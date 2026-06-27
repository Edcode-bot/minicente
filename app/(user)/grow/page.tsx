"use client";

import { useT } from "@/lib/i18n";

export default function GrowPage() {
  const { t } = useT();

  return (
    <div className="px-4 pt-5 pb-2">
      <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-1">
        {t("grow")}
      </h1>
      <p className="text-[13px] text-ink3 mb-4">Save more, earn more.</p>

      <div className="rounded-card border border-line bg-card shadow-subtle p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📈</span>
          <p className="text-[15px] font-semibold text-ink">
            {t("coming_soon")}
          </p>
        </div>
        <p className="text-[13px] text-ink3 leading-relaxed">
          Savings products, goal pots, chama groups, and DeFi yield will appear
          here in P3.
        </p>
      </div>

      {/* Preview tiles */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          { name: "Flexi Yield", apy: "7.2%", color: "bg-accent/10 text-accent" },
          { name: "Goal Pot", apy: "6.5%", color: "bg-info/10 text-info" },
          { name: "Fixed Term", apy: "11%", color: "bg-primary/10 text-primary" },
          { name: "Chama", apy: "Group", color: "bg-gold/10 text-gold" },
        ].map((p) => (
          <div
            key={p.name}
            className="rounded-card border border-line bg-card shadow-subtle p-4 opacity-50"
          >
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.color}`}>
              {p.apy}
            </span>
            <p className="text-[13px] font-semibold text-ink mt-2">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
