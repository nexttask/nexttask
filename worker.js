// Cloudflare Worker with Static Assets & D1 Database + Enterprise Security Shield
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
  'Content-Type': 'application/json'
};

const ADMIN_SECRET = 'nt_sec_9999_master_admin_verified';

const JSON_RES = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS
  });

function isAdminRequest(request) {
  const token = request.headers.get('x-admin-token') || request.headers.get('authorization');
  if (!token) return false;
  return token.replace(/^Bearer\s+/i, '').trim() === ADMIN_SECRET;
}

// In-memory rate limiting map (IP -> array of request timestamps)
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 120; // max 120 requests per minute per IP

  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

async function ensureTable(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `).run();
    return true;
  } catch (err) {
    console.error('Error creating app_state table in D1:', err);
    return false;
  }
}

// Sanitize users array so passwords and admin secrets are NEVER leaked to public clients
function sanitizeUsers(users, isAdmin) {
  if (!Array.isArray(users)) return users;
  return users.map((u) => {
    if (!u) return u;
    if (isAdmin) return u; // Admin gets full details to manage accounts
    const { password: _password, ...safeUser } = u;
    return safeUser;
  });
}

export default {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);
    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Anti-Abuse Rate Limiting on API endpoints
    if (url.pathname.startsWith('/api/')) {
      if (!checkRateLimit(clientIp)) {
        return JSON_RES({ success: false, error: 'Too many requests. Please slow down.' }, 429);
      }
    }

    // 3. Health Check API (/api/health)
    if (url.pathname === '/api/health') {
      const hasDb = Boolean(env && env.DB);
      let dbConnected = false;
      let rowCount = 0;
      let error = null;

      if (hasDb) {
        try {
          await ensureTable(env.DB);
          const count = await env.DB.prepare('SELECT COUNT(*) as c FROM app_state').first('c');
          rowCount = count || 0;
          dbConnected = true;
        } catch (e) {
          error = e.message;
        }
      }

      return JSON_RES({
        status: 'ok',
        timestamp: new Date().toISOString(),
        d1BindingConfigured: hasDb,
        d1Connected: dbConnected,
        keysInDatabase: rowCount,
        securityShield: 'active',
        error: error
      });
    }

    // 4. Secure Server-Side Login API (/api/auth/login)
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      if (!env || !env.DB) {
        return JSON_RES({ success: false, error: 'Database service unavailable' }, 503);
      }

      try {
        const body = await request.json();
        const account = String(body.account || body.email || body.phone || '').trim().toLowerCase();
        const inputPass = String(body.password || '').trim();

        if (!account || !inputPass) {
          return JSON_RES({ success: false, error: 'Account and password are required' }, 400);
        }

        await ensureTable(env.DB);
        const row = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('users').first();
        const users = row ? JSON.parse(row.value) : [];

        // Check Master Admin
        if ((account === 'admin@nexttask.online' || account === 'admin') && inputPass === 'Admin@NextTask') {
          const adminUser = users.find((u) => String(u?.email || '').toLowerCase() === 'admin@nexttask.online') || users[0];
          return JSON_RES({
            success: true,
            isAdmin: true,
            adminToken: ADMIN_SECRET,
            user: adminUser
          });
        }

        // Check Regular Users
        const matched = users.find((u) => {
          if (!u) return false;
          const uEmail = String(u.email || '').trim().toLowerCase();
          const uName = String(u.name || '').trim().toLowerCase();
          const uPhone = String(u.phone || '').trim();
          const uId = String(u.id || '').trim();
          return uEmail === account || uName === account || uPhone === account || uId === account;
        });

        if (!matched || String(matched.password || '').trim() !== inputPass) {
          return JSON_RES({ success: false, error: 'Wrong username or password' }, 401);
        }

        if (matched.status === 'banned') {
          return JSON_RES({ success: false, error: 'This account has been suspended. Please contact support.' }, 403);
        }

        const { password: _, ...safeUser } = matched;
        return JSON_RES({
          success: true,
          user: safeUser
        });
      } catch (err) {
        return JSON_RES({ success: false, error: err.message }, 500);
      }
    }

    // 5. Data Store API (/api/data)
    if (url.pathname === '/api/data') {
      if (!env || !env.DB) {
        return JSON_RES({
          success: false,
          message: "D1 database binding 'DB' is missing in environment",
          source: 'offline'
        });
      }

      await ensureTable(env.DB);
      const isAdmin = isAdminRequest(request);

      // GET: Retrieve single key or all data (Passwords masked for non-admin)
      if (request.method === 'GET') {
        const keyParam = url.searchParams.get('key');
        if (keyParam) {
          const row = await env.DB.prepare('SELECT value, updated_at FROM app_state WHERE key = ?')
            .bind(keyParam)
            .first();

          if (!row) {
            return JSON_RES({ success: true, key: keyParam, data: null, source: 'd1' });
          }

          let parsed = null;
          try {
            parsed = JSON.parse(row.value);
          } catch {
            parsed = row.value;
          }

          // Protect users passwords
          if (keyParam === 'users') {
            parsed = sanitizeUsers(parsed, isAdmin);
          }

          return JSON_RES({
            success: true,
            key: keyParam,
            data: parsed,
            updatedAt: row.updated_at,
            source: 'd1'
          });
        }

        // Return all stored keys
        const { results } = await env.DB.prepare('SELECT key, value, updated_at FROM app_state').all();
        const allData = {};
        if (results && Array.isArray(results)) {
          for (const r of results) {
            try {
              let val = JSON.parse(r.value);
              if (r.key === 'users') {
                val = sanitizeUsers(val, isAdmin);
              }
              allData[r.key] = val;
            } catch {
              allData[r.key] = r.value;
            }
          }
        }

        return JSON_RES({
          success: true,
          data: allData,
          count: Object.keys(allData).length,
          source: 'd1'
        });
      }

      // POST: Upsert single key or bulk keys with Authorization Check
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const now = Date.now();

          // Security: Protected Admin-Only keys
          const PROTECTED_ADMIN_KEYS = ['settings', 'payments', 'vips', 'slides'];
          if (body.key && PROTECTED_ADMIN_KEYS.includes(body.key)) {
            if (!isAdmin) {
              return JSON_RES({ success: false, error: 'Unauthorized: Administrator access required' }, 403);
            }
          }

          if (body.bulk) {
            const keys = Object.keys(body.bulk);
            const hasProtected = keys.some((k) => PROTECTED_ADMIN_KEYS.includes(k));
            if (hasProtected && !isAdmin) {
              return JSON_RES({ success: false, error: 'Unauthorized: Administrator access required' }, 403);
            }
          }

          // If updating 'users' from non-admin client:
          // Preserve passwords of existing users so public clients cannot wipe out stored credentials!
          if (body.key === 'users' && Array.isArray(body.value)) {
            const existingRow = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('users').first();
            if (existingRow) {
              const existingUsers = JSON.parse(existingRow.value);
              const passwordMap = new Map();
              existingUsers.forEach((u) => {
                if (u && u.id && u.password) {
                  passwordMap.set(String(u.id), u.password);
                }
                if (u && u.email && u.password) {
                  passwordMap.set(String(u.email).toLowerCase(), u.password);
                }
              });

              // Merge passwords back in if non-admin client posted stripped user models
              body.value = body.value.map((u) => {
                if (!u) return u;
                if (!u.password) {
                  const pass = passwordMap.get(String(u.id)) || passwordMap.get(String(u.email).toLowerCase());
                  if (pass) return { ...u, password: pass };
                }
                return u;
              });

              // Non-admin cannot modify master admin account!
              if (!isAdmin) {
                const masterAdmin = existingUsers.find((u) => String(u?.email || '').toLowerCase() === 'admin@nexttask.online');
                if (masterAdmin) {
                  const idx = body.value.findIndex((u) => String(u?.email || '').toLowerCase() === 'admin@nexttask.online');
                  if (idx >= 0) {
                    body.value[idx] = masterAdmin;
                  } else {
                    body.value.unshift(masterAdmin);
                  }
                }
              }
            }
          }

          // Single key: { key, value }
          if (body.key && body.value !== undefined) {
            const valueStr = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);
            await env.DB.prepare(`
              INSERT INTO app_state (key, value, updated_at)
              VALUES (?, ?, ?)
              ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = excluded.updated_at
            `).bind(body.key, valueStr, now).run();

            return JSON_RES({
              success: true,
              key: body.key,
              updatedAt: now,
              source: 'd1'
            });
          }

          // Bulk keys: { bulk: { ... } }
          if (body.bulk && typeof body.bulk === 'object') {
            const stmts = [];
            for (const [k, v] of Object.entries(body.bulk)) {
              const valStr = typeof v === 'string' ? v : JSON.stringify(v);
              stmts.push(
                env.DB.prepare(`
                  INSERT INTO app_state (key, value, updated_at)
                  VALUES (?, ?, ?)
                  ON CONFLICT(key) DO UPDATE SET
                    value = excluded.value,
                    updated_at = excluded.updated_at
                `).bind(k, valStr, now)
              );
            }

            if (stmts.length > 0) {
              await env.DB.batch(stmts);
            }

            return JSON_RES({
              success: true,
              keys: Object.keys(body.bulk),
              updatedAt: now,
              source: 'd1'
            });
          }

          return JSON_RES({ success: false, error: 'Invalid payload' }, 400);
        } catch (err) {
          return JSON_RES({ success: false, error: err.message }, 500);
        }
      }
    }

    // 6. Default: Serve static SPA frontend assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
