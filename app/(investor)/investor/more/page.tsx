"use client";

import { useState } from "react";
import Link from "next/link";
import { REMITTANCE, MARKETPLACE, FEATURES, type FeatureLayer } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

const FILTER_TABS: { id: FeatureLayer | "All"; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Core", label: "Core" },
  { id: "Growth", label: "Growth" },
  { id: "Vision", label: "Vision" },
];

const LAYER_COLORS: Record<FeatureLayer, string> = {
  Core: "#2dd4a0",
  Growth: "#4a9eff",
  Vision: "#a78bfa",
};

const FLAGS: Record<string, string> = { GH: "🇬🇭", UK: "🇬🇧", US: "🇺🇸", NG: "🇳🇬" };

export default function InvestorMorePage() {
  const [filter, setFilter] = useState<FeatureLayer | "All">("All");
  const filtered = filter === "All" ? FEATURES : FEATURES.filter((f) => f.layer === filter);

  return (
    <div className="px-4 pb-6">
      <PageHeader title="More" subtitle="Services, features & settings" />

      {/* Remittance */}
      <div className="bg-gradient-to-br from-inv-purple/10 to-inv-bg3 rounded-xl3 border border-inv-purple/20 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-inv-ink3 font-medium">Remittance</p>
            <p className="font-display text-base font-bold text-inv-ink mt-0.5">Send globally at 0.5%</p>
          </div>
          <span className="text-2xl">🌍</span>
        </div>
        <div className="space-y-2">
          {REMITTANCE.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-inv-bg3/60 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{FLAGS[r.from]}→{FLAGS[r.to]}</span>
                <div>
                  <p className="text-[11px] font-medium text-inv-ink">{r.rail}</p>
                  <p className="text-[10px] text-inv-ink3">{r.time}</p>
                </div>
              </div>
              <p className="text-xs font-bold" style={{ color: r.accent }}>{r.fee}% fee</p>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full text-xs font-bold py-2.5 rounded-xl bg-inv-purple/10 text-inv-purple border border-inv-purple/20 hover:bg-inv-purple/20 transition-colors">
          Send Money →
        </button>
      </div>

      {/* Marketplace */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold text-inv-ink">Services</h2>
          <Link href="/investor/settings" className="text-xs text-inv-ink3 hover:text-inv-lime">Settings →</Link>
        </div>
        <div className="space-y-2">
          {MARKETPLACE.map((item) => (
            <button key={item.id} className="w-full bg-inv-card rounded-xl p-4 border border-inv-line hover:border-inv-line2 flex items-center gap-3 transition-colors text-left">
              <span className="text-xl w-8 text-center flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-inv-ink">{item.name}</p>
                <p className="text-xs text-inv-ink3 mt-0.5">{item.desc}</p>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  item.badge === "Upgrade" ? "bg-inv-lime/10 text-inv-lime" :
                  item.badge === "New" ? "bg-inv-purple/10 text-inv-purple" :
                  "bg-inv-blue/10 text-inv-blue"
                }`}>{item.badge}</span>
              )}
              <span className="text-inv-ink3 ml-1">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature catalogue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold text-inv-ink">All Features</h2>
          <span className="text-xs text-inv-ink3">{filtered.length} features</span>
        </div>
        <div className="flex bg-inv-card rounded-xl border border-inv-line p-1 gap-1 mb-4">
          {FILTER_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === tab.id ? "bg-inv-lime text-inv-bg" : "text-inv-ink3 hover:text-inv-ink"
              }`}>{tab.label}</button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((feature) => (
            <div key={feature.id} className="bg-inv-card rounded-xl p-4 border border-inv-line flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{feature.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-inv-ink">{feature.title}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color: LAYER_COLORS[feature.layer], backgroundColor: `${LAYER_COLORS[feature.layer]}15` }}>
                    {feature.layer}
                  </span>
                </div>
                <p className="text-xs text-inv-ink3 mt-0.5 leading-relaxed">{feature.desc}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold text-inv-lime">{feature.metric}</span>
                  {feature.chains.map((c) => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 bg-inv-bg3 border border-inv-line rounded-full text-inv-ink3 font-mono">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
