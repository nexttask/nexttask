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
  { id: '101', email: 'Sajuahmed4110@gmail.com', phone: '+8801712345678', password: 'password', vip: 'VIP0', balance: 0.00, recharge: 0.00, status: 'active', joined: '2026-10-30' },
  { id: '102', email: 'alex.trader@gmail.com', phone: '+14155550192', password: 'password', vip: 'VIP3', balance: 145.50, recharge: 170.00, status: 'active', joined: '2026-10-28' },
  { id: '103', email: 'crypto_boss@yahoo.com', phone: '+447911123456', password: 'password', vip: 'VIP5', balance: 820.00, recharge: 770.00, status: 'active', joined: '2026-10-25' },
  { id: '104', email: 'spammer99@fake.org', phone: '+8801999888777', password: 'password', vip: 'VIP1', balance: 2.00, recharge: 10.00, status: 'banned', joined: '2026-10-29' },
];

export const DEFAULT_RECHARGES = [
  { id: 'REC-901', user: 'alex.trader@gmail.com', amount: 170.00, network: 'TRC20', txid: '7b8f9e...2a1c', date: '2026-10-30 22:15', status: 'pending' },
  { id: 'REC-902', user: 'Sajuahmed4110@gmail.com', amount: 50.00, network: 'TRC20', txid: '3d4c5a...8e9f', date: '2026-10-31 00:10', status: 'pending' },
  { id: 'REC-900', user: 'crypto_boss@yahoo.com', amount: 770.00, network: 'TRC20', txid: '1a2b3c...4d5e', date: '2026-10-25 14:30', status: 'approved' },
];

export const DEFAULT_WITHDRAWALS = [
  { id: 'WTH-401', user: 'alex.trader@gmail.com', amount: 55.00, address: 'TWK87r9...9zL1', date: '2026-10-31 00:05', status: 'pending' },
  { id: 'WTH-400', user: 'crypto_boss@yahoo.com', amount: 200.00, address: 'TKj43m2...8xN9', date: '2026-10-29 18:20', status: 'approved' },
];

export const DEFAULT_SETTINGS = {
  platformName: 'NextTask',
  trc20Address: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ',
  minWithdrawal: 1.0,
  minDeposit: 10.0,
  telegramSupport: '@NextTask_Support',
};

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'pm_1', method: 'bKash', type: 'Personal', number: '01712345678', rate: 125, active: true, instructions: 'Send Money করুন এবং TrxID নিচে দিন' },
  { id: 'pm_2', method: 'Nagad', type: 'Personal', number: '01812345678', rate: 125, active: true, instructions: 'Send Money করুন এবং TrxID নিচে দিন' },
  { id: 'pm_3', method: 'Rocket', type: 'Personal', number: '01912345678', rate: 125, active: true, instructions: 'Send Money করুন এবং TrxID নিচে দিন' },
  { id: 'pm_4', method: 'USDT (TRC20)', type: 'Crypto', number: 'TXk9rM8h4K2pQv9xYzN1L3s87AbCdEfGhJ', rate: 1, active: true, instructions: 'TRC20 নেটওয়ার্কে ট্রান্সফার করুন' }
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
    return data ? JSON.parse(data) : fallback;
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
