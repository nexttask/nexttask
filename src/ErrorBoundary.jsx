import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NextTask Global ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] w-full bg-slate-950 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The application encountered an unexpected issue. Please reload or reset cache.
              </p>
            </div>
            {this.state.error && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-rose-300 text-left max-h-24 overflow-y-auto break-all">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Reset Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
