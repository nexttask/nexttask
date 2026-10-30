import React, { useState, useEffect } from 'react';
import {
  Home,
  CheckSquare,
  Users,
  Gem,
  User,
  Copy,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Mail,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  KeyRound,
  LogOut,
  Share2,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  Wallet,
  Bell,
  Crown,
  Download,
  Building2,
  UserPlus,
  ChevronsRight,
  Coins,
  Shield,
  ChevronDown
} from 'lucide-react';
import AdminPanel from './AdminPanel';
import {
  getStoredData,
  setStoredData,
  DEFAULT_VIP_TIERS,
  DEFAULT_SETTINGS,
  DEFAULT_SLIDES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_RECHARGES
} from './store';
import { LANGUAGES, TRANSLATIONS } from './translations';

const MEMBER_LIST_DATA = [
  { amount: '+$14,160.00', user: '856******340', vip: 'VIP9' },
  { amount: '+$49.00', user: '251******465', vip: 'VIP2' },
  { amount: '+$119.00', user: 'Bee******nzj@gmail.com', vip: 'VIP3' },
  { amount: '+$119.00', user: 'elt******25@gmail.com', vip: 'VIP3' },
  { amount: '+$259.00', user: '917******882', vip: 'VIP4' },
  { amount: '+$539.00', user: 'kat******44@gmail.com', vip: 'VIP5' },
  { amount: '+$7.00', user: '017******110', vip: 'VIP1' },
  { amount: '+$1,099.00', user: 'alex******89', vip: 'VIP6' },
  { amount: '+$2,677.00', user: 'david******21@gmail.com', vip: 'VIP7' },
  { amount: '+$5,990.00', user: '88018******99', vip: 'VIP8' },
  { amount: '+$23,545.00', user: 'whale******01@gmail.com', vip: 'VIP10' },
  { amount: '+$49.00', user: 'maria******77', vip: 'VIP2' },
];

export default function App() {
  // Master Admin Route Detection (supports /admin and #/admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#/admin') ||
      window.location.hash.startsWith('#admin')
    );
  });

  // Dynamic Store Data
  const [vipTiers, setVipTiers] = useState(() => getStoredData('vips', DEFAULT_VIP_TIERS));
  const [settings, setSettings] = useState(() => getStoredData('settings', DEFAULT_SETTINGS));
  const [slides, setSlides] = useState(() => getStoredData('slides', DEFAULT_SLIDES));
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#/admin') ||
        window.location.hash.startsWith('#admin');
      setIsAdminRoute(isAdm);
      setVipTiers(getStoredData('vips', DEFAULT_VIP_TIERS));
      setSettings(getStoredData('settings', DEFAULT_SETTINGS));
      setSlides(getStoredData('slides', DEFAULT_SLIDES));
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('storage', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('storage', handleUrlChange);
    };
  }, []);

  // Navigation & Auth state
  const [activeTab, setActiveTab] = useState('home'); // Direct Home page when entering site!
  const [intendedTab, setIntendedTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Guest user initially
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);
  const [inviteCode] = useState('806211');
  const [regInviteCode, setRegInviteCode] = useState('');
  const [balance, setBalance] = useState(0.00);
  const [rechargeTotal, setRechargeTotal] = useState(0.00);
  const [userVip, setUserVip] = useState('VIP0');

  // Payment Methods & VIP Unlock State
  const [paymentMethods, setPaymentMethods] = useState(() => getStoredData('payments', DEFAULT_PAYMENT_METHODS));
  const [selectedVipForUnlock, setSelectedVipForUnlock] = useState(null);
  const [showUnlockConfirmModal, setShowUnlockConfirmModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('10.00');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(() => {
    const list = getStoredData('payments', DEFAULT_PAYMENT_METHODS);
    return list.find((p) => p.active) || list[0] || null;
  });
  const [senderAccount, setSenderAccount] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Modals & Popups
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpgradeLogModal, setShowUpgradeLogModal] = useState(false);
  const [showCompanyProfileModal, setShowCompanyProfileModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Language & Translation State
  const [lang, setLang] = useState(() => localStorage.getItem('nt_lang') || 'en');

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const handleSelectLang = (code) => {
    setLang(code);
    localStorage.setItem('nt_lang', code);
    setShowLangModal(false);
    showToast(`Language: ${LANGUAGES.find((l) => l.code === code)?.name}`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied!`);
  };

  const requireAuth = (targetTab, actionDesc) => {
    if (!isLoggedIn) {
      setIntendedTab(targetTab);
      setActiveTab('auth');
      showToast(actionDesc ? `Please sign in to ${actionDesc}` : 'Please sign in or register');
      return false;
    }
    return true;
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'home') {
      setActiveTab('home');
      return;
    }
    if (!isLoggedIn) {
      setIntendedTab(tabId);
      setActiveTab('auth');
      setAuthMode('login');
      showToast(`Please sign in or register to open ${tabId.toUpperCase()}`);
      return;
    }
    setActiveTab(tabId);
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    const emailOrPhone = loginMethod === 'email' ? userEmail : userPhone;
    if (!emailOrPhone) {
      showToast('Please enter your email or phone number');
      return;
    }
    if (!password) {
      showToast('Please enter password');
      return;
    }

    // Look up or initialize in users store
    const allUsers = getStoredData('users', DEFAULT_USERS);
    let matched = allUsers.find(
      (u) =>
        (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
        (u.phone && u.phone === emailOrPhone)
    );

    if (matched) {
      if (matched.status === 'banned') {
        showToast('This account has been suspended. Please contact support.');
        return;
      }
      if (matched.password && matched.password !== password) {
        showToast('Incorrect password! Click "Forgot password?" to reset.');
        return;
      }
    } else {
      matched = {
        id: String(Date.now()),
        email: loginMethod === 'email' ? emailOrPhone : `${emailOrPhone}@phone.user`,
        phone: loginMethod === 'phone' ? emailOrPhone : '',
        password: password,
        vip: 'VIP0',
        balance: 0.0,
        recharge: 0.0,
        status: 'active',
        joined: new Date().toISOString().slice(0, 10)
      };
      setStoredData('users', [matched, ...allUsers]);
    }

    setUserVip(matched.vip || 'VIP0');
    setBalance(matched.balance || 0);
    setRechargeTotal(matched.recharge || 0);

    setIsLoggedIn(true);
    setActiveTab(intendedTab && intendedTab !== 'auth' ? intendedTab : 'home');
    setShowAnnouncement(true);
    showToast('Signed in successfully!');
  };

  const handleRegister = (e) => {
    e?.preventDefault();
    const emailOrPhone = loginMethod === 'email' ? userEmail : userPhone;
    if (!emailOrPhone) {
      showToast('Please enter email or phone number');
      return;
    }
    if (!password) {
      showToast('Please enter password');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    if (password !== reenterPassword) {
      showToast('Passwords do not match');
      return;
    }

    const allUsers = getStoredData('users', DEFAULT_USERS);
    const existing = allUsers.find(
      (u) =>
        (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
        (u.phone && u.phone === emailOrPhone)
    );
    if (existing) {
      showToast('An account already exists with this email/phone. Please sign in.');
      setAuthMode('login');
      return;
    }

    const newUser = {
      id: String(Date.now()),
      email: loginMethod === 'email' ? emailOrPhone : `${emailOrPhone}@phone.user`,
      phone: loginMethod === 'phone' ? emailOrPhone : '',
      password: password,
      vip: 'VIP0',
      balance: 0.0,
      recharge: 0.0,
      status: 'active',
      joined: new Date().toISOString().slice(0, 10)
    };
    setStoredData('users', [newUser, ...allUsers]);

    setUserVip('VIP0');
    setBalance(0);
    setRechargeTotal(0);

    setIsLoggedIn(true);
    setActiveTab(intendedTab && intendedTab !== 'auth' ? intendedTab : 'home');
    setShowAnnouncement(true);
    showToast('Registration successful! Welcome to NextTask');
  };

  const handleResetPassword = (e) => {
    e?.preventDefault();
    const emailOrPhone = loginMethod === 'email' ? userEmail : userPhone;
    if (!emailOrPhone) {
      showToast('Please enter your registered email or phone');
      return;
    }
    if (!password) {
      showToast('Please enter new password');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    if (password !== reenterPassword) {
      showToast('Passwords do not match');
      return;
    }

    const allUsers = getStoredData('users', DEFAULT_USERS);
    let found = false;
    const updated = allUsers.map((u) => {
      if (
        (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
        (u.phone && u.phone === emailOrPhone)
      ) {
        found = true;
        return { ...u, password: password };
      }
      return u;
    });

    if (!found) {
      showToast('No registered account found with this email/phone');
      return;
    }

    setStoredData('users', updated);
    showToast('Password reset successfully! Please sign in with your new password.');
    setAuthMode('login');
    setPassword('');
    setReenterPassword('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home');
    setIntendedTab('home');
    setUserEmail('');
    setUserPhone('');
    setPassword('');
    setReenterPassword('');
    setRegInviteCode('');
    setUserVip('VIP0');
    setBalance(0);
    setRechargeTotal(0);
    showToast('Logged out');
  };

  // Click on VIP package -> opens unlock confirmation popup (matching user screenshot)
  const handleUnlockVip = (vip) => {
    if (!requireAuth('vip', `unlock ${vip.level}`)) return;
    setSelectedVipForUnlock(vip);
    setShowUnlockConfirmModal(true);
  };

  // Clicking 'Confirm' on unlock confirmation popup:
  // If user already has balance >= deposit, unlocks the VIP package immediately!
  // Otherwise leads to deposit / recharge page.
  const handleConfirmUnlock = () => {
    setShowUnlockConfirmModal(false);
    if (!selectedVipForUnlock) return;

    const reqDeposit = parseFloat(selectedVipForUnlock.deposit.toString().replace(/,/g, '')) || 0;
    const emailOrPhone = loginMethod === 'email' ? userEmail : userPhone;

    // Check if user has enough balance in account
    if (balance >= reqDeposit && reqDeposit > 0) {
      const newBalance = parseFloat((balance - reqDeposit).toFixed(2));
      setBalance(newBalance);
      setUserVip(selectedVipForUnlock.level);

      const allUsers = getStoredData('users', DEFAULT_USERS);
      const updated = allUsers.map((u) => {
        if (
          (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
          (u.phone && u.phone === emailOrPhone)
        ) {
          return { ...u, vip: selectedVipForUnlock.level, balance: newBalance };
        }
        return u;
      });
      setStoredData('users', updated);
      showToast(`🎉 Congratulations! You have unlocked ${selectedVipForUnlock.level}`);
      return;
    }

    // Otherwise open recharge modal prefilled with that package amount
    setRechargeAmount(selectedVipForUnlock.deposit);
    const freshMethods = getStoredData('payments', DEFAULT_PAYMENT_METHODS);
    setPaymentMethods(freshMethods);
    const active = freshMethods.find((p) => p.active) || freshMethods[0];
    setSelectedPaymentMethod(active);
    setShowRechargeModal(true);
  };

  // User submits deposit form with Sender account and Transaction ID (TrxID)
  const handleSubmitRecharge = (e) => {
    e.preventDefault();
    if (!senderAccount.trim()) {
      showToast('Please enter your sender account / phone number');
      return;
    }
    if (!transactionId.trim()) {
      showToast('Please enter Transaction ID (TrxID)');
      return;
    }
    const numAmount = parseFloat(rechargeAmount.toString().replace(/,/g, '')) || 0;
    if (numAmount <= 0) {
      showToast('Invalid recharge amount');
      return;
    }

    const currentRecharges = getStoredData('recharges', DEFAULT_RECHARGES);
    const newRecord = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      user: userEmail || userPhone || 'User',
      amount: numAmount,
      network: selectedPaymentMethod?.method || 'bKash',
      senderNumber: senderAccount.trim(),
      txid: transactionId.trim(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'pending'
    };
    const updated = [newRecord, ...currentRecharges];
    setStoredData('recharges', updated);

    setShowRechargeModal(false);
    setSenderAccount('');
    setTransactionId('');
    showToast(`Deposit of $${numAmount.toFixed(2)} submitted! Admin will verify soon.`);
  };

  if (isAdminRoute) {
    return (
      <AdminPanel
        onNavigateToApp={() => {
          window.history.pushState({}, '', '/');
          window.location.hash = '';
          setIsAdminRoute(false);
          setVipTiers(getStoredData('vips', DEFAULT_VIP_TIERS));
          setSettings(getStoredData('settings', DEFAULT_SETTINGS));
        }}
      />
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-slate-950 flex justify-center items-center overflow-hidden sm:p-2">
      {/* Mobile App Viewport Frame - Always fixed height with internal scrolling */}
      <div dir={currentLangObj.dir} className="w-full max-w-md bg-[#f4f7fb] h-full sm:h-[840px] sm:max-h-[96dvh] flex flex-col relative sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur flex items-center gap-2 border border-slate-700 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ================= ANNOUNCEMENT POPUP MODAL ================= */}
        {showAnnouncement && isLoggedIn && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[340px] overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
              <div className="pt-5 pb-2 text-center relative border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 tracking-wide">{t('announcement')}</h2>
                <div className="w-12 h-1 bg-[#05132d] mx-auto rounded-full mt-2"></div>
              </div>

              <div className="p-4 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-3 font-normal pr-3 select-text">
                <p className="font-bold text-slate-900 text-[13px] leading-tight">
                  NextTask global launch announcement & early ecological co-builder incentive plan
                </p>
                <p className="text-slate-700 font-medium">Dear global partners and ecological co-builders:</p>
                <p>
                  The true value of blockchain technology has never been tied to short-term price fluctuations, but to returning to entities, serving the public, and building an open, transparent, and mutually credible collaborative relationship.
                </p>
                <p>
                  We are very honored to announce that the <strong className="text-slate-900 font-semibold">NextTask</strong> project will be officially launched globally in October 2026.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowAnnouncement(false)}
                  className="w-full bg-[#05132d] hover:bg-slate-900 text-white font-semibold py-2.5 rounded-full text-xs transition active:scale-[0.99] shadow-md"
                >
                  {t('iKnow')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          {activeTab === 'auth' ? (
            /* =================== AUTH SCREEN (LOGIN & REGISTER) =================== */
            <div className="min-h-full bg-gradient-to-b from-[#06142e] via-[#0b2046] to-[#f4f7fb] flex flex-col">
              {/* Header */}
              <div className="p-6 pt-10 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg font-black text-white text-base">
                    N
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">NextTask</h1>
                    <p className="text-xs text-slate-300">{t('welcome')}</p>
                  </div>
                </div>

                {/* Language Switch Button */}
                <button
                  onClick={() => setShowLangModal(true)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-xs text-slate-200 active:scale-95 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentLangObj.flag} {currentLangObj.native}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Tabs */}
              {authMode === 'register' ? (
                /* Register Tabs */
                <div className="flex justify-center gap-8 mt-4 text-sm font-semibold text-white/70">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`pb-2 relative transition-colors ${loginMethod === 'email' ? 'text-white' : 'hover:text-white/90'}`}
                  >
                    {t('registerByEmail')}
                    {loginMethod === 'email' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full"></span>}
                  </button>
                  <button
                    onClick={() => setLoginMethod('phone')}
                    className={`pb-2 relative transition-colors ${loginMethod === 'phone' ? 'text-white' : 'hover:text-white/90'}`}
                  >
                    {t('registerByPhone')}
                    {loginMethod === 'phone' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full"></span>}
                  </button>
                </div>
              ) : authMode === 'forgot' ? (
                /* Forgot Password Tabs */
                <div className="flex justify-center gap-8 mt-4 text-sm font-semibold text-white/70">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`pb-2 relative transition-colors ${loginMethod === 'email' ? 'text-white' : 'hover:text-white/90'}`}
                  >
                    Reset by Email
                    {loginMethod === 'email' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full"></span>}
                  </button>
                  <button
                    onClick={() => setLoginMethod('phone')}
                    className={`pb-2 relative transition-colors ${loginMethod === 'phone' ? 'text-white' : 'hover:text-white/90'}`}
                  >
                    Reset by Phone
                    {loginMethod === 'phone' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full"></span>}
                  </button>
                </div>
              ) : (
                /* Login Tabs */
                <div className="flex justify-center gap-8 mt-4 text-sm font-semibold text-white/70">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`pb-2 relative transition-colors ${loginMethod === 'email' ? 'text-white' : 'hover:text-white/90'}`}
                  >
                    {t('emailLogin')}
                    {loginMethod === 'email' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full"></span>}
                  </button>
                  <button
                    onClick={() => setLoginMethod('phone')}
                    className={`pb-2 relative transition-colors ${loginMethod === 'phone' ? 'text-white' : 'hover:text-white/90'}`}
                  >
                    {t('phoneLogin')}
                    {loginMethod === 'phone' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full"></span>}
                  </button>
                </div>
              )}

              {/* Form Card */}
              <div className="mx-4 mt-4 bg-white rounded-2xl p-6 shadow-xl space-y-4">
                {/* Email / Phone Field */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {loginMethod === 'email' ? t('email') : t('phone')}
                  </label>
                  <input
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    value={loginMethod === 'email' ? userEmail : userPhone}
                    onChange={(e) => loginMethod === 'email' ? setUserEmail(e.target.value) : setUserPhone(e.target.value)}
                    placeholder={loginMethod === 'email' ? t('email') : t('phone')}
                    className="w-full bg-[#f3f6fc] text-slate-800 text-sm px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {authMode === 'forgot' ? 'New Password' : t('password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'forgot' ? 'Enter new password (min 6 chars)' : t('password')}
                      className="w-full bg-[#f3f6fc] text-slate-800 text-sm px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Reenter password (In Register & Forgot Password mode) */}
                {(authMode === 'register' || authMode === 'forgot') && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      {authMode === 'forgot' ? 'Confirm New Password' : t('reenterPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showReenterPassword ? 'text' : 'password'}
                        value={reenterPassword}
                        onChange={(e) => setReenterPassword(e.target.value)}
                        placeholder={authMode === 'forgot' ? 'Reenter new password' : t('reenterPassword')}
                        className="w-full bg-[#f3f6fc] text-slate-800 text-sm px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowReenterPassword(!showReenterPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showReenterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Invitation code (Only in Register mode) */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('invitationCode')}</label>
                    <input
                      type="text"
                      value={regInviteCode}
                      onChange={(e) => setRegInviteCode(e.target.value)}
                      placeholder={t('invitationCode')}
                      className="w-full bg-[#f3f6fc] text-slate-800 text-sm px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition"
                    />
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setPassword('');
                        setReenterPassword('');
                      }}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      {t('forgotPassword')}?
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 space-y-3 mt-4">
                {authMode === 'register' ? (
                  <>
                    <button
                      onClick={handleRegister}
                      className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-medium py-3.5 rounded-full shadow-lg active:scale-[0.99] transition"
                    >
                      {t('signUp')}
                    </button>
                    <button
                      onClick={() => setAuthMode('login')}
                      className="w-full bg-[#e9f0fc] hover:bg-[#dfe9fa] text-[#0d2146] font-medium py-3.5 rounded-full active:scale-[0.99] transition"
                    >
                      {t('alreadyAccount')}
                    </button>
                  </>
                ) : authMode === 'forgot' ? (
                  <>
                    <button
                      onClick={handleResetPassword}
                      className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-medium py-3.5 rounded-full shadow-lg active:scale-[0.99] transition"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setPassword('');
                        setReenterPassword('');
                      }}
                      className="w-full bg-[#e9f0fc] hover:bg-[#dfe9fa] text-[#0d2146] font-medium py-3.5 rounded-full active:scale-[0.99] transition"
                    >
                      Back to Sign In
                    </button>
                    <div className="text-center pt-1">
                      <span className="text-[11px] text-slate-500">
                        Need help? Contact Telegram: <strong className="text-indigo-600">{settings.telegramSupport}</strong>
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLogin}
                      className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-medium py-3.5 rounded-full shadow-lg active:scale-[0.99] transition"
                    >
                      {t('signIn')}
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      className="w-full bg-[#e9f0fc] hover:bg-[#dfe9fa] text-[#0d2146] font-medium py-3.5 rounded-full active:scale-[0.99] transition"
                    >
                      {t('signUp')}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-auto py-6 text-center text-xs text-slate-400">
                NextTask Official Safe & Encrypted Platform
              </div>
            </div>
          ) : (
            /* =================== AUTHENTICATED TABS =================== */
            <>
              {/* TOP HEADER */}
              <div className="bg-[#05132d] text-white px-4 pt-4 pb-3 relative">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    {/* Cosmic Planet Logo Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-800 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                      </div>
                    </div>
                    <span className="font-bold text-lg tracking-wide">NextTask</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowAnnouncement(true)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition">
                      <Mail className="w-4 h-4 text-slate-200" />
                    </button>
                    <button
                      onClick={() => setShowLangModal(true)}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-xs text-slate-200 active:scale-95 transition"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{currentLangObj.native}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Marquee ticker on Home tab */}
                {activeTab === 'home' && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-300 bg-white/5 py-1.5 px-3 rounded-full overflow-hidden">
                    <span className="font-bold text-white flex items-center gap-0.5 shrink-0">
                      <span className="text-cyan-400">N</span> »
                    </span>
                    <marquee className="truncate font-light text-slate-200" behavior="scroll" direction="left" scrollamount="4">
                      The true value of blockchain technology has never been tied to short-term price fluctuations, but to returning to entities, serving the public, and building an open, transparent collaborative relationship.
                    </marquee>
                  </div>
                )}

                {/* Sub-header row for VIP tab */}
                {activeTab === 'vip' && (
                  <div className="flex justify-end pt-2 text-xs">
                    <button
                      onClick={() => setShowUpgradeLogModal(true)}
                      className="text-slate-300 hover:text-white font-medium tracking-wide"
                    >
                      Upgrade log
                    </button>
                  </div>
                )}

                {/* Sub-header row for ME tab */}
                {activeTab === 'me' && (
                  <div className="pt-3 pb-1">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Hi, {(() => {
                            const id = userEmail || userPhone || 'User';
                            return id.length > 16 ? id.slice(0, 15) + '...' : id;
                          })()}
                        </span>
                        <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {userVip}
                        </span>
                      </div>
                      <button 
                        onClick={() => showToast('Account status: Verified')}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        Account &gt;
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-[11px] text-slate-400 mb-1">Total balance (USDT)</div>
                        <div className="text-2xl font-bold tracking-tight">{balance.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 mb-1">Recharge amount (USDT)</div>
                        <div className="text-2xl font-bold tracking-tight">{rechargeTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= TAB 1: HOME (MATCHING NEW SCREENSHOTS) ================= */}
              {activeTab === 'home' && (
                <div className="space-y-4">
                  {/* Floating Action Buttons Card (5 Buttons) */}
                  <div className="mx-4 mt-2 bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                    <div className="grid grid-cols-4 gap-3 text-center">
                      {/* Recharge */}
                      <button
                        onClick={() => {
                          if (!requireAuth('me', 'recharge')) return;
                          setShowRechargeModal(true);
                        }}
                        className="flex flex-col items-center gap-1.5 p-1 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0d2146] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <Coins className="w-5 h-5 text-cyan-300" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Recharge</span>
                      </button>

                      {/* Withdraw */}
                      <button
                        onClick={() => {
                          if (!requireAuth('me', 'withdraw')) return;
                          setShowWithdrawModal(true);
                        }}
                        className="flex flex-col items-center gap-1.5 p-1 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0d2146] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <LogOut className="w-5 h-5 text-amber-300 rotate-180" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Withdraw</span>
                      </button>

                      {/* App */}
                      <button
                        onClick={() => setShowAppModal(true)}
                        className="flex flex-col items-center gap-1.5 p-1 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0d2146] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <Download className="w-5 h-5 text-emerald-300" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">App</span>
                      </button>

                      {/* Company Profile */}
                      <button
                        onClick={() => setShowCompanyProfileModal(true)}
                        className="flex flex-col items-center gap-1.5 p-1 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0d2146] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <Building2 className="w-5 h-5 text-indigo-300" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 leading-tight">Company Profile</span>
                      </button>
                    </div>

                    {/* Second Row: Invite Friends */}
                    <div className="mt-3 pt-3 border-t border-slate-50 flex">
                      <button
                        onClick={() => {
                          if (!requireAuth('team', 'invite friends and view team')) return;
                          setActiveTab('team');
                        }}
                        className="flex flex-col items-center gap-1.5 px-1 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0d2146] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <UserPlus className="w-5 h-5 text-pink-300" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Invite Friends</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Promotional Banner Carousel (Admin Managed) */}
                  {slides.length > 0 && (
                    <div className="mx-4 relative">
                      {(() => {
                        const activeSlide = slides[currentSlideIdx % slides.length] || slides[0];
                        return (
                          <div className={`rounded-3xl overflow-hidden shadow-md bg-gradient-to-r ${activeSlide.gradient || 'from-amber-500 via-orange-500 to-yellow-400'} p-5 text-white relative min-h-[140px] flex items-center transition-all duration-500`}>
                            <div className="relative z-10 max-w-[210px]">
                              {activeSlide.badge && (
                                <div className="inline-block bg-white text-orange-600 font-black text-xl px-2 py-0.5 rounded shadow-sm tracking-tight mb-1">
                                  {activeSlide.badge}
                                </div>
                              )}
                              <div className="text-3xl font-black text-red-700 leading-none tracking-tight drop-shadow-sm">
                                {activeSlide.amount}
                              </div>
                              <div className="text-xs font-black tracking-widest text-slate-900 mt-1 uppercase">
                                {activeSlide.subtitle}
                              </div>
                              {activeSlide.description && (
                                <div className="text-[10px] text-white/90 mt-1 font-medium line-clamp-2">
                                  {activeSlide.description}
                                </div>
                              )}
                            </div>

                            {/* Banner Illustration */}
                            <div className="absolute right-2 bottom-0 top-0 flex items-center opacity-95">
                              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                                <TrendingUp className="w-16 h-16 text-white drop-shadow-lg" />
                              </div>
                            </div>

                            {/* Carousel indicator dots */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                              {slides.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrentSlideIdx(i)}
                                  className={`h-1.5 rounded-full transition-all ${
                                    (currentSlideIdx % slides.length) === i
                                      ? 'w-5 bg-slate-900'
                                      : 'w-2 bg-white/70 hover:bg-white'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ================= TASK HALL SECTION ================= */}
                  <div className="px-4 space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Task Hall</h3>

                    <div className="space-y-3">
                      {vipTiers.map((vip) => (
                        <div
                          key={vip.level}
                          onClick={() => handleUnlockVip(vip)}
                          className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                        >
                          {/* Left: Dark Padlocked VIP Badge */}
                          <div className="w-20 h-20 rounded-2xl bg-[#0c0d11] border border-amber-500/30 flex flex-col items-center justify-center relative shadow-inner overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent"></div>
                            <Lock className="w-7 h-7 text-white drop-shadow stroke-[2.5]" />
                            <div className="text-[9px] uppercase tracking-tighter text-amber-300/80 mt-1 font-semibold">
                              VIP member only
                            </div>
                          </div>

                          {/* Right: Unlock Amount & Level */}
                          <div className="flex-1">
                            <div className="text-xs text-slate-400 font-medium">Unlock amount:</div>
                            <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                              ${vip.deposit}
                            </div>
                            <div className="text-xs text-slate-500 font-semibold mt-0.5">
                              {vip.level}
                            </div>
                            {/* Double Chevrons Icon */}
                            <div className="mt-1 flex text-slate-400">
                              <ChevronsRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ================= MEMBER LIST SECTION (2 LINES AUTO-SCROLLING) ================= */}
                  <div className="px-4 pt-2 pb-6 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Member list</h3>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Payouts
                      </span>
                    </div>

                    {/* Exactly 2 lines container (h-[142px]) with continuous vertical auto-scroll */}
                    <div className="h-[142px] overflow-hidden relative rounded-2xl">
                      <div className="animate-member-scroll grid grid-cols-2 gap-2.5">
                        {[...MEMBER_LIST_DATA, ...MEMBER_LIST_DATA].map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-[#ebf0f8]/95 rounded-2xl p-2.5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[66px]"
                          >
                            {/* VIP Tag on top-right */}
                            <span className="absolute top-2 right-2 bg-[#0c0d11] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider">
                              {item.vip}
                            </span>

                            <div className="text-[13px] font-black text-blue-950 tracking-tight">
                              {item.amount}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-medium">
                              {item.user}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: VIP ================= */}
              {activeTab === 'vip' && (
                <div className="p-4 space-y-6 pt-5">
                  {vipTiers.map((vip) => (
                    <div
                      key={vip.level}
                      className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 relative pt-6"
                    >
                      <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#fbd6a5] to-[#fbc286] text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Crown className="w-3.5 h-3.5 fill-amber-600 text-amber-700" />
                        <span>{vip.level}</span>
                      </div>

                      <div className="flex gap-3 items-stretch">
                        <div className="w-24 h-24 rounded-2xl bg-[#0c0d11] border border-amber-500/30 flex flex-col items-center justify-center p-2 relative shadow-inner overflow-hidden shrink-0">
                          <Crown className="w-5 h-5 text-amber-400 mb-0.5 fill-amber-400 drop-shadow" />
                          <div className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                            VIP
                          </div>
                          <div className="text-[8px] uppercase tracking-tighter text-amber-300/80 mt-0.5">
                            member only
                          </div>
                        </div>

                        <div className="flex-1 bg-[#ebf0f8]/80 rounded-2xl p-3 flex flex-col justify-between text-xs space-y-1">
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Daily tasks</span>
                            <span className="font-semibold text-slate-800">{vip.tasks}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Simple interest</span>
                            <span className="font-bold text-[#00c282]">{vip.interest}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Daily profit</span>
                            <span className="font-semibold text-slate-800">{vip.daily} <span className="text-[10px] text-slate-500 font-normal">USDT</span></span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>The total profit</span>
                            <span className="font-semibold text-slate-800">{vip.total} <span className="text-[10px] text-slate-500 font-normal">USDT</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleUnlockVip(vip)}
                          className="bg-[#05132d] hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-3 shadow-md active:scale-95 transition"
                        >
                          <span>{vip.deposit} USDT</span>
                          <span className="font-normal text-slate-300 border-l border-white/20 pl-2">Unlock now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= TAB 3: TEAM ================= */}
              {activeTab === 'team' && (
                <div className="px-4 py-4 space-y-4">
                  <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-2xl p-4 relative overflow-hidden backdrop-blur">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-slate-300">Invitation code:</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-2xl font-black tracking-wider text-white">{inviteCode}</span>
                          <button
                            onClick={() => copyToClipboard(inviteCode, 'Invitation code')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] px-3 py-1 rounded-full font-medium"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-3">Share your referral link and start earning</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-cyan-300 truncate max-w-[170px]">
                            https://nexttask.com/#/register?i={inviteCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(`https://nexttask.com/#/register?i=${inviteCode}`, 'Referral link')}
                            className="bg-blue-600/80 text-white text-[10px] px-2.5 py-0.5 rounded-full"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                        <Gem className="w-8 h-8 text-amber-400 drop-shadow" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#d946ef] to-[#ec4899] rounded-2xl p-4 text-white shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-extrabold tracking-wider text-base">LEVEL 1</span>
                      <span className="bg-black/60 px-3 py-1 rounded-full text-xs font-semibold">16%</span>
                    </div>
                    <div className="text-xs opacity-90">Direct referral partners commission</div>
                  </div>

                  <div className="bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl p-4 text-white shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-extrabold tracking-wider text-base">LEVEL 2</span>
                      <span className="bg-black/60 px-3 py-1 rounded-full text-xs font-semibold">2%</span>
                    </div>
                    <div className="text-xs opacity-90">Second-tier members commission</div>
                  </div>

                  <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl p-4 text-white shadow-md border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-extrabold tracking-wider text-base">LEVEL 3</span>
                      <span className="bg-black/60 px-3 py-1 rounded-full text-xs font-semibold">1%</span>
                    </div>
                    <div className="text-xs opacity-90">Third-level members commission</div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: TASK ================= */}
              {activeTab === 'task' && (
                <div className="px-4 py-4 space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-slate-800">Daily Task Mission</h3>
                      <span className="text-xs text-indigo-600 font-semibold">10 Tasks available</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center mb-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">NextTask Mission 1</div>
                        <div className="text-[11px] text-slate-500">Reward: 0.70 USDT</div>
                      </div>
                      <button
                        onClick={() => {
                          setBalance(b => b + 0.7);
                          showToast('Mission completed! +0.70 USDT added');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-full font-medium"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 5: ME ================= */}
              {activeTab === 'me' && (
                <div className="px-4 -mt-3 space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <button
                      onClick={() => setShowRechargeModal(true)}
                      className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#05132d] text-white flex items-center justify-center shadow-md">
                        <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Recharge</span>
                    </button>

                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#05132d] text-white flex items-center justify-center shadow-md">
                        <ArrowUpRight className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Withdraw</span>
                    </button>

                    <button
                      onClick={() => setShowRecordsModal(true)}
                      className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#05132d] text-white flex items-center justify-center shadow-md">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 leading-tight">Financial record</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    <button
                      onClick={() => setShowAnnouncement(true)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium text-slate-800">Announcement</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>


                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5 text-slate-500" />
                        <span className="text-sm font-medium text-slate-800">Change Password</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 hover:bg-rose-50 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-rose-500" />
                        <span className="text-sm font-medium text-rose-600">Sign out</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ================= FIXED BOTTOM NAVIGATION BAR (ALWAYS VISIBLE) ================= */}
        <div className="h-16 bg-white border-t border-slate-200 grid grid-cols-5 items-center px-1 shrink-0 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'vip', label: 'VIP', icon: Gem },
            { id: 'me', label: 'Me', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = (activeTab === tab.id) || (activeTab === 'auth' && intendedTab === tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="flex flex-col items-center justify-center h-full py-1 group active:scale-95 transition"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? 'text-[#05132d] stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 transition-colors font-medium ${
                    active ? 'text-[#05132d] font-bold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
                {active && (
                  <span className="w-5 h-0.5 bg-[#05132d] rounded-full mt-0.5 -mb-1"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= MODALS ================= */}
        {/* Company Profile Modal */}
        {showCompanyProfileModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-[340px] p-5 space-y-3 animate-fade-in max-h-[80%] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Company Profile
                </h3>
                <button onClick={() => setShowCompanyProfileModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-800">NextTask Global Foundation</p>
                <p>
                  NextTask is an innovative decentralized e-commerce and tasks reward platform founded in 2026. 
                  Our goal is to build a collaborative, credible, and multi-tier ecosystem for users worldwide.
                </p>
                <p>
                  All transactions and daily tasks are recorded on verifiable blockchain smart contracts ensuring transparency and liquidity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* App Download Modal */}
        {showAppModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-[320px] p-5 space-y-3 animate-fade-in text-center">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">NextTask Official App</h3>
              <p className="text-xs text-slate-500">
                Install NextTask Android APK & iOS Web App for fastest task submissions and instant notifications.
              </p>
              <button
                onClick={() => {
                  showToast('NextTask APK downloading...');
                  setShowAppModal(false);
                }}
                className="w-full bg-[#05132d] hover:bg-indigo-900 text-white text-xs font-semibold py-3 rounded-full mt-2"
              >
                Download APK (v1.0.4)
              </button>
            </div>
          </div>
        )}

        {/* Upgrade Log Modal */}
        {showUpgradeLogModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[320px] p-5 space-y-3 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Upgrade Log</h3>
                <button onClick={() => setShowUpgradeLogModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="text-center py-6 text-slate-400 text-xs">
                No upgrade records yet.
              </div>
            </div>
          </div>
        )}

        {/* ================= VIP UNLOCK CONFIRMATION POPUP (MATCHING USER SCREENSHOT) ================= */}
        {showUnlockConfirmModal && selectedVipForUnlock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[320px] p-6 shadow-2xl space-y-6 text-center animate-scale-up border border-slate-100">
              <p className="text-slate-800 text-sm leading-relaxed font-normal pt-2 px-1">
                The recharge balance is automatically unlocked Need to recharge ${selectedVipForUnlock.deposit}
              </p>
              <button
                onClick={handleConfirmUnlock}
                className="w-full bg-[#ff3b30] hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-full shadow-lg active:scale-95 transition text-sm tracking-wide"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ================= RECHARGE / DEPOSIT MODAL (bKash / Nagad / Rocket / USDT) ================= */}
        {showRechargeModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-3">
            <div className="bg-white rounded-3xl w-full p-5 space-y-4 max-h-[92%] overflow-y-auto animate-slide-up shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base leading-tight">Recharge / Deposit</h3>
                    <p className="text-[10px] text-slate-400">bKash • Nagad • Rocket • USDT</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Deposit Amount Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Recharge Amount (USDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">$</span>
                  <input
                    type="text"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="10.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-black text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Quick Amount Selectors */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {['10.00', '70.00', '170.00', '370.00', '770.00', '1,570.00', '3,570.00', '7,770.00'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-1 rounded-lg text-xs font-bold transition border ${
                        rechargeAmount === amt
                          ? 'bg-[#05132d] text-white border-[#05132d]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ${amt.split('.')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods Selection Tabs (Active ones from Admin) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.filter((p) => p.active).map((pm) => {
                    const isSelected = selectedPaymentMethod?.id === pm.id;
                    const isBkash = pm.method.toLowerCase().includes('bkash');
                    const isNagad = pm.method.toLowerCase().includes('nagad');
                    const isRocket = pm.method.toLowerCase().includes('rocket');

                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(pm)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              isBkash
                                ? 'bg-pink-600'
                                : isNagad
                                ? 'bg-orange-500'
                                : isRocket
                                ? 'bg-purple-600'
                                : 'bg-emerald-600'
                            }`}
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-800">{pm.method}</div>
                            <div className="text-[10px] text-slate-500">{pm.type}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Instructions & Account Card */}
              {selectedPaymentMethod && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        {selectedPaymentMethod.method} ({selectedPaymentMethod.type})
                      </span>
                      <div className="font-mono text-sm font-black text-slate-900 break-all select-all mt-0.5">
                        {selectedPaymentMethod.number}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedPaymentMethod.number, `${selectedPaymentMethod.method} number`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0 ml-2"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>

                  {/* Rate conversion for BDT methods */}
                  {selectedPaymentMethod.rate > 1 && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Payable Amount:</span>
                      <div className="text-right">
                        <span className="font-black text-emerald-600 text-sm">
                          ৳{( (parseFloat(rechargeAmount.toString().replace(/,/g, '')) || 0) * selectedPaymentMethod.rate ).toLocaleString()} BDT
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Rate: 1 USD = {selectedPaymentMethod.rate} ৳
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod.instructions && (
                    <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200 font-medium">
                      ⚠️ {selectedPaymentMethod.instructions}
                    </p>
                  )}
                </div>
              )}

              {/* User Payment Submission Form */}
              <form onSubmit={handleSubmitRecharge} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Sender Phone / Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 9B7X2K4A90"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#05132d] hover:bg-slate-900 text-white font-bold py-3 rounded-full text-xs shadow-lg active:scale-95 transition"
                >
                  Submit Deposit Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full p-5 space-y-4 animate-slide-up">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-base">Withdraw Funds</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600">Available Balance: <span className="font-bold text-slate-900">{balance.toFixed(2)} USDT</span></label>
                  <input
                    type="number"
                    placeholder="Enter withdrawal amount (Min 1 USDT)"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">USDT (TRC20) Address</label>
                  <input
                    type="text"
                    placeholder="Paste TRC20 address"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => {
                    showToast('Withdrawal request submitted!');
                    setShowWithdrawModal(false);
                  }}
                  className="w-full bg-[#05132d] hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-full mt-2"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= LANGUAGE SELECTION MODAL ================= */}
        {showLangModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[320px] p-5 shadow-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  {t('selectLanguage')}
                </h3>
                <button onClick={() => setShowLangModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="max-h-64 overflow-y-auto no-scrollbar divide-y divide-slate-100">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelectLang(l.code)}
                    className={`w-full py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition text-xs ${
                      lang === l.code ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{l.flag}</span>
                      <span className="font-semibold text-slate-900">{l.native}</span>
                      <span className="text-slate-400 text-[10px]">({l.name})</span>
                    </div>
                    {lang === l.code && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
