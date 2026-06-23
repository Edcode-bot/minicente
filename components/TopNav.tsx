"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-bg/90 backdrop-blur-md border-b border-line">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-lime flex items-center justify-center flex-shrink-0">
          <span className="font-display font-black text-bg text-sm leading-none">
            M
          </span>
        </div>
        <span className="font-display font-semibold text-ink text-[15px] tracking-tight">
          Minicente
        </span>
      </div>

      {/* Wallet connect */}
      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus="avatar"
      />
    </header>
  );
}
