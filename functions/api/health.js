// Cloudflare Pages Function: /api/health
// Checks D1 database binding status

export async function onRequest(context) {
  const { env } = context;

  const hasDb = Boolean(env && env.DB);
  let dbWorks = false;
  let rowCount = 0;
  let error = null;

  if (hasDb) {
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `).run();
      const count = await env.DB.prepare('SELECT COUNT(*) as c FROM app_state').first('c');
      rowCount = count || 0;
      dbWorks = true;
    } catch (e) {
      error = e.message;
    }
  }

  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    d1BindingConfigured: hasDb,
    d1Connected: dbWorks,
    keysInDatabase: rowCount,
    error: error
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
