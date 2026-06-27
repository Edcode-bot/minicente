"use client";

import Link from "next/link";
import { BALANCE, USER, TXNS, type Transaction } from "@/lib/data";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

const ACTIONS = [
  { label: "Send", href: "/investor/send", accent: "text-inv-lime", bg: "bg-inv-lime/10", icon: "↑" },
  { label: "Receive", href: "/investor", accent: "text-inv-teal", bg: "bg-inv-teal/10", icon: "↓" },
  { label: "Swap", href: "/investor", accent: "text-inv-blue", bg: "bg-inv-blue/10", icon: "⇄" },
  { label: "Agent", href: "/investor/agency", accent: "text-inv-amber", bg: "bg-inv-amber/10", icon: "◉" },
] as const;

function txnColors(txn: Transaction) {
  if (txn.type === "receive")
    return { icon: "bg-inv-teal/10 text-inv-teal", amount: "text-inv-teal", sign: "+" };
  if (txn.type === "send")
    return { icon: "bg-inv-red/10 text-inv-red", amount: "text-inv-ink", sign: "−" };
  return { icon: "bg-inv-blue/10 text-inv-blue", amount: "text-inv-ink", sign: "" };
}

function statusColor(s: Transaction["status"]) {
  if (s === "completed") return "text-inv-teal";
  if (s === "pending") return "text-inv-amber";
  return "text-inv-red";
}

export default function InvestorHomePage() {
  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Balance card */}
      <div className="rounded-xl3 p-5 bg-gradient-to-br from-inv-card2 via-inv-bg3 to-inv-bg3 border border-inv-line2 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-inv-lime/5 blur-2xl pointer-events-none" />
        <div className="relative">
          <p className="text-inv-ink3 text-xs font-medium uppercase tracking-widest">
            Total Balance
          </p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="font-display text-[38px] font-bold text-inv-ink leading-none">
              ${BALANCE.usd.toLocaleString("en", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-inv-ink3 text-sm mt-1.5">
            {BALANCE.localSymbol}
            {BALANCE.local.toLocaleString()} {BALANCE.localCurrency}
          </p>
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs bg-inv-lime/10 text-inv-lime rounded-full px-3 py-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-inv-lime animate-pulse" />
            {BALANCE.chains} chains · Live
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex flex-col items-center gap-2 bg-inv-card rounded-xl2 py-3.5 border border-inv-line hover:border-inv-line2 active:scale-95 transition-all duration-150"
          >
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold ${a.bg} ${a.accent}`}>
              {a.icon}
            </span>
            <span className="text-[11px] text-inv-ink2 font-medium">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Chain strip */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 w-max pb-1">
          {SUPPORTED_CHAINS.map((chain) => (
            <div
              key={chain.id}
              className="flex items-center gap-2 bg-inv-card rounded-xl px-3 py-2 border border-inv-line whitespace-nowrap flex-shrink-0"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: chain.accent }}
              />
              <span className="text-[11px] font-mono font-medium text-inv-ink2">
                {chain.tag}
              </span>
              <span className="text-[10px] text-inv-ink3">{chain.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/investor/savings" className="bg-inv-card rounded-xl2 p-4 border border-inv-line hover:border-inv-line2 transition-colors">
          <p className="text-inv-ink3 text-xs font-medium">Total Savings</p>
          <p className="font-display text-xl font-bold text-inv-ink mt-1">$1,240</p>
          <p className="text-inv-teal text-xs mt-1.5 font-medium">↑ 7.2% APY</p>
        </Link>
        <Link href="/investor/loans" className="bg-inv-card rounded-xl2 p-4 border border-inv-line hover:border-inv-line2 transition-colors">
          <p className="text-inv-ink3 text-xs font-medium">Active Loan</p>
          <p className="font-display text-xl font-bold text-inv-ink mt-1">$500</p>
          <p className="text-inv-amber text-xs mt-1.5 font-medium">Next: $125 due</p>
        </Link>
      </div>

      {/* KYC nudge */}
      {USER.kyc.tier < 3 && (
        <Link href="/investor/settings" className="flex items-center justify-between bg-inv-amber/10 border border-inv-amber/20 rounded-xl2 p-4 hover:bg-inv-amber/15 transition-colors">
          <div>
            <p className="text-inv-amber text-sm font-semibold">
              Complete KYC Tier {USER.kyc.tier + 1}
            </p>
            <p className="text-inv-ink3 text-xs mt-0.5">
              {USER.kyc.completed}/{USER.kyc.total} steps complete · Unlock higher limits
            </p>
          </div>
          <span className="text-inv-amber text-lg ml-3">→</span>
        </Link>
      )}

      {/* Recent transactions */}
      <div className="pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold text-inv-ink">Recent</h2>
          <button className="text-xs text-inv-lime font-medium">See all</button>
        </div>
        <div className="space-y-2">
          {TXNS.slice(0, 5).map((txn) => {
            const { icon, amount, sign } = txnColors(txn);
            return (
              <div key={txn.id} className="bg-inv-card rounded-xl p-3.5 border border-inv-line flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${icon}`}>
                  {txn.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-inv-ink truncate">{txn.title}</p>
                  <p className="text-[11px] text-inv-ink3 mt-0.5">{txn.subtitle} · {txn.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${amount}`}>{sign}${txn.amount.toFixed(2)}</p>
                  <p className={`text-[10px] mt-0.5 ${statusColor(txn.status)}`}>{txn.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
