import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LayoutDashboard,
  LogIn,
  FileDown,
  Gem,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Edit3,
  CheckCircle,
  Ban,
  DollarSign,
  Search,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Image as ImageIcon,
  Smartphone,
  KeyRound,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Mail,
  Upload,
  Menu,
  X,
  ChevronRight,
  Copy,
  Crown,
  Headphones,
  MessageCircle,
  Send,
  Check,
  Building2,
  Award,
  Sparkles,
  User,
  CheckCircle2
} from 'lucide-react';
import {
  getStoredData,
  setStoredData,
  fetchCloudDataNow,
  DEFAULT_VIP_TIERS,
  DEFAULT_USERS,
  DEFAULT_RECHARGES,
  DEFAULT_WITHDRAWALS,
  DEFAULT_SETTINGS,
  DEFAULT_COMPANY_PROFILE,
  DEFAULT_UPGRADE_LOGS,
  recordUpgradeLog,
  DEFAULT_SLIDES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_SUPPORT_CHANNELS,
  getPackageLogo,
  DEFAULT_SUPPORT_AVATAR,
  getPaymentLogo,
  isReferredByUser,
  getAuthHeaders
} from './store';

export default function AdminPanel({ onNavigateToApp }) {
  // Master Admin Authentication State
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    const isAuth = localStorage.getItem('nt_admin_auth') === 'true';
    if (isAuth) {
      try {
        localStorage.setItem('nt_admin_token', 'nt_sec_9999_master_admin_verified');
        sessionStorage.setItem('nt_admin_token', 'nt_sec_9999_master_admin_verified');
      } catch {}
    }
    return isAuth;
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const trimEmail = adminEmail.trim().toLowerCase();
    const trimPass = adminPassword.trim();

    if (trimEmail === 'admin@nexttask.online' && trimPass === 'Admin@NextTask') {
      localStorage.setItem('nt_admin_auth', 'true');
      localStorage.setItem('nt_admin_token', 'nt_sec_9999_master_admin_verified');
      sessionStorage.setItem('nt_admin_token', 'nt_sec_9999_master_admin_verified');
      setIsAdminAuth(true);
      fetchCloudDataNow();
      setTimeout(syncData, 150);
      showToast('Master Admin Authenticated Successfully');
    } else {
      setLoginError('Invalid Administrator credentials! Please check your email and password.');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('nt_admin_auth');
    localStorage.removeItem('nt_admin_token');
    sessionStorage.removeItem('nt_admin_token');
    setIsAdminAuth(false);
    setAdminEmail('');
    setAdminPassword('');
    showToast('Admin session logged out');
  };

  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'vips' | 'slides' | 'payments' | 'users' | 'recharges' | 'withdrawals' | 'settings'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data State persisted via store
  const [vipTiers, setVipTiers] = useState(() => getStoredData('vips', DEFAULT_VIP_TIERS));
  const [slides, setSlides] = useState(() => getStoredData('slides', DEFAULT_SLIDES));
  const [paymentMethods, setPaymentMethods] = useState(() => getStoredData('payments', DEFAULT_PAYMENT_METHODS));
  const [users, setUsers] = useState(() => getStoredData('users', DEFAULT_USERS));
  const [recharges, setRecharges] = useState(() => getStoredData('recharges', DEFAULT_RECHARGES));
  const [withdrawals, setWithdrawals] = useState(() => getStoredData('withdrawals', DEFAULT_WITHDRAWALS));
  const [settings, setSettings] = useState(() => getStoredData('settings', DEFAULT_SETTINGS));
  const [supportChannels, setSupportChannels] = useState(() => getStoredData('support_channels', DEFAULT_SUPPORT_CHANNELS));
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [editingSupportChannel, setEditingSupportChannel] = useState(null);
  const [supportForm, setSupportForm] = useState({ name: '', type: 'telegram', link: '', active: true });

  // Auto-sync with storage whenever currentTab changes or storage event fires
  const syncData = () => {
    if (showPaymentModal || showVipModal || showSlideModal || showSupportModal) return;
    setRecharges(getStoredData('recharges', DEFAULT_RECHARGES));
    setWithdrawals(getStoredData('withdrawals', DEFAULT_WITHDRAWALS));
    setUsers(getStoredData('users', DEFAULT_USERS));
    if (currentTab !== 'settings' && currentTab !== 'company') {
      setSettings(getStoredData('settings', DEFAULT_SETTINGS));
    }
    setPaymentMethods(getStoredData('payments', DEFAULT_PAYMENT_METHODS));
    setVipTiers(getStoredData('vips', DEFAULT_VIP_TIERS));
    setSlides(getStoredData('slides', DEFAULT_SLIDES));
    setSupportChannels(getStoredData('support_channels', DEFAULT_SUPPORT_CHANNELS));
  };

  useEffect(() => {
    fetchCloudDataNow();
    syncData();
    const handleSync = (e) => {
      if (e?.detail && e.detail.hasUpdates === false) return;
      syncData();
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('cloud-sync', handleSync);
    const syncTimer = setInterval(syncData, 5000);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cloud-sync', handleSync);
      clearInterval(syncTimer);
    };
  }, [currentTab]);

  // Report Download Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDateRange, setReportDateRange] = useState('all');
  const [reportCustomStart, setReportCustomStart] = useState('');
  const [reportCustomEnd, setReportCustomEnd] = useState('');
  const [reportIncludeUsers, setReportIncludeUsers] = useState(true);
  const [reportIncludeRecharges, setReportIncludeRecharges] = useState(true);
  const [reportIncludeWithdrawals, setReportIncludeWithdrawals] = useState(true);

  // PDF Report Generator
  const handleGeneratePdfReport = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let startFilter = null;
      let endFilter = null;
      const today = new Date();

      if (reportDateRange === 'today') {
        const todayStr = today.toISOString().slice(0, 10);
        startFilter = todayStr;
        endFilter = todayStr;
      } else if (reportDateRange === 'yesterday') {
        const yest = new Date(Date.now() - 86400000);
        startFilter = yest.toISOString().slice(0, 10);
        endFilter = yest.toISOString().slice(0, 10);
      } else if (reportDateRange === 'last7') {
        const d7 = new Date(Date.now() - 7 * 86400000);
        startFilter = d7.toISOString().slice(0, 10);
        endFilter = today.toISOString().slice(0, 10);
      } else if (reportDateRange === 'thisMonth') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startFilter = firstDay.toISOString().slice(0, 10);
        endFilter = today.toISOString().slice(0, 10);
      } else if (reportDateRange === 'custom') {
        startFilter = reportCustomStart || null;
        endFilter = reportCustomEnd || null;
      }

      // Filter Recharges
      const filteredRecharges = recharges.filter((r) => {
        if (!startFilter && !endFilter) return true;
        const d = (r.date || '').slice(0, 10);
        if (startFilter && d < startFilter) return false;
        if (endFilter && d > endFilter) return false;
        return true;
      });

      // Filter Withdrawals
      const filteredWithdrawals = withdrawals.filter((w) => {
        if (!startFilter && !endFilter) return true;
        const d = (w.date || '').slice(0, 10);
        if (startFilter && d < startFilter) return false;
        if (endFilter && d > endFilter) return false;
        return true;
      });

      // Filter Users
      const filteredUsers = users.filter((u) => {
        if (!startFilter && !endFilter) return true;
        const d = (u.joined || '').slice(0, 10);
        if (startFilter && d < startFilter) return false;
        if (endFilter && d > endFilter) return false;
        return true;
      });

      const totalApprovedRecharge = filteredRecharges
        .filter((r) => r.status === 'approved')
        .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

      const totalApprovedWithdraw = filteredWithdrawals
        .filter((w) => w.status === 'approved')
        .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

      // Header Banner
      doc.setFillColor(5, 19, 45); // #05132d
      doc.rect(0, 0, 210, 35, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('NextTask', 14, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 210, 255);
      doc.text('PLATFORM FINANCIAL & AUDIT REPORT', 14, 25);

      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      const generatedAt = new Date().toLocaleString();
      doc.text(`Generated: ${generatedAt}`, 130, 18);
      const rangeText = (startFilter || endFilter) ? `Date Range: ${startFilter || 'Earliest'} to ${endFilter || 'Latest'}` : 'Date Range: All Time';
      doc.text(rangeText, 130, 25);

      // Summary Card Grid
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Executive Summary', 14, 43);

      doc.setFillColor(245, 248, 255);
      doc.roundedRect(14, 46, 42, 20, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL RECHARGES', 18, 52);
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129); // green
      doc.text(`${totalApprovedRecharge.toFixed(2)}`, 18, 61);

      doc.setFillColor(245, 248, 255);
      doc.roundedRect(62, 46, 42, 20, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL WITHDRAWALS', 66, 52);
      doc.setFontSize(12);
      doc.setTextColor(244, 63, 94); // rose
      doc.text(`${totalApprovedWithdraw.toFixed(2)}`, 66, 61);

      doc.setFillColor(245, 248, 255);
      doc.roundedRect(110, 46, 42, 20, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('NET BALANCE', 114, 52);
      doc.setFontSize(12);
      doc.setTextColor(14, 165, 233); // sky
      doc.text(`${(totalApprovedRecharge - totalApprovedWithdraw).toFixed(2)}`, 114, 61);

      doc.setFillColor(245, 248, 255);
      doc.roundedRect(158, 46, 38, 20, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('USERS IN RANGE', 162, 52);
      doc.setFontSize(12);
      doc.setTextColor(99, 102, 241); // indigo
      doc.text(`${filteredUsers.length}`, 162, 61);

      let currentY = 74;

      // Section 1: Recharges
      if (reportIncludeRecharges) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Recharges Report (${filteredRecharges.length} records)`, 14, currentY);

        const rechargeBody = filteredRecharges.map((r) => [
          (r.date || '').slice(0, 16),
          String(r.user || r.userId || 'User'),
          String(r.senderAccount || r.user || '—'),
          `${r.method || 'USDT'} (${r.network || 'TRC20'})`,
          String(r.trxId || '—'),
          `${parseFloat(r.amount || 0).toFixed(2)}`,
          String(r.status || 'pending').toUpperCase()
        ]);

        autoTable(doc, {
          startY: currentY + 3,
          head: [['Date', 'User / Email', 'Sender Phone/Acct', 'Gateway', 'TrxID', 'Amount', 'Status']],
          body: rechargeBody.length > 0 ? rechargeBody : [['No recharge records found in selected range', '', '', '', '', '', '']],
          theme: 'striped',
          headStyles: { fillColor: [5, 19, 45], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            currentY = data.cursor.y;
          }
        });

        currentY = doc.lastAutoTable.finalY + 12;
      }

      // Section 2: Withdrawals
      if (reportIncludeWithdrawals) {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Withdrawals Report (${filteredWithdrawals.length} records)`, 14, currentY);

        const withdrawBody = filteredWithdrawals.map((w) => [
          (w.date || '').slice(0, 16),
          String(w.user || w.userId || 'User'),
          String(w.method || 'USDT'),
          String(w.account || w.address || '—'),
          `${parseFloat(w.amount || 0).toFixed(2)}`,
          String(w.status || 'pending').toUpperCase()
        ]);

        autoTable(doc, {
          startY: currentY + 3,
          head: [['Date', 'User / Email', 'Method', 'Withdrawal Account / Address', 'Amount', 'Status']],
          body: withdrawBody.length > 0 ? withdrawBody : [['No withdrawal records found in selected range', '', '', '', '', '']],
          theme: 'striped',
          headStyles: { fillColor: [13, 33, 70], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            currentY = data.cursor.y;
          }
        });

        currentY = doc.lastAutoTable.finalY + 12;
      }

      // Section 3: Registered Users
      if (reportIncludeUsers) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Registered Users (${filteredUsers.length} accounts)`, 14, currentY);

        const usersBody = filteredUsers.map((u) => [
          String(u.id || ''),
          String(u.name || 'User'),
          String(u.email || u.phone || ''),
          String(u.vip || 'VIP0'),
          `${parseFloat(u.balance || 0).toFixed(2)}`,
          `${parseFloat(u.recharge || 0).toFixed(2)}`,
          String(u.myInviteCode || u.inviteCode || ''),
          String(u.referredBy || '—'),
          String(u.joined || '').slice(0, 10)
        ]);

        autoTable(doc, {
          startY: currentY + 3,
          head: [['UID', 'Name', 'Email / Phone', 'VIP', 'Balance', 'Total Deposit', 'My Code', 'Referred By', 'Joined']],
          body: usersBody.length > 0 ? usersBody : [['No user accounts found in selected range', '', '', '', '', '', '', '', '']],
          theme: 'striped',
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
          margin: { left: 14, right: 14 }
        });
      }

      // Save PDF
      const filenameDate = (startFilter || 'all') + (endFilter ? `_to_${endFilter}` : '');
      doc.save(`NextTask_Report_${filenameDate}.pdf`);
      showToast('PDF Report downloaded successfully!');
      setShowReportModal(false);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showToast('Error generating PDF: ' + (err?.message || err));
    }
  };

  // Search & Filter State
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Modals
  const [showVipModal, setShowVipModal] = useState(false);
  const [editingVip, setEditingVip] = useState(null);
  const [vipForm, setVipForm] = useState({
    level: '',
    deposit: '',
    tasks: 10,
    days: 20,
    profitPercent: 80,
    interest: '',
    daily: '',
    total: '',
    logo: ''
  });

  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({
    image: '',
    badge: '',
    amount: '',
    subtitle: '',
    gradient: 'default',
    description: ''
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: 'bKash',
    type: 'Personal',
    number: '',
    rate: 125,
    logo: '/logos/bkash.svg',
    active: true,
    instructions: 'Please Send Money and enter TrxID below'
  });

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState('add'); // 'add' | 'subtract'

  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Sync helpers
  const updateVips = async (newVips) => {
    setVipTiers(newVips);
    await setStoredData('vips', newVips);
  };

  const updateUsers = async (newUsers) => {
    setUsers(newUsers);
    await setStoredData('users', newUsers);
  };

  const updateRecharges = async (newRec) => {
    setRecharges(newRec);
    await setStoredData('recharges', newRec);
  };

  const updateWithdrawals = async (newWth) => {
    setWithdrawals(newWth);
    await setStoredData('withdrawals', newWth);
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    await setStoredData('settings', newSettings);
    showToast('Platform settings updated successfully!');
  };

  const updateSlides = async (newSlides) => {
    setSlides(newSlides);
    await setStoredData('slides', newSlides);
  };

  const updatePaymentMethods = async (newMethods) => {
    setPaymentMethods(newMethods);
    await setStoredData('payments', newMethods);
  };

  const updateSupportChannels = async (newChannels) => {
    setSupportChannels(newChannels);
    await setStoredData('support_channels', newChannels);
  };

  const handleOpenAddSupportChannel = () => {
    setEditingSupportChannel(null);
    setSupportForm({ name: '', type: 'telegram', link: '', active: true });
    setShowSupportModal(true);
  };

  const handleOpenEditSupportChannel = (ch) => {
    setEditingSupportChannel(ch);
    setSupportForm({ name: ch.name || '', type: ch.type || 'telegram', link: ch.link || '', active: ch.active !== false });
    setShowSupportModal(true);
  };

  const handleSaveSupportChannel = (e) => {
    e.preventDefault();
    if (!supportForm.name.trim() || !supportForm.link.trim()) {
      showToast('Please provide channel name and link or number', 'error');
      return;
    }
    if (editingSupportChannel) {
      const updated = supportChannels.map((c) => (c.id === editingSupportChannel.id ? { ...c, ...supportForm } : c));
      updateSupportChannels(updated);
      showToast('Support channel updated successfully!');
    } else {
      const newCh = {
        id: 'sup_' + Date.now(),
        ...supportForm
      };
      updateSupportChannels([...supportChannels, newCh]);
      showToast('Support channel added successfully!');
    }
    setShowSupportModal(false);
  };

  const handleDeleteSupportChannel = (id, name) => {
    if (window.confirm(`Delete support channel "${name}"?`)) {
      const filtered = supportChannels.filter((c) => c.id !== id);
      updateSupportChannels(filtered);
      showToast('Support channel removed');
    }
  };

  const handleToggleSupportChannel = (id) => {
    const updated = supportChannels.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    updateSupportChannels(updated);
    const target = updated.find((c) => c.id === id);
    showToast(`Channel "${target.name}" is now ${target.active ? 'Active' : 'Inactive'}`);
  };

  const handleExecutiveAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const newSettings = { ...settings, supportExecutiveAvatar: dataUrl };
        setSettings(newSettings);
        updateSettings(newSettings);
        showToast('Support executive avatar updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestoreDefaultSupportAvatar = () => {
    const newSettings = { ...settings, supportExecutiveAvatar: '' };
    setSettings(newSettings);
    updateSettings(newSettings);
    showToast('Default call center executive avatar restored!');
  };

  // --- TELEGRAM 24/7 AI BOT HANDLERS ---
  const [telegramSettingStatus, setTelegramSettingStatus] = useState('');
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [isTestingBot, setIsTestingBot] = useState(false);

  const handleConnectTelegramWebhook = async () => {
    if (!settings.telegramBotToken) {
      showToast('Please enter Telegram Bot Token first', 'error');
      return;
    }
    setIsSettingWebhook(true);
    setTelegramSettingStatus('Connecting webhook to Telegram...');
    try {
      const res = await fetch('/api/telegram/set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: settings.telegramBotToken })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('Telegram Bot Webhook connected successfully!');
        setTelegramSettingStatus('✅ Webhook Active: ' + (data.webhookUrl || 'Connected'));
      } else {
        const err = data?.telegramResponse?.description || data?.error || 'Failed to connect webhook';
        showToast(err, 'error');
        setTelegramSettingStatus('❌ ' + err);
      }
    } catch (err) {
      showToast('Connection error: ' + err.message, 'error');
      setTelegramSettingStatus('❌ Connection error');
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleTestTelegramBot = async () => {
    if (!settings.telegramBotToken) {
      showToast('Please enter Telegram Bot Token', 'error');
      return;
    }
    if (!settings.telegramAdminChatId) {
      showToast('Please enter Admin Chat ID to receive test message', 'error');
      return;
    }
    setIsTestingBot(true);
    try {
      const res = await fetch('/api/telegram/test-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: settings.telegramBotToken,
          chatId: settings.telegramAdminChatId
        })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('Test message sent to your Telegram!');
      } else {
        const err = data?.telegramResponse?.description || data?.error || 'Test failed';
        showToast(err, 'error');
      }
    } catch (err) {
      showToast('Test error: ' + err.message, 'error');
    } finally {
      setIsTestingBot(false);
    }
  };

  // --- PAYMENT METHOD HANDLERS (bKash / Nagad / Rocket / USDT) ---
  const handleUpdateGatewayMode = async (mode) => {
    const updatedSettings = {
      ...settings,
      paymentGatewayMode: mode
    };
    setSettings(updatedSettings);
    await updateSettings(updatedSettings);
    showToast(`Deposit mode updated to: ${mode === 'automated' ? 'Automated P2P SMS Bot' : 'Manual Review (Default)'}`);
  };

  const handleTogglePaymentActive = (id) => {
    const updated = paymentMethods.map((pm) => {
      if (pm.id === id) {
        const nextActive = !pm.active;
        showToast(`${pm.method} is now ${nextActive ? 'Active' : 'Disabled'}`);
        return { ...pm, active: nextActive };
      }
      return pm;
    });
    updatePaymentMethods(updated);
  };

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({
      method: 'bKash',
      type: 'Personal',
      number: '',
      rate: 125,
      logo: '/logos/bkash.svg',
      active: true,
      instructions: 'Please Send Money and enter TrxID below'
    });
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (pm) => {
    setEditingPayment(pm);
    setPaymentForm({
      ...pm,
      logo: pm.logo || getPaymentLogo(pm)
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!paymentForm.method || !paymentForm.number) {
      showToast('Payment method name and phone/address are required');
      return;
    }

    if (editingPayment) {
      const updated = paymentMethods.map((p) =>
        p.id === editingPayment.id ? { ...paymentForm, id: p.id } : p
      );
      updatePaymentMethods(updated);
      showToast(`${paymentForm.method} updated successfully!`);
    } else {
      const newMethod = {
        ...paymentForm,
        id: `pm_${Date.now()}`
      };
      updatePaymentMethods([...paymentMethods, newMethod]);
      showToast(`New payment method ${paymentForm.method} added!`);
    }
    setShowPaymentModal(false);
  };

  const handleDeletePayment = (id, method) => {
    if (confirm(`Are you sure you want to delete payment method ${method}?`)) {
      const filtered = paymentMethods.filter((p) => p.id !== id);
      updatePaymentMethods(filtered);
      showToast(`${method} deleted`);
    }
  };

  // --- SLIDE CRUD HANDLERS ---
  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      image: '',
      badge: '',
      amount: '',
      subtitle: '',
      gradient: 'default',
      description: ''
    });
    setShowSlideModal(true);
  };

  const handleOpenEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideForm({
      image: slide.image || '',
      badge: slide.badge || '',
      amount: slide.amount || '',
      subtitle: slide.subtitle || '',
      gradient: slide.gradient || 'default',
      description: slide.description || ''
    });
    setShowSlideModal(true);
  };

  const handleSaveSlide = (e) => {
    e.preventDefault();
    if (!slideForm.image && !slideForm.amount && !slideForm.subtitle) {
      showToast('Please upload a photo banner or enter text details');
      return;
    }

    const payload = {
      ...slideForm,
      gradient: slideForm.gradient || 'default',
      amount: slideForm.amount || '',
      subtitle: slideForm.subtitle || ''
    };

    if (editingSlide) {
      const updated = slides.map((s) => (s.id === editingSlide.id ? { ...payload, id: s.id } : s));
      updateSlides(updated);
      showToast('Slide banner updated!');
    } else {
      const newSlide = {
        ...payload,
        id: `s_${Date.now()}`
      };
      updateSlides([...slides, newSlide]);
      showToast('New slide banner added!');
    }
    setShowSlideModal(false);
  };

  const handleDeleteSlide = (id) => {
    if (confirm('Are you sure you want to delete this slide banner?')) {
      const filtered = slides.filter((s) => s.id !== id);
      updateSlides(filtered);
      showToast('Slide banner deleted');
    }
  };

  // --- VIP CRUD HANDLERS ---
  const handleVipFormChange = (field, value) => {
    setVipForm((prev) => {
      const next = { ...prev, [field]: value };
      const dep = parseFloat(String(field === 'deposit' ? value : next.deposit).replace(/,/g, '')) || 0;
      const profitPct = parseFloat(field === 'profitPercent' ? value : next.profitPercent) || 0;
      const tasks = parseInt(field === 'tasks' ? value : next.tasks) || 5;
      const days = parseInt(field === 'days' ? value : next.days) || 20;

      if (field === 'deposit' || field === 'profitPercent') {
        if (dep > 0 && profitPct > 0) {
          const totalReturn = dep * (1 + profitPct / 100);
          const dailyProfit = days > 0 ? (totalReturn / days) : 0;
          const rewardPerTask = tasks > 0 ? (dailyProfit / tasks) : 0;
          next.total = totalReturn.toFixed(2);
          next.daily = dailyProfit.toFixed(2);
          next.interest = rewardPerTask.toFixed(2);
        }
      } else if (field === 'daily') {
        const daily = parseFloat(value) || 0;
        next.interest = tasks > 0 ? (daily / tasks).toFixed(2) : '0.00';
        next.total = (daily * days).toFixed(2);
      } else if (field === 'days') {
        const daily = parseFloat(next.daily) || 0;
        next.total = (daily * days).toFixed(2);
      } else if (field === 'tasks') {
        const daily = parseFloat(next.daily) || 0;
        next.interest = tasks > 0 ? (daily / tasks).toFixed(2) : '0.00';
      }

      return next;
    });
  };

  const handleOpenAddVip = () => {
    setEditingVip(null);
    const nextNum = vipTiers.length + 1;
    const dep = 1000.00;
    const profitPct = 80;
    const days = 20;
    const total = (dep * (1 + profitPct / 100)).toFixed(2);
    const daily = (parseFloat(total) / days).toFixed(2);
    const tasks = 5;
    const interest = (parseFloat(daily) / tasks).toFixed(2);
    setVipForm({
      level: `VIP${nextNum}`,
      deposit: dep.toFixed(2),
      tasks: tasks,
      days: days,
      profitPercent: profitPct,
      interest: interest,
      daily: daily,
      total: total,
      logo: ''
    });
    setShowVipModal(true);
  };

  const handleOpenEditVip = (vip) => {
    setEditingVip(vip);
    const dep = parseFloat(String(vip.deposit || 0).replace(/,/g, '')) || 0;
    const isStarter = dep === 0 || String(vip.level || '').toLowerCase().includes('starter');
    const profitPct = vip.profitPercent !== undefined ? parseFloat(vip.profitPercent) : (isStarter ? 0 : 80);
    const days = vip.days ? parseInt(vip.days) : (isStarter ? 7 : 20);
    const tasks = vip.tasks ? parseInt(vip.tasks) : 5;
    const total = vip.total || (isStarter ? '140.00' : (dep * (1 + profitPct / 100)).toFixed(2));
    const daily = vip.daily || (isStarter ? '20.00' : (parseFloat(total) / days).toFixed(2));
    const interest = vip.interest || (tasks > 0 ? (parseFloat(daily) / tasks).toFixed(2) : '0.00');

    setVipForm({
      level: vip.level,
      deposit: vip.deposit,
      tasks: tasks,
      days: days,
      profitPercent: profitPct,
      interest: interest,
      daily: daily,
      total: total,
      logo: vip.logo || ''
    });
    setShowVipModal(true);
  };

  const handleSaveVip = (e) => {
    e.preventDefault();
    if (!vipForm.level || vipForm.deposit === undefined || vipForm.deposit === null || String(vipForm.deposit).trim() === '') {
      showToast('Level name and deposit amount are required');
      return;
    }
    const dep = parseFloat(String(vipForm.deposit).replace(/,/g, '')) || 0;
    const isStarter = dep === 0 || String(vipForm.level || '').toLowerCase().includes('starter');
    const days = parseInt(vipForm.days) || (isStarter ? 7 : 20);
    const profitPercent = parseFloat(vipForm.profitPercent) || 0;
    const tasks = parseInt(vipForm.tasks) || 5;
    const daily = vipForm.daily && String(vipForm.daily).trim() ? String(vipForm.daily) : (isStarter ? '20.00' : (days > 0 ? (parseFloat(total) / days).toFixed(2) : '0.00'));
    const total = vipForm.total && String(vipForm.total).trim() ? String(vipForm.total) : (isStarter ? '140.00' : (parseFloat(daily) * days).toFixed(2));
    const interest = vipForm.interest && String(vipForm.interest).trim() ? String(vipForm.interest) : (tasks > 0 ? (parseFloat(daily) / tasks).toFixed(2) : '0.00');

    const payload = {
      ...vipForm,
      days,
      profitPercent,
      tasks,
      total,
      daily,
      interest,
      logo: vipForm.logo || (editingVip?.logo ? editingVip.logo : '')
    };

    if (editingVip) {
      const oldLevel = editingVip.level;
      const newLevel = (vipForm.level || '').trim();

      // If the VIP level name has changed, auto-update everywhere:
      if (oldLevel && newLevel && oldLevel !== newLevel) {
        // 1. Update all users whose vip === oldLevel
        const allUsers = getStoredData('users', DEFAULT_USERS);
        const updatedUsers = allUsers.map((u) => (u.vip === oldLevel ? { ...u, vip: newLevel } : u));
        updateUsers(updatedUsers);

        // 2. Update currentUser in localStorage
        try {
          const rawCur = localStorage.getItem('nt_currentUser');
          if (rawCur) {
            const cur = JSON.parse(rawCur);
            if (cur && cur.vip === oldLevel) {
              cur.vip = newLevel;
              localStorage.setItem('nt_currentUser', JSON.stringify(cur));
            }
          }
        } catch (e) {}

        // 3. Update recharges notes
        const allRecharges = getStoredData('recharges', []);
        const updatedRecs = allRecharges.map((r) => {
          if (r.note && r.note.includes(oldLevel)) {
            return { ...r, note: r.note.replace(new RegExp(oldLevel, 'g'), newLevel) };
          }
          return r;
        });
        setStoredData('recharges', updatedRecs);
      }

      const updated = vipTiers.map((v) => {
        if ((v.id && editingVip.id && String(v.id) === String(editingVip.id)) || v.level === editingVip.level) {
          return { ...payload, id: v.id || editingVip.id || String(Date.now()), level: newLevel };
        }
        return v;
      });
      updateVips(updated);
      showToast(`${newLevel} updated successfully! Name, logo, and validity saved.`);
    } else {
      const newVip = {
        ...payload,
        id: String(Date.now())
      };
      updateVips([...vipTiers, newVip]);
      showToast(`New ${vipForm.level} added successfully!`);
    }
    setShowVipModal(false);
  };

  const handleDeleteVip = (id, level) => {
    if (confirm(`Are you sure you want to delete ${level}?`)) {
      const filtered = vipTiers.filter((v) => (id && v.id ? String(v.id) !== String(id) : v.level !== level));
      updateVips(filtered);
      showToast(`${level} deleted`);
    }
  };

  // --- USER HANDLERS ---
  const handleChangeUserVip = (id, newVip) => {
    const matchedTier = vipTiers.find((v) => v.level === newVip);
    const durationDays = matchedTier?.days ? parseInt(matchedTier.days) : 20;
    const now = Date.now();
    const expiresAt = now + durationDays * 86400000;
    const updated = users.map((u) => {
      if (u.id === id) {
        showToast(`User ${u.email} VIP set to ${newVip} (${durationDays} Days validity)`);
        return {
          ...u,
          vip: newVip,
          vipActivatedAt: now,
          vipDurationDays: durationDays,
          vipExpiresAt: expiresAt,
          capitalReleased: false
        };
      }
      return u;
    });
    updateUsers(updated);

    // Record Upgrade Log on manual admin change
    const targetUser = users.find((u) => u.id === id);
    if (targetUser && (targetUser.vip || 'VIP0') !== newVip) {
      recordUpgradeLog({
        userId: targetUser.id,
        user: targetUser.name || targetUser.phone || targetUser.email || 'User',
        userIdentifier: (targetUser.phone || targetUser.email || 'Member').replace(/(\d{3})\d{4,}(\d{2})/, '$1****$2'),
        fromVip: targetUser.vip || 'VIP0',
        toVip: newVip,
        amount: 0,
        type: (targetUser.vip || 'VIP0') === 'VIP0' ? 'Admin Unlock' : 'Admin Upgrade'
      });
    }
  };

  const handleLoginAsUser = (targetUser) => {
    if (!targetUser) return;
    try {
      localStorage.setItem('nt_currentUser', JSON.stringify(targetUser));
      window.dispatchEvent(new Event('storage'));
      showToast(`Logging in as ${targetUser.name || targetUser.email || targetUser.id}...`);
      setTimeout(() => {
        if (typeof onNavigateToApp === 'function') {
          onNavigateToApp();
        } else {
          window.location.href = '/me';
        }
      }, 250);
    } catch (err) {
      console.error('Login as user error:', err);
      showToast('Error logging in as user: ' + (err?.message || err));
    }
  };

  const handleToggleBanUser = (id) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === 'active' ? 'banned' : 'active';
        showToast(`User ${u.email} is now ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    updateUsers(updated);
  };

  const handleDeleteUser = async (id, email) => {
    const targetUser = users.find((u) => (id && u.id === id) || (email && u.email === email));
    const userLabel = email || targetUser?.phone || targetUser?.name || id;

    if (userLabel === 'admin@nexttask.online') {
      showToast('Master Admin account cannot be deleted');
      return;
    }

    if (!confirm(`Permanently delete user ${userLabel} and ALL associated data (recharges, withdrawals, tasks, earnings, records)?\n\nThis action cannot be undone.`)) {
      return;
    }

    // 1. Gather all identifiers of the target user
    const userKeys = new Set();
    if (id) userKeys.add(String(id).toLowerCase().trim());
    if (email) userKeys.add(String(email).toLowerCase().trim());
    if (targetUser) {
      if (targetUser.id) userKeys.add(String(targetUser.id).toLowerCase().trim());
      if (targetUser.email) userKeys.add(String(targetUser.email).toLowerCase().trim());
      if (targetUser.phone) userKeys.add(String(targetUser.phone).toLowerCase().trim());
      if (targetUser.name) userKeys.add(String(targetUser.name).toLowerCase().trim());
      if (targetUser.myInviteCode) userKeys.add(String(targetUser.myInviteCode).toLowerCase().trim());
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
      ].filter(Boolean).map((v) => String(v).toLowerCase().trim());
      return candidates.some((c) => userKeys.has(c));
    };

    // 2. Filter out user from users list
    const filteredUsers = users.filter((u) => !userKeys.has(String(u.id || '').toLowerCase().trim()) && !userKeys.has(String(u.email || '').toLowerCase().trim()));
    setUsers(filteredUsers);
    await updateUsers(filteredUsers);

    // 3. Permanently remove all recharge records of this user
    const filteredRecharges = recharges.filter((r) => !isMatch(r));
    setRecharges(filteredRecharges);
    await updateRecharges(filteredRecharges);

    // 4. Permanently remove all withdrawal records of this user
    const filteredWithdrawals = withdrawals.filter((w) => !isMatch(w));
    setWithdrawals(filteredWithdrawals);
    await updateWithdrawals(filteredWithdrawals);

    // 5. Permanently remove all task records of this user
    try {
      const allTasks = getStoredData('task_records', []);
      const filteredTasks = allTasks.filter((t) => !isMatch(t));
      await setStoredData('task_records', filteredTasks);
    } catch (e) {}

    // 6. Permanently remove all notifications for this user
    try {
      const allNotifs = getStoredData('notifications', []);
      const filteredNotifs = allNotifs.filter((n) => !isMatch(n));
      await setStoredData('notifications', filteredNotifs);
    } catch (e) {}

    // 7. Permanently remove upgrade/referral logs of this user
    try {
      const allLogs = getStoredData('upgrade_logs', []);
      const filteredLogs = allLogs.filter((l) => !isMatch(l));
      await setStoredData('upgrade_logs', filteredLogs);
    } catch (e) {}

    // 8. Call Cloud API endpoint for atomic server-side purge in D1
    try {
      fetch('/api/delete-user', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: id || targetUser?.id,
          email: email || targetUser?.email,
          phone: targetUser?.phone
        })
      }).catch((e) => console.warn('Server delete call error:', e));
    } catch (e) {}

    // 9. Clean up any user-specific localStorage entries
    if (typeof window !== 'undefined') {
      try {
        const prefixes = [id, email, targetUser?.phone].filter(Boolean);
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && prefixes.some((p) => k.includes(p))) {
            localStorage.removeItem(k);
          }
        }
      } catch (e) {}
    }

    showToast(`User ${userLabel} and all associated records permanently deleted!`);
  };

  const handleAdjustBalance = (e) => {
    e.preventDefault();
    const num = parseFloat(balanceAmount);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid positive number');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === selectedUserForBalance.id) {
        const newBalance = balanceAction === 'add' ? u.balance + num : Math.max(0, u.balance - num);
        return { ...u, balance: parseFloat(newBalance.toFixed(2)) };
      }
      return u;
    });

    updateUsers(updated);
    showToast(`Updated balance for ${selectedUserForBalance.email}`);
    setShowBalanceModal(false);
    setBalanceAmount('');
  };

  // Notification Helper for User Mailbox
  const addNotification = (userKey, title, message, type) => {
    try {
      const allNotifs = getStoredData('notifications', []);
      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: String(userKey || 'all'),
        title,
        message,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        read: false,
        type
      };
      setStoredData('notifications', [newNotif, ...allNotifs]);
    } catch (e) {
      console.warn('Notification save error:', e);
    }
  };

  // --- RECHARGE APPROVALS ---
  const handleApproveRecharge = (rec) => {
    // 1. Mark recharge as approved
    const updatedRecs = recharges.map((r) => (r.id === rec.id ? { ...r, status: 'approved' } : r));
    updateRecharges(updatedRecs);

    const targetUser = users.find((u) =>
      (rec.userId && String(u.id) === String(rec.userId)) ||
      (rec.userEmail && String(u.email).toLowerCase() === String(rec.userEmail).toLowerCase()) ||
      (rec.userPhone && String(u.phone) === String(rec.userPhone)) ||
      (rec.user && (
        String(u.email).toLowerCase() === String(rec.user).toLowerCase() ||
        String(u.phone) === String(rec.user) ||
        String(u.name).toLowerCase() === String(rec.user).toLowerCase()
      ))
    );

    const commRate = typeof settings?.referralCommissionRate === 'number' && settings.referralCommissionRate >= 0
      ? settings.referralCommissionRate
      : (parseFloat(settings?.referralCommissionRate) || 10);
    const commissionAmount = parseFloat(((rec.amount || 0) * (commRate / 100)).toFixed(2));
    let referrerCredited = false;
    let referrerName = '';

    const isReferrerMatch = (child, parent) => {
      if (!child || !parent || !child.referredBy) return false;
      if (String(child.id) === String(parent.id)) return false;
      const refClean = String(child.referredBy).trim().toUpperCase();
      const parentCodes = [
        parent.myInviteCode,
        parent.inviteCode,
        parent.id,
        parent.phone,
        parent.email
      ].filter(Boolean).map((s) => String(s).trim().toUpperCase());
      return parentCodes.includes(refClean) || isReferredByUser(child, parent);
    };

    // 2. Credit user's balance and recharge total, auto-upgrade VIP level and credit referrer commission
    const updatedUsers = users.map((u) => {
      const isMatch = targetUser && String(u.id) === String(targetUser.id);

      if (isMatch) {
        const newRecharge = parseFloat(((u.recharge || 0) + rec.amount).toFixed(2));

        let newVip = u.vip || 'Starter Package';
        let matchedTier = null;
        for (const tier of vipTiers) {
          const reqDeposit = parseFloat(tier.deposit.toString().replace(/,/g, '')) || 0;
          if (newRecharge >= reqDeposit && reqDeposit > 0) {
            newVip = tier.level;
            matchedTier = tier;
          }
        }
        const durationDays = matchedTier?.days ? parseInt(matchedTier.days) : 20;
        const now = Date.now();
        const expiresAt = now + durationDays * 86400000;

        const prevLevel = u.vip || 'Starter Package';
        let pendingUpgradeData = u.pendingUpgrade || null;
        let userCompletedTasks = u.completedTasks || {};

        if (newVip !== prevLevel) {
          const todayDate = new Date().toISOString().slice(0, 10);
          const todayDone = (userCompletedTasks && Array.isArray(userCompletedTasks[todayDate])) ? userCompletedTasks[todayDate] : [];
          const prevTier = vipTiers.find((v) => v && (v.level === prevLevel || v.id === prevLevel)) || vipTiers[0];
          const prevMax = prevTier?.tasks || 10;

          if (todayDone.length > 0 && todayDone.length < prevMax) {
            pendingUpgradeData = {
              date: todayDate,
              activeTierLevel: prevLevel,
              targetTierLevel: newVip,
              previousMaxTasks: prevMax
            };
          } else if (todayDone.length >= prevMax) {
            userCompletedTasks = { ...userCompletedTasks, [todayDate]: [] };
            pendingUpgradeData = null;
          }
        }

        let activePackages = Array.isArray(u.activePackages) ? [...u.activePackages] : [];
        if (matchedTier) {
          const tasksCount = parseInt(matchedTier.tasks) || 5;
          activePackages.push({
            instanceId: `pkg_${matchedTier.id || Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            packId: matchedTier.id,
            level: matchedTier.level,
            deposit: matchedTier.deposit,
            daily: matchedTier.daily,
            interest: matchedTier.interest || (parseFloat(matchedTier.daily) / tasksCount).toFixed(2),
            tasks: tasksCount,
            days: durationDays,
            activatedAt: now,
            expiresAt: expiresAt,
            logo: matchedTier.logo || '',
            isStarter: false
          });
        }

        return {
          ...u,
          recharge: newRecharge,
          vip: newVip,
          vipActivatedAt: now,
          vipDurationDays: durationDays,
          vipExpiresAt: expiresAt,
          activePackages,
          capitalReleased: false,
          pendingUpgrade: pendingUpgradeData,
          completedTasks: userCompletedTasks
        };
      }

      // Check if this user is the referrer of targetUser
      if (targetUser && isReferrerMatch(targetUser, u) && commissionAmount > 0) {
        referrerCredited = true;
        referrerName = u.name || u.phone || u.email || u.myInviteCode || 'Referrer';
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
    updateUsers(updatedUsers);

    if (referrerCredited && commissionAmount > 0) {
      showToast(`Recharge of ৳${rec.amount} approved! ৳${commissionAmount} (${commRate}%) commission credited to referrer ${referrerName}.`);
    } else {
      showToast(`Recharge of ৳${rec.amount} approved!`);
    }

    // Record Upgrade Log if VIP tier changed
    if (targetUser) {
      const oldVip = targetUser.vip || 'VIP0';
      const updatedTarget = updatedUsers.find((u) => String(u.id) === String(targetUser.id));
      if (updatedTarget && updatedTarget.vip !== oldVip) {
        recordUpgradeLog({
          userId: targetUser.id,
          user: targetUser.name || targetUser.phone || targetUser.email || 'User',
          userIdentifier: (targetUser.phone || targetUser.email || 'Member').replace(/(\d{3})\d{4,}(\d{2})/, '$1****$2'),
          fromVip: oldVip,
          toVip: updatedTarget.vip,
          amount: rec.amount,
          type: oldVip === 'VIP0' ? 'Unlock' : 'Upgrade'
        });
      }
    }

    // Record commission transaction
    if (referrerCredited && commissionAmount > 0) {
      const commissionRecord = {
        id: `COM-${Date.now()}`,
        userId: targetUser?.referredBy,
        user: referrerName,
        senderAccount: targetUser?.name || targetUser?.email || targetUser?.phone || 'Team Member',
        amount: commissionAmount,
        method: 'Referral Bonus',
        network: 'Commission',
        trxId: `COMM-DEP-${Date.now().toString().slice(-6)}`,
        status: 'approved',
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        note: `10% referral commission from ${targetUser?.name || targetUser?.id} deposit of $${rec.amount}`
      };
      setStoredData('recharges', [commissionRecord, ...updatedRecs]);
      addNotification(targetUser?.referredBy || referrerName, 'Referral Commission Credited', `You earned $${commissionAmount} USDT commission from ${targetUser?.name || targetUser?.id}'s deposit!`, 'commission');
    }

    addNotification(rec.userId || rec.user, 'Recharge & VIP Activated', `Your recharge of ${rec.amount} USDT has been approved and added to Recharge Amount. VIP status is active with deposit locked as principal capital. Complete daily tasks to earn withdrawable profit!`, 'recharge');
    showToast(`Recharge of ${rec.amount} approved for ${rec.user}!${referrerCredited ? ' (10% commission credited to inviter)' : ''}`);
  };

  const handleRejectRecharge = (id) => {
    const updatedRecs = recharges.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r));
    updateRecharges(updatedRecs);
    addNotification(id, 'Recharge Rejected', `Your recharge request of ${id} was rejected. Please verify transaction ID or contact support.`, 'recharge');
    showToast(`Recharge ${id} rejected`);
  };

  // --- WITHDRAWAL APPROVALS ---
  const handleApproveWithdrawal = (id, user, amount) => {
    const updatedWth = withdrawals.map((w) => (w.id === id ? { ...w, status: 'approved' } : w));
    updateWithdrawals(updatedWth);
    addNotification(user, 'Withdrawal Completed', `Your withdrawal request of ${amount} USDT has been approved and processed.`, 'withdraw');
    showToast(`Withdrawal of ${amount} approved for ${user}`);
  };

  const handleRejectWithdrawal = (wth) => {
    // 1. Mark rejected
    const updatedWth = withdrawals.map((w) => (w.id === wth.id ? { ...w, status: 'rejected' } : w));
    updateWithdrawals(updatedWth);

    // 2. Refund balance back to user
    const updatedUsers = users.map((u) => {
      const isMatch =
        (wth.userId && String(u.id) === String(wth.userId)) ||
        (wth.userEmail && String(u.email).toLowerCase() === String(wth.userEmail).toLowerCase()) ||
        (wth.userPhone && String(u.phone) === String(wth.userPhone)) ||
        (wth.user && (
          String(u.email).toLowerCase() === String(wth.user).toLowerCase() ||
          String(u.phone) === String(wth.user) ||
          String(u.name).toLowerCase() === String(wth.user).toLowerCase()
        ));

      if (isMatch) {
        return { ...u, balance: parseFloat(((u.balance || 0) + wth.amount).toFixed(2)) };
      }
      return u;
    });
    updateUsers(updatedUsers);
    showToast(`Withdrawal ${wth.id} rejected. $${wth.amount} refunded to user.`);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = (userSearch || '').toLowerCase().trim();
    const email = String(u.email || '').toLowerCase();
    const phone = String(u.phone || '').toLowerCase();
    const name = String(u.name || '').toLowerCase();
    const uid = String(u.id || '').toLowerCase();
    const code = String(u.myInviteCode || u.inviteCode || '').toLowerCase();

    const matchesSearch = !q || email.includes(q) || phone.includes(q) || name.includes(q) || uid.includes(q) || code.includes(q);
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics
  const totalUserCount = users.length;
  const totalRechargeVol = recharges
    .filter((r) => r.status === 'approved')
    .reduce((acc, r) => acc + r.amount, 0);
  const totalWithdrawalVol = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((acc, w) => acc + w.amount, 0);
  const pendingRecharges = recharges.filter((r) => r.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  // If not authenticated as Master Admin, show Admin Login Portal
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#061226] to-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
        {toast && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-950/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 border border-blue-400/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">NextTask Master Portal</h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Authorized personnel only. Enter Master Administrator credentials.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition pl-11"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition pl-11 pr-11"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.99] transition text-sm cursor-pointer"
            >
              Authenticate & Access Control Panel
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex flex-col gap-3">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Return to User Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-500 font-mono">
              NextTask Security Protocol • v2.6 Enterprise
            </span>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'recharges', label: 'Recharge Requests', shortLabel: 'Recharges', icon: ArrowDownLeft, badge: pendingRecharges.length },
    { id: 'withdrawals', label: 'Withdrawal Requests', shortLabel: 'Withdrawals', icon: ArrowUpRight, badge: pendingWithdrawals.length },
    { id: 'users', label: 'Users Management', shortLabel: 'Users', icon: Users },
    { id: 'payments', label: 'Payment Methods', shortLabel: 'Payments', icon: Smartphone },
    { id: 'vips', label: 'VIP Packages', shortLabel: 'VIPs', icon: Gem },
    { id: 'slides', label: 'Home Page Banners', shortLabel: 'Banners', icon: ImageIcon },
    { id: 'company', label: 'Company Profile', shortLabel: 'Company', icon: Building2 },
    { id: 'settings', label: 'System Settings', shortLabel: 'Settings', icon: Settings },
  ];

  const totalPending = pendingRecharges.length + pendingWithdrawals.length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-fade-in max-w-[90vw]">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      {/* ================= MOBILE STICKY TOPBAR (VISIBLE ON PHONES) ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shrink-0">
        <div className="px-3.5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 relative transition cursor-pointer"
              title="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-600/30">
                N
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-wide text-white leading-tight">NextTask</h1>
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                  Master Admin
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="p-2 bg-slate-900 hover:bg-blue-600/40 text-blue-400 rounded-xl border border-slate-800 transition cursor-pointer"
              title="Export PDF Report"
            >
              <FileDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                syncData();
                showToast('Data refreshed');
              }}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl border border-rose-800/40 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Tab Bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-900/80 bg-slate-950">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.shortLabel}</span>
                {item.badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-white text-blue-700' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ================= MOBILE SLIDE-OVER DRAWER MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[82vw] h-full bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl z-10 animate-slide-right overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
                    N
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">NextTask</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Master Admin
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5 text-sm font-medium">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 border-t border-slate-800 space-y-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAdminLogout();
                }}
                className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-rose-800/40 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Admin Logout</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToApp?.();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Open User App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR (VISIBLE ON MD+ SCREENS) ================= */}
      <aside className="hidden md:flex md:w-64 bg-slate-950 border-r border-slate-800 p-5 flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">
              N
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white">NextTask</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50">
                Master Admin
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Shortcuts: Admin Logout & Open User App */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={handleAdminLogout}
            className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-rose-800/40 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Admin Logout</span>
          </button>
          <button
            onClick={onNavigateToApp}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Open User App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white capitalize tracking-tight">
              {currentTab === 'vips'
                ? 'VIP Packages'
                : currentTab === 'users'
                ? 'Users Management'
                : currentTab === 'recharges'
                ? 'Recharge Requests'
                : currentTab === 'withdrawals'
                ? 'Withdrawal Requests'
                : currentTab === 'payments'
                ? 'Payment Methods'
                : currentTab === 'slides'
                ? 'Home Page Banners'
                : currentTab === 'company'
                ? 'Company Profile'
                : currentTab === 'settings'
                ? 'System Settings'
                : 'Dashboard Overview'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Master control panel for NextTask tasks, users, and financials
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-mono">admin@nexttask.online</span>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
              title="Download Date-wise PDF Report"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
            <button
              onClick={() => {
                syncData();
                showToast('Data refreshed successfully');
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleAdminLogout}
              className="p-2 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl text-rose-400 border border-rose-800/40 transition cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= TAB 1: DASHBOARD ================= */}
        {currentTab === 'dashboard' && (
          <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Stat Cards (2x2 on mobile, 4 columns on desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-slate-950 border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-xs font-semibold">
                  <span className="truncate">REGISTERED USERS</span>
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0 ml-1" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-white mt-1.5 sm:mt-2">{totalUserCount}</div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Active co-builders</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-xs font-semibold">
                  <span className="truncate">TOTAL RECHARGE</span>
                  <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 ml-1" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-emerald-400 mt-1.5 sm:mt-2 truncate">
                  ${totalRechargeVol.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">TRC20 & Gateway deposits</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-xs font-semibold">
                  <span className="truncate">TOTAL WITHDRAWN</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 ml-1" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-amber-400 mt-1.5 sm:mt-2 truncate">
                  ${totalWithdrawalVol.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Paid out to users</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-xs font-semibold">
                  <span className="truncate">PENDING ACTIONS</span>
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0 ml-1" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-rose-400 mt-1.5 sm:mt-2">
                  {pendingRecharges.length + pendingWithdrawals.length}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Recharges & withdrawals</div>
              </div>
            </div>

            {/* Quick Action Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {/* Pending Recharges */}
              <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-xs sm:text-sm">Pending Deposits ({pendingRecharges.length})</h3>
                  <button onClick={() => setCurrentTab('recharges')} className="text-xs text-blue-400 hover:underline cursor-pointer">
                    View all &gt;
                  </button>
                </div>
                {pendingRecharges.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No pending recharge requests</p>
                ) : (
                  <div className="space-y-2">
                    {pendingRecharges.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="bg-slate-900 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-200 truncate">{rec.user}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{rec.network} • {rec.date}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-emerald-400 text-xs sm:text-sm">+৳{rec.amount}</span>
                          <button
                            onClick={() => handleApproveRecharge(rec)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Withdrawals */}
              <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-xs sm:text-sm">Pending Withdrawals ({pendingWithdrawals.length})</h3>
                  <button onClick={() => setCurrentTab('withdrawals')} className="text-xs text-blue-400 hover:underline cursor-pointer">
                    View all &gt;
                  </button>
                </div>
                {pendingWithdrawals.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No pending withdrawal requests</p>
                ) : (
                  <div className="space-y-2">
                    {pendingWithdrawals.slice(0, 3).map((wth) => (
                      <div key={wth.id} className="bg-slate-900 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-200 truncate">{wth.user}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{wth.method || 'USDT'} • {wth.account || wth.address || 'N/A'}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-amber-400 text-xs sm:text-sm">৳{wth.amount}</span>
                          <button
                            onClick={() => handleApproveWithdrawal(wth.id, wth.user, wth.amount)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: VIP PACKAGES ================= */}
        {currentTab === 'vips' && (
          <div className="py-4 sm:py-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Active VIP Levels ({vipTiers.length})</h3>
                <p className="text-xs text-slate-400">Manage levels, required deposits, interest, and daily profits</p>
              </div>
              <button
                onClick={handleOpenAddVip}
                className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New VIP Level</span>
              </button>
            </div>

            {/* Mobile Touch Cards View (md:hidden) */}
            <div className="md:hidden space-y-3">
              {vipTiers.map((vip) => (
                <div key={vip.id || vip.level} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <img src={vip.logo || getPackageLogo(vip)} alt={vip.level} className="w-8 h-8 rounded-xl object-contain bg-slate-900 border border-amber-500/30 p-0.5" />
                      <div>
                        <span className="font-extrabold text-white text-sm">{vip.level}</span>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {vip.id || vip.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Required Deposit</div>
                      <div className="text-sm font-black text-amber-400">৳{vip.deposit}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Validity</div>
                      <div className="text-xs font-black text-amber-300 mt-0.5">{vip.days || 20} Days</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Daily Profit</div>
                      <div className="text-xs font-black text-cyan-300 mt-0.5">+৳{vip.daily}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Total Return</div>
                      <div className="text-xs font-black text-emerald-400 mt-0.5">৳{vip.total}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Daily Tasks</div>
                      <div className="text-xs font-black text-slate-200 mt-0.5">{vip.tasks}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        Task Reward: <strong className="text-emerald-400 font-bold">৳{vip.interest}</strong>
                      </span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Auto Capital Release
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditVip(vip)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVip(vip.id, vip.level)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-rose-900/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Deposit (BDT)</th>
                    <th className="py-3 px-4">Validity</th>
                    <th className="py-3 px-4">Daily Tasks</th>
                    <th className="py-3 px-4">Task Reward</th>
                    <th className="py-3 px-4">Daily Profit</th>
                    <th className="py-3 px-4">Total Return (80% Return)</th>
                    <th className="py-3 px-4">Capital Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {vipTiers.map((vip) => (
                    <tr key={vip.id || vip.level} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <img src={vip.logo || getPackageLogo(vip)} alt={vip.level} className="w-6 h-6 rounded-lg object-contain bg-slate-900 border border-amber-500/30 p-0.5" />
                        {vip.level}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">৳{vip.deposit}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                          {vip.days || 20} Days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{vip.tasks}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">৳{vip.interest}</td>
                      <td className="py-3 px-4 text-cyan-300 font-bold">+৳{vip.daily}</td>
                      <td className="py-3 px-4">
                        <span className="text-slate-200 font-semibold">৳{vip.total}</span>
                        <span className="text-[10px] text-emerald-400 font-bold ml-1">({vip.profitPercent || 80}%)</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Auto-release at expiry
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditVip(vip)}
                          className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVip(vip.id, vip.level)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: PAYMENT METHODS (bKash / Nagad / Rocket / USDT) ================= */}
        {currentTab === 'payments' && (
          <div className="py-4 sm:py-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Payment Gateways & Numbers ({paymentMethods.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Manage active bKash, Nagad, Rocket, and USDT numbers shown on the user deposit screen
                </p>
              </div>
              <button
                onClick={handleOpenAddPayment}
                className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Number</span>
              </button>
            </div>

            
            {/* ================= PAYMENT GATEWAY MODE SWITCHER ================= */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      Deposit Gateway Processing Mode
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      settings?.paymentGatewayMode === 'automated'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      Active: {settings?.paymentGatewayMode === 'automated' ? 'Automated P2P SMS Bot' : 'Manual Review (Default)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose how user recharges are processed. You can switch between manual review and automated P2P verification anytime.
                  </p>
                </div>

                {/* Mode Toggle Buttons */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateGatewayMode('manual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      settings?.paymentGatewayMode !== 'automated'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Manual Review (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateGatewayMode('automated')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      settings?.paymentGatewayMode === 'automated'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Automated P2P SMS Bot
                  </button>
                </div>
              </div>

              {/* Info based on selected mode */}
              {settings?.paymentGatewayMode === 'automated' ? (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3.5 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Automated Mode is ACTIVE on live site!
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Users see the 12-second live verification scanner. When an SMS arrives on your phone, our system automatically matches the TrxID, credits user balance, and activates their VIP package instantly. If your phone is offline or SMS is delayed, it safely queues for your manual approval.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="text-slate-400 block text-[9px] uppercase font-sans">Webhook URL (MacroDroid / SMS Forwarder):</span>
                        <span className="text-cyan-300 select-all">https://nexttask.online/api/sms-webhook</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('https://nexttask.online/api/sms-webhook', 'Webhook URL')}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="text-slate-400 block text-[9px] uppercase font-sans">Secret Token (Header x-sms-secret):</span>
                        <span className="text-amber-300 select-all">nt_sms_webhook_sec_8888</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('nt_sms_webhook_sec_8888', 'SMS Secret Token')}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><b>Manual Mode is ACTIVE:</b> Users submit their TrxID & Sender Number normally. All deposits wait for your review and manual approval in the Recharges tab.</span>
                </div>
              )}
            </div>

{/* Mobile Touch Cards View (md:hidden) */}
            <div className="md:hidden space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getPaymentLogo(pm)}
                        alt={pm.method}
                        className="w-8 h-8 rounded-xl object-contain bg-slate-900 border border-slate-700/80 p-1 shadow-sm shrink-0"
                        onError={(e) => { e.currentTarget.src = '/logos/usdt.svg'; }}
                      />
                      <div>
                        <div className="font-extrabold text-white text-sm leading-tight">{pm.method}</div>
                        <span className="bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-md text-[9px] mt-0.5 inline-block">
                          {pm.type}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePaymentActive(pm.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                        pm.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pm.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      {pm.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Account Number / Address</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(pm.number);
                          showToast('Number copied');
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="font-mono font-bold text-cyan-300 text-xs sm:text-sm break-all select-all">
                      {pm.number}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-[11px]">
                      <span className="text-slate-400">Rate: </span>
                      <strong className="text-emerald-400 font-bold">
                        {pm.rate > 1 ? `1 USD = ${pm.rate} BDT` : '1 USD = 1 USDT'}
                      </strong>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditPayment(pm)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePayment(pm.id, pm.method)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-rose-900/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  {pm.instructions && (
                    <div className="text-[10px] text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
                      💡 {pm.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Phone / Address</th>
                    <th className="py-3 px-4">Rate (BDT/USD)</th>
                    <th className="py-3 px-4">Instructions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paymentMethods.map((pm) => {
                    return (
                      <tr key={pm.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getPaymentLogo(pm)}
                              alt={pm.method}
                              className="w-7 h-7 rounded-lg object-contain bg-slate-900 border border-slate-700/80 p-0.5 shadow-sm shrink-0"
                              onError={(e) => { e.currentTarget.src = '/logos/usdt.svg'; }}
                            />
                            <div>
                              <div className="font-extrabold text-white text-xs">{pm.method}</div>
                              <div className="text-[10px] text-slate-500 font-normal">{pm.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                            {pm.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-cyan-300">{pm.number}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-400">
                          {pm.rate > 1 ? `1 USD = ${pm.rate} BDT` : '1 USD = 1 USDT'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{pm.instructions || '-'}</td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentActive(pm.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1.5 ${
                              pm.active
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${pm.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            {pm.active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditPayment(pm)}
                            className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(pm.id, pm.method)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: HOME SLIDES & BANNERS ================= */}
        {currentTab === 'slides' && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Home Screen Promotional Slides ({slides.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Add, update, or remove promotional banners shown on the user app carousel
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddSlide}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Slide</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slides.map((slide) => (
                <div key={slide.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
                  {/* Live Visual Card Preview */}
                  {slide.image ? (
                    <div className="rounded-2xl overflow-hidden relative min-h-[120px] max-h-[140px] border border-slate-700">
                      <img src={slide.image} alt="Banner" className="w-full h-full object-cover" />
                      {(!slide.gradient || slide.gradient === 'default') ? (
                        <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Default Theme
                        </div>
                      ) : slide.subtitle ? (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                          <span className="text-white text-xs font-bold">{slide.subtitle}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                  <div className={`rounded-2xl p-4 text-white bg-gradient-to-r ${(!slide.gradient || slide.gradient === 'default') ? 'from-amber-500 via-orange-500 to-yellow-400' : slide.gradient} shadow-md relative overflow-hidden min-h-[120px]`}>
                    {slide.badge && (
                      <span className="inline-block bg-white text-orange-600 font-black text-xs px-2 py-0.5 rounded shadow-sm mb-1 uppercase">
                        {slide.badge}
                      </span>
                    )}
                    <div className="text-2xl font-black text-red-700 leading-none drop-shadow-sm mt-1">
                      {slide.amount}
                    </div>
                    <div className="text-[10px] font-black tracking-widest text-slate-900 uppercase mt-1">
                      {slide.subtitle}
                    </div>
                    {slide.description && (
                      <div className="text-[10px] text-white/90 font-medium mt-1 line-clamp-2">
                        {slide.description}
                      </div>
                    )}
                  </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400">ID: {slide.id}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditSlide(slide)}
                        className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                        title="Edit Slide"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: USERS MANAGEMENT ================= */}
        {currentTab === 'users' && (
          <div className="py-6 space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user email or phone"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                {['all', 'active', 'banned'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setUserStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                      userStatusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Touch Cards View (md:hidden) */}
            <div className="md:hidden space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                  No users found matching filter.
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{u.name || 'User'}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                        <div className="text-[10px] text-cyan-400 font-mono font-bold mt-0.5">
                          UID: {u.id} • Code: {u.myInviteCode || u.inviteCode || 'N/A'}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase shrink-0 ${
                          u.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Balance</div>
                        <div className="text-sm font-black text-emerald-400 mt-0.5">৳{u.balance.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Recharge</div>
                        <div className="text-sm font-bold text-slate-200 mt-0.5">৳{u.recharge.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Phone</div>
                        <div className="text-xs text-slate-300 font-mono mt-0.5 truncate">{u.phone || '-'}</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">VIP Level</span>
                          {u.vip && u.vip !== 'VIP0' && (
                            <span className="text-[9px] font-bold text-amber-300">
                              {u.capitalReleased || (u.vipExpiresAt && Date.now() >= u.vipExpiresAt) ? 'Capital Released' : `${Math.max(1, Math.ceil(((u.vipExpiresAt || Date.now() + 20*86400000) - Date.now()) / 86400000))}d left`}
                            </span>
                          )}
                        </div>
                        <select
                          value={u.vip || 'VIP0'}
                          onChange={(e) => handleChangeUserVip(u.id, e.target.value)}
                          className="bg-amber-950/90 text-amber-300 font-black px-2 py-1 rounded-lg border border-amber-800/50 text-[11px] outline-none cursor-pointer mt-0.5 w-full"
                        >
                          <option value="VIP0">VIP0</option>
                          {vipTiers.map((vt) => (
                            <option key={vt.level} value={vt.level}>
                              {vt.level} ({vt.days || 20}d - {vt.profitPercent || 80}%)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Security & Login Audit Info */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Last IP & Location:</span>
                        {u.lastLoginIp && u.lastLoginIp !== 'Pending' ? (
                          <span className="font-mono text-cyan-400 font-semibold">{u.lastLoginIp} ({u.lastLoginLocation || 'Bangladesh'})</span>
                        ) : (
                          <span className="text-amber-400/90 font-medium">Awaiting First Login</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Device & Activity:</span>
                        <span className="text-slate-300">{u.lastLoginDevice || 'Mobile'} • {u.lastLoginAt ? u.lastLoginAt.slice(0, 16) : u.joined}</span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleLoginAsUser(u)}
                        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Login as User</span>
                      </button>

                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUserForBalance(u);
                            setShowBalanceModal(true);
                          }}
                          className="py-2 bg-slate-900 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-900/40 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                          title="Adjust Balance"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Balance</span>
                        </button>

                        <button
                          onClick={() => {
                            const newPass = prompt(`Enter new password for ${u.email}:`, '123456');
                            if (newPass && newPass.trim().length >= 6) {
                              const updated = users.map((usr) => (usr.id === u.id ? { ...usr, password: newPass.trim() } : usr));
                              updateUsers(updated);
                              showToast(`Password for ${u.email} reset to: ${newPass.trim()}`);
                            } else if (newPass) {
                              showToast('Password must be at least 6 characters');
                            }
                          }}
                          className="py-2 bg-slate-900 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-900/40 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Pass</span>
                        </button>

                        <button
                          onClick={() => handleToggleBanUser(u.id)}
                          className={`py-2 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[10px] font-bold cursor-pointer border ${
                            u.status === 'active'
                              ? 'bg-slate-900 hover:bg-amber-600/30 text-amber-400 border-amber-900/40'
                              : 'bg-amber-600 text-white border-amber-500'
                          }`}
                          title={u.status === 'active' ? 'Ban User' : 'Unban User'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{u.status === 'active' ? 'Ban' : 'Unban'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="py-2 bg-slate-900 hover:bg-rose-600/30 text-rose-400 border border-rose-900/40 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">VIP Level</th>
                    <th className="py-3 px-4">Balance (USDT)</th>
                    <th className="py-3 px-4">Recharge Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{u.name || 'User'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                        <div className="text-[9px] text-cyan-400 font-mono font-bold">UID: {u.id} | Code: {u.myInviteCode || u.inviteCode || 'N/A'}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {u.lastLoginIp && u.lastLoginIp !== 'Pending' ? (
                            <span className="text-cyan-400 font-semibold">IP: {u.lastLoginIp} • {u.lastLoginLocation || 'Bangladesh'} ({u.lastLoginDevice || 'Mobile'})</span>
                          ) : (
                            <span className="text-amber-400/90 font-medium">IP: Awaiting Login (New Account)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{u.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <select
                            value={u.vip || 'VIP0'}
                            onChange={(e) => handleChangeUserVip(u.id, e.target.value)}
                            className="bg-amber-950/90 text-amber-300 font-black px-2 py-1 rounded-lg border border-amber-800/50 text-[10px] outline-none cursor-pointer hover:border-amber-500"
                          >
                            <option value="VIP0">VIP0</option>
                            {vipTiers.map((vt) => (
                              <option key={vt.level} value={vt.level}>
                                {vt.level} ({vt.days || 20}d)
                              </option>
                            ))}
                          </select>
                          {u.vip && u.vip !== 'VIP0' && (
                            <span className="text-[9px] font-bold text-amber-400">
                              {u.capitalReleased || (u.vipExpiresAt && Date.now() >= u.vipExpiresAt) ? 'Capital Released' : `${Math.max(1, Math.ceil(((u.vipExpiresAt || Date.now() + 20*86400000) - Date.now()) / 86400000))}d left`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400">৳{u.balance.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">৳{u.recharge.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[10px]">{u.joined}</td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {/* Login as User */}
                        <button
                          type="button"
                          onClick={() => handleLoginAsUser(u)}
                          className="px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition font-bold text-[10px] inline-flex items-center gap-1 shadow-sm cursor-pointer"
                          title={`Log in as ${u.name || u.email || u.id}`}
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Login as user</span>
                        </button>
                        {/* Adjust Balance */}
                        <button
                          onClick={() => {
                            setSelectedUserForBalance(u);
                            setShowBalanceModal(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="Adjust Balance"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            const newPass = prompt(`Enter new password for ${u.email}:`, '123456');
                            if (newPass && newPass.trim().length >= 6) {
                              const updated = users.map((usr) => (usr.id === u.id ? { ...usr, password: newPass.trim() } : usr));
                              updateUsers(updated);
                              showToast(`Password for ${u.email} reset to: ${newPass.trim()}`);
                            } else if (newPass) {
                              showToast('Password must be at least 6 characters');
                            }
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {/* Ban / Unban */}
                        <button
                          onClick={() => handleToggleBanUser(u.id)}
                          className={`p-1.5 rounded-lg transition ${
                            u.status === 'active'
                              ? 'bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                          title={u.status === 'active' ? 'Ban User' : 'Unban User'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: RECHARGE REQUESTS ================= */}
        {currentTab === 'recharges' && (
          <div className="py-4 sm:py-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Recharge / Deposit Log ({recharges.length})</h3>
                <p className="text-xs text-slate-400">Review, verify TrxID, and approve user deposits</p>
              </div>
              {pendingRecharges.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {pendingRecharges.length} Pending
                </span>
              )}
            </div>

            {/* Mobile Touch Cards View (md:hidden) */}
            <div className="md:hidden space-y-3">
              {recharges.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                  No recharge requests found.
                </div>
              ) : (
                recharges.map((r) => (
                  <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{r.user}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.date} • ID: {r.id}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                          r.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : r.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    {/* Amount & Method */}
                    <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Deposit Amount</div>
                        <div className="text-base font-black text-emerald-400 mt-0.5">+৳{r.amount.toFixed(2)} BDT</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Network / Gateway</div>
                        <span className="inline-block bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded text-[10px] mt-0.5 border border-blue-800/50">
                          {r.network}
                        </span>
                      </div>
                    </div>

                    {/* Sender Info (if any) */}
                    {r.senderNumber && (
                      <div className="text-xs bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Sender Number:</span>
                        <span className="font-mono font-bold text-cyan-300 text-xs">{r.senderNumber}</span>
                      </div>
                    )}

                    {/* TxID / Reference */}
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">TxID / Reference</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(r.txid);
                            showToast('TrxID copied to clipboard');
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="font-mono font-bold text-amber-300 text-xs break-all select-all">
                        {r.txid}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {r.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleApproveRecharge(r)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectRecharge(r.id)}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-1 text-slate-500 text-[11px] font-medium border-t border-slate-900">
                        Processed on {r.date}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Network</th>
                    <th className="py-3 px-4">TxID / Reference</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recharges.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">
                        No recharge requests found.
                      </td>
                    </tr>
                  ) : (
                    recharges.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4 font-mono text-slate-400">{r.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{r.user}</div>
                          {r.senderNumber && (
                            <div className="text-[10px] text-cyan-400 font-mono">From: {r.senderNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-400">৳{r.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-300 font-bold">{r.network}</td>
                        <td className="py-3 px-4 font-mono text-amber-300 text-[11px] font-bold select-all">{r.txid}</td>
                        <td className="py-3 px-4 text-slate-500 text-[10px]">{r.date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : r.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {r.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveRecharge(r)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRecharge(r.id)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-600 text-[11px]">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: WITHDRAWAL REQUESTS ================= */}
        {currentTab === 'withdrawals' && (
          <div className="py-4 sm:py-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Withdrawal Log ({withdrawals.length})</h3>
                <p className="text-xs text-slate-400">Process user payout requests to bKash, Nagad, or USDT</p>
              </div>
              {pendingWithdrawals.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  {pendingWithdrawals.length} Pending
                </span>
              )}
            </div>

            {/* Mobile Touch Cards View (md:hidden) */}
            <div className="md:hidden space-y-3">
              {withdrawals.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                  No withdrawal requests found.
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{w.user}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{w.date} • ID: {w.id}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                          w.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : w.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    {/* Amount & Method */}
                    <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Requested Payout</div>
                        <div className="text-base font-black text-amber-400 mt-0.5">৳{w.amount.toFixed(2)} BDT</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Payout Method</div>
                        <span className="inline-block bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded text-[10px] mt-0.5 border border-indigo-800/50">
                          {w.method || 'USDT'}
                        </span>
                      </div>
                    </div>

                    {/* Target Account / Wallet with Copy */}
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Account / Address</span>
                        <button
                          type="button"
                          onClick={() => {
                            const val = w.account || w.address || '';
                            if (val) {
                              navigator.clipboard.writeText(val);
                              showToast('Target account copied');
                            }
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="font-mono font-bold text-cyan-300 text-xs break-all select-all">
                        {w.account || w.address || 'N/A'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {w.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleApproveWithdrawal(w.id, w.user, w.amount)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w)}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject & Refund</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-1 text-slate-500 text-[11px] font-medium border-t border-slate-900">
                        Processed on {w.date}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method & Target Account</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        No withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4 font-mono text-slate-400">{w.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{w.user}</td>
                        <td className="py-3 px-4 font-black text-amber-400">৳{w.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="font-bold text-white">{w.method || 'USDT'}</span>
                          <div className="font-mono text-cyan-400 text-[11px] font-bold select-all">{w.account || w.address || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[10px]">{w.date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              w.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : w.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {w.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(w.id, w.user, w.amount)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(w)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition cursor-pointer"
                              >
                                Reject & Refund
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-600 text-[11px]">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {currentTab === 'settings' && (
          <div className="py-6 max-w-2xl space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/60 before:to-transparent">
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight flex items-center gap-2">
                      Global Financial Settings
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Live minimum limits, deposit addresses & support configurations
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Sync
                </span>
              </div>

              <div className="space-y-5 text-xs">
                {/* Company Profile Quick Shortcut Card */}
                <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-cyan-950/40 border border-blue-800/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">Company Profile & Official License</h4>
                      <p className="text-[11px] text-slate-400">Edit company background, our work model, mission, vision, and upload certificate photo</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('company')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <span>Manage Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Platform USDT Deposit Address */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      Platform USDT Deposit Address (TRC20)
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono font-semibold">User Recharge Target</span>
                  </div>
                  <input
                    type="text"
                    value={settings.trc20Address}
                    onChange={(e) => setSettings({ ...settings, trc20Address: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition shadow-inner"
                    placeholder="TRC20 Wallet Address"
                  />
                  <p className="text-[10px] text-slate-500">This TRC20 wallet address is presented to users in the app when recharging via crypto.</p>
                </div>

                {/* Min Deposit, Min Withdrawal & Referral Commission Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-300 font-bold">Minimum Recharge</label>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">BDT</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">৳</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={settings.minDeposit ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings((prev) => ({ ...prev, minDeposit: val === '' ? '' : parseFloat(val) }));
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-slate-100 font-bold text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition shadow-inner"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Recharge modal will enforce this minimum amount.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-300 font-bold">Minimum Withdrawal</label>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">BDT</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">৳</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={settings.minWithdrawal ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings((prev) => ({ ...prev, minWithdrawal: val === '' ? '' : parseFloat(val) }));
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-slate-100 font-bold text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 transition shadow-inner"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">User withdrawal modal will enforce this minimum amount.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-300 font-bold">Referral Commission</label>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">% Rate</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">%</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={settings.referralCommissionRate ?? 10}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings((prev) => ({ ...prev, referralCommissionRate: val === '' ? 10 : parseFloat(val) }));
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-slate-100 font-bold text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition shadow-inner"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Auto-credited to referrer when a member's recharge is approved.</p>
                  </div>
                </div>

                {/* Telegram Support Handle */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                  <label className="text-slate-300 font-bold block">Telegram Support Handle</label>
                  <input
                    type="text"
                    value={settings.telegramSupport}
                    onChange={(e) => setSettings({ ...settings, telegramSupport: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition shadow-inner"
                    placeholder="Telegram Support Handle"
                  />
                  <p className="text-[10px] text-slate-500">Connected to 24/7 customer service floating buttons and help links.</p>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => {
                      const payload = {
                        ...settings,
                        minDeposit: typeof settings.minDeposit === 'number' ? settings.minDeposit : (parseFloat(settings.minDeposit) || 0),
                        minWithdrawal: typeof settings.minWithdrawal === 'number' ? settings.minWithdrawal : (parseFloat(settings.minWithdrawal) || 0),
                        referralCommissionRate: typeof settings.referralCommissionRate === 'number' ? settings.referralCommissionRate : (parseFloat(settings.referralCommissionRate) || 10)
                      };
                      setSettings(payload);
                      updateSettings(payload);
                      showToast(`Settings saved! Min Recharge: ৳${payload.minDeposit}, Min Withdrawal: ৳${payload.minWithdrawal}, Referral Commission: ${payload.referralCommissionRate}%`);
                    }}
                    className="w-full sm:w-auto justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs py-3 px-7 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Save Settings</span>
                  </button>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    ✓ Changes take effect across user panel immediately
                  </span>
                </div>
              </div>
            </div>

            {/* 24/7 Live Customer Support & Floating Help Desk Card */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-emerald-500/60 before:to-transparent">
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Headphones className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight flex items-center gap-2">
                      24/7 Live Support & Floating Help Desk
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Floating button, call center executive avatar, and Telegram / WhatsApp channels
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddSupportChannel}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Channel</span>
                </button>
              </div>

              <div className="space-y-5 text-xs">
                {/* Floating Support Button Master Switch */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 font-bold text-xs flex items-center gap-2">
                      <span>Show Floating Support Button on Website</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        settings.floatingSupportEnabled !== false
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {settings.floatingSupportEnabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Renders a call center executive floating button at the bottom-right corner for fast 1-click support.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = settings.floatingSupportEnabled === false ? true : false;
                      const newSettings = { ...settings, floatingSupportEnabled: next };
                      setSettings(newSettings);
                      updateSettings(newSettings);
                      showToast(`Floating Support Button is now ${next ? 'Enabled' : 'Disabled'}`);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.floatingSupportEnabled !== false ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.floatingSupportEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Call Center Executive Avatar Management */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Call Center Executive Avatar</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Shown in floating button & contact dialogs</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-800 border-2 border-emerald-500 shadow-md shrink-0 flex items-center justify-center">
                      <img
                        src={settings.supportExecutiveAvatar || DEFAULT_SUPPORT_AVATAR}
                        alt="Support Executive"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <p className="font-semibold text-slate-200 text-xs">
                        {settings.supportExecutiveAvatar ? 'Custom Executive Photo Active' : 'Default Call Center Avatar (Headset)'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Upload real customer executive photo or brand icon (PNG, JPG, SVG up to 2MB).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition">
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleExecutiveAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      {settings.supportExecutiveAvatar && (
                        <button
                          type="button"
                          onClick={handleRestoreDefaultSupportAvatar}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/40 transition cursor-pointer"
                          title="Restore default avatar"
                        >
                          Restore Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Support Channels List (Telegram, WhatsApp) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>Connected Support Channels ({supportChannels.length})</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Telegram & WhatsApp links</span>
                  </div>

                  {supportChannels.length === 0 ? (
                    <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
                      <p>No support channels configured yet.</p>
                      <button
                        type="button"
                        onClick={handleOpenAddSupportChannel}
                        className="mt-2 text-emerald-400 hover:text-emerald-300 font-semibold underline"
                      >
                        Add Telegram or WhatsApp channel now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {supportChannels.map((channel) => {
                        const isTg = channel.type === 'telegram';
                        const isWa = channel.type === 'whatsapp';
                        return (
                          <div
                            key={channel.id}
                            className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              channel.active !== false
                                ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isTg
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                    : isWa
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                }`}
                              >
                                {isTg ? <Send className="w-4 h-4" /> : isWa ? <MessageCircle className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-slate-100 text-xs truncate">{channel.name}</h4>
                                  <span
                                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
                                      isTg
                                        ? 'bg-sky-950 text-sky-400 border border-sky-800/50'
                                        : isWa
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {channel.type}
                                  </span>
                                  {channel.active !== false ? (
                                    <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-slate-500 font-semibold">Inactive</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                                  {channel.link}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {/* Toggle Active Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSupportChannel(channel.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                                  channel.active !== false
                                    ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {channel.active !== false ? 'Active' : 'Inactive'}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditSupportChannel(channel)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                title="Edit Channel"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSupportChannel(channel.id, channel.name)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/30 transition cursor-pointer"
                                title="Delete Channel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Telegram 24/7 AI Automated Support Bot Management */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-sky-500/60 before:to-transparent">
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
                    <Send className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight flex items-center gap-2">
                      🤖 24/7 Automated Telegram Support Bot
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Auto-replies to user questions with buttons, FAQs, and two-way human agent chat
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  (settings.telegramBotToken || DEFAULT_SETTINGS.telegramBotToken)
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {(settings.telegramBotToken || DEFAULT_SETTINGS.telegramBotToken) ? '✓ Configured' : 'Needs Setup'}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Bot Username & Token Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-slate-300 font-bold block">Telegram Bot Username</label>
                    <input
                      type="text"
                      value={settings.telegramBotUsername || ''}
                      onChange={(e) => setSettings({ ...settings, telegramBotUsername: e.target.value })}
                      placeholder="Telegram Bot Username"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs outline-none focus:border-sky-400"
                    />
                    <p className="text-[10px] text-slate-500">Public bot handle users can click to start chat.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-slate-300 font-bold block">Admin Telegram Chat ID</label>
                    <input
                      type="text"
                      value={settings.telegramAdminChatId || ''}
                      onChange={(e) => setSettings({ ...settings, telegramAdminChatId: e.target.value })}
                      placeholder="Admin Telegram Chat ID"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs outline-none focus:border-sky-400"
                    />
                    <p className="text-[10px] text-slate-500">Inquiries will be forwarded here; reply to answer users.</p>
                  </div>
                </div>

                {/* Bot Token Input */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold">Telegram Bot API Token</label>
                    <span className="text-[10px] text-amber-400 font-semibold">Secret Key</span>
                  </div>
                  <input
                    type="password"
                    value={settings.telegramBotToken || ''}
                    onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                    placeholder="Telegram Bot API Token"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs outline-none focus:border-sky-400"
                  />
                </div>

                {/* Status notice */}
                {telegramSettingStatus && (
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-mono text-sky-300">
                    {telegramSettingStatus}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isSettingWebhook}
                    onClick={handleConnectTelegramWebhook}
                    className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isSettingWebhook ? 'Connecting...' : '🔗 Connect Webhook'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isTestingBot}
                    onClick={handleTestTelegramBot}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isTestingBot ? 'Sending...' : '🚀 Send Test Message'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateSettings(settings);
                      showToast('Telegram bot configuration saved!');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer ml-auto"
                  >
                    <span>Save Bot Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 9: COMPANY PROFILE & LEGAL LICENSE ================= */}
        {currentTab === 'company' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-cyan-400" />
                  Company Profile & Corporate License
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage the official company information, work model, mission, vision, and legal license photo displayed to all users
                </p>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live User Sync
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedSettings = {
                  ...settings,
                  companyProfile: settings.companyProfile || DEFAULT_COMPANY_PROFILE
                };
                setSettings(updatedSettings);
                updateSettings(updatedSettings);
                showToast('Company profile & license updated successfully!');
              }}
              className="space-y-6 text-xs"
            >
              {/* Card 1: Corporate Identity */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Corporate Legal Identity</h3>
                    <p className="text-[11px] text-slate-400">Official registered name and international registration number</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">Company Legal Name</label>
                    <input
                      type="text"
                      required
                      value={settings?.companyProfile?.companyName ?? DEFAULT_COMPANY_PROFILE.companyName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => ({
                          ...prev,
                          companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), companyName: val }
                        }));
                      }}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs outline-none focus:border-cyan-400 font-semibold"
                      placeholder="Company Legal Name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">Registration / Certificate Number</label>
                    <input
                      type="text"
                      required
                      value={settings?.companyProfile?.regNumber ?? DEFAULT_COMPANY_PROFILE.regNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => ({
                          ...prev,
                          companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), regNumber: val }
                        }));
                      }}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs outline-none focus:border-cyan-400 font-mono"
                      placeholder="Registration Number"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Platform Tagline / Slogan</label>
                  <input
                    type="text"
                    value={settings?.companyProfile?.tagline ?? DEFAULT_COMPANY_PROFILE.tagline}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), tagline: val }
                      }));
                    }}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs outline-none focus:border-cyan-400"
                    placeholder="Tagline / Slogan"
                  />
                </div>
              </div>

              {/* Card 2: What We Do (Our Work) & About */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Our Work & Platform Operations</h3>
                    <p className="text-[11px] text-slate-400">Detailed explanation of how the platform operates and how users earn profit</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">
                    What We Do / Our Business Model
                  </label>
                  <textarea
                    rows={4}
                    value={settings?.companyProfile?.whatWeDo ?? DEFAULT_COMPANY_PROFILE.whatWeDo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), whatWeDo: val }
                      }));
                    }}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-slate-100 text-xs outline-none focus:border-emerald-400 leading-relaxed resize-y"
                    placeholder="What We Do / Our Work"
                  />
                  <p className="text-[10px] text-slate-500">Displayed prominently under 'Our Work' in the Company Profile modal.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">About Company Overview</label>
                  <textarea
                    rows={3}
                    value={settings?.companyProfile?.about ?? DEFAULT_COMPANY_PROFILE.about}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), about: val }
                      }));
                    }}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-slate-100 text-xs outline-none focus:border-emerald-400 leading-relaxed resize-y"
                    placeholder="About Company Overview"
                  />
                </div>
              </div>

              {/* Card 3: Mission & Vision */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Mission & Vision Statements</h3>
                    <p className="text-[11px] text-slate-400">Strategic goals and future vision of the network</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">Corporate Mission</label>
                    <textarea
                      rows={3}
                      value={settings?.companyProfile?.mission ?? DEFAULT_COMPANY_PROFILE.mission}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => ({
                          ...prev,
                          companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), mission: val }
                        }));
                      }}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-slate-100 text-xs outline-none focus:border-amber-400 leading-relaxed resize-y"
                      placeholder="Corporate Mission"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">Corporate Vision</label>
                    <textarea
                      rows={3}
                      value={settings?.companyProfile?.vision ?? DEFAULT_COMPANY_PROFILE.vision}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => ({
                          ...prev,
                          companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), vision: val }
                        }));
                      }}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-slate-100 text-xs outline-none focus:border-amber-400 leading-relaxed resize-y"
                      placeholder="Corporate Vision"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Official Certificate & License Photo */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Official License & Certificate Photo</h3>
                    <p className="text-[11px] text-slate-400">Upload your government registration certificate, business license, or incorporation document</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">Certificate Title / Document Name</label>
                    <input
                      type="text"
                      value={settings?.companyProfile?.licenseTitle ?? DEFAULT_COMPANY_PROFILE.licenseTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => ({
                          ...prev,
                          companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), licenseTitle: val }
                        }));
                      }}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs outline-none focus:border-indigo-400 font-semibold"
                      placeholder="Certificate Title"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">Issuance Date / Legal Authority</label>
                    <input
                      type="text"
                      value={settings?.companyProfile?.licenseDate ?? DEFAULT_COMPANY_PROFILE.licenseDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => ({
                          ...prev,
                          companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), licenseDate: val }
                        }));
                      }}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs outline-none focus:border-indigo-400"
                      placeholder="Issuance Date / Authority"
                    />
                  </div>
                </div>

                {/* Upload or Image URL controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-bold block">Certificate Image URL</label>
                      <input
                        type="text"
                        value={settings?.companyProfile?.licenseImage ?? DEFAULT_COMPANY_PROFILE.licenseImage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings((prev) => ({
                            ...prev,
                            companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), licenseImage: val }
                          }));
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs outline-none focus:border-indigo-400 font-mono"
                        placeholder="Certificate Image URL"
                      />
                      <p className="text-[10px] text-slate-500">You can paste an online image link or upload a photo directly below.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload License Photo / Document</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('Image size exceeds 5MB limit');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const dataUrl = ev.target.result;
                              setSettings((prev) => ({
                                ...prev,
                                companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), licenseImage: dataUrl }
                              }));
                              showToast('License photo uploaded! Click Save to apply.');
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            companyProfile: { ...(prev.companyProfile || DEFAULT_COMPANY_PROFILE), licenseImage: '/license_certificate.svg' }
                          }));
                          showToast('Reset to default official certificate.');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 px-3.5 rounded-xl transition cursor-pointer"
                      >
                        Restore Default Certificate
                      </button>
                    </div>
                  </div>

                  {/* Certificate Live Preview Box */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold text-[11px] block">Live Document Preview</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden min-h-[140px]">
                      <img
                        src={settings?.companyProfile?.licenseImage || '/license_certificate.svg'}
                        alt="License Preview"
                        className="w-full max-h-40 object-contain rounded-lg shadow-md border border-slate-700/50"
                        onError={(e) => { e.currentTarget.src = '/license_certificate.svg'; }}
                      />
                      <span className="text-[10px] text-cyan-400 font-mono mt-1.5 truncate max-w-full">
                        {settings?.companyProfile?.licenseTitle || 'Official License'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto justify-center bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs py-3.5 px-8 rounded-xl shadow-lg shadow-cyan-600/30 active:scale-[0.98] transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Company Profile & License</span>
                </button>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  ✓ Instantly updates the user-side Company Profile modal on all devices
                </span>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT VIP ================= */}
      {showVipModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingVip ? `Edit Package: ${editingVip.level}` : 'Add New VIP Package'}
              </h3>
              <button onClick={() => setShowVipModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveVip} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Package Level Name</label>
                <input
                  type="text"
                  value={vipForm.level}
                  onChange={(e) => setVipForm({ ...vipForm, level: e.target.value })}
                  placeholder="Package Level Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 font-bold"
                  required
                />
              </div>

              {/* VIP Package Logo / Icon (Upload / Delete / Restore) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIP Package Logo / Badge</span>
                  </label>
                  {vipForm.logo ? (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                      Custom Logo Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                      Default VIP Badge
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Visual Preview */}
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 relative shrink-0 shadow-inner overflow-hidden">
                    {vipForm.logo ? (
                      <img src={vipForm.logo} alt="VIP Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-[8px] font-black text-amber-300 mt-0.5">VIP</span>
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition shadow-sm">
                        <Upload className="w-3 h-3" />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                showToast('Logo image must be under 2MB');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setVipForm({ ...vipForm, logo: ev.target.result });
                                showToast('New VIP logo uploaded successfully!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {vipForm.logo && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setVipForm({ ...vipForm, logo: '' });
                              showToast('Custom logo removed');
                            }}
                            className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] font-semibold transition border border-rose-900/40 cursor-pointer"
                          >
                            Delete Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVipForm({ ...vipForm, logo: '' });
                              showToast('Restored default VIP logo');
                            }}
                            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Restore Default
                          </button>
                        </>
                      )}
                    </div>

                    <input
                      type="text"
                      value={vipForm.logo || ''}
                      onChange={(e) => setVipForm({ ...vipForm, logo: e.target.value })}
                      placeholder="Package Logo URL"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-200 outline-none focus:border-blue-500 font-mono"
                    />

                    {/* 10 Official Package Preset Badges */}
                    <div className="pt-1.5">
                      <span className="text-[10px] text-slate-400 block mb-1">Quick Select Official Badges:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: 'Starter', icon: '/packages/starter.svg' },
                          { label: 'Basic', icon: '/packages/basic.svg' },
                          { label: 'Silver', icon: '/packages/silver.svg' },
                          { label: 'Gold', icon: '/packages/gold.svg' },
                          { label: 'Platinum', icon: '/packages/platinum.svg' },
                          { label: 'Diamond', icon: '/packages/diamond.svg' },
                          { label: 'Premium', icon: '/packages/premium.svg' },
                          { label: 'Business', icon: '/packages/business.svg' },
                          { label: 'Elite', icon: '/packages/elite.svg' },
                          { label: 'Royal', icon: '/packages/royal.svg' }
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setVipForm((prev) => ({ ...prev, logo: p.icon }));
                              showToast(`Selected ${p.label} badge`);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 cursor-pointer transition ${
                              (vipForm.logo || '').includes(p.icon.replace('/packages/', ''))
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <img src={p.icon} alt={p.label} className="w-3.5 h-3.5" />
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Deposit Amount (BDT / ৳)</label>
                  <input
                    type="text"
                    value={vipForm.deposit}
                    onChange={(e) => handleVipFormChange('deposit', e.target.value)}
                    placeholder="1000.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Profit (%)</label>
                  <input
                    type="number"
                    value={vipForm.profitPercent !== undefined ? vipForm.profitPercent : 80}
                    onChange={(e) => handleVipFormChange('profitPercent', e.target.value)}
                    placeholder="80"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold outline-none focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Package Validity (Days / মেয়াদ)</label>
                  <input
                    type="number"
                    value={vipForm.days || 20}
                    onChange={(e) => handleVipFormChange('days', e.target.value)}
                    placeholder="20"
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Daily Tasks Count</label>
                  <input
                    type="number"
                    value={vipForm.tasks}
                    onChange={(e) => handleVipFormChange('tasks', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 font-semibold"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Daily Profit (৳)</label>
                  <input
                    type="text"
                    value={vipForm.daily}
                    onChange={(e) => handleVipFormChange('daily', e.target.value)}
                    placeholder="90.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Task Reward (৳)</label>
                  <input
                    type="text"
                    value={vipForm.interest}
                    onChange={(e) => handleVipFormChange('interest', e.target.value)}
                    placeholder="18.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Total Return (৳)</label>
                  <input
                    type="text"
                    value={vipForm.total}
                    onChange={(e) => handleVipFormChange('total', e.target.value)}
                    placeholder="1800.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Explanatory Banner */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-200/90 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Smart Validity & Principal Capital Release Policy:</span>
                </div>
                <p>
                  A <b>{vipForm.profitPercent || 80}% profit</b> is added to the deposit, distributed as daily tasks over <b>{vipForm.days || 20} days validity</b>. When the package validity expires, the user's <b>principal capital is automatically unlocked and released for withdrawal</b>.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVipModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADJUST USER BALANCE ================= */}
      {showBalanceModal && selectedUserForBalance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-4 sm:p-6 space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Adjust User Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl space-y-1">
              <div className="text-slate-400">User: <strong className="text-white">{selectedUserForBalance.email}</strong></div>
              <div className="text-slate-400">Current Balance: <strong className="text-emerald-400">৳{selectedUserForBalance.balance.toFixed(2)} BDT</strong></div>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceAction('add')}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    balanceAction === 'add' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  + Add Funds
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceAction('subtract')}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    balanceAction === 'subtract' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  - Deduct Funds
                </button>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PAYMENT NUMBER ================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingPayment ? `Edit Payment: ${editingPayment.method}` : 'Add Payment Number'}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Gateway Name</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => {
                      const method = e.target.value;
                      const defaultLogo = getPaymentLogo({ method });
                      setPaymentForm({
                        ...paymentForm,
                        method,
                        logo: defaultLogo
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Upay">Upay</option>
                    <option value="USDT (TRC20)">USDT (TRC20)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Account Type</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Agent">Agent</option>
                    <option value="Merchant">Merchant</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>
              </div>

              {/* LOGO UPLOAD & PREVIEW */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <label className="block text-slate-300 font-bold">Payment Gateway Logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                    <img
                      src={paymentForm.logo || getPaymentLogo(paymentForm)}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.src = '/logos/usdt.svg'; }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1.5 shadow">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                showToast('Logo file size must be under 2MB');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setPaymentForm({ ...paymentForm, logo: ev.target.result });
                                showToast('Logo uploaded!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {paymentForm.logo && (
                        <button
                          type="button"
                          onClick={() => setPaymentForm({ ...paymentForm, logo: getPaymentLogo(paymentForm) })}
                          className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                        >
                          Reset to Default
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={paymentForm.logo || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, logo: e.target.value })}
                      placeholder="Payment Logo URL"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number / Wallet Address</label>
                <input
                  type="text"
                  value={paymentForm.number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, number: e.target.value })}
                  placeholder="Phone Number / Wallet Address"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Exchange Rate (BDT per 1 USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.rate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, rate: parseFloat(e.target.value) || 1 })}
                    placeholder="Exchange Rate (BDT)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">Set 1 for crypto/USDT</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentForm.active}
                      onChange={(e) => setPaymentForm({ ...paymentForm, active: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="text-slate-200 font-semibold">Active & Visible</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Instructions for User</label>
                <textarea
                  rows="2"
                  value={paymentForm.instructions}
                  onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                  placeholder="Payment Instructions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Payment Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT HOME SLIDE ================= */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingSlide ? 'Edit Home Slide Banner' : 'Add New Slide Banner'}
              </h3>
              <button onClick={() => setShowSlideModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Upload Photo Slide / Banner
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          const rawData = re.target?.result;
                          const img = new Image();
                          img.onload = () => {
                            const maxW = 900;
                            const scale = Math.min(1, maxW / img.width);
                            const canvas = document.createElement('canvas');
                            canvas.width = Math.round(img.width * scale);
                            canvas.height = Math.round(img.height * scale);
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            const compressed = canvas.toDataURL('image/jpeg', 0.82);
                            setSlideForm((prev) => ({ ...prev, image: compressed }));
                          };
                          img.src = rawData;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
                  />
                  {slideForm.image && (
                    <button
                      type="button"
                      onClick={() => setSlideForm((prev) => ({ ...prev, image: '' }))}
                      className="px-2.5 py-2 text-rose-400 hover:text-rose-300 text-xs border border-rose-800 rounded-xl shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {slideForm.image && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-700 max-h-28">
                    <img src={slideForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Top Badge Tag</label>
                  <input
                    type="text"
                    value={slideForm.badge}
                    onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                    placeholder="Top Badge"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Prominent Text / Amount</label>
                  <input
                    type="text"
                    value={slideForm.amount}
                    onChange={(e) => setSlideForm({ ...slideForm, amount: e.target.value })}
                    placeholder="Amount / Title"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center justify-between">
                  <span>Subtitle Line</span>
                  <span className="text-[10px] text-slate-500">
                    {slideForm.image ? '(Optional for photo banners)' : '(Required)'}
                  </span>
                </label>
                <input
                  type="text"
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  placeholder="Subtitle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  required={!slideForm.image}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center justify-between">
                  <span>Theme / Banner Style</span>
                  {slideForm.image && (
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      ✓ Default Theme keeps 100% original photo colors
                    </span>
                  )}
                </label>
                <select
                  value={slideForm.gradient || 'default'}
                  onChange={(e) => setSlideForm({ ...slideForm, gradient: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="default">Default Theme (Original Photo Colors / Clean - No Color Shift)</option>
                  <option value="from-amber-500 via-orange-500 to-yellow-400">Amber / Gold Classic Gradient</option>
                  <option value="from-blue-600 via-indigo-600 to-purple-600">Indigo / Royal Purple</option>
                  <option value="from-emerald-600 via-teal-600 to-cyan-600">Emerald / Cyan Teal</option>
                  <option value="from-rose-600 via-pink-600 to-purple-600">Rose / Vivid Pink</option>
                  <option value="from-slate-900 via-purple-950 to-indigo-900">Dark Cosmic Galaxy</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={slideForm.description}
                  onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                  placeholder="Description"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSlideModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DATE-WISE PDF REPORT MODAL ================= */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-4 sm:p-6 space-y-4 sm:space-y-5 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Download Date-wise Report</h3>
                  <p className="text-xs text-slate-400">Export financial audit & user records as formatted PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Select Date Range</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'last7', label: 'Last 7 Days' },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'all', label: 'All Time' },
                  { id: 'custom', label: 'Custom Range' }
                ].map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setReportDateRange(range.id)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition cursor-pointer ${
                      reportDateRange === range.id
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers */}
              {reportDateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={reportCustomStart}
                      onChange={(e) => setReportCustomStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={reportCustomEnd}
                      onChange={(e) => setReportCustomEnd(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content Checkboxes */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300">Include Sections in PDF</label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={reportIncludeRecharges}
                    onChange={(e) => setReportIncludeRecharges(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Recharges</span>
                </label>
                <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={reportIncludeWithdrawals}
                    onChange={(e) => setReportIncludeWithdrawals(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Withdrawals</span>
                </label>
                <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={reportIncludeUsers}
                    onChange={(e) => setReportIncludeUsers(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Users</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGeneratePdfReport}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SUPPORT CHANNEL ================= */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 text-xs text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  {editingSupportChannel ? 'Edit Support Channel' : 'Add New Support Channel'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupportChannel} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Channel Name</label>
                <input
                  type="text"
                  value={supportForm.name}
                  onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                  placeholder="Channel Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Channel Platform Type</label>
                <select
                  value={supportForm.type}
                  onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="telegram">Telegram (@username or link)</option>
                  <option value="whatsapp">WhatsApp (Phone number or wa.me link)</option>
                  <option value="direct">Direct Web Link (URL)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {supportForm.type === 'telegram'
                    ? 'Telegram Username or Full Link'
                    : supportForm.type === 'whatsapp'
                    ? 'WhatsApp Phone Number or Link'
                    : 'Target Support URL'}
                </label>
                <input
                  type="text"
                  value={supportForm.link}
                  onChange={(e) => setSupportForm({ ...supportForm, link: e.target.value })}
                  placeholder={
                    supportForm.type === 'telegram'
                      ? 'Telegram Username or Link'
                      : supportForm.type === 'whatsapp'
                      ? 'WhatsApp Phone Number or Link'
                      : 'Support URL'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {supportForm.type === 'whatsapp'
                    ? 'Enter phone with country code or full WhatsApp link'
                    : supportForm.type === 'telegram'
                    ? 'Enter @handle or full https://t.me/... link'
                    : 'Enter standard web URL'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="supActive"
                  checked={supportForm.active}
                  onChange={(e) => setSupportForm({ ...supportForm, active: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="supActive" className="text-slate-300 font-semibold cursor-pointer">
                  Channel is Active (Users can contact immediately)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  {editingSupportChannel ? 'Save Changes' : 'Add Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
