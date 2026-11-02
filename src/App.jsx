import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  RefreshCw,
  Headphones,
  MessageCircle,
  Gift,
  Send,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import AdminPanel from './AdminPanel';
import {
  getStoredData,
  setStoredData,
  fetchCloudDataNow,
  getVipLevelFromReferrals,
  generateUniqueInviteCode,
  isReferredByUser,
  getInviteCodeFromUrl,
  isRegisterRoute,
  DEFAULT_USERS,
  DEFAULT_VIP_TIERS,
  DEFAULT_SETTINGS,
  DEFAULT_COMPANY_PROFILE,
  DEFAULT_UPGRADE_LOGS,
  recordUpgradeLog,
  DEFAULT_SLIDES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_RECHARGES,
  DEFAULT_WITHDRAWALS,
  DEFAULT_TASK_RECORDS,
  DEFAULT_SUPPORT_CHANNELS,
  DEFAULT_SUPPORT_AVATAR,
  getUserWithdrawableBalance,
  getPaymentLogo,
  getPackageLogo,
  getVipDisplayName,
  getLocalDateStr,
  recordUserLoginAudit
} from './store';
import { LANGUAGES, TRANSLATIONS } from './translations';
import { COUNTRY_LIST } from './countries';

const MEMBER_LIST_DATA = [
  { amount: '+৳15,000.00', user: '018******34', vip: 'Business Package' },
  { amount: '+৳500.00', user: '017******46', vip: 'Starter Package' },
  { amount: '+৳3,500.00', user: '019******25', vip: 'Basic Package' },
  { amount: '+৳7,500.00', user: '016******88', vip: 'Silver Package' },
  { amount: '+৳18,000.00', user: '013******82', vip: 'Gold Package' },
  { amount: '+৳42,000.00', user: '015******44', vip: 'Platinum Package' },
  { amount: '+৳50.00', user: '017******11', vip: 'Starter Package' },
  { amount: '+৳90,000.00', user: '018******89', vip: 'Diamond Package' },
  { amount: '+৳180,000.00', user: '019******21', vip: 'Premium Package' },
  { amount: '+৳450,000.00', user: '018******99', vip: 'Elite Package' },
  { amount: '+৳1,200,000.00', user: '017******01', vip: 'Royal Package' },
  { amount: '+৳1,000.00', user: '016******77', vip: 'Basic Package' },
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

// ================= BANNER CAROUSEL (SMOOTH HORIZONTAL SLIDE & TOUCH SWIPE) =================
function BannerCarousel({ slides, lang, defaultSlides }) {
  const filteredSlides = (slides || []).filter((s) => {
    if (lang === 'bn') {
      return s.id?.startsWith('s_bn') || /[\u0980-\u09FF]/.test(s.subtitle || '') || (s.image && s.image.includes('_bn_'));
    } else {
      return !s.id?.startsWith('s_bn') && !/[\u0980-\u09FF]/.test(s.subtitle || '') && !(s.image && s.image.includes('_bn_'));
    }
  });

  let slideList = filteredSlides;
  if (!slideList || slideList.length < 5) {
    slideList = lang === 'bn'
      ? defaultSlides.filter((s) => s.id?.startsWith('s_bn'))
      : defaultSlides.filter((s) => !s.id?.startsWith('s_bn'));
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Reset when language or slides count changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsTransitioning(false);
  }, [lang, slideList.length]);

  // Autoplay timer: advance right-to-left every 4.2 seconds
  useEffect(() => {
    if (slideList.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4200);

    return () => clearInterval(interval);
  }, [slideList.length, isPaused]);

  // Seamless infinite loop handler
  const handleTransitionEnd = () => {
    if (currentIndex >= slideList.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const delta = touchDeltaX.current;
    if (delta < -40) {
      // Swiped left -> advance next
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (delta > 40) {
      // Swiped right -> go to previous
      if (currentIndex > 0) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
      }
    }
  };

  if (!slideList || slideList.length === 0) return null;

  // Add cloned first slide at the end for continuous forward slide
  const extendedSlides = slideList.length > 1 ? [...slideList, slideList[0]] : slideList;

  return (
    <div
      className="mx-4 relative rounded-3xl overflow-hidden shadow-md bg-slate-900 border border-slate-100/10 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 850ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
          willChange: 'transform'
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, idx) => {
          const isDefaultTheme = !slide.gradient || slide.gradient === 'default' || slide.gradient === 'none';
          const showTextOverlay = !isDefaultTheme && (slide.subtitle || slide.badge);

          if (slide.image) {
            return (
              <div
                key={`${slide.id || 'slide'}-${idx}`}
                className="w-full shrink-0 min-w-full relative h-[150px] sm:h-[165px] flex items-center justify-center overflow-hidden"
              >
                <img
                  src={slide.image}
                  alt={slide.subtitle || 'Banner Slide'}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  draggable={false}
                />
                {showTextOverlay && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 z-10 pointer-events-none">
                    {slide.badge && (
                      <span className="inline-block bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full w-fit mb-1 shadow-sm uppercase">
                        {slide.badge}
                      </span>
                    )}
                    {slide.subtitle && (
                      <span className="text-white text-xs font-bold drop-shadow">
                        {slide.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }

          const gradientTheme = (!slide.gradient || slide.gradient === 'default')
            ? 'from-amber-500 via-orange-500 to-yellow-400'
            : slide.gradient;

          return (
            <div
              key={`${slide.id || 'slide'}-${idx}`}
              className={`w-full shrink-0 min-w-full bg-gradient-to-r ${gradientTheme} p-5 text-white relative h-[150px] sm:h-[165px] flex items-center overflow-hidden`}
            >
              <div className="relative z-10 max-w-[210px]">
                {slide.badge && (
                  <div className="inline-block bg-white text-orange-600 font-black text-xl px-2 py-0.5 rounded shadow-sm tracking-tight mb-1">
                    {slide.badge}
                  </div>
                )}
                <div className="text-3xl font-black text-red-700 leading-none tracking-tight drop-shadow-sm">
                  {slide.amount}
                </div>
                <div className="text-xs font-black tracking-widest text-slate-900 mt-1 uppercase">
                  {slide.subtitle}
                </div>
                {slide.description && (
                  <div className="text-[10px] text-white/90 mt-1 font-medium line-clamp-2">
                    {slide.description}
                  </div>
                )}
              </div>
              <div className="absolute right-2 bottom-0 top-0 flex items-center opacity-95 pointer-events-none">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                  <TrendingUp className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel Indicator Dots */}
      {slideList.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-auto">
          {slideList.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIsTransitioning(true);
                setCurrentIndex(i);
              }}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                (currentIndex % slideList.length) === i
                  ? 'w-5 bg-white shadow-sm'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
        // Auto-check capital release if package validity has ended
        if (
          freshUser.vipExpiresAt &&
          Date.now() >= freshUser.vipExpiresAt &&
          !freshUser.capitalReleased &&
          freshUser.vip !== 'VIP0' &&
          freshUser.email !== 'admin@nexttask.online'
        ) {
          freshUser.capitalReleased = true;
          const updatedUsers = allUsers.map(u => (
            (u.id && freshUser.id && String(u.id) === String(freshUser.id)) ||
            (u.email && freshUser.email && u.email.toLowerCase() === freshUser.email.toLowerCase())
          ) ? { ...u, capitalReleased: true } : u);
          setStoredData('users', updatedUsers);
          try {
            const allNotifs = getStoredData('notifications', []);
            allNotifs.unshift({
              id: `notif_${Date.now()}`,
              userId: String(freshUser.id || freshUser.email),
              title: '🎉 Package Validity Completed & Capital Released!',
              message: `Your ${freshUser.vip} package validity period has successfully completed. Your principal recharge capital of ৳${freshUser.recharge} BDT is now unlocked and fully released to your withdrawable balance!`,
              time: new Date().toISOString().replace('T', ' ').slice(0, 16),
              read: false,
              type: 'vip'
            });
            setStoredData('notifications', allNotifs);
          } catch (e) {}
        }

        setCurrentUser((prev) => {
          if (!prev) return freshUser;
          if (
            prev.balance !== freshUser.balance ||
            prev.recharge !== freshUser.recharge ||
            prev.vip !== freshUser.vip ||
            prev.name !== freshUser.name ||
            prev.capitalReleased !== freshUser.capitalReleased
          ) {
            try {
              localStorage.setItem('nt_currentUser', JSON.stringify(freshUser));
            } catch (e) {}
            const withBal = getUserWithdrawableBalance(freshUser);
            setBalance(withBal);
            setRechargeTotal(typeof freshUser.recharge === 'number' ? freshUser.recharge : (parseFloat(freshUser.recharge) || 0));
            const sanitizedVip = (freshUser.email !== 'admin@nexttask.online' && (!freshUser.recharge || freshUser.recharge === 0) && freshUser.vip === 'VIP1') ? 'VIP0' : (freshUser.vip || 'VIP0');
            setUserVip(sanitizedVip);
            return { ...freshUser, balance: withBal, vip: sanitizedVip };
          }
          return prev;
        });

        // Auto-resolve IP & Location if missing or pending
        if (freshUser && (!freshUser.lastLoginIp || freshUser.lastLoginIp === 'Pending')) {
          recordUserLoginAudit(freshUser);
        }
      } else {
        // If logged-in account was deleted or no longer exists in D1 database, invalidate stale session immediately
        if (cur.email !== 'admin@nexttask.online') {
          try {
            localStorage.removeItem('nt_currentUser');
          } catch (e) {}
          setCurrentUser(null);
          setIsLoggedIn(false);
          setBalance(0);
          setRechargeTotal(0);
          setUserVip('VIP0');
        }
      }
    } catch (err) {
      console.warn('Realtime sync error:', err);
    }
  };

  // Dynamic Store Data
  const [vipTiers, setVipTiers] = useState(() => getStoredData('vips', DEFAULT_VIP_TIERS));
  const [settings, setSettings] = useState(() => getStoredData('settings', DEFAULT_SETTINGS));
  const [slides, setSlides] = useState(() => getStoredData('slides', DEFAULT_SLIDES));
  const [supportChannels, setSupportChannels] = useState(() => getStoredData('support_channels', DEFAULT_SUPPORT_CHANNELS));
  const [showSupportChoiceModal, setShowSupportChoiceModal] = useState(false);

  const formatSupportUrl = (channel) => {
    if (!channel || !channel.link) return '';
    const raw = channel.link.trim();
    if (channel.type === 'telegram') {
      if (raw.startsWith('@')) return `https://t.me/${raw.slice(1)}`;
      if (!raw.startsWith('http')) return `https://t.me/${raw}`;
      return raw;
    }
    if (channel.type === 'whatsapp') {
      if (raw.startsWith('http')) return raw;
      const cleanNum = raw.replace(/[^\d+]/g, '').replace(/^\+/, '');
      return `https://wa.me/${cleanNum}`;
    }
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      return `https://${raw}`;
    }
    return raw;
  };

  const handleFloatingSupportClick = () => {
    const activeList = (supportChannels || []).filter((c) => c.active !== false);
    if (activeList.length === 0) {
      if (settings?.telegramSupport) {
        const tg = settings.telegramSupport.trim();
        const url = tg.startsWith('http') ? tg : `https://t.me/${tg.replace(/^@/, '')}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      showToast('Support is currently offline. Please try again later.');
      return;
    }
    if (activeList.length === 1) {
      const url = formatSupportUrl(activeList[0]);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    setShowSupportChoiceModal(true);
  };

  // Draggable Floating Support Button State & Handlers
  const appFrameRef = useRef(null);
  const [supportPos, setSupportPos] = useState(() => {
    try {
      const saved = localStorage.getItem('nt_support_btn_pos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const isDraggingSupport = useRef(false);
  const supportDragData = useRef({ startX: 0, startY: 0, initX: 0, initY: 0, moved: false });

  const handleSupportDragStart = (clientX, clientY) => {
    if (!appFrameRef.current) return;
    const parentRect = appFrameRef.current.getBoundingClientRect();
    const btnEl = document.getElementById('floating-support-btn-wrapper');
    if (!btnEl) return;
    const btnRect = btnEl.getBoundingClientRect();

    const currentLeft = btnRect.left - parentRect.left;
    const currentTop = btnRect.top - parentRect.top;

    isDraggingSupport.current = true;
    supportDragData.current = {
      startX: clientX,
      startY: clientY,
      initX: currentLeft,
      initY: currentTop,
      moved: false
    };
  };

  const handleSupportDragMove = (clientX, clientY) => {
    if (!isDraggingSupport.current || !appFrameRef.current) return;
    const dx = clientX - supportDragData.current.startX;
    const dy = clientY - supportDragData.current.startY;

    if (Math.hypot(dx, dy) > 4) {
      supportDragData.current.moved = true;
    }

    const parentRect = appFrameRef.current.getBoundingClientRect();
    const btnWidth = 56;
    const btnHeight = 56;

    let newX = supportDragData.current.initX + dx;
    let newY = supportDragData.current.initY + dy;

    const minX = 8;
    const maxX = parentRect.width - btnWidth - 8;
    const minY = 8;
    const maxY = parentRect.height - btnHeight - 8;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    setSupportPos({ x: newX, y: newY });
  };

  const handleSupportDragEnd = () => {
    if (!isDraggingSupport.current) return;
    isDraggingSupport.current = false;
    if (supportDragData.current.moved) {
      setSupportPos((pos) => {
        if (pos) {
          try {
            localStorage.setItem('nt_support_btn_pos', JSON.stringify(pos));
          } catch {}
        }
        return pos;
      });
    }
  };

  const onMouseDownSupport = (e) => {
    e.preventDefault();
    handleSupportDragStart(e.clientX, e.clientY);

    const onMouseMove = (moveEvent) => {
      handleSupportDragMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      handleSupportDragEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStartSupport = (e) => {
    const touch = e.touches[0];
    if (touch) {
      handleSupportDragStart(touch.clientX, touch.clientY);
    }
  };

  const onTouchMoveSupport = (e) => {
    const touch = e.touches[0];
    if (touch) {
      handleSupportDragMove(touch.clientX, touch.clientY);
    }
  };

  const onTouchEndSupport = () => {
    handleSupportDragEnd();
  };

  const handleSupportClickWrapped = (e) => {
    if (supportDragData.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      supportDragData.current.moved = false;
      return;
    }
    handleFloatingSupportClick();
  };

  // Preload banners and payment logos for zero-lag instant rendering on mobile
  useEffect(() => {
    try {
      if (slides && slides.length > 0) {
        slides.forEach((s) => {
          if (s.image && typeof s.image === 'string') {
            const img = new Image();
            img.src = s.image;
          }
        });
      }
      const paymentLogos = ['/logos/bkash.svg', '/logos/nagad.svg', '/logos/rocket.svg', '/logos/usdt.svg', '/logos/bank.svg', '/logos/upay.svg'];
      paymentLogos.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
      if (vipTiers && vipTiers.length > 0) {
        vipTiers.forEach((vt) => {
          if (vt.logo && typeof vt.logo === 'string') {
            const img = new Image();
            img.src = vt.logo;
          }
        });
      }
    } catch {}
  }, [slides, vipTiers]);

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
      setSupportChannels(getStoredData('support_channels', DEFAULT_SUPPORT_CHANNELS));
      setPaymentMethods(getStoredData('payments', DEFAULT_PAYMENT_METHODS));
      syncCurrentUserData();
    };

    const applyFreshState = () => {
      handleUrlChange();
      const freshVips = getStoredData('vips', DEFAULT_VIP_TIERS);
      const freshSettings = getStoredData('settings', DEFAULT_SETTINGS);
      const freshSlides = getStoredData('slides', DEFAULT_SLIDES);
      const freshSupport = getStoredData('support_channels', DEFAULT_SUPPORT_CHANNELS);
      const freshPayments = getStoredData('payments', DEFAULT_PAYMENT_METHODS);

      setVipTiers((prev) => JSON.stringify(prev) === JSON.stringify(freshVips) ? prev : freshVips);
      setSettings((prev) => JSON.stringify(prev) === JSON.stringify(freshSettings) ? prev : freshSettings);
      setSlides((prev) => JSON.stringify(prev) === JSON.stringify(freshSlides) ? prev : freshSlides);
      setSupportChannels((prev) => JSON.stringify(prev) === JSON.stringify(freshSupport) ? prev : freshSupport);
      setPaymentMethods((prev) => JSON.stringify(prev) === JSON.stringify(freshPayments) ? prev : freshPayments);
      syncCurrentUserData();
    };

    const handleSyncEvent = (e) => {
      // If cloud-sync triggered without real updates, skip state replacement to prevent UI jitter
      if (e?.detail && e.detail.hasUpdates === false) return;
      applyFreshState();
    };

    handleUrlChange();

    // Await cloud synchronization BEFORE dismissing the loading splash
    fetchCloudDataNow().then(() => {
      applyFreshState();
      setTimeout(() => {
        setIsInitialSyncing(false);
      }, 150);
    }).catch(() => {
      applyFreshState();
      setIsInitialSyncing(false);
    });

    const splashSafetyTimer = setTimeout(() => {
      applyFreshState();
      setIsInitialSyncing(false);
    }, 1800);

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('storage', handleSyncEvent);
    window.addEventListener('cloud-sync', handleSyncEvent);
    const syncInterval = setInterval(syncCurrentUserData, 3000);
    return () => {
      clearTimeout(splashSafetyTimer);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('storage', handleSyncEvent);
      window.removeEventListener('cloud-sync', handleSyncEvent);
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
  const [isInitialSyncing, setIsInitialSyncing] = useState(true);
  const [loginMethod, setLoginMethod] = useState('phone'); // phone only (Gmail removed)
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
      return getUserWithdrawableBalance(u);
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
      if (u && u.email !== 'admin@nexttask.online' && (!u.recharge || u.recharge === 0) && u.vip === 'VIP1') {
        return 'VIP0';
      }
      return u?.vip || 'VIP0';
    } catch {
      return 'VIP0';
    }
  });

  // User Profile & Withdrawal Accounts State
  const [showPersonalProfileModal, setShowPersonalProfileModal] = useState(false);
  const [showWithdrawAccountsModal, setShowWithdrawAccountsModal] = useState(false);
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [newAccType, setNewAccType] = useState('bKash');
  const [newAccHolder, setNewAccHolder] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccBankName, setNewAccBankName] = useState('');
  const [selectedWithdrawAccountId, setSelectedWithdrawAccountId] = useState('');
  const [rechargeErrorPopup, setRechargeErrorPopup] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('personal');
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

  // Financial Records State (Task Income vs Deposited vs Withdrawn)
  const [recordsTab, setRecordsTab] = useState('task'); // 'task' | 'deposit' | 'withdraw'

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bKash');
  const [withdrawAccountInput, setWithdrawAccountInput] = useState('');

  // Automatically select the user's first configured withdrawal account
  useEffect(() => {
    if (showWithdrawModal && currentUser) {
      const wa = currentUser?.withdrawalAccounts || {};
      const active = [];
      if (wa.bkash?.trim()) active.push({ name: 'bKash', val: wa.bkash.trim() });
      if (wa.nagad?.trim()) active.push({ name: 'Nagad', val: wa.nagad.trim() });
      if (wa.rocket?.trim()) active.push({ name: 'Rocket', val: wa.rocket.trim() });
      if (wa.trc20?.trim()) active.push({ name: 'USDT (TRC20)', val: wa.trc20.trim() });
      if (wa.bankAccount?.trim()) active.push({ name: 'Bank Transfer', val: wa.bankAccount.trim() });

      if (active.length > 0) {
        const match = active.find((a) => a.name === withdrawMethod);
        if (match) {
          if (withdrawAccountInput !== match.val) {
            setWithdrawAccountInput(match.val);
          }
        } else {
          setWithdrawMethod(active[0].name);
          setWithdrawAccountInput(active[0].val);
        }
      } else if (withdrawAccountInput !== '') {
        setWithdrawAccountInput('');
      }
    }
  }, [showWithdrawModal, currentUser?.id, withdrawMethod]);

  // Team Tab State
  const [teamLevelTab, setTeamLevelTab] = useState(1);

  // Task Tab State
  const [taskTab, setTaskTab] = useState('running'); // 'running' | 'completed'
  const [selectedTaskPackId, setSelectedTaskPackId] = useState(null);
  const [taskProcessingIdx, setTaskProcessingIdx] = useState(null);
  const [taskCountdown, setTaskCountdown] = useState(0);
  const taskTimerRef = useRef(null);
  const [todayDateStr, setTodayDateStr] = useState(() => getLocalDateStr());
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Multi-Package Active Plans Detection:
  // User can own Starter (7 days) + multiple VIPs simultaneously.
  // All package meyad, daily profit, tasks, and deposit are live linked with Admin settings!
  const userActivePackages = useMemo(() => {
    if (!currentUser) return [];
    const list = [];
    const now = Date.now();

    // 1. Starter Package check
    const starterTier = vipTiers.find((v) => String(v.level || '').toLowerCase().includes('starter') || v.id === '1') || vipTiers[0];
    const starterDays = parseInt(starterTier?.days) || 7;
    const isStarterClaimed = !!currentUser.starterClaimedAt;
    const starterExpiresAt = currentUser.starterExpiresAt || (currentUser.starterClaimedAt ? currentUser.starterClaimedAt + starterDays * 86400000 : null);
    const isStarterRunning = isStarterClaimed && starterExpiresAt && now < starterExpiresAt;

    if (isStarterRunning) {
      list.push({
        instanceId: 'starter_active',
        packId: starterTier?.id || '1',
        level: starterTier?.level || 'Starter Package',
        deposit: starterTier?.deposit || '0.00',
        daily: starterTier?.daily || '20.00',
        interest: starterTier?.interest || '4.00',
        tasks: parseInt(starterTier?.tasks) || 5,
        days: starterDays,
        activatedAt: currentUser.starterClaimedAt,
        expiresAt: starterExpiresAt,
        logo: getPackageLogo(starterTier),
        isStarter: true
      });
    }

    // 2. Purchased VIP Packages in currentUser.activePackages (exclude any duplicate starter)
    if (Array.isArray(currentUser.activePackages)) {
      currentUser.activePackages.forEach((pkg, idx) => {
        if (!pkg || !pkg.expiresAt || now >= pkg.expiresAt) return;
        const isPkgStarter = String(pkg.level || '').toLowerCase().includes('starter') || pkg.isStarter;
        // Never add starter package twice!
        if (isPkgStarter && list.some((p) => p.isStarter)) return;

        // Link dynamically with live admin VIP tier settings
        const matchingTier = vipTiers.find((v) => v.id === pkg.packId || v.level === pkg.level) || pkg;
        list.push({
          ...pkg,
          instanceId: pkg.instanceId || `pkg_${pkg.packId || idx}_${pkg.activatedAt}`,
          level: matchingTier.level || pkg.level,
          daily: matchingTier.daily || pkg.daily,
          interest: matchingTier.interest || pkg.interest,
          tasks: parseInt(matchingTier.tasks) || parseInt(pkg.tasks) || 5,
          deposit: matchingTier.deposit || pkg.deposit,
          logo: getPackageLogo(matchingTier),
          isStarter: isPkgStarter
        });
      });
    }

    // 3. Backward compatibility: if currentUser.vip is set (e.g. VIP1) but activePackages not yet populated
    if (currentUser.vip && currentUser.vip !== 'VIP0' && !currentUser.vip.toLowerCase().includes('starter')) {
      const alreadyInList = list.some((p) => p.level === currentUser.vip);
      if (!alreadyInList) {
        const matchingTier = vipTiers.find((v) => v.level === currentUser.vip || v.id === currentUser.vip);
        const vipDays = parseInt(matchingTier?.days) || parseInt(currentUser.vipDurationDays) || 20;
        const activatedAt = currentUser.vipActivatedAt || (currentUser.joined ? new Date(currentUser.joined).getTime() : now);
        const expiresAt = currentUser.vipExpiresAt || (activatedAt + vipDays * 86400000);
        if (now < expiresAt) {
          list.push({
            instanceId: `legacy_vip_${currentUser.vip}`,
            packId: matchingTier?.id || '2',
            level: matchingTier?.level || currentUser.vip,
            deposit: matchingTier?.deposit || '1,000.00',
            daily: matchingTier?.daily || '90.00',
            interest: matchingTier?.interest || '18.00',
            tasks: parseInt(matchingTier?.tasks) || 5,
            days: vipDays,
            activatedAt,
            expiresAt,
            logo: getPackageLogo(matchingTier),
            isStarter: false
          });
        }
      }
    }

    return list;
  }, [currentUser, vipTiers]);

  // Active selected package
  const activePackage = userActivePackages.find((p) => p.instanceId === selectedTaskPackId) || userActivePackages[0] || null;

  // Auto-select package when list updates
  useEffect(() => {
    if (userActivePackages.length > 0) {
      if (!selectedTaskPackId || !userActivePackages.some((p) => p.instanceId === selectedTaskPackId)) {
        setSelectedTaskPackId(userActivePackages[0].instanceId);
      }
    } else {
      setSelectedTaskPackId(null);
    }
  }, [userActivePackages, selectedTaskPackId]);

  // Rolling 24-hour task reset cycle from exact purchase/claim timestamp
  const getPack24hCycle = (pkg) => {
    if (!currentUser || !pkg) return { cycle: 0, countdown: '24h 00m 00s', key: 'default', daysLeft: 0 };
    const uid = currentUser.id || currentUser.email || currentUser.phone || 'guest';
    const baseTime = pkg.activatedAt || (currentUser.joined ? new Date(currentUser.joined).getTime() : Date.now());
    const cycleMs = 86400000; // Exact 24 hours
    const elapsed = Math.max(0, Date.now() - baseTime);
    const cycle = Math.floor(elapsed / cycleMs);
    const nextReset = baseTime + (cycle + 1) * cycleMs;
    const diffMs = Math.max(0, nextReset - Date.now());

    const h = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');

    const pkgKeyId = pkg.instanceId || pkg.packId || pkg.level || 'pack';
    const expiresAt = pkg.expiresAt || (baseTime + (parseInt(pkg.days) || 20) * 86400000);
    const daysLeft = Math.max(1, Math.ceil((expiresAt - Date.now()) / 86400000));

    return {
      cycle,
      countdown: `${h}h ${m}m ${s}s`,
      key: `nt_pack_tasks_${uid}_${pkgKeyId}_c${cycle}`,
      daysLeft
    };
  };

  const getCompletedIndicesForPack = (pkg) => {
    if (!currentUser || !pkg) return [];
    const info = getPack24hCycle(pkg);
    try {
      const raw = localStorage.getItem(info.key);
      if (raw) return JSON.parse(raw);
    } catch {}
    const profileSaved = currentUser.packCompletedTasks?.[info.key];
    if (Array.isArray(profileSaved)) return profileSaved;
    return [];
  };

  // Live 24h countdown clock from package purchase/claim time
  useEffect(() => {
    const updateResetCountdown = () => {
      if (activePackage) {
        const info = getPack24hCycle(activePackage);
        setTimeUntilReset(info.countdown);
      } else {
        setTimeUntilReset('');
      }
    };

    updateResetCountdown();
    const interval = setInterval(updateResetCountdown, 1000);
    return () => clearInterval(interval);
  }, [activePackage, currentUser?.starterClaimedAt, currentUser?.vipActivatedAt]);

  const handleClaimStarter = () => {
    if (!requireAuth('task', 'claim starter package')) return;
    const starterTier = vipTiers.find((v) => String(v.level || '').toLowerCase().includes('starter') || v.id === '1') || vipTiers[0];
    const starterDays = parseInt(starterTier?.days) || 7;
    const now = Date.now();
    const expiresAt = now + starterDays * 86400000;
    const tasksCount = parseInt(starterTier?.tasks) || 5;

    const starterInstance = {
      instanceId: `pkg_starter_${currentUser.id || 'usr'}_${now}`,
      packId: starterTier?.id || '1',
      level: starterTier?.level || 'Starter Package',
      deposit: starterTier?.deposit || '0.00',
      daily: starterTier?.daily || '20.00',
      interest: starterTier?.interest || '4.00',
      tasks: tasksCount,
      days: starterDays,
      activatedAt: now,
      expiresAt: expiresAt,
      logo: getPackageLogo(starterTier),
      isStarter: true
    };

    const currentActive = Array.isArray(currentUser?.activePackages) ? currentUser.activePackages : [];
    const updatedActive = currentActive.filter((p) => !String(p?.level || '').toLowerCase().includes('starter') && p?.instanceId !== 'starter_active');

    const updatedUser = {
      ...currentUser,
      starterClaimedAt: now,
      starterExpiresAt: expiresAt,
      activePackages: updatedActive,
      vip: (!currentUser?.vip || currentUser.vip === 'VIP0') ? 'Starter Package' : currentUser.vip
    };
    setCurrentUser(updatedUser);
    try { localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser)); } catch (e) {}
    const allUsers = getStoredData('users', DEFAULT_USERS);
    setStoredData('users', allUsers.map((u) => String(u.id) === String(currentUser.id) ? updatedUser : u));
    showToast(`🎉 Free Starter Package activated! You have ${tasksCount} daily tasks for ${starterDays} days (৳${starterTier?.daily || '20.00'}/day).`);
    setSelectedTaskPackId('starter_active');
  };

  const getUserTasksKey = (u) => {
    const uid = u?.id || u?.email || u?.phone || 'guest';
    return `nt_completed_tasks_${uid}_${todayDateStr}`;
  };
  const todayTasksKey = getUserTasksKey(currentUser);

  const reloadCompletedTasks = (u) => {
    if (!u) {
      setCompletedTaskIndices([]);
      return;
    }
    try {
      const allRecords = getStoredData('task_records', []);
      const userTaskIdxs = allRecords
        .filter((t) => t && (
          (u.id && String(t.userId) === String(u.id)) ||
          (u.email && String(t.user || '').toLowerCase() === String(u.email).toLowerCase()) ||
          (u.phone && String(t.user || '') === String(u.phone))
        ) && (t.date && String(t.date).startsWith(todayDateStr)))
        .map((t) => typeof t.taskIndex === 'number' ? t.taskIndex : (parseInt(t.taskIndex) || 0));

      const profileTasks = (u.completedTasks && Array.isArray(u.completedTasks[todayDateStr]))
        ? u.completedTasks[todayDateStr]
        : [];

      let localTasks = [];
      try {
        const raw = localStorage.getItem(getUserTasksKey(u));
        if (raw) localTasks = JSON.parse(raw);
      } catch {}

      const merged = Array.from(new Set([...userTaskIdxs, ...profileTasks, ...localTasks]));
      setCompletedTaskIndices(merged);
    } catch {
      setCompletedTaskIndices([]);
    }
  };

  const [completedTaskIndices, setCompletedTaskIndices] = useState(() => {
    try {
      const raw = localStorage.getItem(todayTasksKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Ensure completed tasks reload whenever currentUser changes or date rolls over
  useEffect(() => {
    reloadCompletedTasks(currentUser);
  }, [currentUser?.id, currentUser?.email, currentUser?.phone, currentUser?.completedTasks, todayDateStr]);

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
    showToast('All notifications marked as read');
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    setSelectedNotificationDetail(notif);
  };

  // Modals & Popups
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeStep, setRechargeStep] = useState(1); // 1 = Amount Selection & Pay Now | 2 = Checkout with Gateways & TrxID
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationCountdown, setVerificationCountdown] = useState(12);
  const [verificationStage, setVerificationStage] = useState('scanning'); // 'scanning' | 'success' | 'queued'
  const [verificationDetails, setVerificationDetails] = useState({ amount: 0, method: '', trxId: '', targetVip: '' });
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpgradeLogModal, setShowUpgradeLogModal] = useState(false);
  const [upgradeLogTab, setUpgradeLogTab] = useState('all');
  const [showCompanyProfileModal, setShowCompanyProfileModal] = useState(false);
  const [showLicenseZoomModal, setShowLicenseZoomModal] = useState(false);
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

  const handleShareSocial = (platform, inviteCode) => {
    const code = inviteCode || userInviteCode;
    const shareUrl = `https://nexttask.online/#/register?i=${code}`;
    const shareText = `Join NextTask to earn daily USDT profits! Use my referral invitation code: ${code}`;
    const encUrl = encodeURIComponent(shareUrl);
    const encText = encodeURIComponent(shareText);

    switch (platform) {
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${encText}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encUrl}&text=${encText}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'instagram':
        copyToClipboard(shareUrl, 'Referral link');
        window.open('https://www.instagram.com/', '_blank');
        break;
      case 'tiktok':
        copyToClipboard(shareUrl, 'Referral link');
        window.open('https://www.tiktok.com/', '_blank');
        break;
      case 'kwai':
      default:
        if (navigator.share) {
          navigator.share({ title: 'NextTask', text: shareText, url: shareUrl }).catch(() => {});
        } else {
          copyToClipboard(shareUrl, 'Referral link');
        }
        break;
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied!`);
  };

  const navigateToTab = (tabId, mode = null, replace = false) => {
    let targetPath = '/';
    if (tabId === 'task') targetPath = '/task';
    else if (tabId === 'team') targetPath = '/team';
    else if (tabId === 'vip') targetPath = '/vip';
    else if (tabId === 'me') targetPath = '/me';
    else if (tabId === 'home') targetPath = '/';
    else if (tabId === 'auth') {
      const activeMode = mode || authMode;
      const inviteCode = regInviteCode || getInviteCodeFromUrl();
      if (activeMode === 'register' && inviteCode) {
        targetPath = `/register?i=${encodeURIComponent(inviteCode)}`;
      } else {
        targetPath = activeMode === 'register' ? '/register' : '/login';
      }
    }

    try {
      const currentFull = (window.location.pathname || '') + (window.location.search || '');
      if (currentFull !== targetPath) {
        if (replace) {
          window.history.replaceState({ tab: tabId, authMode: mode || authMode }, '', targetPath);
        } else {
          window.history.pushState({ tab: tabId, authMode: mode || authMode }, '', targetPath);
        }
      }
    } catch (err) {
      console.warn('Navigation state error:', err);
    }

    setActiveTab(tabId);
    if (mode) setAuthMode(mode);
  };

  const requireAuth = (targetTab, actionDesc) => {
    if (!isLoggedIn) {
      setIntendedTab(targetTab);
      navigateToTab('auth', 'login');
      showToast(actionDesc ? `Please sign in to ${actionDesc}` : 'Please sign in or register');
      return false;
    }
    return true;
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'home') {
      navigateToTab('home');
      return;
    }
    if (!isLoggedIn) {
      setIntendedTab(tabId);
      navigateToTab('auth', 'login');
      showToast(`Please sign in or register to open ${tabId.toUpperCase()}`);
      return;
    }
    navigateToTab(tabId);
  };

  // User referral sync (VIP tiers are only unlocked by purchasing packages)
  useEffect(() => {
    if (!currentUser) return;
    const allUsers = getStoredData('users', DEFAULT_USERS);
    const myCode = String(currentUser.myInviteCode || currentUser.inviteCode || '');
    const myId = String(currentUser.id || '');
    if (!myCode && !myId) return;

    // Reset any non-admin user who got corrupted with VIP1 without purchase to VIP0
    if (currentUser.email !== 'admin@nexttask.online' && (!currentUser.recharge || currentUser.recharge === 0) && currentUser.vip === 'VIP1') {
      const fixed = { ...currentUser, vip: 'VIP0' };
      setCurrentUser(fixed);
      setUserVip('VIP0');
      try {
        localStorage.setItem('nt_currentUser', JSON.stringify(fixed));
      } catch (e) {}
      const updatedList = allUsers.map(u => u.id === currentUser.id ? { ...u, vip: 'VIP0' } : u);
      setStoredData('users', updatedList);
    }
  }, [activeTab, currentUser]);

  const handleOpenPersonalProfile = () => {
    if (!currentUser) return;
    setProfileName(currentUser.name || '');
    setProfilePhone(currentUser.phone || '');
    setProfileDob(currentUser.dob || '');
    setShowPersonalProfileModal(true);
  };

  const getUserAccountsList = (user) => {
    if (!user) return [];
    const list = Array.isArray(user.savedAccounts) ? [...user.savedAccounts] : [];
    if (list.length === 0 && user.withdrawalAccounts) {
      const wa = user.withdrawalAccounts;
      if (wa.bkash?.trim()) list.push({ id: 'acc_bkash', type: 'bKash', number: wa.bkash.trim(), holder: wa.bankHolder || user.name || 'User' });
      if (wa.nagad?.trim()) list.push({ id: 'acc_nagad', type: 'Nagad', number: wa.nagad.trim(), holder: wa.bankHolder || user.name || 'User' });
      if (wa.rocket?.trim()) list.push({ id: 'acc_rocket', type: 'Rocket', number: wa.rocket.trim(), holder: wa.bankHolder || user.name || 'User' });
      if (wa.bankAccount?.trim()) list.push({ id: 'acc_bank', type: 'Bank Transfer', number: wa.bankAccount.trim(), bankName: wa.bankName || '', holder: wa.bankHolder || user.name || 'User' });
      if (wa.trc20?.trim()) list.push({ id: 'acc_trc20', type: 'USDT (TRC20)', number: wa.trc20.trim(), holder: user.name || 'User' });
    }
    return list;
  };

  const handleOpenWithdrawAccounts = () => {
    if (!currentUser) return;
    setShowAddAccountForm(false);
    setShowWithdrawAccountsModal(true);
  };

  const handleSaveNewAccount = (e) => {
    e?.preventDefault();
    if (!currentUser) return;
    if (!newAccNumber.trim()) {
      showToast('Please enter account number');
      return;
    }
    if (!newAccHolder.trim()) {
      showToast('Please enter account holder name');
      return;
    }

    const currentList = getUserAccountsList(currentUser);
    const newAcc = {
      id: `acc_${Date.now()}`,
      type: newAccType,
      number: newAccNumber.trim(),
      holder: newAccHolder.trim(),
      bankName: newAccType === 'Bank Transfer' ? newAccBankName.trim() : '',
      date: new Date().toISOString().slice(0, 10)
    };

    const updatedList = [...currentList, newAcc];
    const legacyWa = { ...(currentUser.withdrawalAccounts || {}) };
    if (newAccType === 'bKash') legacyWa.bkash = newAcc.number;
    if (newAccType === 'Nagad') legacyWa.nagad = newAcc.number;
    if (newAccType === 'Rocket') legacyWa.rocket = newAcc.number;
    if (newAccType === 'USDT (TRC20)') legacyWa.trc20 = newAcc.number;
    if (newAccType === 'Bank Transfer') {
      legacyWa.bankAccount = newAcc.number;
      legacyWa.bankName = newAcc.bankName;
      legacyWa.bankHolder = newAcc.holder;
    }

    const updatedUser = {
      ...currentUser,
      savedAccounts: updatedList,
      withdrawalAccounts: legacyWa
    };

    setCurrentUser(updatedUser);
    setSelectedWithdrawAccountId(newAcc.id);
    setWithdrawMethod(newAcc.type);
    setWithdrawAccountInput(newAcc.number);
    try { localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser)); } catch (err) {}
    const allUsers = getStoredData('users', DEFAULT_USERS);
    const updatedUsers = allUsers.map((u) => String(u.id) === String(currentUser.id) ? updatedUser : u);
    setStoredData('users', updatedUsers);

    setShowAddAccountForm(false);
    setNewAccNumber('');
    setNewAccHolder('');
    setNewAccBankName('');
    showToast(`${newAccType} account added successfully!`);
  };

  const handleDeleteSavedAccount = (accId) => {
    if (!currentUser) return;
    const currentList = getUserAccountsList(currentUser);
    const updatedList = currentList.filter((a) => a.id !== accId);
    const updatedUser = {
      ...currentUser,
      savedAccounts: updatedList
    };
    setCurrentUser(updatedUser);
    try { localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser)); } catch (err) {}
    const allUsers = getStoredData('users', DEFAULT_USERS);
    const updatedUsers = allUsers.map((u) => String(u.id) === String(currentUser.id) ? updatedUser : u);
    setStoredData('users', updatedUsers);
    showToast('Account removed');
  };

  const handleOpenProfileModal = (tab = 'personal') => {
    if (tab === 'withdraw') {
      handleOpenWithdrawAccounts();
    } else {
      handleOpenPersonalProfile();
    }
  };

  const handleSavePersonalProfile = (e) => {
    e?.preventDefault();
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      name: profileName.trim() || currentUser.name || 'User',
      phone: profilePhone.trim() || currentUser.phone || '',
      dob: profileDob.trim()
    };
    setCurrentUser(updatedUser);
    setUserPhone(updatedUser.phone);
    try { localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser)); } catch (err) {}
    const allUsers = getStoredData('users', DEFAULT_USERS);
    const updatedUsers = allUsers.map((u) => String(u.id) === String(currentUser.id) ? updatedUser : u);
    setStoredData('users', updatedUsers);
    showToast('Personal profile saved successfully!');
    setShowPersonalProfileModal(false);
  };

  const handleSaveWithdrawAccounts = (e) => {
    e?.preventDefault();
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      withdrawalAccounts: {
        ...(currentUser.withdrawalAccounts || {}),
        bkash: profileBkash.trim(),
        nagad: profileNagad.trim(),
        rocket: profileRocket.trim(),
        trc20: profileTrc20.trim(),
        bankName: profileBankName.trim(),
        bankAccount: profileBankAccount.trim(),
        bankHolder: profileBankHolder.trim()
      }
    };
    setCurrentUser(updatedUser);
    try { localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser)); } catch (err) {}
    const allUsers = getStoredData('users', DEFAULT_USERS);
    const updatedUsers = allUsers.map((u) => String(u.id) === String(currentUser.id) ? updatedUser : u);
    setStoredData('users', updatedUsers);
    showToast('Withdrawal accounts saved successfully!');
    setShowWithdrawAccountsModal(false);
  };

  const handleSaveProfile = () => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      name: profileName.trim() || currentUser.name || 'User',
      phone: profilePhone.trim() || currentUser.phone || '',
      dob: profileDob.trim(),
      withdrawalAccounts: {
        bkash: profileBkash.trim(),
        nagad: profileNagad.trim(),
        rocket: profileRocket.trim(),
        trc20: profileTrc20.trim(),
        bankName: profileBankName.trim(),
        bankAccount: profileBankAccount.trim(),
        bankHolder: profileBankHolder.trim(),
      }
    };
    setCurrentUser(updatedUser);
    setUserPhone(updatedUser.phone);
    try {
      localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
    const allUsers = getStoredData('users', DEFAULT_USERS);
    const updatedUsers = allUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    setStoredData('users', updatedUsers);
    setShowProfileModal(false);
    showToast('Profile & Withdrawal accounts saved!');
  };

  // Withdraw Handler
  const handleWithdrawSubmit = (e) => {
    e?.preventDefault();
    if (!requireAuth('me', 'withdraw')) return;

    const num = parseFloat(withdrawAmount);
    if (!num || num <= 0) {
      showToast('Please enter a valid withdrawal amount');
      return;
    }
    if (num > balance) {
      showToast('Insufficient withdrawable task earnings! VIP recharge is locked.');
      return;
    }
    const minWth = typeof settings?.minWithdrawal === 'number' && settings.minWithdrawal > 0
      ? settings.minWithdrawal
      : (parseFloat(settings?.minWithdrawal) || 500);
    if (num < minWth) {
      showToast(`Minimum withdrawal is ৳${minWth.toFixed(2)}`);
      return;
    }

    // Determine target account number / address
    const savedAcc = currentUser?.withdrawalAccounts?.[withdrawMethod.toLowerCase()] ||
                     (withdrawMethod === 'Bank Transfer' ? currentUser?.withdrawalAccounts?.bankAccount : '') ||
                     (withdrawMethod === 'USDT (TRC20)' ? currentUser?.withdrawalAccounts?.trc20 : '');
    const finalAccount = (withdrawAccountInput || savedAcc || '').trim();

    if (!finalAccount) {
      showToast(`Please enter your ${withdrawMethod} account number/address`);
      return;
    }

    // Auto-save account to profile if it wasn't saved yet
    let updatedUser = { ...currentUser };
    const fieldMap = {
      'bKash': 'bkash',
      'Nagad': 'nagad',
      'Rocket': 'rocket',
      'USDT (TRC20)': 'trc20',
      'Bank Transfer': 'bankAccount'
    };
    const accKey = fieldMap[withdrawMethod] || 'bkash';
    if (!savedAcc) {
      updatedUser = {
        ...currentUser,
        withdrawalAccounts: {
          ...(currentUser.withdrawalAccounts || {}),
          [accKey]: finalAccount
        }
      };
      setCurrentUser(updatedUser);
    }

    // Deduct balance
    const newBal = parseFloat((balance - num).toFixed(2));
    setBalance(newBal);
    updatedUser.balance = newBal;
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
    const allUsers = getStoredData('users', DEFAULT_USERS);
    setStoredData('users', allUsers.map(u => u.id === currentUser.id ? { ...u, balance: newBal } : u));

    // Save real withdrawal record
    const currentWithdrawals = getStoredData('withdrawals', DEFAULT_WITHDRAWALS);
    const newWth = {
      id: `WTH-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser?.id,
      user: currentUser?.name || currentUser?.email || currentUser?.phone || 'User',
      userEmail: currentUser?.email || '',
      userPhone: currentUser?.phone || '',
      amount: num,
      method: withdrawMethod,
      account: finalAccount,
      address: finalAccount,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'pending'
    };
    setStoredData('withdrawals', [newWth, ...currentWithdrawals]);

    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawAccountInput('');
    showToast(`Withdrawal of ৳${num.toFixed(2)} submitted successfully!`);
  };

  // Complete Task Handler (Runs one task at a time with verification countdown)
  const handleCompleteTask = (taskIndex, reward, targetPkg = activePackage) => {
    if (!requireAuth('task', 'complete task')) return;
    if (taskProcessingIdx !== null) return;
    if (!targetPkg) return;

    const currentCompleted = getCompletedIndicesForPack(targetPkg);
    if (currentCompleted.includes(taskIndex)) return;

    setTaskProcessingIdx(taskIndex);
    const durationSec = 3; // 3-second sleek verification
    setTaskCountdown(durationSec);

    let remaining = durationSec;
    if (taskTimerRef.current) clearInterval(taskTimerRef.current);
    taskTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setTaskCountdown(remaining);
      } else {
        clearInterval(taskTimerRef.current);
        taskTimerRef.current = null;
        setTaskCountdown(0);

        const packInfo = getPack24hCycle(targetPkg);
        const updatedIndices = [...currentCompleted, taskIndex];

        try {
          localStorage.setItem(packInfo.key, JSON.stringify(updatedIndices));
          localStorage.setItem(todayTasksKey, JSON.stringify(updatedIndices));
        } catch (e) {}

        setCompletedTaskIndices(updatedIndices);

        // Add balance and update user with task history
        setBalance((prevBal) => {
          const newBal = parseFloat((prevBal + reward).toFixed(2));
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              balance: newBal,
              packCompletedTasks: {
                ...(currentUser.packCompletedTasks || {}),
                [packInfo.key]: updatedIndices
              }
            };
            setCurrentUser(updatedUser);
            try {
              localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser));
            } catch (e) {
              console.error(e);
            }
            const allUsers = getStoredData('users', DEFAULT_USERS);
            setStoredData('users', allUsers.map((u) => (
              (u.id && String(u.id) === String(currentUser.id)) ||
              (u.email && String(u.email).toLowerCase() === String(currentUser.email).toLowerCase())
            ) ? updatedUser : u));
          }
          return newBal;
        });

        // Add to Financial Record (Task Earnings)
        try {
          const now = new Date();
          const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
          const currentMissionName = `${targetPkg.level || 'VIP'} Mission #${taskIndex + 1}`;

          const newTaskRecord = {
            id: `TSK-${Date.now()}-${taskIndex + 1}`,
            userId: currentUser?.id,
            user: currentUser?.email || currentUser?.phone || currentUser?.name || `User-${currentUser?.id}`,
            missionNo: taskIndex + 1,
            taskIndex: taskIndex,
            taskName: currentMissionName,
            vipLevel: targetPkg.level || 'VIP',
            amount: parseFloat(reward.toFixed(2)),
            status: 'completed',
            date: formattedDate,
            timestamp: Date.now()
          };

          const currentTaskRecords = getStoredData('task_records', DEFAULT_TASK_RECORDS);
          setStoredData('task_records', [newTaskRecord, ...currentTaskRecords]);
        } catch (err) {
          console.error('Error saving task financial record:', err);
        }

        setTaskProcessingIdx(null);
        showToast(`🎉 Mission #${taskIndex + 1} completed! +৳${reward.toFixed(2)} added.`);
      }
    }, 1000);
  };

  const handleChangePasswordSubmit = (e) => {
    e?.preventDefault();
    setChangePassError('');

    if (!currentUser) {
      showToast('Please sign in first');
      return;
    }

    if (!oldPasswordInput) {
      setChangePassError('Please enter your old password');
      return;
    }

    if (oldPasswordInput !== currentUser.password) {
      setChangePassError('Current password is incorrect');
      return;
    }

    if (!newPasswordInput || newPasswordInput.trim().length < 6) {
      setChangePassError('New password must be at least 6 characters long');
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setChangePassError('New passwords do not match');
      return;
    }

    const updatedUser = {
      ...currentUser,
      password: newPasswordInput.trim()
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('nt_currentUser', JSON.stringify(updatedUser));
    } catch (err) {
      console.error(err);
    }

    const allUsers = getStoredData('users', DEFAULT_USERS);
    const updatedUsers = allUsers.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setStoredData('users', updatedUsers);

    setShowPasswordModal(false);
    setOldPasswordInput('');
    setNewPasswordInput('');
    setConfirmNewPasswordInput('');
    setChangePassError('');
    showToast('Password changed successfully!');
  };

  // Helper to match user flexibly by email, username, phone, UID, or invitation code
  const matchAccount = (u, id) => {
    if (!id || !u) return false;
    const cleanId = String(id).trim().toLowerCase();
    if (!cleanId) return false;

    // 1. Email match (case-insensitive & trimmed)
    if (u.email && u.email.trim().toLowerCase() === cleanId) return true;

    // 2. Name / Username match (case-insensitive & trimmed)
    if (u.name && u.name.trim().toLowerCase() === cleanId) return true;

    // 3. Match UID
    if (u.id && String(u.id).trim().toLowerCase() === cleanId) return true;

    // 4. Match Invitation Code (e.g. NT1001, NT1002)
    const code1 = String(u.myInviteCode || '').trim().toLowerCase();
    const code2 = String(u.inviteCode || '').trim().toLowerCase();
    if (code1 && code1 === cleanId) return true;
    if (code2 && code2 === cleanId) return true;

    // 5. Match Phone number flexibly
    const idDigits = cleanId.replace(/\D/g, '');
    const userPhoneDigits = String(u.phone || '').replace(/\D/g, '');
    if (idDigits.length >= 6 && userPhoneDigits.length >= 6) {
      if (idDigits === userPhoneDigits) return true;
      if (idDigits.endsWith(userPhoneDigits) || userPhoneDigits.endsWith(idDigits)) return true;
      const last10Input = idDigits.slice(-10);
      const last10User = userPhoneDigits.slice(-10);
      if (last10Input.length >= 8 && last10Input === last10User) return true;
    }
    if (u.phone && u.phone.trim().toLowerCase() === cleanId) return true;

    return false;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const rawInput = (accountInput || userEmail || userPhone || '').trim();
      const inputPass = (password || '').trim();

      if (!rawInput) {
        const err = loginMethod === 'email' ? 'Please enter your email or username' : 'Please enter your phone number';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }
      if (!inputPass) {
        const err = 'Please enter password';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }

      // 1. Secure Server-Side Login via Cloudflare Worker API
      try {
        const authRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account: rawInput, password: inputPass })
        });
        const authJson = await authRes.json();
        if (authJson && authJson.success && authJson.user) {
          const loggedUser = authJson.user;
          if (authJson.adminToken) {
            localStorage.setItem('nt_admin_token', authJson.adminToken);
            sessionStorage.setItem('nt_admin_token', authJson.adminToken);
          }
          try {
            localStorage.setItem('nt_currentUser', JSON.stringify(loggedUser));
          } catch (e) {
            console.error(e);
          }
          setCurrentUser(loggedUser);
          setUserVip(loggedUser.vip || 'VIP0');
          setBalance(typeof loggedUser.balance === 'number' ? loggedUser.balance : 0);
          setRechargeTotal(typeof loggedUser.recharge === 'number' ? loggedUser.recharge : 0);
          setUserEmail(loggedUser.email || '');
          setUserPhone(loggedUser.phone || '');
          setIsLoggedIn(true);
          fetchCloudDataNow();
          reloadCompletedTasks(loggedUser);
          navigateToTab('me');
          setIntendedTab('me');
          showToast(authJson.isAdmin ? 'Welcome back, Master Admin!' : 'Login successful!');
          return;
        } else if (authJson && authJson.error) {
          setAuthError(authJson.error);
          setAuthModalMsg(authJson.error);
          showToast(authJson.error);
          return;
        }
      } catch {
        // Fall back to local check if offline
      }

      // Master Admin Login Support
      if (rawInput.toLowerCase() === 'admin@nexttask.online' || rawInput.toLowerCase() === 'admin') {
        if (inputPass === 'Admin@NextTask' || password === 'Admin@NextTask') {
          const adminUser = {
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
          };
          try {
            localStorage.setItem('nt_currentUser', JSON.stringify(adminUser));
          } catch (e) {
            console.error(e);
          }
          setCurrentUser(adminUser);
          setUserVip('VIP10');
          setBalance(0.00);
          setRechargeTotal(0.00);
          setUserEmail('admin@nexttask.online');
          setUserPhone('');
          setIsLoggedIn(true);
          navigateToTab('me');
          setIntendedTab('me');
          showToast('Welcome back, Master Admin!');
          return;
        } else {
          const err = 'Wrong user name or password';
          setAuthError(err);
          setAuthModalMsg(err);
          showToast(err);
          return;
        }
      }

      const isPhonePattern = /^[+]?[\d\s-]{6,}$/.test(rawInput) && !rawInput.includes('@');
      const fullPhone = isPhonePattern
        ? (rawInput.startsWith('+') ? rawInput : `${selectedCountry?.dial || '+880'}${rawInput.replace(/^0+/, '')}`)
        : (loginMethod === 'phone' && !rawInput.includes('@')
            ? (rawInput.startsWith('+') ? rawInput : `${selectedCountry?.dial || '+880'}${rawInput.replace(/^0+/, '')}`)
            : '');

      const allUsers = getStoredData('users', DEFAULT_USERS);

      // Find user matching by email, username, phone, or id
      let matched = allUsers.find((u) => 
        matchAccount(u, rawInput) ||
        (fullPhone && matchAccount(u, fullPhone)) ||
        (u.email && u.email.trim().toLowerCase() === rawInput.toLowerCase()) ||
        (u.name && u.name.trim().toLowerCase() === rawInput.toLowerCase()) ||
        (u.phone && u.phone.trim() === rawInput)
      );

      // Password comparison: check trimmed or exact
      const storedPass = String(matched?.password || '').trim();
      const isPassValid = matched && storedPass && (storedPass === inputPass || matched.password === password);

      if (!matched || !isPassValid) {
        const err = 'Wrong user name or password';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }

      if (matched.status === 'banned') {
        const err = 'This account has been suspended. Please contact support.';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }

      try {
        localStorage.setItem('nt_currentUser', JSON.stringify(matched));
      } catch (e) {
        console.error(e);
      }

      setCurrentUser(matched);
      setUserVip(matched.vip || 'VIP0');
      setBalance(typeof matched.balance === 'number' ? matched.balance : 0);
      setRechargeTotal(typeof matched.recharge === 'number' ? matched.recharge : 0);
      setUserEmail(matched.email || (loginMethod === 'email' ? rawInput : ''));
      setUserPhone(matched.phone || (loginMethod === 'phone' ? fullPhone : ''));
      setIsLoggedIn(true);
      setAuthSuccess('Signed in successfully! Loading profile...');
      setAuthError('');
      setAuthModalMsg('');

      // Background audit recording for fraud prevention & location tracking
      recordUserLoginAudit(matched);

      const targetTab = intendedTab && intendedTab !== 'auth' ? intendedTab : 'me';
      navigateToTab(targetTab);
      setIntendedTab(targetTab);
      showToast(`Welcome back, ${matched.name || matched.email || matched.phone || 'User'}!`);
    } catch (err) {
      console.error('Login error:', err);
      showToast('Login error: ' + (err?.message || err));
    }
  };

  const handleRegister = (e) => {
    e?.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const rawInput = (accountInput || userEmail || userPhone || '').trim();
      if (!rawInput) {
        const err = loginMethod === 'email' ? 'Please enter email' : 'Please enter phone number';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }
      if (!password) {
        const err = 'Please enter password';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }
      if (password.trim().length < 6) {
        const err = 'Password must be at least 6 characters long';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }
      if (reenterPassword && password.trim() !== reenterPassword.trim()) {
        const err = 'Passwords do not match';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }

      const isPhonePattern = /^[+]?[\d\s-]{6,}$/.test(rawInput) && !rawInput.includes('@');
      const fullPhone = (loginMethod === 'phone' || isPhonePattern)
        ? (rawInput.startsWith('+') ? rawInput : `${selectedCountry?.dial || '+880'}${rawInput.replace(/^0+/, '')}`)
        : '';
      const idToMatch = fullPhone || rawInput;

      const allUsers = getStoredData('users', DEFAULT_USERS);
      let matched = allUsers.find((u) => matchAccount(u, idToMatch) || matchAccount(u, rawInput));

      if (matched) {
        const err = 'This account is already registered. Please sign in.';
        setAuthError(err);
        setAuthModalMsg(err);
        showToast(err);
        return;
      }

      // Generate unique NTxxxx serial invite code for this new user
      const uniqueInviteCode = generateUniqueInviteCode(allUsers);

      // Create fresh user account
      const isMail = rawInput.includes('@') || loginMethod === 'email';
      const effectiveReferrer = (
        regInviteCode ||
        getInviteCodeFromUrl() ||
        (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('nt_referral_code') : '') ||
        (typeof localStorage !== 'undefined' ? localStorage.getItem('nt_referral_code') : '') ||
        ''
      ).trim().toUpperCase();

      const userToSave = {
        id: String(Date.now()),
        name: (fullName || '').trim() || (isMail ? rawInput.split('@')[0] : 'User'),
        email: isMail ? rawInput.toLowerCase() : `${rawInput.replace(/\D/g, '')}@phone.user`,
        phone: !isMail ? fullPhone : '',
        dob: '',
        password: (password || '').trim(),
        vip: 'VIP0',
        balance: 0.00,
        recharge: 0.00,
        status: 'active',
        joined: new Date().toISOString().slice(0, 10),
        inviteCode: uniqueInviteCode,
        myInviteCode: uniqueInviteCode,
        referredBy: effectiveReferrer,
        withdrawalAccounts: {
          bkash: '',
          nagad: '',
          rocket: '',
          trc20: '',
          bankName: '',
          bankAccount: '',
          bankHolder: ''
        }
      };
      const updated = [userToSave, ...allUsers];
      setStoredData('users', updated);

      try {
        localStorage.setItem('nt_currentUser', JSON.stringify(userToSave));
      } catch (e) {
        console.error(e);
      }

      // Clear register / referral hash from URL bar
      try {
        if (window.location.hash.includes('register') || window.location.hash.includes('signup')) {
          window.history.replaceState(null, '', window.location.pathname || '/');
        }
      } catch (e) {
        console.error(e);
      }

      setCurrentUser(userToSave);
      setUserVip(userToSave.vip || 'VIP0');
      setBalance(typeof userToSave.balance === 'number' ? userToSave.balance : 0);
      setRechargeTotal(typeof userToSave.recharge === 'number' ? userToSave.recharge : 0);
      setUserEmail(userToSave.email || (loginMethod === 'email' ? rawInput : ''));
      setUserPhone(userToSave.phone || fullPhone || '');
      setIsLoggedIn(true);
      setAuthSuccess('Account created successfully! Welcome to NextTask.');
      setAuthError('');
      setAuthModalMsg('');

      // Background audit recording for fraud prevention & location tracking
      recordUserLoginAudit(userToSave);

      const targetTab = intendedTab && intendedTab !== 'auth' ? intendedTab : 'me';
      navigateToTab(targetTab);
      setIntendedTab(targetTab);
      showToast(`Account ready! Welcome, ${userToSave.name || userToSave.email || userToSave.phone || 'User'}`);
    } catch (err) {
      console.error('Register error:', err);
      showToast('Register error: ' + (err?.message || err));
    }
  };

  const handleOpenTelegramForgot = (e) => {
    e?.preventDefault();
    const rawBot = (settings?.telegramBotUsername || '@NextTask_SupportBot').replace(/^@/, '').trim();
    const tgUrl = `https://t.me/${rawBot}?start=forgot_password`;
    window.open(tgUrl, '_blank');
    setAuthMode('forgot');
    showToast('Connecting to 24/7 Telegram Support for identity verification & password reset...');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('nt_currentUser');
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    navigateToTab('home');
    setIntendedTab('home');
    setAccountInput('');
    setUserEmail('');
    setUserPhone('');
    setFullName('');
    setPassword('');
    setReenterPassword('');
    setRegInviteCode('');
    setAuthModalMsg('');
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
    const isFreePackage = reqDeposit === 0 || String(selectedVipForUnlock.level || '').toLowerCase().includes('starter');
    const emailOrPhone = loginMethod === 'email' ? userEmail : userPhone;

    // Free Starter package OR user has enough balance in account
    if (isFreePackage || (balance >= reqDeposit && reqDeposit > 0)) {
      if (isFreePackage) {
        handleClaimStarter();
        return;
      }

      const depositDeduction = reqDeposit;
      const newBalance = parseFloat((balance - depositDeduction).toFixed(2));
      const newRecharge = parseFloat(((currentUser?.recharge || rechargeTotal || 0) + depositDeduction).toFixed(2));
      const durationDays = selectedVipForUnlock.days ? parseInt(selectedVipForUnlock.days) : 20;
      const now = Date.now();
      const expiresAt = now + durationDays * 86400000;
      const tasksCount = parseInt(selectedVipForUnlock.tasks) || 5;

      const newPackageInstance = {
        instanceId: `pkg_${selectedVipForUnlock.id || Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        packId: selectedVipForUnlock.id,
        level: selectedVipForUnlock.level,
        deposit: selectedVipForUnlock.deposit,
        daily: selectedVipForUnlock.daily,
        interest: selectedVipForUnlock.interest || (parseFloat(selectedVipForUnlock.daily) / tasksCount).toFixed(2),
        tasks: tasksCount,
        days: durationDays,
        activatedAt: now,
        expiresAt: expiresAt,
        logo: selectedVipForUnlock.logo || '',
        isStarter: false
      };

      const currentActiveList = Array.isArray(currentUser?.activePackages) ? currentUser.activePackages : [];
      const updatedActivePackages = [
        ...currentActiveList.filter((p) => p && p.expiresAt && Date.now() < p.expiresAt),
        newPackageInstance
      ];

      const updatedUserObj = {
        ...currentUser,
        vip: selectedVipForUnlock.level,
        balance: newBalance,
        recharge: newRecharge,
        vipActivatedAt: now,
        vipDurationDays: durationDays,
        vipExpiresAt: expiresAt,
        activePackages: updatedActivePackages,
        capitalReleased: false,
        starterClaimedAt: currentUser?.starterClaimedAt || null,
        starterExpiresAt: currentUser?.starterExpiresAt || null
      };
      setCurrentUser(updatedUserObj);
      try { localStorage.setItem('nt_currentUser', JSON.stringify(updatedUserObj)); } catch (e) {}

      setBalance(newBalance);
      setRechargeTotal(newRecharge);
      setUserVip(selectedVipForUnlock.level);
      setSelectedTaskPackId(newPackageInstance.instanceId);

      const allUsers = getStoredData('users', DEFAULT_USERS);
      const commRate = typeof settings?.referralCommissionRate === 'number' && settings.referralCommissionRate >= 0
        ? settings.referralCommissionRate
        : (parseFloat(settings?.referralCommissionRate) || 10);
      const commissionAmount = parseFloat((reqDeposit * (commRate / 100)).toFixed(2));
      let referrerCredited = false;
      let referrerName = '';

      const updated = allUsers.map((u) => {
        // Update the purchasing user
        if (
          (u.id && currentUser?.id && String(u.id) === String(currentUser.id)) ||
          (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
          (u.phone && u.phone === emailOrPhone)
        ) {
          return {
            ...u,
            vip: selectedVipForUnlock.level,
            balance: newBalance,
            recharge: newRecharge,
            vipActivatedAt: now,
            vipDurationDays: durationDays,
            vipExpiresAt: expiresAt,
            activePackages: updatedActivePackages,
            capitalReleased: false,
            starterClaimedAt: currentUser?.starterClaimedAt || null,
            starterExpiresAt: currentUser?.starterExpiresAt || null
          };
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
          note: `${commRate}% referral commission from ${currentUser?.name || currentUser?.id} for unlocking ${selectedVipForUnlock.level}`
        };
        setStoredData('recharges', [commissionRecord, ...allRecharges]);
      }

      // Record in Upgrade Log
      const prevLevel = currentUser?.vip || userVip || 'VIP0';
      recordUpgradeLog({
        userId: currentUser?.id,
        user: currentUser?.name || currentUser?.phone || currentUser?.email || userPhone || userEmail || 'User',
        userIdentifier: (currentUser?.phone || currentUser?.email || userPhone || userEmail || 'Member').replace(/(\d{3})\d{4,}(\d{2})/, '$1****$2'),
        fromVip: prevLevel,
        toVip: selectedVipForUnlock.level,
        amount: isFreePackage ? 0 : reqDeposit,
        type: isFreePackage ? 'Free Unlock' : (prevLevel === 'VIP0' ? 'Unlock' : 'Upgrade')
      });

      showToast(`🎉 Congratulations! You have unlocked ${selectedVipForUnlock.level}`);
      return;
    }

    // Open recharge modal prefilled with that package amount
    openRechargeModal(selectedVipForUnlock.deposit);
  };

  const openRechargeModal = (amount = null) => {
    if (!requireAuth('me', 'recharge')) return;
    const freshMethods = getStoredData('payments', DEFAULT_PAYMENT_METHODS);
    setPaymentMethods(freshMethods);
    const activeList = freshMethods.filter((p) => p && p.active !== false);
    setSelectedPaymentMethod(activeList[0] || null);
    if (amount) {
      setRechargeAmount(amount);
      setRechargeStep(2);
    } else {
      setRechargeStep(1);
    }
    setShowRechargeModal(true);
  };

  // User submits deposit form with Sender account and Transaction ID (TrxID)
  const handleSubmitRecharge = (e) => {
    e.preventDefault();
    if (!senderAccount.trim()) {
      showToast('Please enter your sender account number');
      return;
    }
    if (!transactionId.trim()) {
      showToast('Please enter Transaction ID (TrxID)');
      return;
    }

    const currentMethod = selectedPaymentMethod?.method || 'bKash';
    const isCrypto = currentMethod.toLowerCase().includes('usdt') || currentMethod.toLowerCase().includes('crypto');

    // Strict validation for mobile banking (bKash, Nagad, Rocket, etc.)
    if (!isCrypto) {
      const senderDigits = senderAccount.replace(/\D/g, '');
      if (senderDigits.length !== 11) {
        setRechargeErrorPopup({
          title: 'Invalid Sender Number',
          message: `Sender account number must be exactly 11 digits. You entered ${senderDigits.length} digits. Please check and provide a valid 11-digit mobile banking number.`
        });
        return;
      }

      const cleanTrx = transactionId.trim();
      if (cleanTrx.length < 8) {
        setRechargeErrorPopup({
          title: 'Invalid Transaction ID (TrxID)',
          message: `Transaction ID (TrxID) must be at least 8 characters. You entered ${cleanTrx.length} characters. Please check your statement and enter the correct TrxID.`
        });
        return;
      }
    }

    const numAmount = parseFloat(rechargeAmount.toString().replace(/,/g, '')) || 0;
    if (numAmount <= 0) {
      showToast('Invalid recharge amount');
      return;
    }
    const minDep = typeof settings?.minDeposit === 'number' && settings.minDeposit > 0
      ? settings.minDeposit
      : (parseFloat(settings?.minDeposit) || 500);
    if (numAmount < minDep) {
      showToast(`Minimum recharge is ৳${minDep}`);
      return;
    }

    const cleanTrxId = transactionId.trim().toUpperCase();
    const cleanSender = senderAccount.trim();
    const targetVipLevel = selectedVipForUnlock?.level || '';
    const isAutoGatewayEnabled = settings?.paymentGatewayMode === 'automated';

    // ========================================================
    // MODE 1: AUTOMATED P2P SMS GATEWAY (Active when Admin enables it)
    // ========================================================
    if (isAutoGatewayEnabled) {
      setShowRechargeModal(false);
      setIsVerifyingPayment(true);
      setVerificationCountdown(12);
      setVerificationStage('scanning');
      setVerificationDetails({
        amount: numAmount,
        method: currentMethod,
        trxId: cleanTrxId,
        targetVip: targetVipLevel
      });

      setSenderAccount('');
      setTransactionId('');

      let isFinished = false;
      const pollVerification = async () => {
        try {
          const res = await fetch('/api/verify-recharge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser?.id,
              user: currentUser?.name || currentUser?.email || currentUser?.phone || 'User',
              amount: numAmount,
              method: currentMethod,
              senderAccount: cleanSender,
              trxId: cleanTrxId,
              targetVip: targetVipLevel
            })
          });
          const data = await res.json();
          if (data.success && data.verified) {
            isFinished = true;
            setVerificationStage('success');
            setBalance((prev) => parseFloat((prev + numAmount).toFixed(2)));
            if (data.vipActivated && targetVipLevel) {
              setUserVip(targetVipLevel);
            }
            syncCurrentUserData();
            showToast(`🎉 Payment of ৳${numAmount.toFixed(2)} verified & credited instantly!`);
            setTimeout(() => {
              setIsVerifyingPayment(false);
              navigateToTab('profile');
            }, 2000);
          }
        } catch (err) {
          console.error('Verify recharge error:', err);
        }
      };

      pollVerification();

      let secondsLeft = 12;
      const interval = setInterval(async () => {
        if (isFinished) {
          clearInterval(interval);
          return;
        }
        secondsLeft -= 1;
        setVerificationCountdown(secondsLeft);

        if (secondsLeft % 2 === 0 && secondsLeft > 0) {
          await pollVerification();
        }

        if (secondsLeft <= 0) {
          clearInterval(interval);
          if (!isFinished) {
            setVerificationStage('queued');
            const currentRecharges = getStoredData('recharges', DEFAULT_RECHARGES);
            const alreadyExists = currentRecharges.some((r) => String(r.trxId || '').toUpperCase() === cleanTrxId);
            if (!alreadyExists) {
              const newRecord = {
                id: `REC-${Math.floor(100 + Math.random() * 900)}`,
                userId: currentUser?.id,
                user: currentUser?.name || currentUser?.email || currentUser?.phone || userEmail || userPhone || 'User',
                userEmail: currentUser?.email || userEmail || '',
                userPhone: currentUser?.phone || userPhone || '',
                amount: numAmount,
                network: currentMethod,
                senderNumber: cleanSender,
                txid: cleanTrxId,
                trxId: cleanTrxId,
                targetVip: targetVipLevel,
                date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                status: 'pending',
                source: 'Manual Submission (Queued)'
              };
              setStoredData('recharges', [newRecord, ...currentRecharges]);
            }
            setTimeout(() => {
              setIsVerifyingPayment(false);
              navigateToTab('profile');
              setShowRecordsModal(true);
              setRecordTab('deposit');
              showToast('Payment submitted to admin queue for review');
            }, 3000);
          }
        }
      }, 1000);
      return;
    }

    // ========================================================
    // MODE 2: ORIGINAL MANUAL GATEWAY (100% UNTOUCHED & DEFAULT)
    // ========================================================
    const currentRecharges = getStoredData('recharges', DEFAULT_RECHARGES);
    const newRecord = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser?.id,
      user: currentUser?.name || currentUser?.email || currentUser?.phone || userEmail || userPhone || 'User',
      userEmail: currentUser?.email || userEmail || '',
      userPhone: currentUser?.phone || userPhone || '',
      amount: numAmount,
      network: currentMethod,
      senderNumber: cleanSender,
      txid: cleanTrxId,
      trxId: cleanTrxId,
      targetVip: targetVipLevel,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'pending',
      source: 'Manual Submission'
    };
    const updated = [newRecord, ...currentRecharges];
    setStoredData('recharges', updated);

    setShowRechargeModal(false);
    setSenderAccount('');
    setTransactionId('');
    showToast(`Recharge of ৳${numAmount.toFixed(2)} submitted! Admin will verify soon.`);
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
          setPaymentMethods(getStoredData('payments', DEFAULT_PAYMENT_METHODS));
        }}
      />
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-slate-950 flex justify-center items-center overflow-hidden sm:p-2">
      {/* Mobile App Viewport Frame - Always fixed height with internal scrolling */}
      <div ref={appFrameRef} dir={currentLangObj.dir} className="w-full max-w-md bg-[#f4f7fb] h-full sm:h-[840px] sm:max-h-[96dvh] flex flex-col relative sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-800">

        {/* ================= INITIAL CLOUD SYNC SPLASH (NO FLICKER ON ANY DEVICE) ================= */}
        <div
          className={`absolute inset-0 z-[100] bg-gradient-to-b from-[#05132d] via-[#091b3e] to-[#040e22] flex flex-col items-center justify-center p-6 text-white select-none transition-all duration-300 ease-out ${
            isInitialSyncing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-400 p-0.5 shadow-2xl shadow-cyan-500/30">
              <div className="w-full h-full bg-[#05132d] rounded-3xl flex items-center justify-center overflow-hidden">
                <img src="/app-logo.png" alt="NextTask" className="w-12 h-12 object-contain drop-shadow" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            </div>
            <div className="absolute -inset-1 rounded-3xl bg-cyan-400/20 blur-md -z-10 animate-pulse"></div>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white mb-1">
            NextTask
          </h2>
          <p className="text-xs text-cyan-300/80 font-medium tracking-wide mb-6">
            Official Earning Platform
          </p>

          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-amber-400 animate-progress rounded-full"></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-3 font-mono">Synchronizing live data...</span>
        </div>

        {/* ================= RECHARGE ERROR POPUP (11 DIGITS & 10 TRX) ================= */}
        {rechargeErrorPopup && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[340px] p-5 shadow-2xl border border-rose-100 flex flex-col items-center text-center space-y-3.5 animate-scale-up">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  {typeof rechargeErrorPopup === 'string' ? 'Invalid Information' : rechargeErrorPopup.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-left">
                  {typeof rechargeErrorPopup === 'string' ? rechargeErrorPopup : rechargeErrorPopup.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRechargeErrorPopup('')}
                className="w-full bg-[#05132d] hover:bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Enter Correct Information
              </button>
            </div>
          </div>
        )}
        
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
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 border-b border-slate-100 bg-slate-50">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country or code"
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
                    <h3 className="text-sm font-bold text-slate-900">{t('notificationCenter')}</h3>
                    <p className="text-[10px] text-slate-500">{userNotifications.length} message(s)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Actions toolbar */}
              <div className="px-4 py-2 bg-slate-100/60 flex items-center justify-between text-xs border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-600">
                  {unreadCount > 0 ? `${unreadCount} ${t('unreadMessages')}` : t('allCaughtUp')}
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                  >
                    {t('markAllAsRead')}
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-50 max-h-[50vh]">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">{t('noMessages')}</p>
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
                            {t('viewDetails')}
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
                  {t('close')}
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
                  <X className="w-4 h-4" />
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
                {t('gotIt')}
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

              {/* White Form Card (Only Inputs) */}
              <div className="mx-4 mt-2 bg-white rounded-3xl p-5 shadow-xl space-y-3.5">
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

                {/* Name field (Sign Up only) */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-[#eef3fb] text-slate-800 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition"
                    />
                  </div>
                )}

                {/* Phone Number Field with Country Code Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
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
                </div>

                {authMode === 'forgot' ? (
                  <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 text-center space-y-2.5 my-1">
                    <div className="w-11 h-11 rounded-full bg-sky-500/15 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck className="w-6 h-6 text-sky-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Official Password Recovery</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      To protect member funds and account security, passwords can only be reset manually by our official admin team after identity verification.
                    </p>
                    <p className="text-[11px] text-sky-800 bg-white/90 p-2.5 rounded-xl border border-sky-100 font-medium">
                      Please message our 24/7 Support Desk on Telegram with your registered Account/Phone/Email. Our administrator will verify and reset your password!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Password Field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
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

                    {/* Reenter password (Register mode only) */}
                    {authMode === 'register' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showReenterPassword ? 'text' : 'password'}
                            value={reenterPassword}
                            onChange={(e) => setReenterPassword(e.target.value)}
                            placeholder="Confirm Password"
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
                  </>
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
                      onChange={(e) => setRegInviteCode(e.target.value.toUpperCase().trim())}
                      placeholder="Invitation code"
                      className="w-full bg-[#eef3fb] text-slate-800 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition font-mono tracking-wider font-bold"
                    />
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={handleOpenTelegramForgot}
                      className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
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
                      onClick={handleOpenTelegramForgot}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-full shadow-lg active:scale-[0.99] transition cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                      <span>Contact Support on Telegram</span>
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
                          {getVipDisplayName(userVip, vipTiers)}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowAnnouncement(true)}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer text-slate-200 shadow-sm"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t('announcement')}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white/5 py-2.5 px-3 rounded-2xl border border-white/10">
                        <div className="text-[11px] text-slate-300 font-medium mb-0.5">{t('totalBalance')}</div>
                        <div className="text-2xl font-black tracking-tight text-emerald-400">৳{balance.toFixed(2)}</div>
                      </div>
                      <div className="bg-white/5 py-2.5 px-3 rounded-2xl border border-white/10">
                        <div className="text-[11px] text-slate-300 font-medium mb-0.5">{t('rechargeAmount')}</div>
                        <div className="text-2xl font-black tracking-tight text-amber-300">৳{rechargeTotal.toFixed(2)}</div>
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
                        type="button"
                        onClick={() => openRechargeModal()}
                        className="flex flex-col items-center gap-1.5 p-1 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0d2146] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <Coins className="w-5 h-5 text-cyan-300" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">{t('recharge')}</span>
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
                        <span className="text-[11px] font-semibold text-slate-700">{t('withdraw')}</span>
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
                        <span className="text-[11px] font-semibold text-slate-700">{t('app')}</span>
                      </button>

                      {/* Company Profile */}
                      <button
                        onClick={() => setShowCompanyProfileModal(true)}
                        className="flex flex-col items-center gap-1.5 p-1 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0d2146] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                          <Building2 className="w-5 h-5 text-indigo-300" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 leading-tight">{t('companyProfile')}</span>
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

                  {/* Dynamic Promotional Banner Carousel (Smooth Horizontal Sliding & Touch Swipe) */}
                  {slides.length > 0 && (
                    <BannerCarousel slides={slides} lang={lang} defaultSlides={DEFAULT_SLIDES} />
                  )}

                  {/* ================= TASK HALL SECTION ================= */}
                  <div className="px-4 space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">{t('taskHall')}</h3>

                    <div className="space-y-2">
                      {vipTiers.map((vip) => {
                        const isStarter = parseFloat(String(vip.deposit).replace(/,/g, '')) === 0 || String(vip.level).toLowerCase().includes('starter');
                        return (
                          <div
                            key={vip.level}
                            onClick={() => handleUnlockVip(vip)}
                            className="bg-white rounded-xl p-2.5 shadow-2xs border border-slate-100 flex items-center gap-3 hover:shadow-xs transition cursor-pointer active:scale-[0.99]"
                          >
                            {/* Left: Official Matching Badge */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0c0d11] to-[#161822] border border-amber-500/30 flex items-center justify-center p-1 relative shadow-inner overflow-hidden shrink-0">
                              <img
                                src={getPackageLogo(vip)}
                                alt={vip.level}
                                className="w-9 h-9 object-contain rounded-lg"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>

                            {/* Right: Unlock Amount & Level */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline">
                                <div className="text-[10px] text-slate-400 font-medium leading-none">{t('unlockAmount')}</div>
                                <span className="text-[10px] font-bold text-cyan-700">
                                  +৳{vip.daily}/d
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-0.5">
                                <div className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                                  {isStarter ? (
                                    <span className="text-emerald-600 font-extrabold">Free (৳0.00)</span>
                                  ) : (
                                    <span>৳{vip.deposit}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {isStarter && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                                      FREE
                                    </span>
                                  )}
                                  <ChevronsRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </div>
                              </div>
                              <div className="text-[11px] font-bold text-slate-700 mt-0.5 truncate flex items-center justify-between">
                                <span className="truncate">{vip.level}</span>
                                <span className="text-[9px] text-slate-400 font-normal shrink-0">10 Tasks</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                <div className="px-3.5 py-3 space-y-2.5">
                  {(() => {
                    return vipTiers.map((vip) => {
                      const isStarter = parseFloat(String(vip.deposit || 0).replace(/,/g, '')) === 0 || String(vip.level || '').toLowerCase().includes('starter');
                      const activeInstances = userActivePackages.filter((p) => p.level === vip.level || p.packId === vip.id);
                      const isCurrentActive = activeInstances.length > 0;
                      const vipName = getVipDisplayName(vip.level, vipTiers);
                      const daysCount = vip.days || (isStarter ? 7 : 20);

                      return (
                        <div
                          key={vip.level || vip.id}
                          className={`rounded-2xl p-3.5 transition-all shadow-xs ${
                            isCurrentActive
                              ? 'bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 border border-emerald-300/80 ring-1 ring-emerald-500/10'
                              : 'bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            {/* Left: Package Icon + Titles */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-12 h-12 rounded-2xl bg-[#071739] p-2 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
                                <img
                                  src={getPackageLogo(vip)}
                                  alt={vipName}
                                  className="w-8 h-8 object-contain drop-shadow"
                                  loading="lazy"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-extrabold text-xs text-slate-900 truncate">
                                    {vipName}
                                  </h4>
                                  {isCurrentActive && (
                                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 shadow-xs">
                                      Active {activeInstances.length > 1 ? `(${activeInstances.length})` : ''}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-baseline gap-2 mt-0.5">
                                  <span className="text-sm font-black text-slate-900">
                                    {isStarter ? (
                                      <span className="text-emerald-600">Free</span>
                                    ) : (
                                      `৳${vip.deposit}`
                                    )}
                                  </span>
                                  <span className="text-[11px] font-bold text-emerald-600">
                                    +৳{vip.daily}<span className="text-[9px] font-normal text-slate-400">/day</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Action Button */}
                            <div className="shrink-0">
                              {isStarter ? (
                                isCurrentActive ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-full">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    Active
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUnlockVip(vip)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                                  >
                                    Claim Free
                                  </button>
                                )
                              ) : isCurrentActive ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnlockVip(vip)}
                                  className="bg-[#05132d] hover:bg-[#0b2457] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition cursor-pointer inline-flex items-center gap-1"
                                >
                                  <span>+ Upgrade</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUnlockVip(vip)}
                                  className="bg-[#05132d] hover:bg-[#0b2457] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                                >
                                  Upgrade
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Clean Minimal Specs Bar */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span>Total Return: <b className="text-slate-800 font-bold">৳{vip.total}</b></span>
                            <span className="text-slate-300">•</span>
                            <span>Missions: <b className="text-slate-800 font-bold">{vip.tasks || 5}/day</b></span>
                            <span className="text-slate-300">•</span>
                            <span>Validity: <b className="text-amber-700 font-bold">{daysCount} Days</b></span>
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
                          <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">{t('invitationCode')}</div>
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

                          <div className="text-[11px] text-slate-300 mt-3 font-medium">{t('shareReferral')}</div>
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

                          {/* Social Sharing Icons Row (Matching User Screenshot) */}
                          <div className="mt-3.5 bg-white rounded-2xl py-2 px-2.5 flex items-center justify-between gap-1 shadow-md border border-slate-100 max-w-full">
                            {/* 1. X */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('x', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-black hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share on X"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </button>

                            {/* 2. Facebook */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('facebook', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-blue-600 hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share on Facebook"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </button>

                            {/* 3. Telegram */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('telegram', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-sky-500 hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share on Telegram"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                              </svg>
                            </button>

                            {/* 4. LinkedIn */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('linkedin', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-blue-700 hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share on LinkedIn"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            </button>

                            {/* 5. WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('whatsapp', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-emerald-600 hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share on WhatsApp"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.896 2.796.896h.005c3.18 0 5.767-2.587 5.769-5.766.001-1.543-.599-2.994-1.69-4.086s-2.544-1.697-4.085-1.697zm6.757 11.233c-.328.924-1.637 1.748-2.677 1.838-.72.062-1.658.093-4.739-1.182-3.939-1.629-6.474-5.642-6.671-5.906-.197-.265-1.597-2.128-1.597-4.06 0-1.932 1.009-2.883 1.37-3.275.361-.392.788-.49 1.05-.49.262 0 .524.003.754.015.244.012.569-.092.89.678.328.786 1.117 2.73 1.216 2.927.098.197.164.428.033.689-.131.262-.197.426-.393.655-.197.23-.414.512-.591.688-.197.197-.403.41-.173.804.23.393 1.022 1.686 2.193 2.731 1.508 1.344 2.778 1.761 3.171 1.958.393.197.623.164.852-.098.23-.262.984-1.147 1.246-1.54.262-.393.524-.328.885-.197.361.131 2.296 1.082 2.689 1.279.393.197.655.295.754.459.099.164.099.951-.229 1.875z" />
                              </svg>
                            </button>

                            {/* 6. Instagram */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('instagram', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-pink-600 hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share on Instagram"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                            </button>

                            {/* 7. TikTok */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('tiktok', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-black hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share on TikTok"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.29-1.52 3.32-3.33.02-3.95.01-7.89.01-11.84.01-2.22.01-4.44.01-6.66z" />
                              </svg>
                            </button>

                            {/* 8. Video / Camera / Kwai */}
                            <button
                              type="button"
                              onClick={() => handleShareSocial('kwai', userInviteCode)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 hover:text-amber-600 hover:bg-slate-100 transition active:scale-90 cursor-pointer shrink-0"
                              title="Share via Video / More Apps"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M4 4h10a2 2 0 012 2v1l4-2.5v11L16 13v1a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm3 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                              </svg>
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
                            {getVipDisplayName(userVip, vipTiers)} ACTIVE
                          </span>
                          <span className="text-slate-300 text-[11px]">
                            {t('directReferrals')} <b className="text-white font-bold ml-1">{level1Members.length}</b>
                          </span>
                        </div>
                        {nextVip && (
                          <div className="text-[10px] text-cyan-300 font-medium">
                            {Math.max(0, nextTarget - level1Members.length)} {t('moreTo')} <span className="font-bold text-white ml-1">{nextVip}</span>
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
                const hasActivePlans = userActivePackages.length > 0;
                const currentPkg = activePackage || userActivePackages[0] || null;
                const completedIndices = currentPkg ? getCompletedIndicesForPack(currentPkg) : [];
                const maxTasks = currentPkg ? (parseInt(currentPkg.tasks) || 5) : 5;
                const dailyProfit = currentPkg ? (parseFloat(currentPkg.daily) || 20.00) : 20.00;
                const rewardPerTask = parseFloat((dailyProfit / maxTasks).toFixed(2));
                const cycleInfo = currentPkg ? getPack24hCycle(currentPkg) : { daysLeft: 7, countdown: '24h 00m 00s' };

                const totalTasks = Array.from({ length: maxTasks }, (_, i) => i);
                const runningTasks = totalTasks.filter((i) => !completedIndices.includes(i));
                const finishedTasks = totalTasks.filter((i) => completedIndices.includes(i));

                return (
                  <div className="px-3.5 py-3 space-y-3">
                    {/* Multi-Package Pill Switcher (Minimal & Clean) */}
                    {userActivePackages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                        {userActivePackages.map((pkg) => {
                          const isSelected = pkg.instanceId === currentPkg?.instanceId;
                          const pkgDone = getCompletedIndicesForPack(pkg);
                          const pkgTotal = parseInt(pkg.tasks) || 5;

                          return (
                            <button
                              key={pkg.instanceId}
                              type="button"
                              onClick={() => setSelectedTaskPackId(pkg.instanceId)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs ${
                                isSelected
                                  ? 'bg-[#05132d] text-white'
                                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                              }`}
                            >
                              <span>{pkg.level}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                isSelected ? 'bg-cyan-400/25 text-cyan-300' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {pkgDone.length}/{pkgTotal}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Active Plan Mission Header (Clean & Minimal) */}
                    {hasActivePlans && currentPkg ? (
                      <div className="bg-gradient-to-br from-[#071739] via-[#0b2457] to-[#05132d] rounded-2xl p-4 text-white shadow-md border border-cyan-500/20 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">
                              {currentPkg.level}
                            </span>
                            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30">
                              Active
                            </span>
                          </div>

                          {timeUntilReset && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>{timeUntilReset}</span>
                            </span>
                          )}
                        </div>

                        {/* 3 Crisp Stat Columns */}
                        <div className="grid grid-cols-3 gap-2 bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Daily</span>
                            <b className="text-xs font-bold text-emerald-400">+৳{currentPkg.daily}</b>
                          </div>
                          <div className="border-x border-white/10">
                            <span className="text-[10px] text-slate-400 block">Per Mission</span>
                            <b className="text-xs font-bold text-cyan-300">+৳{rewardPerTask.toFixed(2)}</b>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Validity</span>
                            <b className="text-xs font-bold text-amber-300">{cycleInfo.daysLeft}d left</b>
                          </div>
                        </div>

                        {/* Minimal Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-300">
                            <span>Today's Progress</span>
                            <span className="font-mono font-bold">{completedIndices.length} / {maxTasks}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, (completedIndices.length / maxTasks) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Free Starter Claim / VIP Unlock Card if user has 0 active packages */
                      <div className="bg-gradient-to-br from-[#071739] via-[#0b2457] to-[#05132d] rounded-2xl p-5 text-white shadow-md border border-amber-500/30 space-y-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                          <Gift className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-white">Claim 7 Days Free Starter Package!</h3>
                          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                            Earn <b className="text-amber-400">৳20.00 daily for 7 days</b> with 5 free verification missions every day. Zero recharge needed.
                          </p>
                        </div>
                        <div className="flex gap-2 pt-1 max-w-xs mx-auto">
                          <button
                            type="button"
                            onClick={handleClaimStarter}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold py-2.5 rounded-full text-xs shadow-md transition cursor-pointer"
                          >
                            🎁 Claim Free
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateToTab('vip')}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-cyan-300 font-bold py-2.5 rounded-full text-xs border border-cyan-400/30 transition cursor-pointer"
                          >
                            VIP Packages
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Segmented Control: To Do vs Completed */}
                    {hasActivePlans && (
                      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                        <button
                          type="button"
                          onClick={() => setTaskTab('running')}
                          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${taskTab === 'running' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-900'}`}
                        >
                          To Do ({runningTasks.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskTab('completed')}
                          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${taskTab === 'completed' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-900'}`}
                        >
                          Completed ({finishedTasks.length})
                        </button>
                      </div>
                    )}

                    {/* Clean Tasks List */}
                    {hasActivePlans && currentPkg && (
                      <div className="space-y-2">
                        {taskTab === 'running' ? (
                          runningTasks.length === 0 ? (
                            <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-xs space-y-2">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                              <h3 className="text-xs font-bold text-slate-900">All tasks completed today!</h3>
                              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                You finished all {maxTasks} tasks for {currentPkg.level}. Resets in <b className="text-cyan-600 font-mono">{timeUntilReset}</b>.
                              </p>
                            </div>
                          ) : (
                            runningTasks.map((taskIdx) => (
                              <div
                                key={taskIdx}
                                className="bg-white rounded-xl p-3 shadow-xs border border-slate-100/90 flex items-center justify-between gap-3 hover:shadow-sm transition"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 font-black text-xs flex items-center justify-center shrink-0">
                                    {taskIdx + 1}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-800 truncate">
                                      Verification Mission #{taskIdx + 1}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      Reward: <b className="text-emerald-600 font-bold">+৳{rewardPerTask.toFixed(2)}</b>
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  <button
                                    type="button"
                                    disabled={taskProcessingIdx !== null}
                                    onClick={() => handleCompleteTask(taskIdx, rewardPerTask, currentPkg)}
                                    className="h-8 bg-[#05132d] hover:bg-[#0b2457] text-white text-xs font-bold px-4 rounded-full shadow-xs active:scale-95 transition cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {taskProcessingIdx === taskIdx ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>{taskCountdown}s</span>
                                      </>
                                    ) : (
                                      <span>Complete</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))
                          )
                        ) : (
                          finishedTasks.length === 0 ? (
                            <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-xs text-slate-400">
                              <p className="text-xs font-medium">No completed tasks yet today.</p>
                            </div>
                          ) : (
                            finishedTasks.map((taskIdx) => (
                              <div
                                key={taskIdx}
                                className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-700 truncate">
                                      Verification Mission #{taskIdx + 1}
                                    </div>
                                    <div className="text-[10px] text-emerald-600 font-medium">
                                      Completed • Credited
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  <span className="text-xs font-black text-emerald-600">
                                    +৳{rewardPerTask.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))
                          )
                        )}

                        {/* Minimal Add Package Link */}
                        <div className="pt-1 text-center">
                          <button
                            type="button"
                            onClick={() => navigateToTab('vip')}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer py-1"
                          >
                            + Upgrade to VIP Package
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ================= TAB 5: ME ================= */}
              {activeTab === 'me' && (
                <div className="px-4 -mt-3 space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => openRechargeModal()}
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
                      onClick={handleOpenPersonalProfile}
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
                      onClick={handleOpenWithdrawAccounts}
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
            { id: 'home', label: t('home'), icon: Home },
            { id: 'task', label: t('task'), icon: CheckSquare },
            { id: 'team', label: t('team'), icon: Users },
            { id: 'vip', label: t('vip'), icon: Gem },
            { id: 'me', label: t('me'), icon: User },
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

        {/* ================= DRAGGABLE FLOATING 24/7 CUSTOMER SUPPORT BUTTON ================= */}
        {!isAdminRoute && settings?.floatingSupportEnabled !== false && (
          <div
            id="floating-support-btn-wrapper"
            style={
              supportPos
                ? {
                    left: `${supportPos.x}px`,
                    top: `${supportPos.y}px`,
                    position: 'absolute',
                    zIndex: 40,
                    touchAction: 'none'
                  }
                : {
                    bottom: '80px',
                    right: '16px',
                    position: 'absolute',
                    zIndex: 40,
                    touchAction: 'none'
                  }
            }
            onMouseDown={onMouseDownSupport}
            onTouchStart={onTouchStartSupport}
            onTouchMove={onTouchMoveSupport}
            onTouchEnd={onTouchEndSupport}
            className="cursor-grab active:cursor-grabbing select-none"
          >
            <button
              type="button"
              onClick={handleSupportClickWrapped}
              aria-label="24/7 Live Customer Support"
              className="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 hover:scale-105"
            >
              {/* Outer pulsing ring */}
              <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping opacity-75 duration-1000 pointer-events-none"></span>

              {/* Avatar circle */}
              <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.45)] border border-white/50 overflow-hidden flex items-center justify-center pointer-events-none">
                <img
                  src={settings?.supportExecutiveAvatar || DEFAULT_SUPPORT_AVATAR}
                  alt="24/7 Customer Support"
                  className="w-full h-full object-cover rounded-full bg-slate-900 pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Online indicator badge */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              </span>

              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute -top-8 right-0 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                24/7 Live Support
              </span>
            </button>
          </div>
        )}

        {/* ================= MODALS ================= */}
        {/* Support Channels Choice Modal (Telegram / WhatsApp) */}
        {showSupportChoiceModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[340px] p-5 space-y-4 shadow-2xl border border-slate-100 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
                    <img
                      src={settings?.supportExecutiveAvatar || DEFAULT_SUPPORT_AVATAR}
                      alt="Customer Support Executive"
                      className="w-full h-full object-cover bg-slate-900"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>24/7 Live Help Desk</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Choose your preferred support channel</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSupportChoiceModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {(supportChannels || [])
                  .filter((c) => c.active !== false)
                  .map((channel) => {
                    const isWa = channel.type === 'whatsapp';
                    const isTg = channel.type === 'telegram';
                    const url = formatSupportUrl(channel);

                    return (
                      <a
                        key={channel.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowSupportChoiceModal(false)}
                        className={`w-full p-3 rounded-2xl flex items-center justify-between gap-3 text-white transition active:scale-[0.98] shadow-md cursor-pointer ${
                          isWa
                            ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 shadow-emerald-500/25'
                            : isTg
                            ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/25'
                            : 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-slate-900/25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                            {isWa ? <MessageCircle className="w-5 h-5 text-white" /> : isTg ? <Send className="w-5 h-5 text-white" /> : <Headphones className="w-5 h-5 text-white" />}
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-xs tracking-tight leading-tight">{channel.name}</h4>
                            <span className="text-[10px] text-white/80 font-medium capitalize">
                              {channel.type === 'whatsapp' ? 'WhatsApp Direct Chat' : channel.type === 'telegram' ? 'Telegram Official Support' : 'Live Agent Desk'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
                      </a>
                    );
                  })}
              </div>

              <p className="text-center text-[10px] text-slate-400 pt-1">
                Average executive response time: &lt; 2 minutes
              </p>
            </div>
          </div>
        )}
        {/* ================= COMPANY PROFILE MODAL ================= */}
        {showCompanyProfileModal && (() => {
          const profile = settings?.companyProfile || DEFAULT_COMPANY_PROFILE;
          return (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden max-h-[92%] flex flex-col animate-slide-up shadow-2xl border border-slate-100">
                {/* Midnight Luxury Header */}
                <div className="relative bg-gradient-to-r from-[#071739] via-[#0b2457] to-[#05132d] p-4 text-white shrink-0 overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-white text-base tracking-tight">Company Profile</h3>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">Official Corporate Dossier &amp; Legal License</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCompanyProfileModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Verification Tagline Chip */}
                  <div className="mt-3 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-[11px]">
                    <span className="font-bold text-cyan-200 truncate">
                      {profile.companyName || 'NextTask Global Network LTD.'}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-extrabold shrink-0 ml-2">
                      CERTIFIED 2026
                    </span>
                  </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-4 space-y-4 overflow-y-auto text-xs">
                  {/* Corporate Overview Card */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">
                          {profile.companyName || 'NextTask Global Network LTD.'}
                        </h4>
                        <div className="text-[10px] font-mono text-cyan-700 font-bold mt-0.5">
                          {profile.regNumber || 'UK-CRN #14892051 / INT-GLOBAL-TASK-2026'}
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active Entity
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {profile.about || 'NextTask is an internationally accredited task acceleration and digital media marketing network founded in 2026.'}
                    </p>
                  </div>

                  {/* What We Do / Platform Operations */}
                  <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-blue-950 text-xs">Our Work &amp; Earning Model</h4>
                        <span className="text-[10px] text-blue-700 font-medium">Merchant Partnerships &amp; Real-time Dividends</span>
                      </div>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed font-medium">
                      {profile.whatWeDo || 'Our platform coordinates daily micro-missions between global enterprise merchants and verified community members. By fulfilling daily sponsored tasks, users earn guaranteed daily BDT dividend returns with immediate daily liquidity and automated cloud payouts.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div className="bg-white/80 border border-blue-100 rounded-xl p-2 space-y-0.5 shadow-2xs">
                        <span className="font-bold text-blue-900 block">🛒 Global Brands</span>
                        <span className="text-slate-500">Sponsored app ratings &amp; e-commerce data tasks</span>
                      </div>
                      <div className="bg-white/80 border border-blue-100 rounded-xl p-2 space-y-0.5 shadow-2xs">
                        <span className="font-bold text-emerald-900 block">💰 Daily Dividends</span>
                        <span className="text-slate-500">Instant BDT yield settled every 24 hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Mission & Vision */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Mission */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                        <Award className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Our Mission</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {profile.mission || 'To empower everyday internet users worldwide with transparent, accessible, and high-yield digital employment opportunities supported by automated cloud settlement.'}
                      </p>
                    </div>

                    {/* Vision */}
                    <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                        <Crown className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Our Vision</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {profile.vision || 'To become the world’s most trusted and decentralized micro-task ecosystem, bridging global business intelligence with verifiable crowd participation.'}
                      </p>
                    </div>
                  </div>

                  {/* Official Legal License & Certificate Photo */}
                  <div className="bg-gradient-to-br from-[#0c1424] via-[#09152e] to-[#040c1a] border border-cyan-500/30 rounded-2xl p-3.5 text-white shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-xs">Official Business License &amp; Certificate</h4>
                          <p className="text-[10px] text-slate-300">
                            {profile.licenseTitle || 'Official Certificate of Incorporation & Global Operating License'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30 shrink-0">
                        OFFICIAL
                      </span>
                    </div>

                    {/* License Image Box with Zoom */}
                    <div
                      onClick={() => setShowLicenseZoomModal(true)}
                      className="group relative bg-black/50 border border-white/15 rounded-xl overflow-hidden cursor-pointer shadow-inner"
                    >
                      <img
                        src={profile.licenseImage || '/license_certificate.svg'}
                        alt="Company License"
                        className="w-full max-h-48 object-contain bg-white/5 transition duration-300 group-hover:scale-102"
                        onError={(e) => { e.currentTarget.src = '/license_certificate.svg'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                        <span>🔍 Click to View Full License</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="truncate">{profile.licenseDate || 'Issued: January 15, 2026 • Verified'}</span>
                      <button
                        type="button"
                        onClick={() => setShowLicenseZoomModal(true)}
                        className="text-cyan-400 hover:text-cyan-300 font-bold underline shrink-0 cursor-pointer"
                      >
                        Enlarge Certificate
                      </button>
                    </div>
                  </div>

                  {/* Security & Regulatory Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 space-y-0.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-600 mx-auto" />
                      <div className="font-bold text-[10px] text-slate-800">100% Insured</div>
                      <div className="text-[8px] text-slate-400">Capital Guaranteed</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 space-y-0.5">
                      <Globe className="w-4 h-4 text-blue-600 mx-auto" />
                      <div className="font-bold text-[10px] text-slate-800">Global License</div>
                      <div className="text-[8px] text-slate-400">UK-CRN #14892051</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 space-y-0.5">
                      <Sparkles className="w-4 h-4 text-amber-600 mx-auto" />
                      <div className="font-bold text-[10px] text-slate-800">Cloud Audited</div>
                      <div className="text-[8px] text-slate-400">Blockchain Smart Core</div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCompanyProfileModal(false)}
                    className="w-full bg-[#071739] hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= FULLSCREEN LICENSE ZOOM MODAL ================= */}
        {showLicenseZoomModal && (
          <div
            onClick={() => setShowLicenseZoomModal(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl space-y-3 cursor-default animate-scale-up"
            >
              <div className="flex justify-between items-center text-white pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span className="font-extrabold text-sm">
                    {settings?.companyProfile?.licenseTitle || 'Official Certificate & Business Operating License'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLicenseZoomModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-auto rounded-2xl bg-black/60 flex items-center justify-center p-2">
                <img
                  src={settings?.companyProfile?.licenseImage || '/license_certificate.svg'}
                  alt="Full Official Certificate"
                  className="w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                  onError={(e) => { e.currentTarget.src = '/license_certificate.svg'; }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span className="font-mono text-cyan-300">
                  {settings?.companyProfile?.regNumber || 'UK-CRN #14892051'}
                </span>
                <span className="text-slate-400">
                  {settings?.companyProfile?.licenseDate || 'Verified Official Corporate Document'}
                </span>
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

        {/* ================= UPGRADE LOG MODAL ================= */}
        {showUpgradeLogModal && (() => {
          const upgradeLogs = getStoredData('upgrade_logs', DEFAULT_UPGRADE_LOGS);
          const myLogs = upgradeLogs.filter((log) => {
            if (!currentUser) return false;
            return (
              (log.userId && String(log.userId) === String(currentUser.id)) ||
              (log.user && currentUser.name && log.user === currentUser.name) ||
              (log.user && (currentUser.email === log.user || currentUser.phone === log.user))
            );
          });
          const displayedLogs = upgradeLogTab === 'my' ? myLogs : upgradeLogs;

          return (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden max-h-[92%] flex flex-col animate-slide-up shadow-2xl border border-slate-100">
                {/* Midnight Luxury Header */}
                <div className="relative bg-gradient-to-r from-[#071739] via-[#0b2457] to-[#05132d] p-4 text-white shrink-0 overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25">
                        <Crown className="w-5 h-5 fill-slate-950 text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-white text-base tracking-tight">Upgrade Log</h3>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Live
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">Real-time VIP Unlocks &amp; Transitions</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUpgradeLogModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-3 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Total Unlocks:</span>
                      <b className="text-white font-mono">{upgradeLogs.length} Records</b>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-300 font-extrabold bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                      My VIP: {currentUser?.vip || userVip || 'VIP0'}
                    </span>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="p-3 pb-0 bg-slate-50 border-b border-slate-100 flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setUpgradeLogTab('all')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer text-center ${
                      upgradeLogTab === 'all'
                        ? 'bg-[#071739] text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    All Upgrades ({upgradeLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpgradeLogTab('my')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer text-center ${
                      upgradeLogTab === 'my'
                        ? 'bg-[#071739] text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    My Upgrades ({myLogs.length})
                  </button>
                </div>

                {/* Scrollable Records List */}
                <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1">
                  {displayedLogs.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Award className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">No upgrade records in this tab</p>
                        <p className="text-[11px] text-slate-400">
                          {upgradeLogTab === 'my'
                            ? 'You have not unlocked any VIP packages yet.'
                            : 'Upgrade logs will appear here in real time.'}
                        </p>
                      </div>
                      {upgradeLogTab === 'my' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUpgradeLogModal(false);
                            setActiveTab('vip');
                          }}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs py-2.5 px-5 rounded-full shadow-md transition cursor-pointer"
                        >
                          Unlock VIP Package Now
                        </button>
                      )}
                    </div>
                  ) : (
                    displayedLogs.map((log, idx) => {
                      const isMyRecord = currentUser && (
                        String(log.userId) === String(currentUser.id) ||
                        log.user === currentUser.name ||
                        log.user === currentUser.email ||
                        log.user === currentUser.phone
                      );
                      const isUnlock = log.type === 'Unlock' || log.fromVip === 'VIP0' || !log.fromVip;

                      return (
                        <div
                          key={log.id || idx}
                          className={`p-3 rounded-2xl border transition ${
                            isMyRecord
                              ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-amber-300 shadow-sm ring-1 ring-amber-400/20'
                              : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/90'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                                isUnlock
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {isUnlock ? '★' : '▲'}
                              </div>
                              <span className="font-extrabold text-xs text-slate-900 truncate">
                                {log.userIdentifier || (log.user ? String(log.user).replace(/(\d{3})\d{4,}(\d{2})/, '$1****$2') : 'Member')}
                              </span>
                              {isMyRecord && (
                                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded font-mono shrink-0">
                                  YOU
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-bold text-slate-400 shrink-0 font-mono">
                              {log.date}
                            </span>
                          </div>

                          {/* Transition Bar: VIP From -> To */}
                          <div className="flex items-center justify-between bg-white border border-slate-200/70 rounded-xl px-2.5 py-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-600">
                                {log.fromVip || 'VIP0'}
                              </span>
                              <span className="text-slate-400 font-bold text-xs">➔</span>
                              <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-xs">
                                {log.toVip}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 ml-1">
                                {isUnlock ? 'Package Unlock' : 'Tier Upgrade'}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono text-xs font-black text-emerald-600">
                                {log.amount > 0 ? `+৳${parseFloat(log.amount).toFixed(2)}` : 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowUpgradeLogModal(false)}
                    className="w-full bg-[#071739] hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Close Log
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= VIP UNLOCK CONFIRMATION POPUP (MATCHING USER SCREENSHOT) ================= */}
        {showUnlockConfirmModal && selectedVipForUnlock && (() => {
          const reqDep = parseFloat(String(selectedVipForUnlock.deposit || 0).replace(/,/g, '')) || 0;
          const isFree = reqDep === 0 || String(selectedVipForUnlock.level || '').toLowerCase().includes('starter');
          const hasSufficient = balance >= reqDep;

          return (
            <div
              onClick={() => setShowUnlockConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-in cursor-pointer"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-[320px] p-6 shadow-2xl space-y-4 text-center animate-scale-up border border-slate-100 cursor-default"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-400/30 flex items-center justify-center p-1.5 shadow-sm">
                  <img
                    src={getPackageLogo(selectedVipForUnlock)}
                    alt={selectedVipForUnlock.level}
                    className="w-10 h-10 object-contain drop-shadow"
                  />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {selectedVipForUnlock.level}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed mt-2 px-1">
                    {isFree ? (
                      <span>
                        Starter Package is <b>100% Free</b> for all members! Claim now to receive <b>5 daily tasks</b> and earn <b>৳20.00 BDT</b> daily for 7 days.
                      </span>
                    ) : hasSufficient ? (
                      <span>
                        Upgrade to <b>{selectedVipForUnlock.level}</b> using your current balance? <b>৳{selectedVipForUnlock.deposit} BDT</b> will be activated for this package.
                      </span>
                    ) : (
                      <span>
                        Upgrading to <b>{selectedVipForUnlock.level}</b> requires a deposit of <b>৳{selectedVipForUnlock.deposit} BDT</b>. Please recharge your account to activate.
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleConfirmUnlock}
                    className={`w-full text-white font-bold py-3 px-5 rounded-full shadow-lg active:scale-95 transition text-xs tracking-wide cursor-pointer ${
                      isFree
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-emerald-500/25'
                        : hasSufficient
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 shadow-blue-500/25'
                        : 'bg-[#ff3b30] hover:bg-red-600 shadow-red-500/25'
                    }`}
                  >
                    {isFree
                      ? 'Claim Free Starter (৳0.00)'
                      : hasSufficient
                      ? `Confirm Upgrade (৳${selectedVipForUnlock.deposit})`
                      : `Recharge to Upgrade (৳${selectedVipForUnlock.deposit})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUnlockConfirmModal(false)}
                    className="w-full text-slate-400 hover:text-slate-600 font-semibold py-1.5 text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= RECHARGE / DEPOSIT MODAL (bKash / Nagad / Rocket / USDT) ================= */}
        {showRechargeModal && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden max-h-[92%] flex flex-col animate-slide-up shadow-2xl border border-slate-100">
              
              {/* Luxury Midnight Header */}
              <div className="relative bg-gradient-to-r from-[#071739] via-[#0b2457] to-[#05132d] p-4 text-white shrink-0 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-white text-base tracking-tight">
                          {rechargeStep === 1 ? 'Recharge Deposit' : 'Payment Checkout'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                          settings?.paymentGatewayMode === 'automated'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
                        }`}>
                          {settings?.paymentGatewayMode === 'automated' ? '⚡ P2P Auto Gateway' : 'Standard Deposit'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">Safe & Encrypted Cloud Settlement</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRechargeModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Balance bar chip */}
                <div className="mt-3 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Current Balance:</span>
                  </div>
                  <span className="font-extrabold text-cyan-300 tracking-wide font-mono">
                    ৳{(currentUser?.balance || 0).toFixed(2)} BDT
                  </span>
                </div>
              </div>

              {/* Scrollable Body: Step 1 vs Step 2 */}
              {rechargeStep === 1 ? (
                /* ================= STEP 1: AMOUNT SELECTION & PAY NOW ================= */
                <div className="p-4 sm:p-5 space-y-5 overflow-y-auto animate-fade-in">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-blue-600" />
                        Recharge Amount (BDT)
                      </label>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Min: ৳{typeof settings?.minDeposit === 'number' && settings.minDeposit > 0 ? settings.minDeposit : (parseFloat(settings?.minDeposit) || 500)} BDT
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">৳</span>
                      <input
                        type="text"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-cyan-600 rounded-2xl pl-8 pr-16 py-3 text-lg font-black text-slate-900 outline-none transition shadow-inner font-mono"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        BDT
                      </span>
                    </div>

                    {/* Quick Amount Selectors */}
                    <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                      {['1,000.00', '5,000.00', '15,000.00', '35,000.00', '75,000.00', '150,000.00', '350,000.00', '750,000.00'].map((amt) => {
                        const isActive = rechargeAmount === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setRechargeAmount(amt)}
                            className={`py-2 rounded-xl text-xs font-extrabold transition border cursor-pointer active:scale-95 ${
                              isActive
                                ? 'bg-gradient-to-r from-[#071739] to-blue-900 text-cyan-300 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            ৳{amt.split('.')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Big 'Pay Now' Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseFloat(rechargeAmount.toString().replace(/,/g, '')) || 0;
                      const minDep = typeof settings?.minDeposit === 'number' && settings.minDeposit > 0
                        ? settings.minDeposit
                        : (parseFloat(settings?.minDeposit) || 500);
                      if (num < minDep) {
                        showToast(`Minimum recharge is ৳${minDep} BDT`);
                        return;
                      }
                      setRechargeStep(2);
                    }}
                    className="w-full bg-gradient-to-r from-[#071739] via-blue-900 to-cyan-600 hover:brightness-110 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-wider shadow-xl shadow-blue-950/30 flex items-center justify-center gap-2 active:scale-[0.99] transition cursor-pointer"
                  >
                    <span>Pay Now</span>
                    <span className="text-cyan-300 font-mono">
                      (৳{(parseFloat(rechargeAmount.toString().replace(/,/g, '')) || 0).toLocaleString()} BDT)
                    </span>
                    <ChevronRight className="w-5 h-5 text-cyan-300" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>
                      {settings?.paymentGatewayMode === 'automated'
                        ? 'Automated P2P Live Verification Network'
                        : 'Official 256-Bit Encrypted Security'}
                    </span>
                  </div>
                </div>
              ) : (
                /* ================= STEP 2: CHECKOUT (GATEWAYS, NUMBER COPY, TRXID) ================= */
                <div className="p-4 space-y-4 overflow-y-auto animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setRechargeStep(1)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition"
                    >
                      <span>← Change Amount</span>
                    </button>
                    <div className="text-xs font-black text-slate-800 font-mono">
                      Payable: <span className="text-emerald-600 font-extrabold text-sm">৳{(parseFloat(rechargeAmount.toString().replace(/,/g, '')) || 0).toLocaleString()} BDT</span>
                    </div>
                  </div>

                  {/* Payment Methods Selection Tabs */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        Select Payment Gateway
                      </label>
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Channels
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.filter((p) => p && p.active !== false).map((pm) => {
                        const isSelected = selectedPaymentMethod?.id === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setSelectedPaymentMethod(pm)}
                            className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? 'border-cyan-600 bg-gradient-to-br from-cyan-50/80 via-blue-50/40 to-white shadow-sm ring-2 ring-cyan-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={getPaymentLogo(pm)}
                                alt={pm.method}
                                className="w-8 h-8 rounded-xl object-contain bg-white border border-slate-200/90 p-0.5 shrink-0 shadow-sm"
                                loading="eager"
                                decoding="async"
                                onError={(e) => { e.currentTarget.src = '/logos/usdt.svg'; }}
                              />
                              <div className="min-w-0">
                                <div className="font-extrabold text-xs text-slate-800 truncate">{pm.method}</div>
                                <div className="text-[10px] text-slate-500 font-semibold">{pm.type}</div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Official Receiver Luxury Card */}
                  {selectedPaymentMethod && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1424] via-[#09152e] to-[#040c1a] border border-cyan-500/30 rounded-2xl p-3.5 text-white shadow-xl space-y-3">
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={getPaymentLogo(selectedPaymentMethod)}
                            alt={selectedPaymentMethod.method}
                            className="w-8 h-8 rounded-xl object-contain bg-white/95 border border-white/20 p-0.5 shrink-0 shadow-md"
                            loading="eager"
                            decoding="async"
                            onError={(e) => { e.currentTarget.src = '/logos/usdt.svg'; }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white truncate">
                                {selectedPaymentMethod.method}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                                {selectedPaymentMethod.type}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-300 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Official Receiving Account
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedPaymentMethod.number, `${selectedPaymentMethod.method} account`)}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 shadow-md shadow-cyan-500/25 active:scale-95 transition cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>

                      {/* Prominent Number display */}
                      <div className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                        <div className="font-mono text-xs sm:text-sm font-black text-cyan-300 break-all select-all tracking-wider">
                          {selectedPaymentMethod.number}
                        </div>
                      </div>

                      {/* Rate conversion for BDT methods */}
                      {selectedPaymentMethod.rate > 1 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <div className="text-slate-300 text-[11px] font-medium">Payable in BDT:</div>
                            <div className="text-[10px] text-cyan-300 font-mono">
                              Rate: 1 USDT = {selectedPaymentMethod.rate} BDT
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-400 text-sm tracking-tight font-mono">
                              {( (parseFloat(rechargeAmount.toString().replace(/,/g, '')) || 0) * selectedPaymentMethod.rate ).toLocaleString()} BDT
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Custom instruction notice */}
                      {selectedPaymentMethod.instructions ? (
                        <div className="text-[11px] text-amber-200 bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl flex items-start gap-1.5">
                          <span className="shrink-0 text-amber-400 font-bold">ℹ️</span>
                          <span>
                            {lang !== 'bn' && /[\u0980-\u09FF]/.test(selectedPaymentMethod.instructions)
                              ? (selectedPaymentMethod.method === 'USDT (TRC20)' ? 'Transfer USDT via TRC20 network and submit TxID below' : 'Please Send Money to the official number above and enter Sender Number & TrxID below.')
                              : selectedPaymentMethod.instructions}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-300 bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                          1. Send Money to above account • 2. Copy TrxID • 3. Submit below
                        </div>
                      )}
                    </div>
                  )}

                  {/* User Payment Submission Form */}
                  <form onSubmit={handleSubmitRecharge} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Sender Account Number</span>
                        <span className="text-[10px] font-semibold text-slate-400">Required</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={senderAccount}
                        onChange={(e) => setSenderAccount(e.target.value)}
                        placeholder="Sender Account Number"
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-cyan-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Transaction ID (TrxID)</span>
                        <span className="text-[10px] font-semibold text-slate-400">Required</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Transaction ID"
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-cyan-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono outline-none transition uppercase"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#071739] via-blue-900 to-cyan-700 hover:brightness-110 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-blue-950/30 flex items-center justify-center gap-2 active:scale-[0.99] transition cursor-pointer mt-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                      {settings?.paymentGatewayMode === 'automated' ? 'Submit & Auto-Verify Payment' : 'Submit Recharge Request'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ================= AUTOMATED GATEWAY VERIFICATION MODAL ================= */}
      {isVerifyingPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-[360px] p-6 text-center space-y-4 shadow-2xl animate-scale-up text-white relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            {verificationStage === 'scanning' ? (
              <>
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center my-2">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border border-cyan-400/40 animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#05132d] via-blue-900 to-cyan-600 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <RefreshCw className="w-8 h-8 text-cyan-300 animate-spin" />
                  </div>
                  <div className="absolute -bottom-1 bg-cyan-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md font-mono">
                    {verificationCountdown}s
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Verifying Payment
                  </h3>
                  <p className="text-xs text-cyan-300 font-semibold animate-pulse">
                    {verificationCountdown > 8
                      ? 'Connecting to telecom gateway network...'
                      : verificationCountdown > 4
                      ? 'Scanning live SMS records & matching TrxID...'
                      : 'Confirming settlement & security handshake...'}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-left space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Gateway:</span>
                    <span className="text-white font-bold">{verificationDetails.method}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Payable Amount:</span>
                    <span className="text-emerald-400 font-bold">৳{verificationDetails.amount.toFixed(2)} BDT</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>TrxID:</span>
                    <span className="text-cyan-300 font-bold truncate max-w-[170px]">{verificationDetails.trxId}</span>
                  </div>
                  {verificationDetails.targetVip && (
                    <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                      <span>Auto-Unlock Package:</span>
                      <span className="text-amber-400 font-bold">{verificationDetails.targetVip}</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Encrypted P2P Automation Handshake</span>
                </div>
              </>
            ) : verificationStage === 'success' ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mx-auto my-2 shadow-xl shadow-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-emerald-400 tracking-tight">
                    Payment Verified!
                  </h3>
                  <p className="text-xs text-slate-300">
                    ৳{verificationDetails.amount.toFixed(2)} has been credited to your account!
                  </p>
                  {verificationDetails.targetVip && (
                    <p className="text-xs text-amber-300 font-bold pt-1">
                      🎉 {verificationDetails.targetVip} package activated!
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center mx-auto my-2 shadow-xl shadow-blue-500/20">
                  <Clock className="w-10 h-10 text-cyan-300 animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Payment Submitted!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Your transaction is in queue. Admin will verify and credit your balance within a few minutes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyingPayment(false);
                    navigateToTab('profile');
                    setShowRecordsModal(true);
                    setRecordTab('deposit');
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold py-2.5 rounded-xl text-xs shadow cursor-pointer transition active:scale-95"
                >
                  View in Financial Records
                </button>
              </>
            )}
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
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                      <span>Available Balance</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">
                        {currentUser?.capitalReleased || (currentUser?.vipExpiresAt && Date.now() >= currentUser.vipExpiresAt) ? 'Earnings + Released Capital' : 'Task Earnings'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">৳{balance.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-medium">Min Withdrawal</div>
                    <div className="text-xs font-bold text-indigo-600">
                      ৳{(typeof settings?.minWithdrawal === 'number' && settings.minWithdrawal > 0 ? settings.minWithdrawal : (parseFloat(settings?.minWithdrawal) || 500)).toFixed(2)}
                    </div>
                  </div>
                </div>

                {rechargeTotal > 0 && userVip && userVip !== 'VIP0' && (
                  <div className="text-[10px] text-slate-500 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Locked VIP ({getVipDisplayName(userVip, vipTiers)}) Capital:</span>
                    </span>
                    <strong className="text-amber-800 font-bold">৳{rechargeTotal.toFixed(2)}</strong>
                  </div>
                )}
              </div>

              {/* Dynamic Saved Accounts Selector */}
              {(() => {
                const userAccounts = getUserAccountsList(currentUser);
                const minWthLimit = typeof settings?.minWithdrawal === 'number' && settings.minWithdrawal > 0
                  ? settings.minWithdrawal
                  : (parseFloat(settings?.minWithdrawal) || 500);

                if (userAccounts.length === 0) {
                  return (
                    <div className="py-6 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">No Withdrawal Account Added</h4>
                        <p className="text-[11px] text-slate-500 max-w-[230px] mx-auto">
                          Please add your bKash, Nagad, Rocket, Bank or USDT account to withdraw.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWithdrawModal(false);
                          handleOpenWithdrawAccounts();
                        }}
                        className="w-full bg-[#05132d] hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Withdrawal Account Now</span>
                      </button>
                    </div>
                  );
                }

                // If no account is actively selected yet, select the first one
                const currentSelectedAcc = userAccounts.find(a => a.id === selectedWithdrawAccountId) || userAccounts[0];

                return (
                  <>
                    {/* Method & Saved Account Selection */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Select Payout Account
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowWithdrawModal(false);
                            handleOpenWithdrawAccounts();
                          }}
                          className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add New / Manage &gt;</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar pr-0.5">
                        {userAccounts.map((acc) => {
                          const isSelected = (selectedWithdrawAccountId && selectedWithdrawAccountId === acc.id) ||
                                            (!selectedWithdrawAccountId && currentSelectedAcc?.id === acc.id);
                          return (
                            <button
                              type="button"
                              key={acc.id}
                              onClick={() => {
                                setSelectedWithdrawAccountId(acc.id);
                                setWithdrawMethod(acc.type);
                                setWithdrawAccountInput(acc.number);
                              }}
                              className={`w-full p-2.5 text-xs rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#05132d] text-white border-[#05132d] shadow-sm'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold">{acc.type}</span>
                                  {acc.bankName && (
                                    <span className={`text-[9px] px-1 py-0.2 rounded font-medium truncate max-w-[120px] ${
                                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {acc.bankName}
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[11px] truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                                  {acc.holder} • <span className="font-mono font-bold">{acc.number}</span>
                                </div>
                              </div>

                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Withdrawal Amount (BDT)
                        </label>
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(String(Math.floor(balance)))}
                          className="text-[10px] text-cyan-700 font-bold hover:underline cursor-pointer"
                        >
                          All: ৳{balance.toFixed(2)}
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">৳</span>
                        <input
                          type="number"
                          step="1"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Amount"
                          className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-900 font-bold outline-none focus:border-indigo-500 focus:bg-white transition"
                        />
                      </div>

                      {/* Quick Amount Chips */}
                      <div className="flex gap-1.5 mt-2">
                        {[500, 1000, 2000, 5000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setWithdrawAmount(String(amt))}
                            className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer text-center"
                          >
                            ৳{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleWithdrawSubmit}
                      className="w-full bg-[#05132d] hover:bg-[#091f4b] text-white text-xs font-bold py-3.5 rounded-full shadow-lg active:scale-95 transition cursor-pointer"
                    >
                      Confirm Withdrawal
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* ================= REAL FINANCIAL RECORDS MODAL (SPLIT VIEW) ================= */}
        {showRecordsModal && (() => {
          const allRecharges = getStoredData('recharges', DEFAULT_RECHARGES);
          const allWithdrawals = getStoredData('withdrawals', DEFAULT_WITHDRAWALS);
          const allTaskRecords = getStoredData('task_records', DEFAULT_TASK_RECORDS);

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

          const currentVipTier = vipTiers.find((v) => v.level === userVip) || vipTiers[0];
          const maxTasks = currentVipTier?.tasks || 10;
          const dailyProfit = parseFloat(currentVipTier?.daily || '50.00') || 50.00;
          const rewardPerTask = parseFloat((dailyProfit / maxTasks).toFixed(2));

          // Real task records: Exactly matches active completedTaskIndices for today
          const todayRecords = (completedTaskIndices || []).map((idx) => ({
            id: `TSK-${todayDateStr}-${idx + 1}`,
            userId: currentUser?.id,
            missionNo: idx + 1,
            taskIndex: idx,
            taskName: `${getVipDisplayName(userVip, vipTiers)} Mission #${idx + 1}`,
            vipLevel: userVip || 'Starter Package',
            amount: rewardPerTask,
            status: 'completed',
            date: `${todayDateStr} ${String(10 + Math.floor(idx / 2)).padStart(2, '0')}:${String((idx * 6) % 60).padStart(2, '0')}`
          }));

          // Valid past task records from previous dates
          const pastTaskRecords = allTaskRecords.filter((t) => {
            if (!t) return false;
            const isUser = (currentUser?.id && String(t.userId) === String(currentUser.id)) ||
              (currentUser?.email && String(t.user || '').toLowerCase() === currentUser.email.toLowerCase()) ||
              (currentUser?.phone && String(t.user || '') === currentUser.phone);
            if (!isUser) return false;
            const tDate = t.date ? String(t.date).slice(0, 10) : '';
            return tDate && tDate !== todayDateStr;
          });

          const userTaskRecords = [...todayRecords, ...pastTaskRecords];

          const totalDeposited = userRecharges
            .filter((r) => r && (String(r.status || '').toLowerCase() === 'approved' || String(r.status || '').toLowerCase() === 'completed'))
            .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
          const totalWithdrawn = userWithdrawals
            .filter((w) => w && (String(w.status || '').toLowerCase() === 'approved' || String(w.status || '').toLowerCase() === 'completed'))
            .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
          const totalTaskIncome = userTaskRecords.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

          return (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-[400px] p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[88%] flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Financial Records
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowRecordsModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 3-Summary Grid: Task Income, Deposited, Withdrawn */}
                <div className="grid grid-cols-3 gap-2 shrink-0">
                  {/* Task Earnings */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-2.5 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-900 uppercase tracking-tight">
                      <Coins className="w-3 h-3 text-blue-600" />
                      <span>Tasks</span>
                    </div>
                    <div className="text-sm font-black text-blue-700 mt-1 truncate">
                      +৳{totalTaskIncome.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-blue-600/90 font-semibold mt-0.5 truncate">
                      {userTaskRecords.length} Tasks
                    </div>
                  </div>

                  {/* Left Column: Recharged Amount */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-2.5 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800 uppercase tracking-tight">
                      <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      <span>Recharged</span>
                    </div>
                    <div className="text-sm font-black text-emerald-700 mt-1 truncate">
                      ৳{totalDeposited.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-emerald-600/90 font-semibold mt-0.5 truncate">
                      {userRecharges.length} Recharges
                    </div>
                  </div>

                  {/* Right Column: Withdrawn Amount */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-2.5 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-800 uppercase tracking-tight">
                      <ArrowUpRight className="w-3 h-3 text-amber-600" />
                      <span>Withdrawn</span>
                    </div>
                    <div className="text-sm font-black text-amber-700 mt-1 truncate">
                      ৳{totalWithdrawn.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-amber-600/90 font-semibold mt-0.5 truncate">
                      {userWithdrawals.length} Payouts
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-[#eef3fb] p-1 rounded-2xl text-[11px] font-bold text-slate-600 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRecordsTab('task')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer text-center ${recordsTab === 'task' ? 'bg-white text-blue-700 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                  >
                    Tasks ({userTaskRecords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordsTab('deposit')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer text-center ${recordsTab === 'deposit' ? 'bg-white text-emerald-700 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                  >
                    Recharges ({userRecharges.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordsTab('withdraw')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer text-center ${recordsTab === 'withdraw' ? 'bg-white text-amber-700 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                  >
                    Withdrawals ({userWithdrawals.length})
                  </button>
                </div>

                {/* Real Transactions List */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {recordsTab === 'task' ? (
                    userTaskRecords.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-1">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No task earnings yet.</p>
                        <p className="text-[10px] text-slate-400">Complete daily VIP tasks to see income records here in real time.</p>
                      </div>
                    ) : (
                      userTaskRecords.map((t, idx) => (
                        <div key={t.id || idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{t.taskName || `VIP Mission #${t.missionNo || t.taskIndex + 1 || idx + 1}`}</span>
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase bg-blue-100 text-blue-700">
                                Completed
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Ref: {t.id}
                            </div>
                            <div className="text-[10px] text-slate-400">{t.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-emerald-600">
                              +৳{parseFloat(t.amount).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">BDT</div>
                          </div>
                        </div>
                      ))
                    )
                  ) : recordsTab === 'deposit' ? (
                    userRecharges.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-1">
                        <ArrowDownLeft className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No recharge records yet.</p>
                        <p className="text-[10px] text-slate-400">Recharges submitted will show here in real time.</p>
                      </div>
                    ) : (
                      userRecharges.map((r, idx) => (
                        <div key={r.id || idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Recharge via {r.network || 'bKash'}</span>
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
                              +৳{parseFloat(r.amount).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">BDT</div>
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
                              -৳{parseFloat(w.amount).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">BDT</div>
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

        {/* ================= MODAL: PERSONAL PROFILE (SEPARATE PAGE) ================= */}
        {showPersonalProfileModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-[360px] p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[90%] flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Personal Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPersonalProfileModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePersonalProfile} className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={profileDob}
                    onChange={(e) => setProfileDob(e.target.value)}
                    className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
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
                    <span className="font-bold text-amber-600">{getVipDisplayName(userVip, vipTiers)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Invitation Code:</span>
                    <span className="font-mono font-bold text-cyan-600">{userInviteCode}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#05132d] hover:bg-[#091f4b] text-white text-xs font-bold py-3 rounded-full shadow-lg active:scale-95 transition cursor-pointer shrink-0 mt-3"
                >
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: WITHDRAWAL ACCOUNTS (MULTI-ACCOUNT MANAGEMENT) ================= */}
        {showWithdrawAccountsModal && (() => {
          const userAccounts = getUserAccountsList(currentUser);

          return (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-[370px] p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[90%] flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {showAddAccountForm ? 'Add Withdrawal Account' : 'My Withdrawal Accounts'}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {showAddAccountForm ? 'Save bKash, Nagad, Rocket, Bank or USDT' : `${userAccounts.length} saved account(s)`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawAccountsModal(false);
                      setShowAddAccountForm(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {showAddAccountForm ? (
                  /* Form to Add New Account */
                  <form onSubmit={handleSaveNewAccount} className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 text-xs">
                    {/* Method Type Selector */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">Select Account Type</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'USDT (TRC20)'].map((tName) => (
                          <button
                            key={tName}
                            type="button"
                            onClick={() => setNewAccType(tName)}
                            className={`p-2 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${
                              newAccType === tName
                                ? 'bg-[#05132d] text-white border-[#05132d] shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {tName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Account Holder Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAccHolder}
                        onChange={(e) => setNewAccHolder(e.target.value)}
                        placeholder="Account Holder Name"
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                    </div>

                    {/* Bank Name if Bank Transfer */}
                    {newAccType === 'Bank Transfer' && (
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Bank Name & Branch <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newAccBankName}
                          onChange={(e) => setNewAccBankName(e.target.value)}
                          placeholder="Bank Name & Branch"
                          className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                        />
                      </div>
                    )}

                    {/* Account / Phone Number / Wallet Address */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {newAccType === 'USDT (TRC20)' ? 'TRC20 Wallet Address' : `${newAccType} Account / Phone Number`} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAccNumber}
                        onChange={(e) => setNewAccNumber(e.target.value)}
                        placeholder={newAccType === 'USDT (TRC20)' ? 'TRC20 Wallet Address' : 'Account Number'}
                        className="w-full bg-[#f4f7fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAccountForm(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#05132d] hover:bg-[#091f4b] text-white text-xs font-bold py-2.5 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
                      >
                        Save Account
                      </button>
                    </div>
                  </form>
                ) : (
                  /* List of Saved Accounts */
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium text-[11px]">Saved Payment Methods</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewAccHolder(currentUser?.name || '');
                          setNewAccNumber('');
                          setNewAccBankName('');
                          setShowAddAccountForm(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New Account</span>
                      </button>
                    </div>

                    {userAccounts.length === 0 ? (
                      <div className="py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-3 my-2">
                        <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center mx-auto">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800">No Accounts Saved Yet</h4>
                          <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto">
                            Add your bKash, Nagad, Rocket, Bank or USDT account to withdraw your earnings anytime.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewAccHolder(currentUser?.name || '');
                            setNewAccNumber('');
                            setNewAccBankName('');
                            setShowAddAccountForm(true);
                          }}
                          className="bg-[#05132d] hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer mx-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Account Now</span>
                        </button>
                      </div>
                    ) : (
                      userAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-slate-900">{acc.type}</span>
                              {acc.bankName && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.2 rounded-md">
                                  {acc.bankName}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              Holder: <b>{acc.holder || 'User'}</b>
                            </div>
                            <div className="text-xs font-mono font-bold text-slate-900 tracking-wide">
                              {acc.number}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSavedAccount(acc.id)}
                            className="w-8 h-8 rounded-xl bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer shrink-0"
                            title="Remove account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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
                  <X className="w-5 h-5" />
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
                    placeholder="Old Password"
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
                    placeholder="New Password"
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
                    placeholder="Confirm New Password"
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
                <button onClick={() => setShowLangModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
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
