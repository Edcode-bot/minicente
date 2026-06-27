"use client";

import { useT } from "@/lib/i18n";

export default function CashPage() {
  const { t } = useT();

  return (
    <div className="px-4 pt-5 pb-2">
      <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-1">
        {t("cash")}
      </h1>
      <p className="text-[13px] text-ink3 mb-4">Send, receive, pay bills.</p>

      <div className="rounded-card border border-line bg-card shadow-subtle p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💸</span>
          <p className="text-[15px] font-semibold text-ink">
            {t("coming_soon")}
          </p>
        </div>
        <p className="text-[13px] text-ink3 leading-relaxed">
          Mobile money top-up, bank transfer, remittance, and bill payments will
          live here in P4.
        </p>
      </div>

      {/* Quick action preview */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: t("send"), icon: "↑", color: "text-primary" },
          { label: t("receive"), icon: "↓", color: "text-accent" },
          { label: "Bills", icon: "🧾", color: "text-gold" },
        ].map((a) => (
          <div
            key={a.label}
            className="rounded-card border border-line bg-card shadow-subtle p-4 flex flex-col items-center gap-2 opacity-50 min-h-[72px] justify-center"
          >
            <span className={`text-xl font-bold ${a.color}`}>{a.icon}</span>
            <span className="text-[11px] text-ink2 font-medium">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
