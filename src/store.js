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

// Helper methods to read/write from localStorage safely
export const getStoredData = (key, fallback) => {
  try {
    const data = localStorage.getItem(`nt_${key}`);
    if (!data) return fallback;
    const parsed = JSON.parse(data);

    // Clean out mock users from previous sessions
    if (key === 'users' && Array.isArray(parsed)) {
      const cleaned = parsed.filter((u) => {
        if (!u) return false;
        // Keep master admin, remove hardcoded demo users
        const idStr = String(u.id || '');
        if (['101', '102', '103', '104'].includes(idStr)) return false;
        const emailStr = String(u.email || '').toLowerCase();
        if (['alex.trader@gmail.com', 'crypto_boss@yahoo.com', 'spammer99@fake.org'].includes(emailStr)) return false;
        return true;
      });
      // Ensure master admin is always present
      if (!cleaned.some((u) => String(u?.email || '').toLowerCase() === 'admin@nexttask.online')) {
        cleaned.unshift(DEFAULT_USERS[0]);
      }
      return cleaned;
    }

    // Clean out mock recharges from previous sessions
    if (key === 'recharges' && Array.isArray(parsed)) {
      return parsed.filter((r) => r && !['REC-900', 'REC-901', 'REC-902'].includes(String(r.id || '')));
    }

    // Clean out mock withdrawals from previous sessions
    if (key === 'withdrawals' && Array.isArray(parsed)) {
      return parsed.filter((w) => w && !['WTH-400', 'WTH-401'].includes(String(w.id || '')));
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

    // Ensure minWithdrawal is at least 10 USDT
    if (key === 'settings' && parsed && typeof parsed === 'object') {
      return {
        ...parsed,
        minWithdrawal: Math.max(10.0, parseFloat(parsed.minWithdrawal) || 10.0)
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

export const setStoredData = (key, value) => {
  try {
    localStorage.setItem(`nt_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

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
  const ref = String(member.referredBy).trim().toUpperCase();
  const parentCode = String(parentUser.myInviteCode || parentUser.inviteCode || '').trim().toUpperCase();
  const parentId = String(parentUser.id || '').trim().toUpperCase();

  if (ref === parentCode || ref === parentId) return true;
  // Backward compatibility: If referral was '806211' and parent is admin
  if (ref === '806211' && (parentCode === 'NT1001' || parentCode === '806211' || parentUser.email === 'admin@nexttask.online')) {
    return true;
  }
  return false;
};

export const getInviteCodeFromUrl = () => {
  if (typeof window === 'undefined') return '';
  const href = window.location.href;
  const match = href.match(/[?&#](?:i|ref|code|invite)=([A-Za-z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1].trim().toUpperCase();
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
  const vipOrder = ['VIP0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5', 'VIP6', 'VIP7', 'VIP8', 'VIP9', 'VIP10'];
  let refVip = 'VIP0';
  if (refCount >= 120) refVip = 'VIP10';
  else if (refCount >= 85) refVip = 'VIP9';
  else if (refCount >= 60) refVip = 'VIP8';
  else if (refCount >= 40) refVip = 'VIP7';
  else if (refCount >= 25) refVip = 'VIP6';
  else if (refCount >= 15) refVip = 'VIP5';
  else if (refCount >= 10) refVip = 'VIP4';
  else if (refCount >= 6) refVip = 'VIP3';
  else if (refCount >= 3) refVip = 'VIP2';
  else if (refCount >= 1) refVip = 'VIP1';

  const refIdx = vipOrder.indexOf(refVip);
  const curIdx = vipOrder.indexOf(currentVip);
  return refIdx > curIdx ? refVip : currentVip;
};
