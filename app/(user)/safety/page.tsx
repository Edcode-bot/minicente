"use client";

import { useT } from "@/lib/i18n";

export default function SafetyPage() {
  const { t } = useT();

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-primary"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-[20px] font-bold text-ink leading-tight">
            {t("safety_tagline")}
          </h1>
          <p className="text-[12px] text-ink3">How we protect you</p>
        </div>
      </div>

      {/* Trust facts */}
      {[
        {
          icon: "🏦",
          title: "Licensed bank partner",
          body: "Your funds are held at a Bank of Uganda-licensed institution, not by Minicente directly.",
        },
        {
          icon: "↩️",
          title: "Full refund guarantee",
          body: "If a payment fails or is sent in error, we initiate a refund within 24 hours.",
        },
        {
          icon: "🔒",
          title: "End-to-end encryption",
          body: "All data in transit and at rest is encrypted. We never store card numbers.",
        },
        {
          icon: "👆",
          title: "Biometric authentication",
          body: "Every transaction requires your fingerprint or Face ID — even on a shared device.",
        },
      ].map((fact) => (
        <div
          key={fact.title}
          className="rounded-card border border-line bg-card shadow-subtle p-4 mb-3 flex gap-3"
        >
          <span className="text-xl flex-shrink-0 mt-0.5">{fact.icon}</span>
          <div>
            <p className="text-[14px] font-semibold text-ink">{fact.title}</p>
            <p className="text-[12px] text-ink3 leading-relaxed mt-0.5">
              {fact.body}
            </p>
          </div>
        </div>
      ))}

      {/* Success rate */}
      <div className="rounded-card border border-accent/30 bg-accent/5 p-4 mt-1 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-ink">Payment success rate</p>
        <span className="money text-[22px] text-accent">99.4%</span>
      </div>
    </div>
  );
}
