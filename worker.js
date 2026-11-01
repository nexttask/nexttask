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

// --- Telegram Bot Helper Methods & Keyboards ---
async function sendTelegramMessage(token, payload) {
  if (!token) return { success: false, error: 'No Telegram Bot Token' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function answerTelegramCallback(token, callbackQueryId, text = '') {
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text })
    });
  } catch {}
}

const TELEGRAM_MAIN_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '💳 How to Deposit / Recharge', callback_data: 'faq_deposit' },
      { text: '💸 How to Withdraw Money', callback_data: 'faq_withdraw' }
    ],
    [
      { text: '👑 VIP Packages & Profit Rules', callback_data: 'faq_vip' },
      { text: '👥 Referral Bonus (10%)', callback_data: 'faq_referral' }
    ],
    [
      { text: '👨‍💼 Chat with Live Human Agent', callback_data: 'faq_agent' },
      { text: '🌐 Open NextTask Website', url: 'https://nexttask.online' }
    ]
  ]
};

const TELEGRAM_BACK_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '🔙 Back to Main Menu', callback_data: 'menu_main' },
      { text: '🌐 Open Website', url: 'https://nexttask.online' }
    ]
  ]
};

function getTelegramFaqContent(key) {
  switch (key) {
    case 'faq_deposit':
      return `💳 *NextTask Recharge & Deposit Guide*\n\n` +
        `1. *Accepted Methods:* bKash, Nagad, Rocket & USDT (TRC20).\n` +
        `2. *Minimum Deposit:* 10.00 USDT / equivalent BDT.\n` +
        `3. *How to Deposit:*\n` +
        `   • Open NextTask Website -> Tap *Recharge*\n` +
        `   • Choose your payment channel.\n` +
        `   • Send Money to the official number/address shown on screen.\n` +
        `   • Enter your Sender Number & TrxID / Hash in the submission form.\n` +
        `   • Admin verifies and approves within 5-15 minutes!\n\n` +
        `⚠️ *Safety Notice:* Always send funds to the number shown inside the app only.`;

    case 'faq_withdraw':
      return `💸 *NextTask Withdrawal Rules & Limits*\n\n` +
        `1. *Minimum Withdrawal:* 10.00 USDT.\n` +
        `2. *Payout Channels:* bKash, Nagad, Rocket, or USDT (TRC20) wallet.\n` +
        `3. *Daily Profit Withdrawals:* You can withdraw 100% of your daily task earnings and referral commissions at any time!\n` +
        `4. *Locked Capital Release:* When your VIP package duration (e.g. 20 days) ends, your initial deposit is automatically released and becomes 100% withdrawable!\n` +
        `5. *Processing Time:* Handled quickly by automated audit and finance team.`;

    case 'faq_vip':
      return `👑 *VIP Packages & Profit Structure*\n\n` +
        `• *80% Net Guaranteed Profit:* Every VIP package cycle yields 80% total net profit.\n` +
        `• *Package Validity:* Default 20 days.\n` +
        `• *Daily Verification Tasks:* Complete simple daily tasks in the *Task* tab to collect your daily earnings.\n` +
        `• *Auto Capital Release:* At the end of the package validity, your principal locked capital automatically unfreezes for withdrawal!`;

    case 'faq_referral':
      return `👥 *Referral Income & Team Rewards*\n\n` +
        `• *10% Instant Direct Commission:* Share your personal invitation link or code. When your direct (Level 1) referrals recharge or unlock any VIP package, you instantly get *10% of their package amount* credited directly to your withdrawable balance!\n` +
        `• *Withdrawable Immediately:* Referral commissions have zero lock period.\n` +
        `• *Multi-Tier Progression:* Build Level 1, Level 2, and Level 3 teams to climb VIP rankings and earn higher bonuses!`;

    case 'faq_agent':
      return `👨‍💼 *Live Customer Support Desk*\n\n` +
        `Our support executives are available 24/7 to assist you.\n\n` +
        `👉 *Please reply directly to this message* with:\n` +
        `1. Your *NextTask User ID / Phone / Email*\n` +
        `2. Describe your issue or attach screenshot\n\n` +
        `Our executive will review and reply to you right here in Telegram!`;

    default:
      return null;
  }
}

function matchTelegramFaqAnswer(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('deposit') || t.includes('recharge') || t.includes('bkash') || t.includes('nagad') || t.includes('rocket') || t.includes('usdt') || t.includes('ডিপোজিট') || t.includes('রিচার্জ') || t.includes('টাকা জমা')) {
    return {
      text: `💳 *NextTask Recharge & Deposit Help*\n\n` +
        `You can easily recharge using *bKash, Nagad, Rocket, or USDT (TRC20)*. Minimum deposit is *10 USDT*.\n\n` +
        `Submit your TrxID on the platform, and our admin approves within minutes!`,
      keyboard: {
        inline_keyboard: [
          [{ text: '📖 Read Full Deposit Guide', callback_data: 'faq_deposit' }],
          [{ text: '🔙 Main Menu', callback_data: 'menu_main' }]
        ]
      }
    };
  }

  if (t.includes('withdraw') || t.includes('উইথড্র') || t.includes('টাকা তোলা') || t.includes('payout') || t.includes('cashout')) {
    return {
      text: `💸 *NextTask Withdrawal Help*\n\n` +
        `Minimum withdrawal is *10.00 USDT*. You can withdraw all your daily task earnings and referral commissions anytime to bKash, Nagad, Rocket, or USDT!\n\n` +
        `Your locked VIP capital will also automatically unfreeze after 20 days!`,
      keyboard: {
        inline_keyboard: [
          [{ text: '📖 Read Withdrawal Rules', callback_data: 'faq_withdraw' }],
          [{ text: '🔙 Main Menu', callback_data: 'menu_main' }]
        ]
      }
    };
  }

  if (t.includes('vip') || t.includes('package') || t.includes('profit') || t.includes('প্যাকেজ') || t.includes('লাভ')) {
    return {
      text: `👑 *NextTask VIP Packages & Profit*\n\n` +
        `All VIP packages generate *80% net profit* over a *20-day validity cycle*. Complete simple daily verification tasks to earn daily rewards!`,
      keyboard: {
        inline_keyboard: [
          [{ text: '👑 View VIP Rules', callback_data: 'faq_vip' }],
          [{ text: '🔙 Main Menu', callback_data: 'menu_main' }]
        ]
      }
    };
  }

  if (t.includes('refer') || t.includes('invite') || t.includes('commission') || t.includes('রেফার') || t.includes('বোনাস')) {
    return {
      text: `👥 *NextTask Referral Program*\n\n` +
        `Earn *10% instant direct commission* on every VIP recharge made by your referred partners! Commissions are 100% withdrawable immediately.`,
      keyboard: {
        inline_keyboard: [
          [{ text: '👥 Referral Details', callback_data: 'faq_referral' }],
          [{ text: '🔙 Main Menu', callback_data: 'menu_main' }]
        ]
      }
    };
  }

  return null;
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

    // 2.1 Client Geo & IP Discovery API (/api/client-info)
    if (url.pathname === '/api/client-info') {
      const country = request.cf?.country || 'BD';
      const city = request.cf?.city || 'Dhaka';
      const region = request.cf?.region || '';
      const ua = request.headers.get('user-agent') || '';
      let device = 'Desktop';
      if (/android/i.test(ua)) device = 'Android';
      else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS';
      else if (/windows/i.test(ua)) device = 'Windows';
      else if (/macintosh/i.test(ua)) device = 'Mac';

      return JSON_RES({
        ip: clientIp !== 'unknown' ? clientIp : '180.148.214.220',
        country,
        city,
        region,
        location: `${city}, ${country}`,
        device
      });
    }

    // 2.2 Telegram Bot Webhook API (/api/telegram/webhook)
    if (url.pathname === '/api/telegram/webhook' && request.method === 'POST') {
      try {
        const update = await request.json();

        // Retrieve Telegram Bot configuration from D1 or environment
        let botToken = env.TELEGRAM_BOT_TOKEN || '9004512965:AAGPv7dp8MCDS4jPgjv8ey_V2T6TQpX3Go4';
        let adminChatId = env.TELEGRAM_ADMIN_CHAT_ID || '';
        let autoReplyEnabled = true;

        if (env.DB) {
          try {
            await ensureTable(env.DB);
            const row = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('settings').first();
            if (row) {
              const s = JSON.parse(row.value);
              if (s.telegramBotToken) botToken = s.telegramBotToken;
              if (s.telegramAdminChatId) adminChatId = s.telegramAdminChatId;
              if (s.telegramBotAutoReply !== undefined) autoReplyEnabled = s.telegramBotAutoReply;
            }
          } catch {}
        }

        if (!botToken) {
          return JSON_RES({ ok: true, note: 'No bot token configured yet' });
        }

        // Handle Inline Keyboard Callback Queries
        if (update.callback_query) {
          const cq = update.callback_query;
          const chatId = cq.message?.chat?.id;
          const data = cq.data;

          await answerTelegramCallback(botToken, cq.id);

          if (data === 'menu_main') {
            await sendTelegramMessage(botToken, {
              chat_id: chatId,
              text: `👋 *Welcome to NextTask Official 24/7 AI Support Desk!*\n\n` +
                `How can we assist you today? Please tap an option below:`,
              parse_mode: 'Markdown',
              reply_markup: TELEGRAM_MAIN_KEYBOARD
            });
          } else {
            const content = getTelegramFaqContent(data);
            if (content) {
              await sendTelegramMessage(botToken, {
                chat_id: chatId,
                text: content,
                parse_mode: 'Markdown',
                reply_markup: TELEGRAM_BACK_KEYBOARD
              });
            }
          }
          return JSON_RES({ ok: true });
        }

        // Handle Incoming User Messages
        if (update.message) {
          const msg = update.message;
          const chatId = msg.chat?.id;
          const text = (msg.text || '').trim();
          const fromUser = msg.from || {};
          const userName = fromUser.first_name || fromUser.username || 'User';

          // 1. /start command
          if (text === '/start' || text.startsWith('/start')) {
            await sendTelegramMessage(botToken, {
              chat_id: chatId,
              text: `👋 *Welcome to NextTask Official 24/7 AI Support Desk!*\n\n` +
                `Hello *${userName}*, we are here to provide instant guidance for your deposits, withdrawals, VIP packages, and tasks.\n\n` +
                `Please select a topic below or type your question:`,
              parse_mode: 'Markdown',
              reply_markup: TELEGRAM_MAIN_KEYBOARD
            });
            return JSON_RES({ ok: true });
          }

          // 2. Admin Replying to a User Message
          if (adminChatId && String(chatId) === String(adminChatId) && msg.reply_to_message) {
            const replyText = msg.reply_to_message.text || '';
            const match = replyText.match(/UID: (\d+)/);
            if (match && match[1]) {
              const targetUserId = match[1];
              await sendTelegramMessage(botToken, {
                chat_id: targetUserId,
                text: `💬 *Reply from NextTask Executive:*\n\n${text}\n\n_You can reply here anytime if you have further questions._`,
                parse_mode: 'Markdown'
              });
              await sendTelegramMessage(botToken, {
                chat_id: adminChatId,
                text: `✅ Reply sent to User (ID: ${targetUserId}) successfully!`
              });
              return JSON_RES({ ok: true });
            }
          }

          // 3. Smart FAQ Engine
          if (autoReplyEnabled) {
            const matchedFaq = matchTelegramFaqAnswer(text);
            if (matchedFaq) {
              await sendTelegramMessage(botToken, {
                chat_id: chatId,
                text: matchedFaq.text,
                parse_mode: 'Markdown',
                reply_markup: matchedFaq.keyboard
              });
              return JSON_RES({ ok: true });
            }
          }

          // 4. Forward unhandled messages to Admin Desk
          if (adminChatId && String(chatId) !== String(adminChatId)) {
            await sendTelegramMessage(botToken, {
              chat_id: adminChatId,
              text: `📩 *New Support Inquiry*\n` +
                `From: *${userName}* (@${fromUser.username || 'none'})\n` +
                `UID: ${chatId}\n\n` +
                `Message:\n"${text}"\n\n` +
                `_(Reply directly to this message to send an answer to this user)_`,
              parse_mode: 'Markdown'
            });

            await sendTelegramMessage(botToken, {
              chat_id: chatId,
              text: `✅ *Thank you for reaching out!*\n\n` +
                `Your message has been forwarded to our human support desk. An executive will reply to you right here shortly.`,
              parse_mode: 'Markdown',
              reply_markup: TELEGRAM_BACK_KEYBOARD
            });
            return JSON_RES({ ok: true });
          }

          // Default fallback
          await sendTelegramMessage(botToken, {
            chat_id: chatId,
            text: `👋 Thank you for contacting *NextTask Official Support*!\n\n` +
              `Please choose from our quick menu options below:`,
            parse_mode: 'Markdown',
            reply_markup: TELEGRAM_MAIN_KEYBOARD
          });

          return JSON_RES({ ok: true });
        }

        return JSON_RES({ ok: true });
      } catch (err) {
        console.error('Telegram webhook error:', err);
        return JSON_RES({ ok: false, error: err.message }, 500);
      }
    }

    // 2.3 Set Telegram Webhook API (/api/telegram/set-webhook)
    if (url.pathname === '/api/telegram/set-webhook' && request.method === 'POST') {
      try {
        const body = await request.json();
        const token = body.token;
        if (!token) {
          return JSON_RES({ success: false, error: 'Telegram Bot Token is required' }, 400);
        }

        const host = url.origin || 'https://nexttask.online';
        const webhookUrl = body.webhookUrl || `${host}/api/telegram/webhook`;

        const tgRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
        const tgJson = await tgRes.json();

        return JSON_RES({
          success: tgJson.ok,
          telegramResponse: tgJson,
          webhookUrl
        });
      } catch (err) {
        return JSON_RES({ success: false, error: err.message }, 500);
      }
    }

    // 2.4 Test Telegram Bot Message (/api/telegram/test-bot)
    if (url.pathname === '/api/telegram/test-bot' && request.method === 'POST') {
      try {
        const body = await request.json();
        const token = body.token;
        const chatId = body.chatId;

        if (!token || !chatId) {
          return JSON_RES({ success: false, error: 'Bot Token and Chat ID are required' }, 400);
        }

        const tgRes = await sendTelegramMessage(token, {
          chat_id: chatId,
          text: `🎉 *NextTask 24/7 AI Support Bot is Online!*\n\n` +
            `Your Telegram Bot has been configured successfully and is ready to auto-respond to users and forward live inquiries.`,
          parse_mode: 'Markdown',
          reply_markup: TELEGRAM_MAIN_KEYBOARD
        });

        return JSON_RES({
          success: tgRes.ok,
          telegramResponse: tgRes
        });
      } catch (err) {
        return JSON_RES({ success: false, error: err.message }, 500);
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
