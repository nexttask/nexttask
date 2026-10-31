// Shared State Store with LocalStorage Persistence

export const DEFAULT_VIP_TIERS = [
  { id: '1', level: 'VIP1', deposit: '10.00', tasks: 10, interest: '0.70', daily: '7.00', total: '1,680.00' },
  { id: '2', level: 'VIP2', deposit: '70.00', tasks: 10, interest: '4.90', daily: '49.00', total: '11,760.00' },
  { id: '3', level: 'VIP3', deposit: '170.00', tasks: 10, interest: '11.90', daily: '119.00', total: '28,560.00' },
  { id: '4', level: 'VIP4', deposit: '370.00', tasks: 10, interest: '25.90', daily: '259.00', total: '62,160.00' },
  { id: '5', level: 'VIP5', deposit: '770.00', tasks: 10, interest: '53.90', daily: '539.00', total: '129,360.00' },
  { id: '6', level: 'VIP6', deposit: '1,570.00', tasks: 10, interest: '109.90', daily: '1,099.00', total: '263,760.00' },
  { id: '7', level: 'VIP7', deposit: '3,570.00', tasks: 10, interest: '267.70', daily: '2,677.00', total: '642,480.00' },
  { id: '8', level: 'VIP8', deposit: '7,770.00', tasks: 10, interest: '599.00', daily: '5,990.00', total: '1,437,600.00' },
  { id: '9', level: 'VIP9', deposit: '17,700.00', tasks: 10, interest: '1416.00', daily: '14,160.00', total: '3,398,400.00' },
  { id: '10', level: 'VIP10', deposit: '27,700.00', tasks: 10, interest: '2354.50', daily: '23,545.00', total: '5,650,800.00' },
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
    balance: 99999.00,
    recharge: 99999.00,
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

export const DEFAULT_SETTINGS = {
  platformName: 'NextTask',
  trc20Address: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ',
  minWithdrawal: 10.0,
  minDeposit: 10.0,
  telegramSupport: '@NextTask_Support',
};

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'pm_1', method: 'bKash', type: 'Personal', number: '01712345678', rate: 125, active: true, instructions: 'Please Send Money and enter TrxID below' },
  { id: 'pm_2', method: 'Nagad', type: 'Personal', number: '01812345678', rate: 125, active: true, instructions: 'Please Send Money and enter TrxID below' },
  { id: 'pm_3', method: 'Rocket', type: 'Personal', number: '01912345678', rate: 125, active: true, instructions: 'Please Send Money and enter TrxID below' },
  { id: 'pm_4', method: 'USDT (TRC20)', type: 'Crypto', number: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ', rate: 1, active: true, instructions: 'Transfer USDT via TRC20 network and submit TxID below' }
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

      if (hasUpdates) {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cloud-sync', { detail: { data: json.data } }));
      }
    }
  } catch {
    // Graceful offline fallback
  } finally {
    isCloudSyncing = false;
  }
};

// Initialize automatic cloud synchronization
if (typeof window !== 'undefined') {
  setTimeout(fetchCloudDataNow, 100);
  setInterval(fetchCloudDataNow, 6000);
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
