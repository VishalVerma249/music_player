'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
          <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Audio Experience Interrupted</h2>
            <p className="text-sm text-zinc-400">
              An unexpected error occurred. The music player interface can be recovered cleanly.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium hover:bg-white transition-colors shadow-lg"
            >
              Reload Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
