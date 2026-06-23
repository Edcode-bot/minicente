"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";

type Rail = "mobilemoney" | "stablecoin" | "swift";
type Destination = "local" | "regional" | "intl";

const RAILS: { id: Rail; label: string; fee: number; time: string; icon: string }[] = [
  { id: "mobilemoney", label: "Mobile Money", fee: 1.5, time: "< 5 min", icon: "📱" },
  { id: "stablecoin", label: "Stablecoin L2", fee: 0.5, time: "< 30 sec", icon: "⚡" },
  { id: "swift", label: "Bank / SWIFT", fee: 4.0, time: "1–3 days", icon: "🏦" },
];

const DESTINATIONS: { id: Destination; label: string }[] = [
  { id: "local", label: "Local" },
  { id: "regional", label: "Regional" },
  { id: "intl", label: "International" },
];

const PLATFORM_FEE = 0.3; // %

export default function SendPage() {
  const [amount, setAmount] = useState("100");
  const [rail, setRail] = useState<Rail>("stablecoin");
  const [destination, setDestination] = useState<Destination>("local");

  const numAmount = parseFloat(amount) || 0;
  const selectedRail = RAILS.find((r) => r.id === rail)!;
  const railFee = (numAmount * selectedRail.fee) / 100;
  const platformFee = (numAmount * PLATFORM_FEE) / 100;
  const totalFee = railFee + platformFee;
  const recipientGets = Math.max(0, numAmount - totalFee);
  const traditionalFee = numAmount * 0.07; // 7% avg traditional
  const savedVsTraditional = traditionalFee - totalFee;

  return (
    <div className="px-4 pb-6">
      <PageHeader title="Send Money" subtitle="Fast, cheap, borderless" />

      {/* ── Amount input ─────────────────────────────────── */}
      <div className="bg-card rounded-xl3 p-5 border border-line mb-4">
        <p className="text-ink3 text-xs font-medium mb-2">Amount (USD)</p>
        <div className="flex items-center gap-2">
          <span className="font-display text-3xl text-ink3">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent font-display text-4xl font-bold text-ink outline-none placeholder:text-ink3 min-w-0"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex gap-2 mt-4">
          {[25, 50, 100, 250].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="flex-1 text-xs py-1.5 rounded-lg bg-bg3 border border-line text-ink2 hover:border-line2 hover:text-ink transition-colors"
            >
              ${v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Rail picker ──────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-ink3 text-xs font-medium px-1 mb-2">Payment Rail</p>
        <div className="space-y-2">
          {RAILS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRail(r.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl2 border transition-all ${
                rail === r.id
                  ? "border-lime bg-lime/5"
                  : "border-line bg-card hover:border-line2"
              }`}
            >
              <span className="text-xl">{r.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-ink">{r.label}</p>
                <p className="text-xs text-ink3">{r.time}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  rail === r.id ? "text-lime" : "text-ink2"
                }`}
              >
                {r.fee}% fee
              </span>
              {rail === r.id && (
                <span className="w-4 h-4 rounded-full bg-lime flex items-center justify-center ml-1">
                  <span className="text-bg text-[10px] font-bold">✓</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Destination toggle ───────────────────────────── */}
      <div className="mb-4">
        <p className="text-ink3 text-xs font-medium px-1 mb-2">Destination</p>
        <div className="flex bg-card rounded-xl border border-line p-1 gap-1">
          {DESTINATIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDestination(d.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                destination === d.id
                  ? "bg-lime text-bg"
                  : "text-ink3 hover:text-ink"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Fee breakdown ────────────────────────────────── */}
      <div className="bg-card rounded-xl2 border border-line p-4 space-y-3 mb-4">
        <p className="text-xs font-medium text-ink3 uppercase tracking-wider">
          Fee Breakdown
        </p>

        <div className="space-y-2.5">
          <Row label={`Rail fee (${selectedRail.fee}%)`} value={`$${railFee.toFixed(2)}`} />
          <Row label={`Platform fee (${PLATFORM_FEE}%)`} value={`$${platformFee.toFixed(2)}`} />
          <div className="border-t border-line pt-2.5">
            <Row label="Total fees" value={`$${totalFee.toFixed(2)}`} accent />
          </div>
          <Row label="Settlement time" value={selectedRail.time} />
          {savedVsTraditional > 0 && (
            <div className="flex items-center justify-between bg-teal/5 rounded-xl px-3 py-2">
              <span className="text-xs text-teal font-medium">
                Saved vs traditional
              </span>
              <span className="text-xs text-teal font-bold">
                ${savedVsTraditional.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">
              Recipient gets
            </span>
            <span className="font-display text-xl font-bold text-lime">
              ${recipientGets.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <button
        disabled={numAmount <= 0}
        className="w-full bg-lime text-bg font-display font-bold text-base py-4 rounded-xl2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lime2 active:scale-[0.98] transition-all duration-150"
      >
        Send ${numAmount > 0 ? recipientGets.toFixed(2) : "0.00"}
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink3">{label}</span>
      <span className={`text-xs font-semibold ${accent ? "text-ink" : "text-ink2"}`}>
        {value}
      </span>
    </div>
  );
}
