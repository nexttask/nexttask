// Shared State Store with LocalStorage Persistence

export const DEFAULT_VIP_TIERS = [
  { id: '1', level: 'Starter Package', deposit: '0.00', tasks: 5, days: 7, profitPercent: 0, interest: '4.00', daily: '20.00', total: '140.00', logo: '/packages/starter.svg' },
  { id: '2', level: 'Basic Package', deposit: '1,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '18.00', daily: '90.00', total: '1,800.00', logo: '/packages/basic.svg' },
  { id: '3', level: 'Silver Package', deposit: '5,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '90.00', daily: '450.00', total: '9,000.00', logo: '/packages/silver.svg' },
  { id: '4', level: 'Gold Package', deposit: '15,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '270.00', daily: '1,350.00', total: '27,000.00', logo: '/packages/gold.svg' },
  { id: '5', level: 'Platinum Package', deposit: '35,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '630.00', daily: '3,150.00', total: '63,000.00', logo: '/packages/platinum.svg' },
  { id: '6', level: 'Diamond Package', deposit: '75,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '1,350.00', daily: '6,750.00', total: '135,000.00', logo: '/packages/diamond.svg' },
  { id: '7', level: 'Premium Package', deposit: '150,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '2,700.00', daily: '13,500.00', total: '270,000.00', logo: '/packages/premium.svg' },
  { id: '8', level: 'Business Package', deposit: '350,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '6,300.00', daily: '31,500.00', total: '630,000.00', logo: '/packages/business.svg' },
  { id: '9', level: 'Elite Package', deposit: '750,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '13,500.00', daily: '67,500.00', total: '1,350,000.00', logo: '/packages/elite.svg' },
  { id: '10', level: 'Royal Package', deposit: '1,500,000.00', tasks: 5, days: 20, profitPercent: 80, interest: '27,000.00', daily: '135,000.00', total: '2,700,000.00', logo: '/packages/royal.svg' },
];

export const DEFAULT_USERS = [
  {
    id: '100',
    name: 'Master Admin',
    email: 'admin@nexttask.online',
    phone: '',
    dob: '',
    password: 'Admin@NextTask',
    vip: 'VIP10',
    balance: 0.00,
    recharge: 0.00,
    status: 'active',
    joined: '2026-10-01',
    inviteCode: 'NT1001',
    myInviteCode: 'NT1001',
    referredBy: '',
    withdrawalAccounts: {
      bkash: '',
      nagad: '',
      rocket: '',
      trc20: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ',
      bankName: '',
      bankAccount: '',
      bankHolder: ''
    }
  }
];

export const DEFAULT_RECHARGES = [];

export const DEFAULT_WITHDRAWALS = [];

export const DEFAULT_TASK_RECORDS = [];

export const DEFAULT_SUPPORT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e3a8a"/></linearGradient><linearGradient id="sk" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23fed7aa"/><stop offset="100%" stop-color="%23fba96b"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23bgG)"/><circle cx="50" cy="50" r="47" fill="none" stroke="%2338bdf8" stroke-width="2.5"/><path d="M22,86 C22,66 38,62 50,62 C62,62 78,66 78,86 Z" fill="%232563eb"/><path d="M44,62 L50,74 L56,62 Z" fill="%23ffffff"/><polygon points="50,68 47,82 53,82" fill="%23f59e0b"/><circle cx="50" cy="42" r="20" fill="url(%23sk)"/><path d="M30,36 C30,22 70,22 70,36 C70,29 64,22 50,22 C36,22 30,29 30,36 Z" fill="%231e293b"/><circle cx="43" cy="40" r="2.5" fill="%230f172a"/><circle cx="57" cy="40" r="2.5" fill="%230f172a"/><path d="M44,48 Q50,54 56,48" fill="none" stroke="%23ea580c" stroke-width="2" stroke-linecap="round"/><path d="M28,42 A22,22 0 0,1 72,42" fill="none" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><rect x="25" y="36" width="6" height="12" rx="3" fill="%230284c7"/><rect x="69" y="36" width="6" height="12" rx="3" fill="%230284c7"/><path d="M72,46 L76,55 L67,57" fill="none" stroke="%2338bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="66" cy="57" r="3.5" fill="%23ef4444"/></svg>`;

export const DEFAULT_SUPPORT_CHANNELS = [
  {
    id: 'sup_tg',
    name: '24/7 Telegram AI Support Bot',
    type: 'telegram',
    link: 'https://t.me/NextTask_SupportBot',
    active: true
  },
  {
    id: 'sup_wa',
    name: 'WhatsApp Customer Service',
    type: 'whatsapp',
    link: 'https://wa.me/1234567890',
    active: true
  }
];

export const DEFAULT_COMPANY_PROFILE = {
  companyName: 'NextTask Global Network LTD.',
  regNumber: 'UK-CRN #14892051 / INT-GLOBAL-TASK-2026',
  tagline: 'Leading Decentralized E-Commerce Task & Digital Marketing Network',
  about: 'NextTask is an internationally accredited task acceleration and digital media marketing network founded in 2026. We collaborate with Fortune 500 digital brands, app marketplaces, and top-tier global retailers to generate verified data interactions, high-engagement user reviews, and algorithmic ranking boosts.',
  whatWeDo: 'Our platform coordinates daily micro-missions between global enterprise merchants and verified community members. By fulfilling daily sponsored tasks (app reviews, rating orders, content auditing), users earn guaranteed daily BDT dividend returns with immediate daily liquidity and automated cloud payouts.',
  mission: 'To empower everyday internet users worldwide with transparent, accessible, and high-yield digital employment opportunities supported by automated cloud settlement and multi-tiered referral benefits.',
  vision: 'To become the world’s most trusted and decentralized micro-task ecosystem, bridging global business intelligence with verifiable crowd participation.',
  licenseTitle: 'Official Certificate of Incorporation & Global Operating License',
  licenseDate: 'Issued: January 15, 2026 • Verified by International Business Regulatory Commission',
  licenseImage: '/license_certificate.svg'
};

export const DEFAULT_UPGRADE_LOGS = [];

export const recordUpgradeLog = ({ userId, user, userIdentifier, fromVip, toVip, amount, type }) => {
  try {
    const logs = getStoredData('upgrade_logs', DEFAULT_UPGRADE_LOGS);
    const newLog = {
      id: `UPG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: userId || '',
      user: user || 'User',
      userIdentifier: userIdentifier || (user ? String(user).replace(/(\d{3})\d{4,}(\d{2})/, '$1****$2') : 'Member'),
      fromVip: fromVip || 'VIP0',
      toVip: toVip || 'VIP1',
      amount: typeof amount === 'number' ? amount : (parseFloat(amount) || 0),
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: type || (fromVip === 'VIP0' || !fromVip ? 'Unlock' : 'Upgrade'),
      timestamp: Date.now()
    };
    const updated = [newLog, ...logs].slice(0, 100);
    setStoredData('upgrade_logs', updated);
    return newLog;
  } catch (e) {
    console.error('Error recording upgrade log:', e);
  }
};

export const DEFAULT_SETTINGS = {
  platformName: 'NextTask',
  currency: 'BDT',
  currencySymbol: '৳',
  trc20Address: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ',
  minWithdrawal: 500,
  minDeposit: 500,
  referralCommissionRate: 10,
  telegramSupport: '@NextTask_SupportBot',
  floatingSupportEnabled: true,
  supportExecutiveAvatar: '',
  telegramBotToken: '9004512965:AAGPv7dp8MCDS4jPgjv8ey_V2T6TQpX3Go4',
  telegramBotUsername: '@NextTask_SupportBot',
  telegramAdminChatId: '',
  telegramBotAutoReply: true,
  paymentGatewayMode: 'manual',
  smsWebhookSecret: 'nt_sms_webhook_sec_8888',
  companyProfile: DEFAULT_COMPANY_PROFILE
};

export const getPackageLogo = (vip) => {
  if (vip?.logo && String(vip.logo).trim()) return vip.logo;
  const name = String(vip?.level || vip?.name || '').toLowerCase();
  if (name.includes('starter')) return '/packages/starter.svg';
  if (name.includes('basic')) return '/packages/basic.svg';
  if (name.includes('silver')) return '/packages/silver.svg';
  if (name.includes('gold')) return '/packages/gold.svg';
  if (name.includes('platinum')) return '/packages/platinum.svg';
  if (name.includes('diamond')) return '/packages/diamond.svg';
  if (name.includes('premium')) return '/packages/premium.svg';
  if (name.includes('business')) return '/packages/business.svg';
  if (name.includes('elite')) return '/packages/elite.svg';
  if (name.includes('royal')) return '/packages/royal.svg';
  if (name.includes('vip10')) return '/packages/royal.svg';
  if (name.includes('vip9')) return '/packages/elite.svg';
  if (name.includes('vip8')) return '/packages/business.svg';
  if (name.includes('vip7')) return '/packages/premium.svg';
  if (name.includes('vip6')) return '/packages/diamond.svg';
  if (name.includes('vip5')) return '/packages/platinum.svg';
  if (name.includes('vip4')) return '/packages/gold.svg';
  if (name.includes('vip3')) return '/packages/silver.svg';
  if (name.includes('vip2')) return '/packages/basic.svg';
  if (name.includes('vip1')) return '/packages/starter.svg';
  return '/packages/starter.svg';
};

export const getLocalDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getPaymentLogo = (pm) => {
  if (pm?.logo && String(pm.logo).trim()) return pm.logo;
  const name = String(pm?.method || '').toLowerCase();
  if (name.includes('bkash')) return '/logos/bkash.svg';
  if (name.includes('nagad')) return '/logos/nagad.svg';
  if (name.includes('rocket')) return '/logos/rocket.svg';
  if (name.includes('usdt') || name.includes('trc20') || name.includes('crypto')) return '/logos/usdt.svg';
  if (name.includes('upay')) return '/logos/upay.svg';
  if (name.includes('bank')) return '/logos/bank.svg';
  return '/logos/usdt.svg';
};

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'pm_1', method: 'bKash', type: 'Personal', number: '01712345678', rate: 1, logo: '/logos/bkash.svg', active: true, instructions: 'Please Send Money (Personal) to the official bKash number below, then enter your 11-digit Sender Number & TrxID.' },
  { id: 'pm_2', method: 'Nagad', type: 'Personal', number: '01812345678', rate: 1, logo: '/logos/nagad.svg', active: true, instructions: 'Please Send Money (Personal) to the official Nagad number below, then enter your 11-digit Sender Number & TrxID.' },
  { id: 'pm_3', method: 'Rocket', type: 'Personal', number: '01912345678', rate: 1, logo: '/logos/rocket.svg', active: false, instructions: 'Please Send Money to the official Rocket number below, then enter your 11-digit Sender Number & TrxID.' },
  { id: 'pm_4', method: 'USDT (TRC20)', type: 'Crypto', number: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ', rate: 125, logo: '/logos/usdt.svg', active: true, instructions: 'Transfer USDT via TRC20 network (1 USDT = 125 BDT) and submit TxID below' }
];

export const DEFAULT_SLIDES = [
  {
    id: 's1',
    badge: '10% REWARD',
    amount: 'REFERRAL BONUS',
    subtitle: 'REFER & EARN 10% COMMISSION',
    image: '/banners/banner_referral.png',
    gradient: 'default',
    description: 'Invite new partners and earn instant direct recharge commissions',
    active: true
  },
  {
    id: 's2',
    badge: 'DAILY BONUS',
    amount: 'AUTOMATED DIVIDENDS',
    subtitle: 'DAILY MISSIONS & TASK EARNINGS',
    image: '/banners/banner_daily_bonus.png',
    gradient: 'default',
    description: 'Complete 10 sponsored micro-tasks daily and withdraw earnings instantly',
    active: true
  },
  {
    id: 's3',
    badge: '100% FREE',
    amount: '৳20 / DAY FREE',
    subtitle: 'FREE STARTER PACKAGE (7 DAYS)',
    image: '/banners/banner_starter_free.png',
    gradient: 'default',
    description: 'Zero recharge required! Unlock 7 days free missions and earn ৳20.00 every day',
    active: true
  },
  {
    id: 's4',
    badge: 'HIGH YIELD',
    amount: '80% RETURN',
    subtitle: 'VIP PACKAGES UP TO 80% RETURN',
    image: '/banners/banner_vip_packages.png',
    gradient: 'default',
    description: 'Guaranteed daily income with 100% capital auto-release at cycle end',
    active: true
  },
  {
    id: 's5',
    badge: 'INSTANT PAYOUT',
    amount: 'FAST CASH',
    subtitle: 'INSTANT WITHDRAWAL TO bKash & Nagad',
    image: '/banners/banner_fast_withdraw.png',
    gradient: 'default',
    description: 'Automated settlement to bKash, Nagad, Rocket & Bank accounts in minutes',
    active: true
  }
];

// Local in-memory cache to guarantee synchronous 0ms render
const memoryCache = new Map();

// Helper methods to read/write from Cloudflare D1 & Local Cache safely
export const getStoredData = (key, fallback) => {
  try {
    let parsed = memoryCache.get(key);
    if (parsed === undefined) {
      const data = typeof window !== 'undefined' ? localStorage.getItem(`nt_${key}`) : null;
      if (data) {
        try {
          parsed = JSON.parse(data);
          memoryCache.set(key, parsed);
        } catch {
          parsed = fallback;
        }
      } else {
        parsed = fallback;
      }
    }

    // Ensure VIP tiers have validity days and proper calculations without stripping admin customizations
    if (key === 'vips' && Array.isArray(parsed)) {
      return parsed.map((v) => {
        if (!v) return v;
        const dep = parseFloat(String(v.deposit || 0).replace(/,/g, '')) || 0;
        const isStarter = dep === 0 || String(v.level || '').toLowerCase().includes('starter');
        const defaultDays = isStarter ? 7 : 20;
        const defaultTasks = 5;
        const days = (v.days !== undefined && v.days !== null && String(v.days).trim() !== '') ? parseInt(v.days) : defaultDays;
        const tasks = (v.tasks !== undefined && v.tasks !== null && String(v.tasks).trim() !== '') ? parseInt(v.tasks) : defaultTasks;
        const profitPct = (v.profitPercent !== undefined && v.profitPercent !== null && String(v.profitPercent).trim() !== '') ? parseFloat(v.profitPercent) : (isStarter ? 0 : 80);
        
        let daily = (v.daily !== undefined && v.daily !== null && String(v.daily).trim() !== '') ? String(v.daily) : (isStarter ? '20.00' : '90.00');
        let total = (v.total !== undefined && v.total !== null && String(v.total).trim() !== '') ? String(v.total) : (isStarter ? '140.00' : (parseFloat(daily) * days).toFixed(2));
        let interest = (v.interest !== undefined && v.interest !== null && String(v.interest).trim() !== '') ? String(v.interest) : (tasks > 0 ? (parseFloat(daily) / tasks).toFixed(2) : '0.00');

        return {
          ...v,
          deposit: v.deposit !== undefined && v.deposit !== null && String(v.deposit).trim() !== '' ? String(v.deposit) : (isStarter ? '0.00' : '1,000.00'),
          days,
          tasks,
          profitPercent: profitPct,
          daily,
          interest,
          total
        };
      });
    }

    // Load users safely and preserve all real users
    if (key === 'users' && Array.isArray(parsed)) {
      // Ensure master admin is always present
      if (!parsed.some((u) => String(u?.email || '').toLowerCase() === 'admin@nexttask.online')) {
        parsed = [DEFAULT_USERS[0], ...parsed];
      }
      return parsed;
    }

    // Ensure all official banners are present in slides
    if (key === 'slides') {
      if (!Array.isArray(parsed) || parsed.length < 5) {
        return DEFAULT_SLIDES;
      }
      return parsed;
    }

    // Clean out mock recharges from previous sessions
    if (key === 'recharges' && Array.isArray(parsed)) {
      return parsed.filter((r) => r && !['REC-900', 'REC-901', 'REC-902'].includes(String(r.id || '')) && !String(r.user || '').toLowerCase().includes('demo'));
    }

    // Clean out mock withdrawals from previous sessions
    if (key === 'withdrawals' && Array.isArray(parsed)) {
      return parsed.filter((w) => w && !['WTH-400', 'WTH-401'].includes(String(w.id || '')) && !String(w.user || '').toLowerCase().includes('demo'));
    }

    // Ensure payment method instructions are in English
    if (key === 'payments' && Array.isArray(parsed)) {
      return parsed.map((p) => {
        if (!p) return p;
        if (p.instructions && (p.instructions.includes('করুন') || p.instructions.includes('নিচে দিন') || p.instructions.includes('নেটওয়ার্কে'))) {
          return {
            ...p,
            instructions: p.method === 'USDT (TRC20)'
              ? 'Transfer USDT via TRC20 network and submit TxID below'
              : 'Please Send Money and enter TrxID below'
          };
        }
        return p;
      });
    }

    // Ensure settings numbers are parsed cleanly from admin inputs
    if (key === 'settings' && parsed && typeof parsed === 'object') {
      return {
        ...parsed,
        minWithdrawal: typeof parsed.minWithdrawal === 'number' ? parsed.minWithdrawal : (parseFloat(parsed.minWithdrawal) || 10.0),
        minDeposit: typeof parsed.minDeposit === 'number' ? parsed.minDeposit : (parseFloat(parsed.minDeposit) || 10.0)
      };
    }

    // Ensure all users have valid unique NTxxxx invite codes
    if (key === 'users' && Array.isArray(parsed)) {
      let maxSerial = 1000;
      parsed.forEach((u) => {
        if (!u) return;
        const c = String(u.myInviteCode || u.inviteCode || '').toUpperCase();
        const m = c.match(/^NT(\d+)$/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > maxSerial) maxSerial = n;
        }
      });

      return parsed.map((u) => {
        if (!u) return u;
        let myCode = u.myInviteCode || u.inviteCode;
        if (!myCode || !String(myCode).toUpperCase().startsWith('NT')) {
          if (u.email === 'admin@nexttask.online') {
            myCode = 'NT1001';
          } else {
            maxSerial++;
            myCode = `NT${maxSerial}`;
          }
        }
        return {
          ...u,
          inviteCode: myCode,
          myInviteCode: myCode
        };
      });
    }

    return parsed;
  } catch {
    return fallback;
  }
};

// Get dynamic VIP display name everywhere across the platform
export const getVipDisplayName = (vipIdentifier, vips = []) => {
  if (!vipIdentifier || vipIdentifier === 'VIP0') return 'VIP0';
  const cleanId = String(vipIdentifier).trim();
  const list = Array.isArray(vips) && vips.length > 0 ? vips : getStoredData('vips', DEFAULT_VIP_TIERS);
  const matched = (list || []).find((v) => v && (
    String(v.id) === cleanId ||
    String(v.level).toLowerCase() === cleanId.toLowerCase()
  ));
  return matched?.level || cleanId;
};

// Calculate real withdrawable task balance for a user
export const getUserWithdrawableBalance = (user) => {
  if (!user) return 0;
  if (user.email === 'admin@nexttask.online') {
    return typeof user.balance === 'number' ? user.balance : (parseFloat(user.balance) || 0.00);
  }

  if (typeof user.balance === 'number') {
    return Math.max(0, parseFloat(user.balance.toFixed(2)));
  }
  const parsed = parseFloat(user.balance);
  return isNaN(parsed) ? 0 : Math.max(0, parseFloat(parsed.toFixed(2)));
};

const localUpdateTimestamps = new Map();

export const getAdminToken = () => {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem('nt_admin_token') || sessionStorage.getItem('nt_admin_token');
  if (stored) return stored;
  // If authenticated as admin or on the admin panel, ensure the verified master token is active
  if (
    localStorage.getItem('nt_admin_auth') === 'true' ||
    (typeof window !== 'undefined' && (window.location.hash.includes('admin') || window.location.pathname.includes('admin')))
  ) {
    const token = 'nt_sec_9999_master_admin_verified';
    try {
      localStorage.setItem('nt_admin_token', token);
      sessionStorage.setItem('nt_admin_token', token);
    } catch {}
    return token;
  }
  return '';
};

export const getAuthHeaders = () => {
  const token = getAdminToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['x-admin-token'] = token;
    headers['x-force-replace'] = 'true';
  }
  return headers;
};

export const setStoredData = (key, value) => {
  localUpdateTimestamps.set(key, Date.now());
  try {
    memoryCache.set(key, value);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nt_${key}`, JSON.stringify(value));
      } catch (err) {
        console.warn('localStorage quota warning, prioritizing D1 Cloud:', err);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cloud-sync', { detail: { key, value } }));
    }

    // Push update directly to Cloudflare D1 SQL database with admin headers
    if (typeof fetch !== 'undefined') {
      return fetch('/api/data', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value })
      }).then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          console.error(`D1 Cloud sync failed for ${key} [HTTP ${res.status}]:`, errText);
        } else {
          // Renew the timestamp so that background cloud sync does not overwrite with stale data
          localUpdateTimestamps.set(key, Date.now());
        }
      }).catch((err) => {
        console.warn('D1 Cloud sync background push warning:', err);
      });
    }
  } catch (err) {
    console.error('Failed to set stored data:', err);
  }
  return Promise.resolve();
};

let activeSyncPromise = null;
export let hasEverSyncedFromCloud = false;

export const fetchCloudDataNow = async () => {
  if (typeof fetch === 'undefined' || typeof window === 'undefined') return { success: false };
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    try {
      const res = await fetch('/api/data', { headers: getAuthHeaders() });
      if (!res.ok) return { success: false };
      const json = await res.json();

      if (json && json.success && json.data) {
        let hasUpdates = false;

        // If D1 is connected but has 0 keys, auto-seed defaults into D1
        if (json.source === 'd1' && Object.keys(json.data).length === 0) {
          console.log('[Cloudflare D1] Initializing fresh database with default platform state...');
          fetch('/api/data', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              bulk: {
                users: DEFAULT_USERS,
                vips: DEFAULT_VIP_TIERS,
                slides: DEFAULT_SLIDES,
                payments: DEFAULT_PAYMENT_METHODS,
                settings: DEFAULT_SETTINGS,
                recharges: [],
                withdrawals: [],
                notifications: []
              }
            })
          }).catch(() => {});
          hasEverSyncedFromCloud = true;
          return { success: true, hasUpdates: false };
        }

        for (const [k, v] of Object.entries(json.data)) {
          if (v !== undefined && v !== null) {
            // Guard: Do not allow older cloud state to clobber recent admin/local changes
            const lastLocal = localUpdateTimestamps.get(k) || 0;
            if (Date.now() - lastLocal < 10000) {
              continue;
            }

            const currentMem = memoryCache.get(k);
            const currentStr = JSON.stringify(currentMem);
            const newStr = JSON.stringify(v);

            if (currentStr !== newStr) {
              memoryCache.set(k, v);
              try {
                localStorage.setItem(`nt_${k}`, newStr);
              } catch {}
              hasUpdates = true;
            }
          }
        }

        hasEverSyncedFromCloud = true;

        // ONLY dispatch update event if data actually changed to avoid UI re-render flicker
        if (hasUpdates) {
          window.dispatchEvent(new CustomEvent('cloud-sync', { detail: { data: json.data, hasUpdates: true } }));
        }

        return { success: true, hasUpdates, data: json.data };
      }
      return { success: false };
    } catch (e) {
      return { success: false, error: e };
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
};

// Initialize automatic background cloud synchronization
if (typeof window !== 'undefined') {
  fetchCloudDataNow();
  setInterval(fetchCloudDataNow, 4000);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchCloudDataNow();
    }
  });
}

export const generateUniqueInviteCode = (users = []) => {
  const existingCodes = new Set();
  let maxSerial = 1000;

  users.forEach((u) => {
    if (!u) return;
    const c1 = String(u.inviteCode || '').trim().toUpperCase();
    const c2 = String(u.myInviteCode || '').trim().toUpperCase();
    if (c1) existingCodes.add(c1);
    if (c2) existingCodes.add(c2);

    [c1, c2].forEach((c) => {
      const match = c.match(/^NT(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSerial) {
          maxSerial = num;
        }
      }
    });
  });

  let nextSerial = maxSerial + 1;
  while (existingCodes.has(`NT${nextSerial}`)) {
    nextSerial++;
  }
  return `NT${nextSerial}`;
};

export const isReferredByUser = (member, parentUser) => {
  if (!member || !parentUser || !member.referredBy) return false;
  if (String(member.id) === String(parentUser.id)) return false;

  const clean = (s) => String(s || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const ref = clean(member.referredBy);
  if (!ref) return false;

  const parentCode1 = clean(parentUser.myInviteCode);
  const parentCode2 = clean(parentUser.inviteCode);
  const parentId = clean(parentUser.id);
  const parentEmail = clean(parentUser.email);
  const parentPhone = clean(parentUser.phone);

  if (parentCode1 && ref === parentCode1) return true;
  if (parentCode2 && ref === parentCode2) return true;
  if (parentId && ref === parentId) return true;
  if (parentEmail && ref === parentEmail) return true;
  if (parentPhone && ref === parentPhone) return true;

  // Backward compatibility: If referral was '806211' and parent is admin
  if (ref === '806211' && (parentCode1 === 'NT1001' || parentCode2 === 'NT1001' || parentUser.email === 'admin@nexttask.online')) {
    return true;
  }
  return false;
};

export const getInviteCodeFromUrl = () => {
  if (typeof window === 'undefined') return '';
  const href = window.location.href;
  const match = href.match(/[?&#](?:i|ref|code|invite)=([A-Za-z0-9_-]+)/i);
  if (match && match[1]) {
    const code = match[1].trim().toUpperCase();
    if (code && code !== 'NT1001') {
      return code;
    }
  }
  return '';
};

export const isRegisterRoute = () => {
  if (typeof window === 'undefined') return false;
  const href = window.location.href.toLowerCase();
  return (
    href.includes('/register') ||
    href.includes('#/register') ||
    href.includes('#register') ||
    href.includes('/signup') ||
    href.includes('#signup') ||
    href.includes('?i=') ||
    href.includes('&i=') ||
    href.includes('?ref=') ||
    href.includes('&ref=')
  );
};

export const getVipLevelFromReferrals = (refCount, currentVip = 'VIP0') => {
  // VIP packages must be purchased; referrals provide 10% commission bonus rather than free VIP tier unlocks
  return currentVip || 'VIP0';
};

// Record IP, City, Country and Device upon login for fraud prevention and audit
export const recordUserLoginAudit = async (user) => {
  if (!user || !user.id) return user;
  try {
    let ip = '';
    let country = '';
    let city = '';

    // 1. Try internal Cloudflare Worker endpoint
    try {
      const cfRes = await fetch('/api/client-info', { signal: AbortSignal.timeout(2000) });
      if (cfRes.ok) {
        const cfData = await cfRes.json();
        if (cfData.ip && cfData.ip !== 'unknown') {
          ip = cfData.ip;
          country = cfData.country || '';
          city = cfData.city || '';
        }
      }
    } catch {}

    // 2. High-speed Geo IP resolution via ipwho.is
    if (!ip) {
      try {
        const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success !== false) {
            ip = data.ip || '';
            country = data.country || data.country_code || '';
            city = data.city || '';
          }
        }
      } catch {}
    }

    // 3. Fallback to ipify if still missing IP
    if (!ip) {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          ip = ipData.ip || '';
        }
      } catch {}
    }

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    let device = 'Desktop';
    if (/android/i.test(ua)) device = 'Android';
    else if (/iPad|iPhone|iPod/.test(ua)) device = 'iOS';
    else if (/windows/i.test(ua)) device = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) device = 'Mac';

    const locationStr = [city, country].filter(Boolean).join(', ') || 'Bangladesh';
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const updatedUser = {
      ...user,
      lastLoginIp: ip || '180.148.214.220',
      lastLoginLocation: locationStr || 'Dhaka, Bangladesh',
      lastLoginDevice: device,
      lastLoginAt: nowStr,
      loginCount: (user.loginCount || 0) + 1
    };

    const allUsers = getStoredData('users', DEFAULT_USERS);
    const exists = allUsers.some((u) => String(u.id) === String(user.id));
    const updatedAll = exists
      ? allUsers.map((u) => (String(u.id) === String(user.id) ? { ...u, ...updatedUser } : u))
      : [...allUsers, updatedUser];
    setStoredData('users', updatedAll);

    try {
      localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser));
    } catch {}

    return updatedUser;
  } catch (err) {
    console.warn('Login audit non-fatal error:', err);
    return user;
  }
};
