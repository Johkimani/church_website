import { Component, type ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <div className="text-center">
            <FaExclamationTriangle size={32} className="text-amber-400 mx-auto mb-3" />
            <p className="font-bold text-slate-800 mb-1">Something went wrong</p>
            <p className="text-xs text-slate-500 mb-4 max-w-xs">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              <FaRedo size={12} /> Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
