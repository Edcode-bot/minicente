"use client";

import { AGENT_STATS } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

const AGENT_ACTIONS = [
  { label: "Cash In", icon: "↓", accent: "text-inv-teal", bg: "bg-inv-teal/10", desc: "Accept cash deposits" },
  { label: "Cash Out", icon: "↑", accent: "text-inv-red", bg: "bg-inv-red/10", desc: "Dispense cash to users" },
  { label: "Open Account", icon: "＋", accent: "text-inv-blue", bg: "bg-inv-blue/10", desc: "Onboard new customers" },
  { label: "Pay Bills", icon: "🧾", accent: "text-inv-amber", bg: "bg-inv-amber/10", desc: "Collect bill payments" },
] as const;

const COMMISSION_TIERS = [
  { tier: "Standard", rate: "1.5%", threshold: "< $5,000 / month" },
  { tier: "Silver", rate: "2.0%", threshold: "$5,000 – $20,000 / month" },
  { tier: "Gold", rate: "2.5%", threshold: "> $20,000 / month" },
];

export default function InvestorAgencyPage() {
  return (
    <div className="px-4 pb-6">
      <PageHeader title="Agent Dashboard" subtitle="Earn commissions as a Minicente agent"
        action={<span className="text-[10px] bg-inv-lime/10 text-inv-lime px-2 py-1 rounded-full font-bold">GOLD</span>} />

      <div className="bg-gradient-to-br from-inv-lime/10 to-inv-bg3 rounded-xl3 border border-inv-lime/20 p-5 mb-4">
        <p className="text-inv-ink3 text-xs font-medium">Float Balance</p>
        <p className="font-display text-4xl font-bold text-inv-ink mt-1">$1,420.00</p>
        <p className="text-inv-ink3 text-xs mt-1">Available to disburse</p>
        <button className="mt-3 text-xs bg-inv-lime text-inv-bg font-bold px-4 py-2 rounded-xl hover:bg-inv-lime2 transition-colors">
          Top Up Float
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {AGENT_STATS.map((stat) => (
          <div key={stat.label} className="bg-inv-card rounded-xl2 border border-inv-line p-3">
            <p className="text-[10px] text-inv-ink3 leading-tight">{stat.label}</p>
            <p className="font-display text-lg font-bold mt-1" style={{ color: stat.accent }}>{stat.value}</p>
            {stat.delta && <p className="text-[10px] text-inv-teal mt-0.5">{stat.delta}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {AGENT_ACTIONS.map((a) => (
          <button key={a.label} className="bg-inv-card rounded-xl2 border border-inv-line hover:border-inv-line2 p-4 flex flex-col gap-3 text-left transition-all active:scale-95">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${a.bg} ${a.accent}`}>{a.icon}</span>
            <div>
              <p className="text-sm font-semibold text-inv-ink">{a.label}</p>
              <p className="text-xs text-inv-ink3 mt-0.5">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-inv-card rounded-xl2 border border-inv-line p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-inv-ink">Commission Rates</p>
          <span className="text-xs text-inv-ink3">Your tier: Gold</span>
        </div>
        <div className="space-y-2">
          {COMMISSION_TIERS.map((t) => (
            <div key={t.tier} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
              t.tier === "Gold" ? "bg-inv-lime/10 border border-inv-lime/20" : "bg-inv-bg3"
            }`}>
              <div>
                <p className={`text-xs font-semibold ${t.tier === "Gold" ? "text-inv-lime" : "text-inv-ink2"}`}>{t.tier}</p>
                <p className="text-[10px] text-inv-ink3">{t.threshold}</p>
              </div>
              <span className={`font-display text-base font-bold ${t.tier === "Gold" ? "text-inv-lime" : "text-inv-ink3"}`}>{t.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
