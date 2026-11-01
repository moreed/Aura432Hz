import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
  onClose?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError) {
      const prevChild = React.isValidElement(prevProps.children) ? (prevProps.children as any) : null;
      const nextChild = React.isValidElement(this.props.children) ? (this.props.children as any) : null;
      // If modal was closed in parent, automatically reset error boundary so it does not linger
      if (prevChild?.props?.isOpen && nextChild?.props?.isOpen === false) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      // If wrapped child is a modal with isOpen === false, do not display error banner across the page
      if (
        React.isValidElement(this.props.children) &&
        (this.props.children as any).props?.isOpen === false
      ) {
        return null;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              this.setState({ hasError: false, error: null });
              this.props.onClose?.();
            }
          }}
        >
          <div className="relative w-full max-w-md p-5 rounded-2xl sm:rounded-3xl bg-slate-900 border border-rose-500/50 text-rose-200 text-xs space-y-3 shadow-2xl">
            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onClose?.();
              }}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss Notice"
              aria-label="Dismiss Notice"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 font-bold text-rose-300 text-sm">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <span>Component Notice</span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {this.props.fallbackMessage || 'A component temporarily encountered an unexpected condition. Your playback and sanctuary session are unaffected.'}
            </p>

            {this.state.error?.message && (
              <div className="p-2 rounded-lg bg-slate-950/80 border border-rose-500/30 text-[10px] font-mono text-rose-300/80 truncate max-w-full">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onReset?.();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-aurora-teal to-teal-400 text-midnight font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95 transition-all active:scale-95 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-midnight" />
                <span>Retry</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onClose?.();
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
