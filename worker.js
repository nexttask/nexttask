// Cloudflare Worker with Static Assets & D1 Database + Enterprise Security Shield
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token, x-sms-secret',
  'Content-Type': 'application/json'
};

const ADMIN_SECRET = 'nt_sec_9999_master_admin_verified';
const SMS_WEBHOOK_SECRET = 'nt_sms_webhook_sec_8888';

function parsePaymentSms(body, sender = '') {
  if (!body) return null;
  const text = String(body);

  // 1. Extract TrxID / TxnId
  let trxId = '';
  const trxMatch = text.match(/(?:TrxID|TxnId|TxID|Trx ID|Transaction ID)[:\s]+([A-Za-z0-9]+)/i);
  if (trxMatch) {
    trxId = trxMatch[1].trim().toUpperCase();
  }

  // 2. Extract Amount
  let amount = 0;
  const amtMatch = text.match(/(?:received|deposited|Tk\.?|BDT)\s*(?:Tk\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
                   text.match(/Tk\.?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (amtMatch) {
    amount = parseFloat(amtMatch[1].replace(/,/g, '')) || 0;
  }

  // 3. Extract Sender Number
  let senderNumber = '';
  const senderMatch = text.match(/(?:from|sender)[:\s]+([+]?[\d]{10,14})/i);
  if (senderMatch) {
    senderNumber = senderMatch[1].trim();
  }

  // 4. Gateway Method
  let method = 'bKash';
  const lower = (text + ' ' + sender).toLowerCase();
  if (lower.includes('nagad') || sender.includes('16167')) method = 'Nagad';
  else if (lower.includes('rocket') || sender.includes('16216')) method = 'Rocket';
  else if (lower.includes('upay') || sender.includes('16268')) method = 'Upay';
  else if (lower.includes('bkash') || sender.includes('16247')) method = 'bKash';

  if (!trxId && !amount) return null;

  return {
    trxId,
    amount,
    senderNumber,
    method,
    rawText: text,
    timestamp: Date.now()
  };
}


// High-Reliability Tron TRC20 USDT On-Chain Verification Engine
async function verifyTronUsdtTransaction(rawTxHash, targetWallet, usdtRate = 125) {
  const cleanTxId = String(rawTxHash || '').trim().replace(/^0x/i, '');
  if (cleanTxId.length !== 64) {
    return { verified: false, reason: 'Invalid Tron transaction hash length' };
  }

  const cleanTarget = String(targetWallet || 'TWnrTJYNdJ78iz3LXNUcxKLp51miFD4bPW').trim().toLowerCase();
  const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'.toLowerCase();

  // 1. Primary: TronScan REST API (Decodes exact TRC20 transfer info, confirmations & status)
  try {
    const tsUrl = `https://apilist.tronscanapi.com/api/transaction-info?hash=${cleanTxId}`;
    const tsRes = await fetch(tsUrl, {
      headers: { 'User-Agent': 'NextTask-Blockchain-Verifier/1.0' }
    });
    if (tsRes.ok) {
      const tsData = await tsRes.json();
      if (tsData && tsData.contractRet === 'SUCCESS' && !tsData.revert) {
        const transfers = Array.isArray(tsData.trc20TransferInfo) ? tsData.trc20TransferInfo : [];
        const match = transfers.find(t =>
          t &&
          String(t.to_address || '').trim().toLowerCase() === cleanTarget &&
          (String(t.contract_address || '').trim().toLowerCase() === USDT_CONTRACT || String(t.symbol || '').toUpperCase() === 'USDT')
        );

        if (match) {
          const dec = parseInt(match.decimals || 6, 10);
          const rawAmt = parseFloat(match.amount_str || match.amount || 0);
          const usdtAmount = parseFloat((rawAmt / Math.pow(10, dec)).toFixed(4));
          if (usdtAmount > 0) {
            const bdtAmount = parseFloat((usdtAmount * usdtRate).toFixed(2));
            return {
              verified: true,
              usdtAmount,
              bdtAmount,
              fromAddress: match.from_address || '',
              toAddress: match.to_address || targetWallet,
              txHash: cleanTxId,
              timestamp: tsData.timestamp || Date.now(),
              confirmed: !!tsData.confirmed,
              source: 'TronScan On-Chain (TRC20)'
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('TronScan API error:', err);
  }

  // 2. Fallback: TronGrid REST API (Official Tron Developer Grid)
  try {
    const tgUrl = `https://api.trongrid.io/v1/accounts/${targetWallet}/transactions/trc20?limit=30&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`;
    const tgRes = await fetch(tgUrl, {
      headers: { 'User-Agent': 'NextTask-Blockchain-Verifier/1.0' }
    });
    if (tgRes.ok) {
      const tgData = await tgRes.json();
      const transfers = Array.isArray(tgData?.data) ? tgData.data : [];
      const match = transfers.find(t =>
        t &&
        String(t.transaction_id || '').trim().toLowerCase() === cleanTxId.toLowerCase() &&
        String(t.to || '').trim().toLowerCase() === cleanTarget
      );
      if (match) {
        const dec = parseInt(match.token_info?.decimals || 6, 10);
        const rawAmt = parseFloat(match.value || 0);
        const usdtAmount = parseFloat((rawAmt / Math.pow(10, dec)).toFixed(4));
        if (usdtAmount > 0) {
          const bdtAmount = parseFloat((usdtAmount * usdtRate).toFixed(2));
          return {
            verified: true,
            usdtAmount,
            bdtAmount,
            fromAddress: match.from || '',
            toAddress: match.to || targetWallet,
            txHash: cleanTxId,
            timestamp: match.block_timestamp || Date.now(),
            confirmed: true,
            source: 'TronGrid On-Chain (TRC20)'
          };
        }
      }
    }
  } catch (err) {
    console.warn('TronGrid API error:', err);
  }

  return { verified: false, reason: 'Transaction not found on Tron blockchain or recipient does not match target wallet' };
}

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
      { text: '📢 Join Official Community Group', url: 'https://t.me/+e-GhVsAJ339kZDQ1' }
    ],
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

  if (t.includes('password') || t.includes('pass') || t.includes('পাসওয়ার্ড') || t.includes('reset') || t.includes('ভুলে গেছি') || t.includes('পিন') || t.includes('login problem') || t.includes('লগইন সমস্যা')) {
    return {
      text: `🔐 *NextTask Password Reset Request*\n\n` +
        `To protect member accounts, passwords cannot be changed automatically.\n\n` +
        `👉 Please reply directly to this message with your **Registered Phone / Email / User ID**.\n` +
        `An administrator will verify your account and provide you with a new password!`,
      keyboard: {
        inline_keyboard: [
          [{ text: '👨‍💼 Chat with Executive', callback_data: 'faq_agent' }],
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
          const chatType = msg.chat?.type || 'private';

          // Ignore regular chatter in groups/supergroups to prevent spamming
          if (chatType === 'group' || chatType === 'supergroup') {
            return JSON_RES({ ok: true });
          }
          const text = (msg.text || '').trim();
          const fromUser = msg.from || {};
          const userName = fromUser.first_name || fromUser.username || 'User';

          // 1.1 Password Reset command via Telegram deep-link
          if (text.startsWith('/start forgot_password') || text.startsWith('/start reset')) {
            await sendTelegramMessage(botToken, {
              chat_id: chatId,
              text: `🔐 *NextTask Official Password Reset Help Desk*\n\n` +
                `Hello *${userName}*, to protect member accounts and wallet security, automatic password resets are disabled.\n\n` +
                `👉 *Please reply directly to this message with:*\n` +
                `1. Your registered **Email / Phone / User ID**\n` +
                `2. Your Account Name\n` +
                `3. Approximate registration date or last deposit TrxID\n\n` +
                `Our executive will verify your ownership and reset your password for you shortly.`,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '👨‍💼 Chat with Live Agent', callback_data: 'faq_agent' }],
                  [{ text: '🌐 Back to NextTask Website', url: 'https://nexttask.online' }]
                ]
              }
            });

            if (adminChatId) {
              await sendTelegramMessage(botToken, {
                chat_id: adminChatId,
                text: `🔐 *New Password Reset Request*\n` +
                  `From: *${userName}* (@${fromUser.username || 'none'})\n` +
                  `UID: ${chatId}\n\n` +
                  `_(User requested password recovery through official Telegram desk)_`,
                parse_mode: 'Markdown'
              });
            }

            return JSON_RES({ ok: true });
          }

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

        // Check Regular Users with flexible phone/email/username matching
        const inputDigits = account.replace(/\\D/g, '');
        const matched = users.find((u) => {
          if (!u) return false;
          const uEmail = String(u.email || '').trim().toLowerCase();
          const uName = String(u.name || '').trim().toLowerCase();
          const uPhone = String(u.phone || '').trim().toLowerCase();
          const uId = String(u.id || '').trim().toLowerCase();
          const uInvite = String(u.myInviteCode || u.inviteCode || '').trim().toLowerCase();

          if (uEmail === account || uName === account || uPhone === account || uId === account || uInvite === account) {
            return true;
          }

          // Flexible phone match (allows direct number like 01712345678 without +88, or with +880, 880, etc.)
          if (inputDigits.length >= 8 && uPhone) {
            const uDigits = uPhone.replace(/\\D/g, '');
            if (uDigits === inputDigits) return true;
            if (uDigits.endsWith(inputDigits) || inputDigits.endsWith(uDigits)) return true;
            const last10Input = inputDigits.slice(-10);
            const last10User = uDigits.slice(-10);
            if (last10Input.length >= 8 && last10Input === last10User) return true;
          }

          return false;
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

    // 4.1 P2P SMS Automated Gateway Webhook (/api/sms-webhook)
    if (url.pathname === '/api/sms-webhook') {
      if (!env || !env.DB) {
        return JSON_RES({ success: false, error: 'Database service unavailable' }, 503);
      }

      await ensureTable(env.DB);

      // GET: View SMS Logs (Admin or Secret authenticated)
      if (request.method === 'GET') {
        const authHeader = request.headers.get('x-sms-secret') || url.searchParams.get('secret') || '';
        const isAdmin = isAdminRequest(request);
        if (authHeader !== SMS_WEBHOOK_SECRET && !isAdmin) {
          return JSON_RES({ success: false, error: 'Unauthorized' }, 401);
        }
        const smsRow = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('verified_sms_logs').first();
        const logs = smsRow ? JSON.parse(smsRow.value) : [];
        return JSON_RES({ success: true, count: Array.isArray(logs) ? logs.length : 0, data: logs });
      }

      // POST: Receive Inbound SMS from Android Forwarder / MacroDroid
      if (request.method === 'POST') {
        const authHeader = request.headers.get('x-sms-secret') || url.searchParams.get('secret') || '';
        const isAdmin = isAdminRequest(request);
        if (authHeader !== SMS_WEBHOOK_SECRET && !isAdmin) {
          return JSON_RES({ success: false, error: 'Unauthorized: Invalid SMS secret token' }, 401);
        }

        try {
          const payload = await request.json();
          let parsed = null;
          if (payload.trxId && payload.amount) {
            parsed = {
              trxId: String(payload.trxId).trim().toUpperCase(),
              amount: parseFloat(payload.amount) || 0,
              senderNumber: String(payload.sender || payload.senderNumber || '').trim(),
              method: payload.method || 'bKash',
              rawText: payload.rawText || payload.body || 'Direct Payload',
              timestamp: payload.timestamp || Date.now()
            };
          } else {
            parsed = parsePaymentSms(payload.body || payload.message || payload.text, payload.sender || payload.from || '');
          }

          if (!parsed || !parsed.trxId) {
            return JSON_RES({ success: false, error: 'Could not extract TrxID from SMS', received: payload }, 400);
          }

          // Fetch verified_sms_logs
          const smsRow = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('verified_sms_logs').first();
          let smsLogs = smsRow ? JSON.parse(smsRow.value) : [];
          if (!Array.isArray(smsLogs)) smsLogs = [];

          // Add to SMS logs if not already logged
          const existingSms = smsLogs.find(s => s.trxId === parsed.trxId);
          if (!existingSms) {
            smsLogs.unshift({
              trxId: parsed.trxId,
              amount: parsed.amount,
              method: parsed.method,
              senderNumber: parsed.senderNumber,
              rawText: parsed.rawText,
              timestamp: parsed.timestamp || Date.now(),
              status: 'unclaimed'
            });
            if (smsLogs.length > 500) smsLogs = smsLogs.slice(0, 500);
          }

          // Check if there is an existing pending recharge matching this TrxID
          const recRow = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('recharges').first();
          let recharges = recRow ? JSON.parse(recRow.value) : [];
          if (!Array.isArray(recharges)) recharges = [];

          const pendingMatch = recharges.find(r => 
            r && r.status === 'pending' && 
            String(r.trxId || '').trim().toUpperCase() === parsed.trxId
          );

          let matched = false;
          if (pendingMatch) {
            const expectedAmt = parseFloat(pendingMatch.amount) || 0;
            if (expectedAmt <= 0 || Math.abs(expectedAmt - parsed.amount) <= 1.0) {
              pendingMatch.status = 'approved';
              pendingMatch.autoVerified = true;
              pendingMatch.verifiedAt = Date.now();
              pendingMatch.source = 'Auto SMS Bot';

              const logEntry = smsLogs.find(s => s.trxId === parsed.trxId);
              if (logEntry) {
                logEntry.status = 'claimed';
                logEntry.claimedBy = pendingMatch.userId;
              }

              // Credit User Balance in users table
              const userRow = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('users').first();
              let users = userRow ? JSON.parse(userRow.value) : [];
              if (Array.isArray(users)) {
                const u = users.find(usr => 
                  usr && (
                    String(usr.id) === String(pendingMatch.userId) ||
                    String(usr.email || '').toLowerCase() === String(pendingMatch.user || '').toLowerCase() ||
                    String(usr.phone || '') === String(pendingMatch.user || '')
                  )
                );
                if (u) {
                  u.recharge = parseFloat(((parseFloat(u.recharge) || 0) + parsed.amount).toFixed(2));

                  // Recharge adds to balance; customer purchases VIP manually without auto-activation

                  // Credit Referrer Commission
                  const settingsRow = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('settings').first();
                  const settings = settingsRow ? JSON.parse(settingsRow.value) : {};
                  const commRate = parseFloat(settings.referralCommissionRate) || 10;
                  if (u.referredBy && commRate > 0) {
                    const refCode = String(u.referredBy).trim().toUpperCase();
                    const referrer = users.find(r => 
                      r && (
                        String(r.myInviteCode || '').toUpperCase() === refCode ||
                        String(r.inviteCode || '').toUpperCase() === refCode ||
                        String(r.id) === refCode
                      )
                    );
                    if (referrer) {
                      const commission = parseFloat(((parsed.amount * commRate) / 100).toFixed(2));
                      referrer.balance = parseFloat(((parseFloat(referrer.balance) || 0) + commission).toFixed(2));
                    }
                  }

                  await env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
                    .bind('users', JSON.stringify(users), Date.now())
                    .run();
                }
              }

              await env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
                .bind('recharges', JSON.stringify(recharges), Date.now())
                .run();

              matched = true;
            }
          }

          // Save SMS logs
          await env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
            .bind('verified_sms_logs', JSON.stringify(smsLogs), Date.now())
            .run();

          return JSON_RES({
            success: true,
            message: matched ? 'SMS logged and matching pending recharge auto-approved!' : 'SMS logged successfully. Waiting for user submission.',
            parsed,
            matched
          });
        } catch (err) {
          return JSON_RES({ success: false, error: err.message }, 500);
        }
      }
    }

    // 4.2 Instant Verification & Auto-Activation API (/api/verify-recharge)
    if (url.pathname === '/api/verify-recharge' && request.method === 'POST') {
      if (!env || !env.DB) {
        return JSON_RES({ success: false, error: 'Database service unavailable' }, 503);
      }

      try {
        const body = await request.json();
        const trxId = String(body.trxId || '').trim().toUpperCase();
        const amount = parseFloat(body.amount) || 0;
        const method = String(body.method || 'bKash').trim();
        const senderAccount = String(body.senderAccount || body.sender || '').trim();
        const userId = String(body.userId || '').trim();
        const userIdentifier = String(body.user || body.email || body.phone || '').trim();
        const targetVip = String(body.targetVip || '').trim();

        if (!trxId || amount <= 0) {
          return JSON_RES({ success: false, error: 'Transaction ID and valid amount are required' }, 400);
        }

        await ensureTable(env.DB);

        // 1. Fetch SMS logs, recharges, users, settings
        const [smsRow, recRow, userRow, settingsRow] = await Promise.all([
          env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('verified_sms_logs').first(),
          env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('recharges').first(),
          env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('users').first(),
          env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('settings').first()
        ]);

        let smsLogs = smsRow ? JSON.parse(smsRow.value) : [];
        let recharges = recRow ? JSON.parse(recRow.value) : [];
        let users = userRow ? JSON.parse(userRow.value) : [];
        const settings = settingsRow ? JSON.parse(settingsRow.value) : {};

        if (!Array.isArray(smsLogs)) smsLogs = [];
        if (!Array.isArray(recharges)) recharges = [];
        if (!Array.isArray(users)) users = [];

        // 2. Check if this TrxID is ALREADY approved for another user
        const existingApproved = recharges.find(r => 
          r && r.status === 'approved' && 
          String(r.trxId || '').trim().toUpperCase() === trxId
        );
        if (existingApproved) {
          if (String(existingApproved.userId) === userId) {
            return JSON_RES({
              success: true,
              verified: true,
              alreadyCredited: true,
              message: 'This transaction was already verified and credited to your account!'
            });
          }
          return JSON_RES({
            success: false,
            verified: false,
            error: 'This Transaction ID (TrxID) has already been used on another account!'
          }, 400);
        }

        // 3. Determine method type: USDT (TRC20 Auto Blockchain) vs bKash/Nagad/Rocket (Manual Admin Review)
        const isCryptoMethod = method.includes('USDT') || method.includes('TRC20') || method.includes('Crypto');

        let smsMatch = null;
        if (!isCryptoMethod && settings.paymentGatewayMode === 'automated') {
          smsMatch = smsLogs.find(s => 
            s && s.trxId === trxId && 
            s.status !== 'claimed' &&
            Math.abs(parseFloat(s.amount) - amount) <= 1.0
          );
        }

        // 4. Crypto USDT Real-Time On-Chain Verification (TRC20)
        let cryptoResult = null;
        if (isCryptoMethod) {
          const targetWallet = (settings.trc20Address || 'TWnrTJYNdJ78iz3LXNUcxKLp51miFD4bPW').trim();
          const usdtRate = parseFloat(settings.usdtRate || 125);
          cryptoResult = await verifyTronUsdtTransaction(trxId, targetWallet, usdtRate);
        }

        // If TRC20 Crypto was submitted, but verification failed on Tron Blockchain, REJECT IMMEDIATELY!
        if (isCryptoMethod && (!cryptoResult || !cryptoResult.verified)) {
          const rejectReason = cryptoResult?.reason || 'Transaction not found on Tron blockchain or recipient does not match target wallet.';
          
          let recEntry = recharges.find(r => String(r.trxId || '').trim().toUpperCase() === trxId);
          if (!recEntry) {
            recEntry = {
              id: `rec_${Date.now()}`,
              userId,
              user: userIdentifier,
              amount,
              method,
              senderAccount: senderAccount || 'TRC20 Wallet',
              trxId,
              targetVip: targetVip || '',
              status: 'rejected',
              autoVerified: false,
              rejectReason,
              source: 'Auto-Rejected (Tron Blockchain Verification Failed)',
              date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            recharges.unshift(recEntry);
          } else {
            recEntry.status = 'rejected';
            recEntry.rejectReason = rejectReason;
            recEntry.source = 'Auto-Rejected (Tron Blockchain Verification Failed)';
          }

          await env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
            .bind('recharges', JSON.stringify(recharges), Date.now()).run();

          return JSON_RES({
            success: false,
            verified: false,
            rejected: true,
            status: 'rejected',
            rechargeId: recEntry.id,
            amount,
            method,
            trxId,
            reason: rejectReason,
            message: `Recharge Rejected: ${rejectReason}`
          }, 200);
        }

        const isAutoVerified = Boolean((cryptoResult && cryptoResult.verified) || smsMatch);
        const finalCreditedAmount = (cryptoResult && cryptoResult.verified && cryptoResult.bdtAmount > 0)
          ? cryptoResult.bdtAmount
          : amount;

        // 5. If Auto-Verified (Instant on-chain approval):
        if (isAutoVerified) {
          if (smsMatch) {
            smsMatch.status = 'claimed';
            smsMatch.claimedBy = userId;
          }

          let recEntry = recharges.find(r => String(r.trxId || '').trim().toUpperCase() === trxId);
          if (!recEntry) {
            recEntry = {
              id: `rec_${Date.now()}`,
              userId,
              user: userIdentifier,
              amount: finalCreditedAmount,
              method,
              senderAccount: senderAccount || (cryptoResult?.fromAddress || 'TRC20 Wallet'),
              trxId,
              targetVip: targetVip || '',
              status: 'approved',
              autoVerified: true,
              usdtAmount: cryptoResult?.usdtAmount || null,
              source: cryptoResult?.source || 'Auto Tron Blockchain',
              date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            recharges.unshift(recEntry);
          } else {
            recEntry.status = 'approved';
            recEntry.amount = finalCreditedAmount;
            recEntry.autoVerified = true;
            recEntry.usdtAmount = cryptoResult?.usdtAmount || recEntry.usdtAmount;
            recEntry.source = cryptoResult?.source || recEntry.source || 'Auto Tron Blockchain';
          }

          // Credit User balance & VIP activation
          let updatedUser = null;
          const u = users.find(usr => 
            usr && (
              String(usr.id) === userId ||
              String(usr.email || '').toLowerCase() === userIdentifier.toLowerCase() ||
              String(usr.phone || '') === userIdentifier
            )
          );

          if (u) {
            u.balance = parseFloat(((parseFloat(u.balance) || 0) + finalCreditedAmount).toFixed(2));
            u.recharge = parseFloat(((parseFloat(u.recharge) || 0) + finalCreditedAmount).toFixed(2));

            const commRate = parseFloat(settings.referralCommissionRate) || 10;
            if (u.referredBy && commRate > 0) {
              const refCode = String(u.referredBy).trim().toUpperCase();
              const referrer = users.find(r => 
                r && (
                  String(r.myInviteCode || '').toUpperCase() === refCode ||
                  String(r.inviteCode || '').toUpperCase() === refCode ||
                  String(r.id) === refCode
                )
              );
              if (referrer) {
                const commission = parseFloat(((finalCreditedAmount * commRate) / 100).toFixed(2));
                referrer.balance = parseFloat(((parseFloat(referrer.balance) || 0) + commission).toFixed(2));
              }
            }

            updatedUser = u;
          }

          // Persist all updates to D1
          await Promise.all([
            env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
              .bind('recharges', JSON.stringify(recharges), Date.now()).run(),
            env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
              .bind('verified_sms_logs', JSON.stringify(smsLogs), Date.now()).run(),
            env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
              .bind('users', JSON.stringify(users), Date.now()).run()
          ]);

          return JSON_RES({
            success: true,
            verified: true,
            autoApproved: true,
            amount: finalCreditedAmount,
            usdtAmount: cryptoResult?.usdtAmount || null,
            method,
            user: updatedUser,
            vipActivated: Boolean(targetVip),
            message: cryptoResult?.usdtAmount
              ? `USDT Deposit of ${cryptoResult.usdtAmount} USDT (৳${finalCreditedAmount} BDT) confirmed on Tron Blockchain and credited to your balance instantly!`
              : 'Payment verified and credited to your account instantly!'
          });
        }

        // 6. If Not Auto-Verified Yet: Queue as PENDING in recharges table for admin manual review
        let existingPending = recharges.find(r => String(r.trxId || '').trim().toUpperCase() === trxId);
        if (!existingPending) {
          existingPending = {
            id: `rec_${Date.now()}`,
            userId,
            user: userIdentifier,
            amount: finalCreditedAmount,
            method,
            senderAccount,
            trxId,
            targetVip: targetVip || '',
            status: 'pending',
            autoVerified: false,
            source: isCryptoMethod ? 'Tron Blockchain (Awaiting Block Confirmation)' : 'Manual Submission',
            date: new Date().toISOString().slice(0, 19).replace('T', ' ')
          };
          recharges.unshift(existingPending);

          await env.DB.prepare('INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)')
            .bind('recharges', JSON.stringify(recharges), Date.now()).run();
        }

        return JSON_RES({
          success: true,
          verified: false,
          pending: true,
          rechargeId: existingPending.id,
          amount: finalCreditedAmount,
          method,
          message: isCryptoMethod
            ? 'Tron TRC20 transaction submitted. It will automatically verify and credit as soon as the block confirms (usually 15-60 seconds).'
            : 'Payment request submitted! It is in queue for manual verification by Admin.'
        });
      } catch (err) {
        return JSON_RES({ success: false, error: err.message }, 500);
      }
    }

    // 4.5. Delete User & Purge All Associated Data (/api/delete-user) - Master Admin Only
    if (url.pathname === '/api/delete-user' && request.method === 'POST') {
      if (!isAdminRequest(request)) {
        return JSON_RES({ success: false, error: 'Unauthorized: Master Administrator required' }, 403);
      }

      try {
        const payload = await request.json();
        const targetId = payload.userId ? String(payload.userId).trim().toLowerCase() : '';
        const targetEmail = payload.email ? String(payload.email).trim().toLowerCase() : '';
        const targetPhone = payload.phone ? String(payload.phone).trim() : '';

        if (!targetId && !targetEmail && !targetPhone) {
          return JSON_RES({ success: false, error: 'Target user identifier required' }, 400);
        }

        // Safety: Master Admin cannot be deleted
        if (targetEmail === 'admin@nexttask.online') {
          return JSON_RES({ success: false, error: 'Cannot delete Master Admin account' }, 403);
        }

        await ensureTable(env.DB);

        // Fetch existing records from D1
        const { results } = await env.DB.prepare(
          'SELECT key, value FROM app_state WHERE key IN (?, ?, ?, ?, ?, ?)'
        ).bind(
          'users',
          'recharges',
          'withdrawals',
          'task_records',
          'notifications',
          'upgrade_logs'
        ).all();

        const dataMap = {};
        if (results && Array.isArray(results)) {
          results.forEach((r) => {
            try {
              dataMap[r.key] = JSON.parse(r.value);
            } catch {
              dataMap[r.key] = [];
            }
          });
        }

        const currentUsers = Array.isArray(dataMap.users) ? dataMap.users : [];
        const currentRecharges = Array.isArray(dataMap.recharges) ? dataMap.recharges : [];
        const currentWithdrawals = Array.isArray(dataMap.withdrawals) ? dataMap.withdrawals : [];
        const currentTasks = Array.isArray(dataMap.task_records) ? dataMap.task_records : [];
        const currentNotifs = Array.isArray(dataMap.notifications) ? dataMap.notifications : [];
        const currentLogs = Array.isArray(dataMap.upgrade_logs) ? dataMap.upgrade_logs : [];

        // Match user details
        const targetUser = currentUsers.find((u) => {
          if (!u) return false;
          const uId = u.id ? String(u.id).trim().toLowerCase() : '';
          const uEmail = u.email ? String(u.email).trim().toLowerCase() : '';
          const uPhone = u.phone ? String(u.phone).trim() : '';
          return (targetId && uId === targetId) || (targetEmail && uEmail === targetEmail) || (targetPhone && uPhone === targetPhone);
        });

        const userKeys = new Set();
        if (targetId) userKeys.add(targetId);
        if (targetEmail) userKeys.add(targetEmail);
        if (targetPhone) userKeys.add(targetPhone);
        if (targetUser) {
          if (targetUser.id) userKeys.add(String(targetUser.id).trim().toLowerCase());
          if (targetUser.email) userKeys.add(String(targetUser.email).trim().toLowerCase());
          if (targetUser.phone) userKeys.add(String(targetUser.phone).trim().toLowerCase());
          if (targetUser.name) userKeys.add(String(targetUser.name).trim().toLowerCase());
          if (targetUser.myInviteCode) userKeys.add(String(targetUser.myInviteCode).trim().toLowerCase());
        }

        const isMatch = (item) => {
          if (!item) return false;
          const candidates = [
            item.userId,
            item.user,
            item.email,
            item.phone,
            item.account,
            item.senderAccount
          ].filter(Boolean).map((v) => String(v).trim().toLowerCase());

          return candidates.some((c) => userKeys.has(c));
        };

        // Filter out all records matching this user
        const newUsers = currentUsers.filter((u) => {
          if (!u) return false;
          const uId = u.id ? String(u.id).trim().toLowerCase() : '';
          const uEmail = u.email ? String(u.email).trim().toLowerCase() : '';
          const uPhone = u.phone ? String(u.phone).trim() : '';
          return !userKeys.has(uId) && !userKeys.has(uEmail) && !userKeys.has(uPhone);
        });

        const newRecharges = currentRecharges.filter((r) => !isMatch(r));
        const newWithdrawals = currentWithdrawals.filter((w) => !isMatch(w));
        const newTasks = currentTasks.filter((t) => !isMatch(t));
        const newNotifs = currentNotifs.filter((n) => !isMatch(n));
        const newLogs = currentLogs.filter((l) => !isMatch(l));

        const now = Date.now();
        const stmts = [
          env.DB.prepare('INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('users', JSON.stringify(newUsers), now),
          env.DB.prepare('INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('recharges', JSON.stringify(newRecharges), now),
          env.DB.prepare('INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('withdrawals', JSON.stringify(newWithdrawals), now),
          env.DB.prepare('INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('task_records', JSON.stringify(newTasks), now),
          env.DB.prepare('INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('notifications', JSON.stringify(newNotifs), now),
          env.DB.prepare('INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('upgrade_logs', JSON.stringify(newLogs), now)
        ];

        await env.DB.batch(stmts);

        return JSON_RES({
          success: true,
          message: 'User and all associated data permanently purged',
          stats: {
            deletedUser: targetEmail || targetId,
            rechargesRemoved: currentRecharges.length - newRecharges.length,
            withdrawalsRemoved: currentWithdrawals.length - newWithdrawals.length,
            tasksRemoved: currentTasks.length - newTasks.length
          }
        });
      } catch (err) {
        return JSON_RES({ success: false, error: err.message || 'Failed to delete user' }, 500);
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
          const PROTECTED_ADMIN_KEYS = ['settings', 'payments', 'vips', 'slides', 'support_channels'];
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

          // Server-Side User Protection & Atomic Merge
          // Public clients or desynced sessions CANNOT delete existing users or wipe credentials!
          if (body.key === 'users' && Array.isArray(body.value)) {
            const existingRow = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind('users').first();
            if (existingRow) {
              let existingUsers = [];
              try {
                existingUsers = JSON.parse(existingRow.value) || [];
              } catch {
                existingUsers = [];
              }

              const forceReplace = isAdmin && request.headers.get('x-force-replace') === 'true';

              if (!forceReplace) {
                // Build a map of existing users keyed by id / email / phone
                const userMap = new Map();
                existingUsers.forEach((u) => {
                  if (!u) return;
                  const key = String(u.id || u.email || u.phone || '').trim().toLowerCase();
                  if (key) {
                    userMap.set(key, u);
                  }
                });

                // Merge incoming users
                body.value.forEach((incoming) => {
                  if (!incoming) return;
                  const inId = incoming.id ? String(incoming.id).trim().toLowerCase() : null;
                  const inEmail = incoming.email ? String(incoming.email).trim().toLowerCase() : null;
                  const inPhone = incoming.phone ? String(incoming.phone).trim() : null;

                  // Find match in userMap
                  let matchKey = null;
                  if (inId && userMap.has(inId)) matchKey = inId;
                  else if (inEmail && userMap.has(inEmail)) matchKey = inEmail;
                  else {
                    for (const [k, existing] of userMap.entries()) {
                      if (
                        (inId && existing.id && String(existing.id).trim().toLowerCase() === inId) ||
                        (inEmail && existing.email && String(existing.email).trim().toLowerCase() === inEmail) ||
                        (inPhone && existing.phone && String(existing.phone).trim() === inPhone)
                      ) {
                        matchKey = k;
                        break;
                      }
                    }
                  }

                  if (matchKey) {
                    const existing = userMap.get(matchKey);
                    // Retain existing password if incoming payload has empty or stripped password
                    const password = incoming.password || existing.password;
                    // Retain original createdAt if incoming payload missed it
                    const createdAt = existing.createdAt || incoming.createdAt;
                    userMap.set(matchKey, { ...existing, ...incoming, password, createdAt });
                  } else {
                    // New user registering
                    const newKey = inId || inEmail || inPhone || String(Date.now());
                    userMap.set(newKey, incoming);
                  }
                });

                // Master Admin is always protected from modification by non-admin
                const masterAdmin = existingUsers.find((u) => String(u?.email || '').toLowerCase() === 'admin@nexttask.online');
                if (masterAdmin) {
                  userMap.set('100', masterAdmin);
                  userMap.set('admin@nexttask.online', masterAdmin);
                }

                // De-duplicate in case of multiple keys pointing to same user object
                const uniqueUsers = Array.from(new Set(userMap.values()));
                body.value = uniqueUsers;
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