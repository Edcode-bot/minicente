"use client";

import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-bg">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <span className="text-3xl">🛡</span>
          </div>
          <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-2">
            Something hiccuped
          </h1>
          <p className="text-[14px] text-ink3 leading-relaxed mb-6 max-w-[280px]">
            Your money is safe. This is just a display glitch — tap below to reload.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-button bg-primary text-white font-semibold text-[15px] px-8 py-3.5 hover:bg-primaryPress transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
