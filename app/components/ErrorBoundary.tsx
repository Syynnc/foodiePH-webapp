"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    // Re-throw Next.js internal errors (redirect, notFound) so the router can handle them
    const digest = (error as Record<string, unknown>)?.digest;
    if (typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND"))) {
      throw error;
    }
    return { hasError: true, message: error instanceof Error ? error.message : "Something went wrong." };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-[#1a1208]">Something went wrong</p>
          <p className="text-[11px] text-[#1a1208]/40 max-w-xs">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#c8783a] border border-[#c8783a]/30 rounded-xl px-4 py-2 hover:bg-[#c8783a]/5 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
