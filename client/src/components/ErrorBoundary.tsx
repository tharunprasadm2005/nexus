import { Component, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
  constructor(props: Props & { navigate: (path: string) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.navigate('/login');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-holst-cream px-4">
          <div className="w-full max-w-md rounded-3xl neu-lg bg-holst-cream p-10 text-center">
            <div className="mb-6 flex flex-col items-center">
              <span className="mb-4 text-3xl text-holst-sand">✦</span>
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-holst-sand" />
                <div className="h-1.5 w-1.5 rounded-full bg-holst-sand" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-holst-sand" />
              </div>
            </div>

            <h1 className="font-display text-xl font-semibold text-holst-navy-900">
              Something went wrong
            </h1>

            <p className="mt-3 text-sm text-holst-navy-800/50">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            <div className="mt-8">
              <button
                onClick={this.handleReset}
                className="btn-neu rounded-xl px-8 py-3 font-body text-sm font-medium text-holst-navy-900 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Return to Login
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-holst-navy-800/10" />
              <span className="text-[10px] text-holst-navy-800/40">ERROR_BOUNDARY</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-holst-navy-800/10" />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ErrorBoundaryNavigateWrapper({ children, fallback }: Props) {
  const navigate = useNavigate();
  return (
    <ErrorBoundaryClass navigate={navigate} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundaryNavigateWrapper;
