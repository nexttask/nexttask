// Cloudflare Pages Function: /api/data
// Backed by Cloudflare D1 SQL Database

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const JSON_RESPONSE = (body, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS
  });
};

// Ensure D1 table exists
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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env || !env.DB) {
    return JSON_RESPONSE({
      success: false,
      message: "Cloudflare D1 binding 'DB' is not configured yet in Cloudflare Dashboard.",
      source: 'offline'
    }, 200);
  }

  await ensureTable(env.DB);

  try {
    const url = new URL(request.url);
    const keyParam = url.searchParams.get('key');

    if (keyParam) {
      const stmt = env.DB.prepare('SELECT value, updated_at FROM app_state WHERE key = ?').bind(keyParam);
      const row = await stmt.first();

      if (!row) {
        return JSON_RESPONSE({
          success: true,
          key: keyParam,
          data: null,
          source: 'd1'
        });
      }

      let parsed = null;
      try {
        parsed = JSON.parse(row.value);
      } catch {
        parsed = row.value;
      }

      return JSON_RESPONSE({
        success: true,
        key: keyParam,
        data: parsed,
        updatedAt: row.updated_at,
        source: 'd1'
      });
    }

    // Return all keys
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

    return JSON_RESPONSE({
      success: true,
      data: allData,
      count: Object.keys(allData).length,
      source: 'd1'
    });
  } catch (err) {
    return JSON_RESPONSE({
      success: false,
      error: err.message,
      source: 'd1'
    }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env || !env.DB) {
    return JSON_RESPONSE({
      success: false,
      message: "Cloudflare D1 binding 'DB' is not configured yet in Cloudflare Dashboard.",
      source: 'offline'
    }, 200);
  }

  await ensureTable(env.DB);

  try {
    const body = await request.json();
    const now = Date.now();

    // 1. Single Key Update: { key: 'users', value: [...] }
    if (body.key && body.value !== undefined) {
      const valueStr = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);
      await env.DB.prepare(`
        INSERT INTO app_state (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `).bind(body.key, valueStr, now).run();

      return JSON_RESPONSE({
        success: true,
        key: body.key,
        updatedAt: now,
        source: 'd1'
      });
    }

    // 2. Bulk Update: { bulk: { users: [...], slides: [...] } }
    if (body.bulk && typeof body.bulk === 'object') {
      const statements = [];
      for (const [k, v] of Object.entries(body.bulk)) {
        const valStr = typeof v === 'string' ? v : JSON.stringify(v);
        statements.push(
          env.DB.prepare(`
            INSERT INTO app_state (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at
          `).bind(k, valStr, now)
        );
      }

      if (statements.length > 0) {
        await env.DB.batch(statements);
      }

      return JSON_RESPONSE({
        success: true,
        keys: Object.keys(body.bulk),
        updatedAt: now,
        source: 'd1'
      });
    }

    return JSON_RESPONSE({
      success: false,
      error: 'Invalid payload. Provide { key, value } or { bulk: { ... } }'
    }, 400);
  } catch (err) {
    return JSON_RESPONSE({
      success: false,
      error: err.message,
      source: 'd1'
    }, 500);
  }
}
