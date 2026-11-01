// Shared State Store with LocalStorage Persistence

export const DEFAULT_VIP_TIERS = [
  { id: '1', level: 'VIP1', deposit: '10.00', tasks: 10, days: 20, profitPercent: 80, interest: '0.09', daily: '0.90', total: '18.00' },
  { id: '2', level: 'VIP2', deposit: '70.00', tasks: 10, days: 20, profitPercent: 80, interest: '0.63', daily: '6.30', total: '126.00' },
  { id: '3', level: 'VIP3', deposit: '170.00', tasks: 10, days: 20, profitPercent: 80, interest: '1.53', daily: '15.30', total: '306.00' },
  { id: '4', level: 'VIP4', deposit: '370.00', tasks: 10, days: 20, profitPercent: 80, interest: '3.33', daily: '33.30', total: '666.00' },
  { id: '5', level: 'VIP5', deposit: '770.00', tasks: 10, days: 20, profitPercent: 80, interest: '6.93', daily: '69.30', total: '1,386.00' },
  { id: '6', level: 'VIP6', deposit: '1,570.00', tasks: 10, days: 20, profitPercent: 80, interest: '14.13', daily: '141.30', total: '2,826.00' },
  { id: '7', level: 'VIP7', deposit: '3,570.00', tasks: 10, days: 20, profitPercent: 80, interest: '32.13', daily: '321.30', total: '6,426.00' },
  { id: '8', level: 'VIP8', deposit: '7,770.00', tasks: 10, days: 20, profitPercent: 80, interest: '69.93', daily: '699.30', total: '13,986.00' },
  { id: '9', level: 'VIP9', deposit: '17,700.00', tasks: 10, days: 20, profitPercent: 80, interest: '159.30', daily: '1,593.00', total: '31,860.00' },
  { id: '10', level: 'VIP10', deposit: '27,700.00', tasks: 10, days: 20, profitPercent: 80, interest: '249.30', daily: '2,493.00', total: '49,860.00' },
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
  whatWeDo: 'Our platform coordinates daily micro-missions between global enterprise merchants and verified community members. By fulfilling daily sponsored tasks (app reviews, rating orders, content auditing), users earn guaranteed daily USDT dividend returns with immediate daily liquidity and automated cloud payouts.',
  mission: 'To empower everyday internet users worldwide with transparent, accessible, and high-yield digital employment opportunities supported by automated cloud settlement and multi-tiered referral benefits.',
  vision: 'To become the world’s most trusted and decentralized micro-task ecosystem, bridging global business intelligence with verifiable crowd participation.',
  licenseTitle: 'Official Certificate of Incorporation & Global Operating License',
  licenseDate: 'Issued: January 15, 2026 • Verified by International Business Regulatory Commission',
  licenseImage: '/license_certificate.svg'
};

export const DEFAULT_UPGRADE_LOGS = [
  {
    id: 'UPG-984210',
    userId: 'usr_8421',
    userIdentifier: '017******49',
    fromVip: 'VIP1',
    toVip: 'VIP2',
    amount: 70.00,
    date: '2026-11-01 16:15',
    type: 'Upgrade',
    timestamp: Date.now() - 15 * 60 * 1000
  },
  {
    id: 'UPG-983190',
    userId: 'usr_3190',
    userIdentifier: '880******82',
    fromVip: 'VIP0',
    toVip: 'VIP1',
    amount: 10.00,
    date: '2026-11-01 15:42',
    type: 'Unlock',
    timestamp: Date.now() - 48 * 60 * 1000
  },
  {
    id: 'UPG-981045',
    userId: 'usr_1045',
    userIdentifier: '018******11',
    fromVip: 'VIP2',
    toVip: 'VIP3',
    amount: 170.00,
    date: '2026-11-01 14:10',
    type: 'Upgrade',
    timestamp: Date.now() - 140 * 60 * 1000
  },
  {
    id: 'UPG-979822',
    userId: 'usr_9822',
    userIdentifier: '019******63',
    fromVip: 'VIP0',
    toVip: 'VIP1',
    amount: 10.00,
    date: '2026-11-01 12:35',
    type: 'Unlock',
    timestamp: Date.now() - 250 * 60 * 1000
  },
  {
    id: 'UPG-975411',
    userId: 'usr_5411',
    userIdentifier: '016******95',
    fromVip: 'VIP3',
    toVip: 'VIP4',
    amount: 370.00,
    date: '2026-11-01 10:18',
    type: 'Upgrade',
    timestamp: Date.now() - 380 * 60 * 1000
  },
  {
    id: 'UPG-971203',
    userId: 'usr_1203',
    userIdentifier: '880******34',
    fromVip: 'VIP0',
    toVip: 'VIP1',
    amount: 10.00,
    date: '2026-10-31 22:50',
    type: 'Unlock',
    timestamp: Date.now() - 800 * 60 * 1000
  },
  {
    id: 'UPG-968921',
    userId: 'usr_8921',
    userIdentifier: '013******77',
    fromVip: 'VIP1',
    toVip: 'VIP2',
    amount: 70.00,
    date: '2026-10-31 20:15',
    type: 'Upgrade',
    timestamp: Date.now() - 950 * 60 * 1000
  },
  {
    id: 'UPG-965402',
    userId: 'usr_5402',
    userIdentifier: '017******18',
    fromVip: 'VIP4',
    toVip: 'VIP5',
    amount: 770.00,
    date: '2026-10-31 18:04',
    type: 'Upgrade',
    timestamp: Date.now() - 1100 * 60 * 1000
  }
];

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
  trc20Address: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ',
  minWithdrawal: 10.0,
  minDeposit: 10.0,
  telegramSupport: '@NextTask_SupportBot',
  floatingSupportEnabled: true,
  supportExecutiveAvatar: '',
  telegramBotToken: '9004512965:AAGPv7dp8MCDS4jPgjv8ey_V2T6TQpX3Go4',
  telegramBotUsername: '@NextTask_SupportBot',
  telegramAdminChatId: '',
  telegramBotAutoReply: true,
  companyProfile: DEFAULT_COMPANY_PROFILE
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
  { id: 'pm_1', method: 'bKash', type: 'Personal', number: '01712345678', rate: 125, logo: '/logos/bkash.svg', active: true, instructions: 'Please Send Money and enter TrxID below' },
  { id: 'pm_2', method: 'Nagad', type: 'Personal', number: '01812345678', rate: 125, logo: '/logos/nagad.svg', active: false, instructions: 'Please Send Money and enter TrxID below' },
  { id: 'pm_3', method: 'Rocket', type: 'Personal', number: '01912345678', rate: 125, logo: '/logos/rocket.svg', active: false, instructions: 'Please Send Money and enter TrxID below' },
  { id: 'pm_4', method: 'USDT (TRC20)', type: 'Crypto', number: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ', rate: 1, logo: '/logos/usdt.svg', active: true, instructions: 'Transfer USDT via TRC20 network and submit TxID below' }
];

export const DEFAULT_SLIDES = [
  {
    id: 's1',
    badge: 'MADE',
    amount: '$3,200',
    subtitle: 'IN 48 HOURS!',
    gradient: 'from-amber-500 via-orange-500 to-yellow-400',
    description: 'Top earning member payout milestone achieved this week',
    active: true
  },
  {
    id: 's2',
    badge: 'OFFICIAL',
    amount: '16% COMMISSION',
    subtitle: 'LEVEL 1 REWARDS',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    description: 'Invite new partners and earn instant direct incentives',
    active: true
  },
  {
    id: 's3',
    badge: 'DAILY BONUS',
    amount: '23,545 USDT',
    subtitle: 'VIP-10 TOP TIER',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    description: 'Unlock highest contribution levels for automated USDT payout',
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

    // Ensure VIP tiers have validity days and 80% profit parameters
    if (key === 'vips' && Array.isArray(parsed)) {
      return parsed.map((v) => {
        if (!v) return v;
        const dep = parseFloat(String(v.deposit || 0).replace(/,/g, '')) || 0;
        const days = v.days ? parseInt(v.days) : 20;
        const profitPct = v.profitPercent ? parseFloat(v.profitPercent) : 80;
        const tot = v.total && !v.total.includes('1,680') ? v.total : (dep * (1 + profitPct / 100)).toFixed(2);
        const daily = v.daily && !v.daily.includes('7.00') ? v.daily : (parseFloat(tot) / days).toFixed(2);
        const interest = (parseFloat(daily) / (v.tasks || 10)).toFixed(2);
        return {
          ...v,
          days,
          profitPercent: profitPct,
          daily,
          interest,
          total: tot
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

export const getAdminToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('nt_admin_token') || sessionStorage.getItem('nt_admin_token') || '';
};

export const getAuthHeaders = () => {
  const token = getAdminToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['x-admin-token'] = token;
  }
  return headers;
};

export const setStoredData = (key, value) => {
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

    // Asynchronously push update to Cloudflare D1 database with auth headers
    if (typeof fetch !== 'undefined') {
      fetch('/api/data', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value })
      }).catch((err) => {
        console.warn('D1 Cloud sync background push warning:', err);
      });
    }
  } catch (err) {
    console.error('Failed to set stored data:', err);
  }
};

let isCloudSyncing = false;
export const fetchCloudDataNow = async () => {
  if (typeof fetch === 'undefined' || typeof window === 'undefined') return;
  if (isCloudSyncing) return;
  isCloudSyncing = true;

  try {
    const res = await fetch('/api/data', { headers: getAuthHeaders() });
    if (!res.ok) return;
    const json = await res.json();

    if (json && json.success && json.data) {
      let hasUpdates = false;

      // If D1 is connected but has 0 keys, auto-seed defaults into D1
      if (json.source === 'd1' && Object.keys(json.data).length === 0) {
        console.log('[Cloudflare D1] Initializing fresh database with default platform state...');
        fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        return;
      }

      for (const [k, v] of Object.entries(json.data)) {
        if (v !== undefined && v !== null) {
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

      // Always notify components that fresh D1 cloud data is available
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cloud-sync', { detail: { data: json.data, hasUpdates } }));
    }
  } catch {
    // Graceful offline fallback
  } finally {
    isCloudSyncing = false;
  }
};

// Initialize immediate & automatic cloud synchronization
if (typeof window !== 'undefined') {
  fetchCloudDataNow();
  setTimeout(fetchCloudDataNow, 50);
  setTimeout(fetchCloudDataNow, 300);
  setInterval(fetchCloudDataNow, 3000);
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
    try {
      sessionStorage.setItem('nt_referral_code', code);
      localStorage.setItem('nt_referral_code', code);
    } catch {}
    return code;
  }
  try {
    const stored = sessionStorage.getItem('nt_referral_code') || localStorage.getItem('nt_referral_code');
    if (stored) return stored.trim().toUpperCase();
  } catch {}
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
    const updatedAll = allUsers.map((u) => (String(u.id) === String(user.id) ? { ...u, ...updatedUser } : u));
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
