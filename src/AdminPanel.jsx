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
  Copy
} from 'lucide-react';
import {
  getStoredData,
  setStoredData,
  DEFAULT_VIP_TIERS,
  DEFAULT_USERS,
  DEFAULT_RECHARGES,
  DEFAULT_WITHDRAWALS,
  DEFAULT_SETTINGS,
  DEFAULT_SLIDES,
  DEFAULT_PAYMENT_METHODS,
  getPaymentLogo
} from './store';

export default function AdminPanel({ onNavigateToApp }) {
  // Master Admin Authentication State
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return localStorage.getItem('nt_admin_auth') === 'true';
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

  // Auto-sync with storage whenever currentTab changes or storage event fires
  const syncData = () => {
    setRecharges(getStoredData('recharges', DEFAULT_RECHARGES));
    setWithdrawals(getStoredData('withdrawals', DEFAULT_WITHDRAWALS));
    setUsers(getStoredData('users', DEFAULT_USERS));
    if (currentTab !== 'settings') {
      setSettings(getStoredData('settings', DEFAULT_SETTINGS));
    }
    setPaymentMethods(getStoredData('payments', DEFAULT_PAYMENT_METHODS));
    setVipTiers(getStoredData('vips', DEFAULT_VIP_TIERS));
    setSlides(getStoredData('slides', DEFAULT_SLIDES));
  };

  useEffect(() => {
    syncData();
    window.addEventListener('storage', syncData);
    window.addEventListener('cloud-sync', syncData);
    const syncTimer = setInterval(syncData, 2000);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('cloud-sync', syncData);
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
    interest: '',
    daily: '',
    total: ''
  });

  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({
    badge: 'MADE',
    amount: '$3,200',
    subtitle: 'IN 48 HOURS!',
    gradient: 'from-amber-500 via-orange-500 to-yellow-400',
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
  const updateVips = (newVips) => {
    setVipTiers(newVips);
    setStoredData('vips', newVips);
  };

  const updateUsers = (newUsers) => {
    setUsers(newUsers);
    setStoredData('users', newUsers);
  };

  const updateRecharges = (newRec) => {
    setRecharges(newRec);
    setStoredData('recharges', newRec);
  };

  const updateWithdrawals = (newWth) => {
    setWithdrawals(newWth);
    setStoredData('withdrawals', newWth);
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setStoredData('settings', newSettings);
    showToast('Platform settings updated successfully!');
  };

  const updateSlides = (newSlides) => {
    setSlides(newSlides);
    setStoredData('slides', newSlides);
  };

  const updatePaymentMethods = (newMethods) => {
    setPaymentMethods(newMethods);
    setStoredData('payments', newMethods);
  };

  // --- PAYMENT METHOD HANDLERS (bKash / Nagad / Rocket / USDT) ---
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
      badge: 'PROMO',
      amount: '$5,000',
      subtitle: 'EXCLUSIVE EVENT!',
      gradient: 'from-amber-500 via-orange-500 to-yellow-400',
      description: 'Special seasonal member reward promotion'
    });
    setShowSlideModal(true);
  };

  const handleOpenEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideForm({ ...slide });
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
  const handleOpenAddVip = () => {
    setEditingVip(null);
    setVipForm({
      level: `VIP${vipTiers.length + 1}`,
      deposit: '100.00',
      tasks: 10,
      interest: '7.00',
      daily: '70.00',
      total: '16,800.00'
    });
    setShowVipModal(true);
  };

  const handleOpenEditVip = (vip) => {
    setEditingVip(vip);
    setVipForm({ ...vip });
    setShowVipModal(true);
  };

  const handleSaveVip = (e) => {
    e.preventDefault();
    if (!vipForm.level || !vipForm.deposit) {
      showToast('Level name and deposit amount are required');
      return;
    }

    if (editingVip) {
      const updated = vipTiers.map((v) => (v.id === editingVip.id ? { ...vipForm, id: v.id } : v));
      updateVips(updated);
      showToast(`${vipForm.level} updated successfully!`);
    } else {
      const newVip = {
        ...vipForm,
        id: String(Date.now())
      };
      updateVips([...vipTiers, newVip]);
      showToast(`New ${vipForm.level} added successfully!`);
    }
    setShowVipModal(false);
  };

  const handleDeleteVip = (id, level) => {
    if (confirm(`Are you sure you want to delete ${level}?`)) {
      const filtered = vipTiers.filter((v) => v.id !== id);
      updateVips(filtered);
      showToast(`${level} deleted`);
    }
  };

  // --- USER HANDLERS ---
  const handleChangeUserVip = (id, newVip) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        showToast(`User ${u.email} VIP changed to ${newVip}`);
        return { ...u, vip: newVip };
      }
      return u;
    });
    updateUsers(updated);
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

  const handleDeleteUser = (id, email) => {
    if (confirm(`Permanently delete user ${email}? This action cannot be undone.`)) {
      const filtered = users.filter((u) => u.id !== id);
      updateUsers(filtered);
      showToast(`User ${email} deleted`);
    }
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

    // 2. Credit user's balance and recharge total, and auto-upgrade VIP level if qualified
    const updatedUsers = users.map((u) => {
      const isMatch =
        (rec.userId && String(u.id) === String(rec.userId)) ||
        (rec.userEmail && String(u.email).toLowerCase() === String(rec.userEmail).toLowerCase()) ||
        (rec.userPhone && String(u.phone) === String(rec.userPhone)) ||
        (rec.user && (
          String(u.email).toLowerCase() === String(rec.user).toLowerCase() ||
          String(u.phone) === String(rec.user) ||
          String(u.name).toLowerCase() === String(rec.user).toLowerCase()
        ));

      if (isMatch) {
        const newRecharge = parseFloat(((u.recharge || 0) + rec.amount).toFixed(2));

        let newVip = u.vip || 'VIP0';
        for (const tier of vipTiers) {
          const reqDeposit = parseFloat(tier.deposit.toString().replace(/,/g, '')) || 0;
          if (newRecharge >= reqDeposit && reqDeposit > 0) {
            newVip = tier.level;
          }
        }

        return {
          ...u,
          recharge: newRecharge,
          vip: newVip
        };
      }
      return u;
    });
    updateUsers(updatedUsers);
    addNotification(rec.userId || rec.user, 'Recharge & VIP Activated', `Your recharge of ${rec.amount} USDT has been approved and added to Recharge Amount. VIP status is active with deposit locked as principal capital. Complete daily tasks to earn withdrawable profit!`, 'recharge');
    showToast(`Recharge of ${rec.amount} approved for ${rec.user}!`);
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
                  placeholder="Enter email address"
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
                  placeholder="Enter password"
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
    { id: 'payments', label: 'Payment Numbers', shortLabel: 'Payments', icon: Smartphone },
    { id: 'vips', label: 'VIP Packages', shortLabel: 'VIPs', icon: Gem },
    { id: 'slides', label: 'Home Slides / Banners', shortLabel: 'Banners', icon: ImageIcon },
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
                ? 'VIP Packages Management'
                : currentTab === 'users'
                ? 'User Accounts Management'
                : currentTab === 'recharges'
                ? 'Recharge & Deposit Approvals'
                : currentTab === 'withdrawals'
                ? 'Withdrawal Requests'
                : currentTab === 'settings'
                ? 'System & Platform Settings'
                : 'Platform Overview & Analytics'}
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
                          <span className="font-bold text-emerald-400 text-xs sm:text-sm">+${rec.amount}</span>
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
                          <span className="font-bold text-amber-400 text-xs sm:text-sm">${wth.amount}</span>
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
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Gem className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-sm">{vip.level}</span>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {vip.id || vip.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Required Deposit</div>
                      <div className="text-sm font-black text-amber-400">${vip.deposit}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Daily Profit</div>
                      <div className="text-xs font-black text-cyan-300 mt-0.5">+${vip.daily}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Total Profit</div>
                      <div className="text-xs font-black text-emerald-400 mt-0.5">${vip.total}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Daily Tasks</div>
                      <div className="text-xs font-black text-slate-200 mt-0.5">{vip.tasks}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Interest: <strong className="text-emerald-400 font-bold">{vip.interest}</strong>
                    </span>
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
                    <th className="py-3 px-4">Deposit (USDT)</th>
                    <th className="py-3 px-4">Tasks</th>
                    <th className="py-3 px-4">Simple Interest</th>
                    <th className="py-3 px-4">Daily Profit</th>
                    <th className="py-3 px-4">Total Profit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {vipTiers.map((vip) => (
                    <tr key={vip.id || vip.level} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                        <Gem className="w-3.5 h-3.5 text-amber-400" />
                        {vip.level}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">${vip.deposit}</td>
                      <td className="py-3 px-4 text-slate-400">{vip.tasks}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{vip.interest}</td>
                      <td className="py-3 px-4 text-cyan-300 font-bold">+${vip.daily}</td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">${vip.total}</td>
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
              <button
                onClick={handleOpenAddSlide}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slides.map((slide) => (
                <div key={slide.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
                  {/* Live Visual Card Preview */}
                  {slide.image ? (
                    <div className="rounded-2xl overflow-hidden relative min-h-[120px] max-h-[140px] border border-slate-700">
                      <img src={slide.image} alt="Banner" className="w-full h-full object-cover" />
                      {slide.subtitle && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                          <span className="text-white text-xs font-bold">{slide.subtitle}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                  <div className={`rounded-2xl p-4 text-white bg-gradient-to-r ${slide.gradient || 'from-amber-500 via-orange-500 to-yellow-400'} shadow-md relative overflow-hidden min-h-[120px]`}>
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
                  placeholder="Search user email or phone..."
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
                        <div className="text-sm font-black text-emerald-400 mt-0.5">${u.balance.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Recharge</div>
                        <div className="text-sm font-bold text-slate-200 mt-0.5">${u.recharge.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Phone</div>
                        <div className="text-xs text-slate-300 font-mono mt-0.5 truncate">{u.phone || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">VIP Level</div>
                        <select
                          value={u.vip || 'VIP0'}
                          onChange={(e) => handleChangeUserVip(u.id, e.target.value)}
                          className="bg-amber-950/90 text-amber-300 font-black px-2 py-1 rounded-lg border border-amber-800/50 text-[11px] outline-none cursor-pointer mt-0.5 w-full"
                        >
                          <option value="VIP0">VIP0</option>
                          {vipTiers.map((vt) => (
                            <option key={vt.level} value={vt.level}>
                              {vt.level}
                            </option>
                          ))}
                        </select>
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
                      </td>
                      <td className="py-3 px-4 text-slate-400">{u.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.vip || 'VIP0'}
                          onChange={(e) => handleChangeUserVip(u.id, e.target.value)}
                          className="bg-amber-950/90 text-amber-300 font-black px-2 py-1 rounded-lg border border-amber-800/50 text-[10px] outline-none cursor-pointer hover:border-amber-500"
                        >
                          <option value="VIP0">VIP0</option>
                          {vipTiers.map((vt) => (
                            <option key={vt.level} value={vt.level}>
                              {vt.level}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400">${u.balance.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">${u.recharge.toFixed(2)}</td>
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
                        <div className="text-base font-black text-emerald-400 mt-0.5">+${r.amount.toFixed(2)} USDT</div>
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
                        <td className="py-3 px-4 font-black text-emerald-400">${r.amount.toFixed(2)}</td>
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
                        <div className="text-base font-black text-amber-400 mt-0.5">${w.amount.toFixed(2)} USDT</div>
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
                        <td className="py-3 px-4 font-black text-amber-400">${w.amount.toFixed(2)}</td>
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
                    placeholder="Enter TRC20 Wallet Address"
                  />
                  <p className="text-[10px] text-slate-500">This TRC20 wallet address is presented to users in the app when recharging via crypto.</p>
                </div>

                {/* Min Deposit & Min Withdrawal Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-300 font-bold">Minimum Deposit</label>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">USDT</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">$</span>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={settings.minDeposit ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings((prev) => ({ ...prev, minDeposit: val === '' ? '' : parseFloat(val) }));
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-slate-100 font-bold text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition shadow-inner"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Recharge modal will enforce this exact minimum threshold.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-300 font-bold">Minimum Withdrawal</label>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">USDT</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">$</span>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={settings.minWithdrawal ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings((prev) => ({ ...prev, minWithdrawal: val === '' ? '' : parseFloat(val) }));
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-slate-100 font-bold text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 transition shadow-inner"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">User withdrawal modal will enforce this exact minimum threshold.</p>
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
                    placeholder="@NextTask_Support"
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
                        minWithdrawal: typeof settings.minWithdrawal === 'number' ? settings.minWithdrawal : (parseFloat(settings.minWithdrawal) || 0)
                      };
                      setSettings(payload);
                      updateSettings(payload);
                      showToast(`Settings saved! Min Deposit: $${payload.minDeposit}, Min Withdrawal: $${payload.minWithdrawal}`);
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
                <label className="block text-slate-400 mb-1">Level Name (e.g. VIP11)</label>
                <input
                  type="text"
                  value={vipForm.level}
                  onChange={(e) => setVipForm({ ...vipForm, level: e.target.value })}
                  placeholder="VIP11"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Deposit Amount (USDT)</label>
                  <input
                    type="text"
                    value={vipForm.deposit}
                    onChange={(e) => setVipForm({ ...vipForm, deposit: e.target.value })}
                    placeholder="50,000.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Daily Tasks Count</label>
                  <input
                    type="number"
                    value={vipForm.tasks}
                    onChange={(e) => setVipForm({ ...vipForm, tasks: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Simple Interest</label>
                  <input
                    type="text"
                    value={vipForm.interest}
                    onChange={(e) => setVipForm({ ...vipForm, interest: e.target.value })}
                    placeholder="3500.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Daily Profit</label>
                  <input
                    type="text"
                    value={vipForm.daily}
                    onChange={(e) => setVipForm({ ...vipForm, daily: e.target.value })}
                    placeholder="35,000.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Total Profit</label>
                  <input
                    type="text"
                    value={vipForm.total}
                    onChange={(e) => setVipForm({ ...vipForm, total: e.target.value })}
                    placeholder="8,400,000.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
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
              <div className="text-slate-400">Current Balance: <strong className="text-emerald-400">${selectedUserForBalance.balance.toFixed(2)} USDT</strong></div>
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
                      placeholder="Or paste image URL (e.g. /logos/bkash.svg)"
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
                  placeholder="017XXXXXXXX or TRC20 Address"
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
                    placeholder="125"
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
                  placeholder="Please Send Money and enter TrxID below"
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
                  Upload Photo Slide / Banner (Optional)
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
                    placeholder="MADE / BONUS / OFFICIAL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Prominent Text / Amount</label>
                  <input
                    type="text"
                    value={slideForm.amount}
                    onChange={(e) => setSlideForm({ ...slideForm, amount: e.target.value })}
                    placeholder="$3,200 or 16% BONUS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subtitle Line</label>
                <input
                  type="text"
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  placeholder="IN 48 HOURS! / LEVEL 1 REWARDS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Gradient Theme</label>
                <select
                  value={slideForm.gradient}
                  onChange={(e) => setSlideForm({ ...slideForm, gradient: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="from-amber-500 via-orange-500 to-yellow-400">Amber / Gold (NextTask Default)</option>
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
                  placeholder="Brief promotional description..."
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
    </div>
  );
}
