// Cloudflare Worker with Static Assets & D1 Database
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const JSON_RES = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS
  });

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Health Check API (/api/health)
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
        error: error
      });
    }

    // 3. Data Store API (/api/data)
    if (url.pathname === '/api/data') {
      if (!env || !env.DB) {
        return JSON_RES({
          success: false,
          message: "D1 database binding 'DB' is missing in environment",
          source: 'offline'
        });
      }

      await ensureTable(env.DB);

      // GET: Retrieve single key or all data
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
              allData[r.key] = JSON.parse(r.value);
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

      // POST: Upsert single key or bulk keys
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const now = Date.now();

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

    // 4. Default: Serve static SPA frontend assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
