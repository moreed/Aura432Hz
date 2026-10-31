import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
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

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/50 text-rose-200 text-xs space-y-2 m-4 max-w-md mx-auto shadow-xl">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Component Notice</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {this.props.fallbackMessage || 'A component temporarily encountered an issue. Your audio playback and session are preserved.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-aurora-teal" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
