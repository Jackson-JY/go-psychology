import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] 捕获到异常:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-paper-100 px-6 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink-900">出了点小问题</h1>
          <p className="mt-3 font-mono text-xs text-ink-900/60">
            页面发生未知错误，请刷新重试。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-sm bg-ink-900 px-6 py-2.5 font-kai text-sm text-paper-100 transition-colors hover:bg-cinnabar"
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
