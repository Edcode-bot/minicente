"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-inv-bg/90 backdrop-blur-md border-b border-inv-line">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-inv-lime flex items-center justify-center flex-shrink-0">
          <span className="font-display font-black text-inv-bg text-sm leading-none">
            M
          </span>
        </div>
        <span className="font-display font-semibold text-inv-ink text-[15px] tracking-tight">
          Minicente
        </span>
        <span className="text-[10px] bg-inv-lime/10 text-inv-lime px-2 py-0.5 rounded-full font-bold ml-1">
          INVESTOR DEMO
        </span>
      </div>
      <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
    </header>
  );
}
