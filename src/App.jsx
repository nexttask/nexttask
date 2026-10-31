import React, { useState, useEffect, useRef } from 'react';
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
  Megaphone,
  Crown,
  Download,
  Building2,
  UserPlus,
  ChevronsRight,
  Coins,
  Shield,
  ChevronDown,
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  RefreshCw
} from 'lucide-react';
import AdminPanel from './AdminPanel';
import {
  getStoredData,
  setStoredData,
  getVipLevelFromReferrals,
  generateUniqueInviteCode,
  isReferredByUser,
  getInviteCodeFromUrl,
  isRegisterRoute,
  DEFAULT_USERS,
  DEFAULT_VIP_TIERS,
  DEFAULT_SETTINGS,
  DEFAULT_SLIDES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_RECHARGES,
  DEFAULT_WITHDRAWALS
} from './store';
import { LANGUAGES, TRANSLATIONS } from './translations';
import { COUNTRY_LIST } from './countries';

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

export const resolveInitialRoute = () => {
  if (typeof window === 'undefined') return { tab: 'home', authMode: 'login', isAdmin: false };
  const rawPath = (window.location.pathname || '').toLowerCase();
  const path = rawPath.replace(/\/+$/, '') || '/';
  const hash = (window.location.hash || '').toLowerCase();

  const isAdm =
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash.startsWith('#/admin') ||
    hash.startsWith('#admin');
  if (isAdm) return { tab: 'admin', authMode: 'login', isAdmin: true };

  if (path === '/register' || hash.includes('register') || isRegisterRoute()) {
    return { tab: 'auth', authMode: 'register', isAdmin: false };
  }
  if (path === '/login' || hash.includes('login')) {
    return { tab: 'auth', authMode: 'login', isAdmin: false };
  }
  if (path === '/team' || hash === '#/team' || hash === '#team') {
    return { tab: 'team', authMode: 'login', isAdmin: false };
  }
  if (path === '/task' || path === '/tasks' || hash === '#/task' || hash === '#task') {
    return { tab: 'task', authMode: 'login', isAdmin: false };
  }
  if (path === '/vip' || hash === '#/vip' || hash === '#vip') {
    return { tab: 'vip', authMode: 'login', isAdmin: false };
  }
  if (path === '/me' || path === '/profile' || hash === '#/me' || hash === '#me') {
    return { tab: 'me', authMode: 'login', isAdmin: false };
  }
  return { tab: 'home', authMode: 'login', isAdmin: false };
};

export default function App() {
  const initialRoute = resolveInitialRoute();

  // Master Admin Route Detection (supports /admin and #/admin)
  const [isAdminRoute, setIsAdminRoute] = useState(initialRoute.isAdmin);

  // Direct APK / PWA Downloader
  const handleDownloadApk = async () => {
    // If PWA installation is ready in browser, trigger native PWA install
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsAppInstalled(true);
          showToast('NextTask PWA installed successfully!');
          return;
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
    }

    // Direct download of NextTask.apk with official logo
    const link = document.createElement('a');
    link.href = '/NextTask.apk';
    link.download = 'NextTask.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloading NextTask.apk...');
  };

  // Real-time synchronization of current user profile & balance
  const syncCurrentUserData = () => {
    try {
      const raw = localStorage.getItem('nt_currentUser');
      if (!raw) return;
      const cur = JSON.parse(raw);
      if (!cur) return;
      const allUsers = getStoredData('users', DEFAULT_USERS);
      const freshUser = allUsers.find(u =>
        (u.id && cur.id && String(u.id) === String(cur.id)) ||
        (u.email && cur.email && u.email.toLowerCase() === cur.email.toLowerCase()) ||
        (u.phone && cur.phone && u.phone === cur.phone)
      );
      if (freshUser) {
        setCurrentUser((prev) => {
          if (!prev) return freshUser;
          if (
            prev.balance !== freshUser.balance ||
            prev.recharge !== freshUser.recharge ||
            prev.vip !== freshUser.vip ||
            prev.name !== freshUser.name
          ) {
            try {
              localStorage.setItem('nt_currentUser', JSON.stringify(freshUser));
            } catch (e) {}
            setBalance(typeof freshUser.balance === 'number' ? freshUser.balance : (parseFloat(freshUser.balance) || 0));
            setRechargeTotal(typeof freshUser.recharge === 'number' ? freshUser.recharge : (parseFloat(freshUser.recharge) || 0));
            setUserVip(freshUser.vip || 'VIP0');
            return freshUser;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('Realtime sync error:', err);
    }
  };

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
      const route = resolveInitialRoute();
      setIsAdminRoute(route.isAdmin);
      if (route.isAdmin) return;

      const codeFromUrl = getInviteCodeFromUrl();
      if (codeFromUrl) {
        setRegInviteCode(codeFromUrl);
      }

      const storedUser = localStorage.getItem('nt_currentUser');
      if (route.tab === 'auth') {
        setActiveTab('auth');
        setAuthMode(route.authMode || 'login');
      } else if (!storedUser && (route.tab === 'task' || route.tab === 'team' || route.tab === 'vip' || route.tab === 'me')) {
        setIntendedTab(route.tab);
        setActiveTab('auth');
        setAuthMode('login');
      } else {
        setActiveTab(route.tab);
      }

      setVipTiers(getStoredData('vips', DEFAULT_VIP_TIERS));
      setSettings(getStoredData('settings', DEFAULT_SETTINGS));
      setSlides(getStoredData('slides', DEFAULT_SLIDES));
      syncCurrentUserData();
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('storage', handleUrlChange);
    const syncInterval = setInterval(syncCurrentUserData, 2000);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('storage', handleUrlChange);
      clearInterval(syncInterval);
    };
  }, []);

  // PWA Installation state
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  });
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
      showToast('NextTask App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsAppInstalled(true);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
      setDeferredInstallPrompt(null);
      return;
    }

    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos) {
      setShowIosInstallModal(true);
    } else {
      showToast('To install: click the Install icon (⊕) in your browser address bar or menu');
    }
  };

  // Navigation & Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('nt_currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('nt_currentUser'));
  const [activeTab, setActiveTab] = useState(() => {
    if (initialRoute.tab === 'auth') return 'auth';
    const hasUser = !!localStorage.getItem('nt_currentUser');
    if (!hasUser && (initialRoute.tab === 'task' || initialRoute.tab === 'team' || initialRoute.tab === 'vip' || initialRoute.tab === 'me')) {
      return 'auth';
    }
    return initialRoute.tab;
  });
  const [intendedTab, setIntendedTab] = useState(() => {
    if (initialRoute.tab !== 'auth' && initialRoute.tab !== 'home') return initialRoute.tab;
    return 'home';
  });
  const [authMode, setAuthMode] = useState(() => {
    if (initialRoute.tab === 'auth') return initialRoute.authMode || 'login';
    const hasUser = !!localStorage.getItem('nt_currentUser');
    if (!hasUser && (initialRoute.tab === 'task' || initialRoute.tab === 'team' || initialRoute.tab === 'vip' || initialRoute.tab === 'me')) {
      return 'login';
    }
    return 'login';
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [accountInput, setAccountInput] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('nt_currentUser'));
      return u?.email || u?.phone || '';
    } catch {
      return '';
    }
  });
  const [userEmail, setUserEmail] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('nt_currentUser'));
      return u?.email || '';
    } catch {
      return '';
    }
  });
  const [userPhone, setUserPhone] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('nt_currentUser'));
      return u?.phone || '';
    } catch {
      return '';
    }
  });
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_LIST[0]); // Default Bangladesh +880
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [fullName, setFullName] = useState('');
  const [authModalMsg, setAuthModalMsg] = useState('');
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);
  const userInviteCode = currentUser?.myInviteCode || currentUser?.inviteCode || 'NT1001';
  const [inviteCode] = useState('NT1001'); // fallback
  const [regInviteCode, setRegInviteCode] = useState(() => getInviteCodeFromUrl() || '');
  const [balance, setBalance] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('nt_currentUser'));
      return typeof u?.balance === 'number' ? u.balance : 0.00;
    } catch {
      return 0.00;
    }
  });
  const [rechargeTotal, setRechargeTotal] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('nt_currentUser'));
      return typeof u?.recharge === 'number' ? u.recharge : 0.00;
    } catch {
      return 0.00;
    }
  });
  const [userVip, setUserVip] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('nt_currentUser'));
      return u?.vip || 'VIP0';
    } catch {
      return 'VIP0';
    }
  });

  // User Profile & Withdrawal Accounts State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('personal'); // 'personal' | 'withdraw'
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileBkash, setProfileBkash] = useState('');
  const [profileNagad, setProfileNagad] = useState('');
  const [profileRocket, setProfileRocket] = useState('');
  const [profileTrc20, setProfileTrc20] = useState('');
  const [profileBankName, setProfileBankName] = useState('');
  const [profileBankAccount, setProfileBankAccount] = useState('');
  const [profileBankHolder, setProfileBankHolder] = useState('');

  // Financial Records State (Deposited vs Withdrawn)
  const [recordsTab, setRecordsTab] = useState('deposit'); // 'deposit' | 'withdraw'

  // Withdraw Modal State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bKash');
  const [withdrawAccountInput, setWithdrawAccountInput] = useState('');

  // Team Tab State
  const [teamLevelTab, setTeamLevelTab] = useState(1);

  // Task Tab State
  const [taskTab, setTaskTab] = useState('running'); // 'running' | 'completed'
  const [taskProcessingIdx, setTaskProcessingIdx] = useState(null);
  const [taskCountdown, setTaskCountdown] = useState(0);
  const taskTimerRef = useRef(null);
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const getUserTasksKey = (u) => {
    const uid = u?.id || u?.email || u?.phone || 'guest';
    return `nt_completed_tasks_${uid}_${todayDateStr}`;
  };
  const todayTasksKey = getUserTasksKey(currentUser);

  const [completedTaskIndices, setCompletedTaskIndices] = useState(() => {
    try {
      const raw = localStorage.getItem(todayTasksKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Ensure completed tasks reload whenever currentUser changes (Login / Logout / Switch account)
  useEffect(() => {
    if (!currentUser) {
      setCompletedTaskIndices([]);
      return;
    }
    const key = getUserTasksKey(currentUser);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setCompletedTaskIndices(JSON.parse(raw));
      } else if (currentUser.completedTasks && currentUser.completedTasks[todayDateStr]) {
        setCompletedTaskIndices(currentUser.completedTasks[todayDateStr]);
      } else {
        setCompletedTaskIndices([]);
      }
    } catch {
      setCompletedTaskIndices([]);
    }
  }, [currentUser?.id, currentUser?.email, currentUser?.phone]);

  useEffect(() => {
    return () => {
      if (taskTimerRef.current) clearInterval(taskTimerRef.current);
    };
  }, []);

  // Change Password Modal State
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [changePassError, setChangePassError] = useState('');

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

  // Notifications & User Mailbox State
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotificationDetail, setSelectedNotificationDetail] = useState(null);
  const [notifications, setNotifications] = useState(() => getStoredData('notifications', []));
  const userReadStorageKey = currentUser?.id ? 'read_notifs_' + currentUser.id : 'read_notifs_guest';
  const [readNotifIds, setReadNotifIds] = useState(() => getStoredData(userReadStorageKey, []));

  useEffect(() => {
    const key = currentUser?.id ? 'read_notifs_' + currentUser.id : 'read_notifs_guest';
    setReadNotifIds(getStoredData(key, []));
  }, [currentUser?.id]);

  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(getStoredData('notifications', []));
    };
    window.addEventListener('nt_notification_update', handleNotifUpdate);
    window.addEventListener('storage', handleNotifUpdate);
    return () => {
      window.removeEventListener('nt_notification_update', handleNotifUpdate);
      window.removeEventListener('storage', handleNotifUpdate);
    };
  }, []);

  // Load and filter notifications for current user with guaranteed persistent read state
  const getUserNotifications = () => {
    if (!currentUser) return [];
    const allNotifs = getStoredData('notifications', []);
    const uid = String(currentUser.id || '');
    const email = String(currentUser.email || '').toLowerCase();
    const phone = String(currentUser.phone || '');
    const myCode = String(currentUser.myInviteCode || currentUser.inviteCode || '');

    const userSpecific = allNotifs.filter((n) => {
      if (!n) return false;
      const target = String(n.userId || '').toLowerCase();
      if (target === 'all') return true;
      if (uid && target === uid.toLowerCase()) return true;
      if (email && target === email) return true;
      if (phone && target === phone.toLowerCase()) return true;
      if (myCode && target === myCode.toLowerCase()) return true;
      return false;
    });

    let list = userSpecific;
    if (list.length === 0) {
      list = [
        {
          id: 'welcome_' + (uid || 'user'),
          userId: uid || 'all',
          title: 'Welcome to NextTask!',
          message: 'Welcome to NextTask! Complete daily tasks, upgrade VIP tiers, and grow your team to earn daily profits.',
          time: 'Today',
          read: false,
          type: 'system'
        }
      ];
    }

    return list.map((n) => ({
      ...n,
      read: Boolean(n.read || readNotifIds.includes(n.id))
    }));
  };

  const userNotifications = getUserNotifications();
  const unreadCount = currentUser ? userNotifications.filter((n) => !n.read).length : 0;

  const handleMarkAsRead = (notifId) => {
    if (!notifId) return;
    const key = currentUser?.id ? 'read_notifs_' + currentUser.id : 'read_notifs_guest';
    const currentRead = getStoredData(key, []);
    const updatedRead = currentRead.includes(notifId) ? currentRead : [...currentRead, notifId];
    setStoredData(key, updatedRead);
    setReadNotifIds(updatedRead);

    const allNotifs = getStoredData('notifications', []);
    let found = false;
    const updated = allNotifs.map((n) => {
      if (n.id === notifId) {
        found = true;
        return { ...n, read: true };
      }
      return n;
    });

    if (found) {
      setStoredData('notifications', updated);
      setNotifications(updated);
    } else {
      setNotifications([...allNotifs]);
    }
  };

  const handleMarkAllAsRead = () => {
    const allMyIds = userNotifications.map((n) => n.id);
    const key = currentUser?.id ? 'read_notifs_' + currentUser.id : 'read_notifs_guest';
    const currentRead = getStoredData(key, []);
    const updatedRead = Array.from(new Set([...currentRead, ...allMyIds]));
    setStoredData(key, updatedRead);
    setReadNotifIds(updatedRead);

    const allNotifs = getStoredData('notifications', []);
    const updated = allNotifs.map((n) => {
      if (allMyIds.includes(n.id)) {
        return { ...n, read: true };
      }
      return n;
    });
    setStoredData('notifications', updated);
    setNotifications(updated);
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    setSelectedNotificationDetail(notif);
  };

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
      const commissionAmount = parseFloat((reqDeposit * 0.10).toFixed(2)); // 10% referral commission
      let referrerCredited = false;
      let referrerName = '';

      const updated = allUsers.map((u) => {
        // Update the purchasing user
        if (
          (u.id && currentUser?.id && String(u.id) === String(currentUser.id)) ||
          (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
          (u.phone && u.phone === emailOrPhone)
        ) {
          return { ...u, vip: selectedVipForUnlock.level, balance: newBalance };
        }

        // Credit the referrer
        if (isReferredByUser(currentUser, u) && commissionAmount > 0) {
          referrerCredited = true;
          referrerName = u.name || u.email || u.myInviteCode || 'Referrer';
          const prevB = typeof u.balance === 'number' ? u.balance : (parseFloat(u.balance) || 0);
          const prevEarn = typeof u.referralEarnings === 'number' ? u.referralEarnings : 0;
          return {
            ...u,
            balance: parseFloat((prevB + commissionAmount).toFixed(2)),
            referralEarnings: parseFloat((prevEarn + commissionAmount).toFixed(2))
          };
        }

        return u;
      });
      setStoredData('users', updated);

      // Record referral commission in transactions
      if (referrerCredited && commissionAmount > 0) {
        const allRecharges = getStoredData('recharges', []);
        const commissionRecord = {
          id: `COM-${Date.now()}`,
          userId: currentUser?.referredBy,
          user: referrerName,
          senderAccount: currentUser?.name || currentUser?.email || currentUser?.phone || 'Team Member',
          amount: commissionAmount,
          method: 'Referral Bonus',
          network: 'Commission',
          trxId: `COMM-${selectedVipForUnlock.level}-${Date.now().toString().slice(-6)}`,
          status: 'approved',
          date: new Date().toISOString().replace('T', ' ').slice(0, 19),
          note: `10% referral commission from ${currentUser?.name || currentUser?.id} for unlocking ${selectedVipForUnlock.level}`
        };
        setStoredData('recharges', [commissionRecord, ...allRecharges]);
      }

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
      userId: currentUser?.id,
      user: currentUser?.name || currentUser?.email || currentUser?.phone || userEmail || userPhone || 'User',
      userEmail: currentUser?.email || userEmail || '',
      userPhone: currentUser?.phone || userPhone || '',
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

    const filteredCountries = COUNTRY_LIST.filter((c) => {
    if (!countrySearch.trim()) return true;
    const q = countrySearch.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q);
  });

  if (isAdminRoute) {
    return (
      <AdminPanel
        onNavigateToApp={() => {
          const raw = localStorage.getItem('nt_currentUser');
          if (raw) {
            try {
              const u = JSON.parse(raw);
              setCurrentUser(u);
              setIsLoggedIn(true);
              setBalance(typeof u.balance === 'number' ? u.balance : (parseFloat(u.balance) || 0));
              setRechargeTotal(typeof u.recharge === 'number' ? u.recharge : (parseFloat(u.recharge) || 0));
              setUserVip(u.vip || 'VIP0');
              setUserEmail(u.email || '');
              setUserPhone(u.phone || '');
              setActiveTab('me');
            } catch (e) {}
          }
          window.history.pushState({}, '', '/me');
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

        {/* Country Code Picker Modal */}
        {showCountryPicker && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[340px] max-h-[82vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Select Country Code</h3>
                  <p className="text-[11px] text-slate-400">Choose country dialing code</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCountryPicker(false);
                    setCountrySearch('');
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 border-b border-slate-100 bg-slate-50">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country or code (e.g. Bangladesh or +880)..."
                  className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredCountries.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No countries found</div>
                ) : (
                  filteredCountries.map((c) => (
                    <button
                      key={c.code + c.dial}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(c);
                        setShowCountryPicker(false);
                        setCountrySearch('');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 cursor-pointer ${
                        selectedCountry.dial === c.dial && selectedCountry.code === c.code
                          ? 'bg-blue-50/80 font-bold text-indigo-700'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{c.flag}</span>
                        <span className="text-xs font-medium">{c.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{c.dial}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prompt / Error Popup Modal */}
        {authModalMsg && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[290px] overflow-hidden shadow-2xl p-6 text-center space-y-4 border border-slate-100">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Prompt</h3>
                <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">{authModalMsg}</p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setAuthModalMsg('')}
                  className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-semibold py-2.5 rounded-full text-xs shadow-md active:scale-95 transition cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* iOS PWA Install Instruction Modal */}
        {showIosInstallModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[320px] overflow-hidden shadow-2xl border border-slate-100 p-6 text-center space-y-4">
              <img
                src="/pwa-192.png"
                alt="NextTask"
                className="w-16 h-16 mx-auto rounded-2xl shadow-lg object-contain bg-[#05132d] p-1 border border-purple-500/30"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">Install NextTask App</h3>
                <p className="text-xs text-slate-500 mt-1">Install on your iPhone or iPad in 3 simple steps:</p>
              </div>
              <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Tap the <strong>Share</strong> icon ( <span className="inline-block border border-slate-300 rounded px-1 text-[11px]">⎋</span> ) at the bottom of Safari</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong> ( ➕ )</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstallModal(false)}
                className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-semibold py-2.5 rounded-full text-xs shadow-md active:scale-95 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* ================= USER NOTIFICATION CENTER / MAILBOX MODAL ================= */}
        {showNotificationModal && currentUser && (
          <div
            onClick={() => setShowNotificationModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-[340px] overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] cursor-default"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#05132d] text-white flex items-center justify-center shadow-sm">
                    <Mail className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Notification Center</h3>
                    <p className="text-[10px] text-slate-500">{userNotifications.length} message(s)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Actions toolbar */}
              <div className="px-4 py-2 bg-slate-100/60 flex items-center justify-between text-xs border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-600">
                  {unreadCount > 0 ? `${unreadCount} unread message(s)` : 'All caught up!'}
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-50 max-h-[50vh]">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">No messages in mailbox.</p>
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 active:scale-[0.99] ${
                        notif.read ? 'bg-slate-50 hover:bg-slate-100/80' : 'bg-blue-50/80 border border-blue-200/70 hover:bg-blue-50 shadow-xs'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'recharge'
                          ? 'bg-emerald-100 text-emerald-600'
                          : notif.type === 'withdraw'
                          ? 'bg-amber-100 text-amber-600'
                          : notif.type === 'commission'
                          ? 'bg-purple-100 text-purple-600'
                          : notif.type === 'vip'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {notif.type === 'recharge' ? (
                          <Coins className="w-4 h-4" />
                        ) : notif.type === 'withdraw' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : notif.type === 'commission' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : notif.type === 'vip' ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs truncate ${notif.read ? 'font-semibold text-slate-800' : 'font-extrabold text-blue-950'}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-slate-400 font-medium">
                            {notif.time || 'Just now'}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold hover:underline">
                            View details →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="w-full bg-[#05132d] hover:bg-slate-900 text-white font-semibold py-2.5 rounded-full text-xs transition active:scale-[0.99] shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SINGLE NOTIFICATION DETAIL POPUP MODAL ================= */}
        {selectedNotificationDetail && (
          <div
            onClick={() => setSelectedNotificationDetail(null)}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-[325px] p-5 shadow-2xl border border-slate-100 space-y-4 cursor-default animate-scale-up text-left"
            >
              {/* Header with Type & Time */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      selectedNotificationDetail.type === 'recharge'
                        ? 'bg-emerald-100 text-emerald-600'
                        : selectedNotificationDetail.type === 'withdraw'
                        ? 'bg-amber-100 text-amber-600'
                        : selectedNotificationDetail.type === 'commission'
                        ? 'bg-purple-100 text-purple-600'
                        : selectedNotificationDetail.type === 'vip'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {selectedNotificationDetail.type === 'recharge' ? (
                      <Coins className="w-5 h-5" />
                    ) : selectedNotificationDetail.type === 'withdraw' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : selectedNotificationDetail.type === 'commission' ? (
                      <Sparkles className="w-5 h-5" />
                    ) : selectedNotificationDetail.type === 'vip' ? (
                      <Crown className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider ${
                        selectedNotificationDetail.type === 'recharge'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedNotificationDetail.type === 'withdraw'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : selectedNotificationDetail.type === 'commission'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : selectedNotificationDetail.type === 'vip'
                          ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {selectedNotificationDetail.type || 'Notice'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {selectedNotificationDetail.time || 'Recently'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNotificationDetail(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Message Content */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {selectedNotificationDetail.title}
                </h3>
                <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-[42vh] overflow-y-auto">
                  {selectedNotificationDetail.message}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setSelectedNotificationDetail(null)}
                className="w-full bg-[#05132d] hover:bg-slate-900 text-white font-bold py-2.5 rounded-full text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Got it
              </button>
            </div>
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
                <div 
                  onClick={() => navigateToTab('home')}
                  className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition"
                  title="Back to Home"
                >
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

              {/* Method Tabs: Email vs Phone (Matching Original UI) */}
              <div className="flex justify-center gap-10 mt-2 text-sm font-semibold text-white/70">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setAccountInput(''); setAuthError(''); setAuthModalMsg(''); }}
                  className={`pb-2 relative transition cursor-pointer ${
                    loginMethod === 'email' ? 'text-white font-bold' : 'hover:text-white/90'
                  }`}
                >
                  {authMode === 'register' ? 'Register by Email' : 'Email Login'}
                  {loginMethod === 'email' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setAccountInput(''); setAuthError(''); setAuthModalMsg(''); }}
                  className={`pb-2 relative transition cursor-pointer ${
                    loginMethod === 'phone' ? 'text-white font-bold' : 'hover:text-white/90'
                  }`}
                >
                  {authMode === 'register' ? 'Register by phone' : 'Phone Login'}
                  {loginMethod === 'phone' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></span>
                  )}
                </button>
              </div>

              {/* White Form Card (Only Inputs) */}
              <div className="mx-4 mt-4 bg-white rounded-3xl p-5 shadow-xl space-y-3.5">
                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{authError}</span>
                  </div>
                )}
                {authSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Name field (Sign Up only, above Email as requested) */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-[#eef3fb] text-slate-800 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition"
                    />
                  </div>
                )}

                {/* Email / Phone Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {loginMethod === 'email' ? 'E-mail' : 'Phone'}
                  </label>
                  {loginMethod === 'phone' ? (
                    <div className="flex items-center bg-[#eef3fb] px-3.5 py-1 rounded-2xl border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition">
                      <button
                        type="button"
                        onClick={() => setShowCountryPicker(true)}
                        className="flex items-center gap-1.5 text-[#05132d] font-semibold text-sm py-2 hover:opacity-80 transition cursor-pointer shrink-0"
                      >
                        <span className="text-base">{selectedCountry.flag}</span>
                        <span>{selectedCountry.dial}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <div className="h-5 w-[1px] bg-slate-300 mx-2 shrink-0" />

                      <input
                        type="tel"
                        value={accountInput}
                        onChange={(e) => {
                          setAccountInput(e.target.value);
                          setUserPhone(e.target.value);
                        }}
                        placeholder="Phone"
                        className="w-full bg-transparent text-slate-800 text-sm py-2 outline-none font-medium"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={accountInput}
                      onChange={(e) => {
                        setAccountInput(e.target.value);
                        setUserEmail(e.target.value);
                      }}
                      placeholder="E-mail"
                      className="w-full bg-[#eef3fb] text-slate-800 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition"
                    />
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {authMode === 'forgot' ? 'New Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'forgot' ? 'New Password (min 8 chars)' : 'Password'}
                      className="w-full bg-[#eef3fb] text-slate-800 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition pr-11"
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

                {/* Reenter password (Register & Forgot modes) */}
                {(authMode === 'register' || authMode === 'forgot') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reenter password
                    </label>
                    <div className="relative">
                      <input
                        type={showReenterPassword ? 'text' : 'password'}
                        value={reenterPassword}
                        onChange={(e) => setReenterPassword(e.target.value)}
                        placeholder="Reenter password"
                        className="w-full bg-[#eef3fb] text-slate-800 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition pr-11"
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

                {/* Invitation code (Register mode) */}
                {authMode === 'register' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">Invitation code</label>
                      {regInviteCode && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Referral code applied
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={regInviteCode}
                      onChange={(e) => setRegInviteCode(e.target.value.toUpperCase())}
                      placeholder="Invitation code (e.g. NT1001)"
                      className="w-full bg-[#eef3fb] text-slate-800 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition font-mono tracking-wider font-bold"
                    />
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setPassword('');
                        setReenterPassword('');
                        setAuthError('');
                        setAuthModalMsg('');
                      }}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons OUTSIDE the card (Exact Match to Screenshot) */}
              <div className="px-4 py-4 space-y-3 mt-1">
                {authMode === 'register' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-medium py-3.5 rounded-full shadow-lg active:scale-[0.99] transition cursor-pointer text-sm"
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigateToTab('auth', 'login');
                        setAuthError('');
                        setAuthSuccess('');
                        setAuthModalMsg('');
                      }}
                      className="w-full bg-[#e9f0fc] hover:bg-[#dfe9fa] text-[#0d2146] font-medium py-3.5 rounded-full active:scale-[0.99] transition cursor-pointer text-sm"
                    >
                      Sign In
                    </button>
                  </>
                ) : authMode === 'forgot' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-medium py-3.5 rounded-full shadow-lg active:scale-[0.99] transition cursor-pointer text-sm"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setPassword('');
                        setReenterPassword('');
                        setAuthError('');
                        setAuthModalMsg('');
                      }}
                      className="w-full bg-[#e9f0fc] hover:bg-[#dfe9fa] text-[#0d2146] font-medium py-3.5 rounded-full active:scale-[0.99] transition cursor-pointer text-sm"
                    >
                      Back to Sign In
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleLogin}
                      className="w-full bg-[#05132d] hover:bg-[#091e47] text-white font-medium py-3.5 rounded-full shadow-lg active:scale-[0.99] transition cursor-pointer text-sm"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigateToTab('auth', 'register');
                        setAuthError('');
                        setAuthSuccess('');
                        setAuthModalMsg('');
                      }}
                      className="w-full bg-[#e9f0fc] hover:bg-[#dfe9fa] text-[#0d2146] font-medium py-3.5 rounded-full active:scale-[0.99] transition cursor-pointer text-sm"
                    >
                      Sign Up
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
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          requireAuth('notifications', 'view notifications');
                          return;
                        }
                        setShowNotificationModal(true);
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition relative cursor-pointer"
                      title="Mail / Notifications"
                    >
                      <Mail className="w-4 h-4 text-slate-200" />
                      {currentUser && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md border-2 border-[#05132d] animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
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
                    <span className="font-bold text-white flex items-center shrink-0">
                      <Megaphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
                            const id = currentUser?.name || userEmail || userPhone || 'User';
                            return id.length > 16 ? id.slice(0, 15) + '...' : id;
                          })()}
                        </span>
                        <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {userVip}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowAnnouncement(true)}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer text-slate-200 shadow-sm"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-300" />
                        <span>Announcement</span>
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

                      {/* App (Direct APK Download) */}
                      <button
                        onClick={handleDownloadApk}
                        className="flex flex-col items-center gap-1.5 p-1 group cursor-pointer"
                        title="Download NextTask Android APK"
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
                          navigateToTab('team');
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
                        if (activeSlide.image) {
                          return (
                            <div className="rounded-3xl overflow-hidden shadow-md relative min-h-[145px] max-h-[165px] flex items-center justify-center transition-all duration-500 bg-slate-900 border border-slate-100/10">
                              <img
                                src={activeSlide.image}
                                alt={activeSlide.subtitle || 'Banner Slide'}
                                className="w-full h-full object-cover rounded-3xl"
                              />
                              {(activeSlide.subtitle || activeSlide.badge) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 z-10">
                                  {activeSlide.badge && (
                                    <span className="inline-block bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full w-fit mb-1 shadow-sm uppercase">
                                      {activeSlide.badge}
                                    </span>
                                  )}
                                  {activeSlide.subtitle && (
                                    <span className="text-white text-xs font-bold drop-shadow">
                                      {activeSlide.subtitle}
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Carousel indicator dots */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                                {slides.map((_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setCurrentSlideIdx(i)}
                                    className={`h-1.5 rounded-full transition-all ${
                                      (currentSlideIdx % slides.length) === i
                                        ? 'w-5 bg-white'
                                        : 'w-2 bg-white/50 hover:bg-white'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        }
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
                  {(() => {
                    const vipOrder = ['VIP0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5', 'VIP6', 'VIP7', 'VIP8', 'VIP9', 'VIP10'];
                    const curVipIdx = vipOrder.indexOf(userVip || 'VIP0');

                    return vipTiers.map((vip) => {
                      const thisTierIdx = vipOrder.indexOf(vip.level);
                      const isCurrentUnlocked = curVipIdx > 0 && thisTierIdx === curVipIdx;
                      const isPastUnlocked = curVipIdx > 0 && thisTierIdx < curVipIdx;
                      const isHigherTier = thisTierIdx > curVipIdx;

                      // Card styling based on unlock status
                      const cardClass = isCurrentUnlocked
                        ? "bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 rounded-3xl p-4 shadow-md border-2 border-emerald-500 relative pt-6 ring-2 ring-emerald-500/20 transition-all"
                        : isPastUnlocked
                        ? "bg-slate-50/70 rounded-3xl p-4 shadow-xs border border-slate-200/80 relative pt-6 opacity-85 transition-all"
                        : "bg-white rounded-3xl p-4 shadow-sm border border-slate-100 relative pt-6 transition-all";

                      return (
                        <div key={vip.level} className={cardClass}>
                          {/* Top badge */}
                          {isCurrentUnlocked ? (
                            <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>{vip.level} • Unlocked</span>
                            </div>
                          ) : isPastUnlocked ? (
                            <div className="absolute -top-3 left-4 bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{vip.level}</span>
                            </div>
                          ) : (
                            <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#fbd6a5] to-[#fbc286] text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <Crown className="w-3.5 h-3.5 fill-amber-600 text-amber-700" />
                              <span>{vip.level}</span>
                            </div>
                          )}

                          <div className="flex gap-3 items-stretch">
                            {/* Left Badge Box */}
                            <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-2 relative shadow-inner overflow-hidden shrink-0 ${
                              isCurrentUnlocked
                                ? "bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#043328] border border-emerald-400/50 shadow-emerald-950/20 shadow-md"
                                : "bg-[#0c0d11] border border-amber-500/30"
                            }`}>
                              {isCurrentUnlocked ? (
                                <>
                                  <Crown className="w-5 h-5 text-emerald-300 mb-0.5 fill-emerald-300 drop-shadow" />
                                  <div className="text-base font-black tracking-wider text-emerald-300">
                                    VIP
                                  </div>
                                  <div className="text-[8px] uppercase tracking-wider text-emerald-100 font-extrabold bg-emerald-800/90 px-1.5 py-0.5 rounded mt-0.5 shadow-xs">
                                    UNLOCKED
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Crown className="w-5 h-5 text-amber-400 mb-0.5 fill-amber-400 drop-shadow" />
                                  <div className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                                    VIP
                                  </div>
                                  <div className="text-[8px] uppercase tracking-tighter text-amber-300/80 mt-0.5">
                                    member only
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Middle Specs */}
                            <div className={`flex-1 rounded-2xl p-3 flex flex-col justify-between text-xs space-y-1 ${
                              isCurrentUnlocked
                                ? "bg-emerald-50/70 border border-emerald-100/70"
                                : "bg-[#ebf0f8]/80"
                            }`}>
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

                          {/* Action Button */}
                          <div className="flex justify-end mt-3">
                            {isCurrentUnlocked ? (
                              <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                                <span>Unlocked</span>
                              </div>
                            ) : isPastUnlocked ? (
                              <div className="bg-slate-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Unlocked</span>
                              </div>
                            ) : curVipIdx > 0 && isHigherTier ? (
                              <button
                                onClick={() => handleUnlockVip(vip)}
                                className="bg-[#05132d] hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2.5 shadow-md active:scale-95 transition cursor-pointer"
                              >
                                <span>{vip.deposit} USDT</span>
                                <span className="font-semibold text-cyan-300 border-l border-white/20 pl-2">
                                  Upgrade to {vip.level}
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnlockVip(vip)}
                                className="bg-[#05132d] hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-3 shadow-md active:scale-95 transition cursor-pointer"
                              >
                                <span>{vip.deposit} USDT</span>
                                <span className="font-normal text-slate-300 border-l border-white/20 pl-2">Unlock now</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* ================= TAB 3: TEAM ================= */}
              {activeTab === 'team' && (() => {
                const allUsers = getStoredData('users', DEFAULT_USERS);
                const myCode = String(currentUser?.myInviteCode || currentUser?.inviteCode || 'NT1001');

                // Level 1: Direct referrals (matching NT code, user ID, or legacy admin code)
                const level1Members = allUsers.filter(u => isReferredByUser(u, currentUser));

                // Level 2: Referred by Level 1 members
                const l1Codes = new Set();
                level1Members.forEach(u => {
                  if (u.id) l1Codes.add(String(u.id).toUpperCase());
                  if (u.myInviteCode) l1Codes.add(String(u.myInviteCode).toUpperCase());
                  if (u.inviteCode) l1Codes.add(String(u.inviteCode).toUpperCase());
                });
                const level2Members = allUsers.filter(u => u && String(u.id) !== String(currentUser?.id) && u.referredBy && l1Codes.has(String(u.referredBy).trim().toUpperCase()));

                // Level 3: Referred by Level 2 members
                const l2Codes = new Set();
                level2Members.forEach(u => {
                  if (u.id) l2Codes.add(String(u.id).toUpperCase());
                  if (u.myInviteCode) l2Codes.add(String(u.myInviteCode).toUpperCase());
                  if (u.inviteCode) l2Codes.add(String(u.inviteCode).toUpperCase());
                });
                const level3Members = allUsers.filter(u => u && String(u.id) !== String(currentUser?.id) && u.referredBy && l2Codes.has(String(u.referredBy).trim().toUpperCase()));

                const currentLevelMembers = teamLevelTab === 1 ? level1Members : teamLevelTab === 2 ? level2Members : level3Members;
                const totalTeamCount = level1Members.length + level2Members.length + level3Members.length;

                // Referral VIP ladder
                const vipOrder = ['VIP0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5', 'VIP6', 'VIP7', 'VIP8', 'VIP9', 'VIP10'];
                const curIdx = vipOrder.indexOf(userVip);
                const nextVip = curIdx < vipOrder.length - 1 ? vipOrder[curIdx + 1] : null;
                const refReqMap = { VIP1: 1, VIP2: 3, VIP3: 6, VIP4: 10, VIP5: 15, VIP6: 25, VIP7: 40, VIP8: 60, VIP9: 85, VIP10: 120 };
                const nextTarget = nextVip ? refReqMap[nextVip] : null;

                return (
                  <div className="px-4 py-4 space-y-4">
                    {/* Invitation Card */}
                    <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-[#0c1f44] border border-cyan-500/30 rounded-3xl p-5 relative overflow-hidden backdrop-blur shadow-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">Your Invitation Code</div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-2xl font-black tracking-widest text-white drop-shadow">{userInviteCode}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(userInviteCode, 'Invitation code')}
                              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs px-3 py-1 rounded-full font-bold active:scale-95 transition shadow-sm cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-300 mt-3 font-medium">Share referral link & grow team</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-cyan-300/90 truncate max-w-[190px] font-mono bg-white/5 px-2 py-1 rounded-lg">
                              https://nexttask.online/#/register?i={userInviteCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(`https://nexttask.online/#/register?i=${userInviteCode}`, 'Referral link')}
                              className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
                          <Gem className="w-7 h-7 text-cyan-300 drop-shadow" />
                        </div>
                      </div>

                      {/* Level Up Progress Banner */}
                      <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            {userVip} ACTIVE
                          </span>
                          <span className="text-slate-300 text-[11px]">
                            Direct Referrals: <b className="text-white font-bold">{level1Members.length}</b>
                          </span>
                        </div>
                        {nextVip && (
                          <div className="text-[10px] text-cyan-300 font-medium">
                            {Math.max(0, nextTarget - level1Members.length)} more to <span className="font-bold text-white">{nextVip}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Size & Stats Bar */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Team</div>
                        <div className="text-lg font-black text-slate-900 mt-0.5">{totalTeamCount}</div>
                      </div>
                      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Direct (L1)</div>
                        <div className="text-lg font-black text-blue-600 mt-0.5">{level1Members.length}</div>
                      </div>
                      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Sub-tier (L2+L3)</div>
                        <div className="text-lg font-black text-emerald-600 mt-0.5">{level2Members.length + level3Members.length}</div>
                      </div>
                    </div>

                    {/* Level Filter Tabs */}
                    <div className="flex bg-[#e8eef8] p-1 rounded-2xl text-xs font-bold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setTeamLevelTab(1)}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${teamLevelTab === 1 ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                      >
                        Level 1 ({level1Members.length}) <span className="text-[10px] text-rose-500 font-black ml-0.5">16%</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeamLevelTab(2)}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${teamLevelTab === 2 ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                      >
                        Level 2 ({level2Members.length}) <span className="text-[10px] text-emerald-600 font-black ml-0.5">2%</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeamLevelTab(3)}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${teamLevelTab === 3 ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                      >
                        Level 3 ({level3Members.length}) <span className="text-[10px] text-indigo-600 font-black ml-0.5">1%</span>
                      </button>
                    </div>

                    {/* Team Member List (Showing real user Name & User ID) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Level {teamLevelTab} Team Members
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                          {currentLevelMembers.length} Members
                        </span>
                      </div>

                      {currentLevelMembers.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 space-y-2">
                          <Users className="w-9 h-9 mx-auto text-slate-300" />
                          <p className="text-xs font-semibold text-slate-600">No Level {teamLevelTab} members yet.</p>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                            Share your invitation code <b className="text-slate-700">{userInviteCode}</b> with friends. When they register, they will appear here!
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {currentLevelMembers.map((m, idx) => (
                            <div key={m.id || idx} className="py-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#05132d] via-blue-900 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                  {(m.name || m.email || m.phone || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{m.name || 'Member'}</span>
                                    <span className="text-[9px] bg-amber-500/10 text-amber-700 border border-amber-300/40 px-1.5 py-0.2 rounded font-extrabold uppercase">
                                      {m.vip || 'VIP0'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                    <span>User ID: <b className="text-slate-800">{m.id}</b></span>
                                    <span>•</span>
                                    <span>{m.phone || (m.email?.length > 18 ? m.email.slice(0, 15) + '...' : m.email) || 'Member'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                  Active
                                </span>
                                <div className="text-[9px] text-slate-400 mt-0.5">{m.joined || 'Recent'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ================= TAB 4: TASK (CORRESPONDING TO USER VIP LEVEL) ================= */}
              {activeTab === 'task' && (() => {
                const currentVipTier = vipTiers.find((v) => v.level === userVip) || vipTiers[0];
                const maxTasks = currentVipTier?.tasks || 10;
                const rewardPerTask = parseFloat(currentVipTier?.interest || (parseFloat(currentVipTier?.daily || '7.00') / maxTasks).toFixed(2)) || 0.70;

                const totalTasks = Array.from({ length: maxTasks }, (_, i) => i);
                const runningTasks = totalTasks.filter((i) => !completedTaskIndices.includes(i));
                const finishedTasks = totalTasks.filter((i) => completedTaskIndices.includes(i));

                return (
                  <div className="px-4 py-4 space-y-4">
                    {/* Current VIP Mission Header */}
                    <div className="bg-gradient-to-r from-[#071739] via-[#0d2a66] to-[#05132d] rounded-3xl p-5 text-white shadow-xl border border-cyan-500/30 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                              {userVip}
                            </span>
                            <span className="text-xs font-bold text-cyan-300">Daily Mission Center</span>
                          </div>
                          <h2 className="text-base font-black text-white mt-1.5 tracking-tight">AI & Blockchain Node Tasks</h2>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Reward per mission: <b className="text-amber-400 font-bold">+{rewardPerTask.toFixed(2)} USDT</b>
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-300 uppercase font-bold">Today's Progress</div>
                          <div className="text-xl font-black text-white mt-0.5">
                            {completedTaskIndices.length} <span className="text-xs text-slate-400 font-medium">/ {maxTasks}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (completedTaskIndices.length / maxTasks) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Tabs: Running vs Completed */}
                    <div className="flex bg-[#e8eef8] p-1 rounded-2xl text-xs font-bold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setTaskTab('running')}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${taskTab === 'running' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                      >
                        Running ({runningTasks.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskTab('completed')}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${taskTab === 'completed' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                      >
                        Completed ({finishedTasks.length})
                      </button>
                    </div>

                    {/* VIP Locked Warning Banner if VIP0 */}
                    {(!userVip || userVip === 'VIP0') && (
                      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 text-center space-y-2.5">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                          <Crown className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">VIP Package Required</h4>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                          You are currently on <b className="text-slate-800">VIP0</b>. Please unlock any VIP package (VIP1–VIP10) from the VIP tab to start completing daily tasks and earning rewards.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigateToTab('vip')}
                          className="bg-[#05132d] hover:bg-[#0b2457] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md active:scale-95 transition cursor-pointer"
                        >
                          Unlock VIP Package Now
                        </button>
                      </div>
                    )}

                    {/* Tasks List */}
                    <div className="space-y-3">
                      {taskTab === 'running' ? (
                        runningTasks.length === 0 ? (
                          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                            <h3 className="text-sm font-bold text-slate-900">All tasks completed today!</h3>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                              You have finished all {maxTasks} daily tasks for {userVip}. Daily tasks reset every 24 hours.
                            </p>
                          </div>
                        ) : (
                          runningTasks.map((taskIdx) => (
                            <div
                              key={taskIdx}
                              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between transition hover:shadow-md"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">
                                    {userVip} Verification Mission #{taskIdx + 1}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    Running
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Daily Reward: <b className="text-emerald-600 font-bold">+{rewardPerTask.toFixed(2)} USDT</b>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={taskProcessingIdx !== null}
                                onClick={() => handleCompleteTask(taskIdx, rewardPerTask)}
                                className="bg-[#05132d] hover:bg-[#0b2457] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {taskProcessingIdx === taskIdx ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Verifying ({taskCountdown}s)...</span>
                                  </>
                                ) : (
                                  <span>Complete</span>
                                )}
                              </button>
                            </div>
                          ))
                        )
                      ) : (
                        finishedTasks.length === 0 ? (
                          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm text-slate-400">
                            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="text-xs font-medium">No completed tasks yet today.</p>
                          </div>
                        ) : (
                          finishedTasks.map((taskIdx) => (
                            <div
                              key={taskIdx}
                              className="bg-white/80 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-700">
                                    {userVip} Verification Mission #{taskIdx + 1}
                                  </span>
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Completed
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Credited: <b className="text-emerald-600 font-bold">+{rewardPerTask.toFixed(2)} USDT</b>
                                </div>
                              </div>

                              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                Done ✓
                              </span>
                            </div>
                          ))
                        )
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ================= TAB 5: ME ================= */}
              {activeTab === 'me' && (
                <div className="px-4 -mt-3 space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowRechargeModal(true)}
                      className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#05132d] text-white flex items-center justify-center shadow-md">
                        <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Recharge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowWithdrawModal(true)}
                      className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#05132d] text-white flex items-center justify-center shadow-md">
                        <ArrowUpRight className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Withdraw</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRecordsModal(true)}
                      className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#05132d] text-white flex items-center justify-center shadow-md">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 leading-tight">Financial record</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenProfileModal('personal')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-slate-800">Personal Profile</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenProfileModal('withdraw')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-cyan-600" />
                        <span className="text-sm font-medium text-slate-800">Withdrawal Accounts</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRecordsModal(true)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-800">Financial Records</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5 text-slate-500" />
                        <span className="text-sm font-medium text-slate-800">Change Password</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 hover:bg-rose-50 text-left transition cursor-pointer"
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
              <img
                src="/pwa-192.png"
                alt="NextTask"
                className="w-16 h-16 rounded-2xl mx-auto shadow-lg object-contain bg-[#05132d] p-1 border border-purple-500/30"
              />
              <h3 className="font-bold text-slate-800 text-base">NextTask Official App</h3>
              <p className="text-xs text-slate-500">
                Install NextTask PWA or Download Android APK for fastest task submissions and instant notifications.
              </p>
              <button
                onClick={() => {
                  handleDownloadApk();
                  setShowAppModal(false);
                }}
                className="w-full bg-[#05132d] hover:bg-indigo-900 text-white text-xs font-semibold py-3 rounded-full mt-2 cursor-pointer shadow-md"
              >
                Download APK (NextTask.apk)
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
          <div
            onClick={() => setShowUnlockConfirmModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-[320px] p-6 shadow-2xl space-y-6 text-center animate-scale-up border border-slate-100 cursor-default"
            >
              <p className="text-slate-800 text-sm leading-relaxed font-normal pt-2 px-1">
                The recharge balance is automatically unlocked Need to recharge ${selectedVipForUnlock.deposit}
              </p>
              <button
                onClick={handleConfirmUnlock}
                className="w-full bg-[#ff3b30] hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-full shadow-lg active:scale-95 transition text-sm tracking-wide cursor-pointer"
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
                      ⚠️ {selectedPaymentMethod.instructions.includes('করুন') || selectedPaymentMethod.instructions.includes('নিচে দিন')
                        ? (selectedPaymentMethod.method === 'USDT (TRC20)' ? 'Transfer USDT via TRC20 network and submit TxID below' : 'Please Send Money and enter TrxID below')
                        : selectedPaymentMethod.instructions}
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

        {/* ================= WITHDRAW FUNDS MODAL ================= */}
        {showWithdrawModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[360px] p-5 space-y-4 animate-slide-up shadow-2xl border border-slate-100 max-h-[90%] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-amber-500" />
                  Withdraw Funds
                </h3>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Available Balance</div>
                  <div className="text-xl font-black text-slate-900">{balance.toFixed(2)} USDT</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Min Withdrawal</div>
                  <div className="text-xs font-bold text-indigo-600">{Math.max(10.0, parseFloat(settings?.minWithdrawal) || 10.0).toFixed(2)} USDT</div>
                </div>
              </div>

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Withdrawal Method
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['bKash', 'Nagad', 'Rocket', 'USDT (TRC20)', 'Bank Transfer'].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => {
                        setWithdrawMethod(m);
                        const saved = currentUser?.withdrawalAccounts?.[m.toLowerCase()] ||
                                      (m === 'Bank Transfer' ? currentUser?.withdrawalAccounts?.bankAccount : '') ||
                                      (m === 'USDT (TRC20)' ? currentUser?.withdrawalAccounts?.trc20 : '');
                        setWithdrawAccountInput(saved || '');
                      }}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition cursor-pointer ${
                        withdrawMethod === m
                          ? 'bg-[#05132d] text-white border-[#05132d] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Input / Display */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {withdrawMethod} Account / Number
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      handleOpenProfileModal('withdraw');
                    }}
                    className="text-[10px] text-indigo-600 hover:underline font-bold"
                  >
                    Manage Accounts &gt;
                  </button>
                </div>
                <input
                  type="text"
                  value={withdrawAccountInput}
                  onChange={(e) => setWithdrawAccountInput(e.target.value)}
                  placeholder={`Enter your ${withdrawMethod} number or address`}
                  className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount (Min 10 USDT)"
                  className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              <button
                type="button"
                onClick={handleWithdrawSubmit}
                className="w-full bg-[#05132d] hover:bg-[#091f4b] text-white text-xs font-bold py-3 rounded-full shadow-lg active:scale-95 transition cursor-pointer"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        )}

        {/* ================= REAL FINANCIAL RECORDS MODAL (SPLIT VIEW) ================= */}
        {showRecordsModal && (() => {
          const allRecharges = getStoredData('recharges', DEFAULT_RECHARGES);
          const allWithdrawals = getStoredData('withdrawals', DEFAULT_WITHDRAWALS);

          const userRecharges = allRecharges.filter(r => 
            r && (
              (currentUser?.id && String(r.userId) === String(currentUser.id)) ||
              (currentUser?.email && String(r.user || '').toLowerCase() === currentUser.email.toLowerCase()) ||
              (currentUser?.phone && String(r.user || '') === currentUser.phone)
            )
          );

          const userWithdrawals = allWithdrawals.filter(w =>
            w && (
              (currentUser?.id && String(w.userId) === String(currentUser.id)) ||
              (currentUser?.email && String(w.user || '').toLowerCase() === currentUser.email.toLowerCase()) ||
              (currentUser?.phone && String(w.user || '') === currentUser.phone)
            )
          );

          const totalDeposited = userRecharges.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
          const totalWithdrawn = userWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

          return (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-[370px] p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[88%] flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Financial Records
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowRecordsModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* 2-Side Summary: Left = Deposited, Right = Withdrawn */}
                <div className="grid grid-cols-2 gap-2.5 shrink-0">
                  {/* Left Column: Deposited Amount */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3.5 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-tight">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      Total Deposited
                    </div>
                    <div className="text-lg font-black text-emerald-700 mt-1">
                      ${totalDeposited.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-emerald-600/90 font-semibold mt-0.5">
                      {userRecharges.length} Deposits
                    </div>
                  </div>

                  {/* Right Column: Withdrawn Amount */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3.5 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-800 uppercase tracking-tight">
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                      Total Withdrawn
                    </div>
                    <div className="text-lg font-black text-amber-700 mt-1">
                      ${totalWithdrawn.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-amber-600/90 font-semibold mt-0.5">
                      {userWithdrawals.length} Withdrawals
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-[#eef3fb] p-1 rounded-2xl text-xs font-bold text-slate-600 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRecordsTab('deposit')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer ${recordsTab === 'deposit' ? 'bg-white text-emerald-700 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                  >
                    Deposits ({userRecharges.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordsTab('withdraw')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer ${recordsTab === 'withdraw' ? 'bg-white text-amber-700 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                  >
                    Withdrawals ({userWithdrawals.length})
                  </button>
                </div>

                {/* Real Transactions List */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {recordsTab === 'deposit' ? (
                    userRecharges.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-1">
                        <ArrowDownLeft className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No deposit records yet.</p>
                        <p className="text-[10px] text-slate-400">Recharges submitted will show here in real time.</p>
                      </div>
                    ) : (
                      userRecharges.map((r, idx) => (
                        <div key={r.id || idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Deposit via {r.network || 'bKash'}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                r.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {r.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              TrxID: {r.txid || r.id}
                            </div>
                            <div className="text-[10px] text-slate-400">{r.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-emerald-600">
                              +${parseFloat(r.amount).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">USDT</div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    userWithdrawals.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-1">
                        <ArrowUpRight className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No withdrawal records yet.</p>
                        <p className="text-[10px] text-slate-400">Withdrawal requests will appear here with live status.</p>
                      </div>
                    ) : (
                      userWithdrawals.map((w, idx) => (
                        <div key={w.id || idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Withdraw to {w.method}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                w.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {w.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]">
                              A/C: {w.account}
                            </div>
                            <div className="text-[10px] text-slate-400">{w.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-amber-600">
                              -${parseFloat(w.amount).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">USDT</div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= USER PROFILE & WITHDRAWAL ACCOUNTS MODAL ================= */}
        {showProfileModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[370px] p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[90%] flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  User Profile & Accounts
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#eef3fb] p-1 rounded-2xl text-xs font-bold text-slate-600 shrink-0">
                <button
                  type="button"
                  onClick={() => setProfileTab('personal')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${profileTab === 'personal' ? 'bg-white text-indigo-700 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                >
                  Personal Info
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab('withdraw')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${profileTab === 'withdraw' ? 'bg-white text-indigo-700 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                >
                  Withdrawal Accounts
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 text-xs">
                {profileTab === 'personal' ? (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="e.g. 01712345678"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Date of Birth (DOB)</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={profileDob}
                          onChange={(e) => setProfileDob(e.target.value)}
                          className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>User ID:</span>
                        <span className="font-mono font-bold text-slate-800">{currentUser?.id || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Email:</span>
                        <span className="font-medium text-slate-800">{currentUser?.email || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Current VIP:</span>
                        <span className="font-bold text-amber-600">{userVip}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Invitation Code:</span>
                        <span className="font-mono font-bold text-cyan-600">{userInviteCode}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Add your withdrawal accounts to receive fast, verified payouts directly.
                    </p>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">bKash Account Number</label>
                      <input
                        type="tel"
                        value={profileBkash}
                        onChange={(e) => setProfileBkash(e.target.value)}
                        placeholder="e.g. 01712345678"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nagad Account Number</label>
                      <input
                        type="tel"
                        value={profileNagad}
                        onChange={(e) => setProfileNagad(e.target.value)}
                        placeholder="e.g. 01812345678"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Rocket Account Number</label>
                      <input
                        type="tel"
                        value={profileRocket}
                        onChange={(e) => setProfileRocket(e.target.value)}
                        placeholder="e.g. 01912345678"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">USDT (TRC20) Wallet Address</label>
                      <input
                        type="text"
                        value={profileTrc20}
                        onChange={(e) => setProfileTrc20(e.target.value)}
                        placeholder="Paste TRC20 address (Starts with T)"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="font-bold text-slate-800">Bank Account Details (Optional)</div>
                      <input
                        type="text"
                        value={profileBankName}
                        onChange={(e) => setProfileBankName(e.target.value)}
                        placeholder="Bank Name (e.g. Islami Bank)"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <input
                        type="text"
                        value={profileBankHolder}
                        onChange={(e) => setProfileBankHolder(e.target.value)}
                        placeholder="Account Holder Name"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <input
                        type="text"
                        value={profileBankAccount}
                        onChange={(e) => setProfileBankAccount(e.target.value)}
                        placeholder="Account Number"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full bg-[#05132d] hover:bg-[#091f4b] text-white text-xs font-bold py-3 rounded-full shadow-lg active:scale-95 transition cursor-pointer shrink-0"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ================= CHANGE PASSWORD MODAL (OLD TO NEW) ================= */}
        {showPasswordModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[340px] p-5 space-y-4 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                  Change Password
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setChangePassError('');
                    setOldPasswordInput('');
                    setNewPasswordInput('');
                    setConfirmNewPasswordInput('');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {changePassError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{changePassError}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Old Password</label>
                  <input
                    type="password"
                    required
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPasswordInput}
                    onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                    placeholder="Reenter new password"
                    className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#05132d] hover:bg-[#091f4b] text-white text-xs font-bold py-3 rounded-full shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    Confirm Change
                  </button>
                </div>
              </form>
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
