import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Game Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen bg-gradient-felt flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-casino-black/80 backdrop-blur-sm border border-gold/30 rounded-xl shadow-elevated max-w-md w-full p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-gold" />
            </div>

            <h1 className="text-xl font-bold text-gold mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-casino-white/80 mb-6">
              The game encountered an unexpected error. Don't worry, your
              progress should be saved.
            </p>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-gradient-gold text-casino-black font-bold"
                aria-label="Try to recover from error"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={this.handleReload}
                variant="outline"
                className="w-full border-gold/30 text-gold hover:bg-gold/10"
                aria-label="Reload the game completely"
              >
                Reload Game
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-casino-white/60 cursor-pointer hover:text-casino-white">
                  Technical Details (Development)
                </summary>
                <pre className="text-xs text-red-400 mt-2 overflow-auto max-h-32 bg-casino-black/50 p-2 rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
