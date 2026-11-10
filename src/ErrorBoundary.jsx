import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
      autoRecovering: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NextTask ErrorBoundary caught error:', error, errorInfo);

    // Auto self-healing for stale chunks, React Hook mismatches (e.g. #310), or transient bundle issues
    const errStr = String(error?.message || error || '').toLowerCase();
    const isRecoverable =
      errStr.includes('310') ||
      errStr.includes('chunk') ||
      errStr.includes('dynamically imported module') ||
      errStr.includes('rendered more hooks') ||
      errStr.includes('rendered fewer hooks') ||
      errStr.includes('hooks');

    if (isRecoverable) {
      try {
        const lastRecover = parseInt(sessionStorage.getItem('nt_auto_recover_ts') || '0', 10);
        const now = Date.now();
        // Only auto-reload if we haven't attempted within the last 15 seconds (prevents reload loop)
        if (now - lastRecover > 15000) {
          sessionStorage.setItem('nt_auto_recover_ts', String(now));
          this.setState({ autoRecovering: true });

          // Clear Service Worker caches if available
          if (typeof window !== 'undefined' && 'caches' in window) {
            caches.keys().then((keys) => {
              keys.forEach((k) => caches.delete(k));
            }).catch(() => {});
          }

          setTimeout(() => {
            window.location.reload();
          }, 400);
        }
      } catch (e) {
        console.warn('Auto recovery error:', e);
      }
    }
  }

  handleReload = () => {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        }).catch(() => {});
      }
    } catch {}
    window.location.reload();
  };

  handleResetAndGoHome = () => {
    try {
      sessionStorage.clear();
      // Keep user login credentials intact, only reset view state
      localStorage.removeItem('nt_app_current_tab');
      localStorage.removeItem('nt_active_sessions');
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        }).catch(() => {});
      }
    } catch {}
    window.location.href = '/';
  };

  handleGoToAdmin = () => {
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      if (this.state.autoRecovering) {
        return (
          <div className="h-[100dvh] w-full bg-[#05132d] flex flex-col items-center justify-center p-6 text-white text-center select-none">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-0.5 shadow-2xl shadow-cyan-500/30 animate-pulse">
                <div className="w-full h-full bg-[#05132d] rounded-3xl flex items-center justify-center">
                  <img src="/app-logo.png" alt="NextTask" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              </div>
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">সিস্টেম আপডেট হচ্ছে...</h2>
            <p className="text-xs text-cyan-300/80 mb-4 font-mono">Synchronizing latest platform state...</p>
            <div className="w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 animate-progress rounded-full"></div>
            </div>
          </div>
        );
      }

      const isAdminPage = typeof window !== 'undefined' && (
        window.location.pathname.includes('/admin') ||
        window.location.hash.includes('admin')
      );

      return (
        <div className="h-[100dvh] w-full bg-gradient-to-b from-slate-950 via-[#071329] to-slate-950 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-indigo-950/60 animate-scale-up">
            {/* Logo Emblem */}
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src="/app-logo.png" alt="NextTask" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                {isAdminPage ? 'NextTask Admin Console' : 'NextTask Platform'}
              </h2>
              <p className="text-xs text-cyan-300/80 font-medium">
                সিস্টেম আপডেট সম্পন্ন হয়েছে
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                প্লাটফর্মের নতুন নিরাপত্তা ও ডাটাবেজ আপডেট পেতে অনুগ্রহ করে নিচের বাটনে ক্লিক করে রিলোড দিন।
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/30 active:scale-[0.98] cursor-pointer"
              >
                🔄 রিলোড ও আপডেট করুন (Reload & Refresh)
              </button>

              {isAdminPage ? (
                <button
                  type="button"
                  onClick={this.handleGoToAdmin}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition active:scale-[0.98] cursor-pointer"
                >
                  🔑 অ্যাডমিন পোর্টালে যান (Admin Portal)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={this.handleResetAndGoHome}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition active:scale-[0.98] cursor-pointer"
                >
                  🏠 হোম পেইজে ফিরে যান (Return Home)
                </button>
              )}
            </div>

            {/* Technical diagnostic details toggle for developers/admins */}
            {this.state.error && (
              <div className="pt-2 border-t border-slate-800/80 text-left">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-[10px] text-slate-500 hover:text-slate-400 font-mono transition block mx-auto cursor-pointer"
                >
                  {this.state.showDetails ? '▲ Hide System Details' : '▼ System Diagnostic Info'}
                </button>
                {this.state.showDetails && (
                  <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono text-cyan-300/80 max-h-24 overflow-y-auto break-all">
                    {this.state.error.message || String(this.state.error)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
