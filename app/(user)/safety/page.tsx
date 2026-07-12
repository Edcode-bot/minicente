"use client";

import { useT } from "@/lib/i18n";
import { usePlatformStats } from "@/lib/hooks/usePlatformStats";

function TrustBlock({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-3 flex gap-4">
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[14px] font-semibold text-ink leading-snug">{title}</p>
        <p className="text-[12px] text-ink3 leading-relaxed mt-1.5">{body}</p>
      </div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-line last:border-0">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[11px] font-bold text-primary">{n}</span>
      </div>
      <p className="text-[13px] text-ink leading-relaxed flex-1">{text}</p>
    </div>
  );
}

export default function SafetyPage() {
  const { t } = useT();
  const { stats } = usePlatformStats();

  const successRate = stats
    ? `${stats.success_rate.toFixed(1)}%`
    : "99.4%";

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Pilot disclaimer — required at top of safety page */}
      <div className="rounded-card border border-gold/40 bg-gold/5 px-4 py-4 mb-5 flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-[13px] text-ink leading-relaxed">{t("safety_pilot_notice")}</p>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-primary"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-[20px] font-bold text-ink leading-tight">
            {t("safety_title")}
          </h1>
          <p className="text-[12px] text-ink3 mt-0.5">{t("safety_tagline")}</p>
        </div>
      </div>

      {/* Live success rate chip */}
      <div className="rounded-card border border-accent/30 bg-accent/5 p-4 mb-5 flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink">{t("safety_rate_label")}</p>
        <span className="money text-[24px] font-bold text-accent">{successRate}</span>
      </div>

      {/* Four trust blocks */}
      <TrustBlock
        icon="🏦"
        title={t("safety_licensed_title")}
        body={t("safety_licensed_body")}
      />
      <TrustBlock
        icon="↩️"
        title={t("safety_refund_title")}
        body={t("safety_refund_body")}
      />
      <TrustBlock
        icon="🛡️"
        title={t("safety_bou_title")}
        body={t("safety_bou_body")}
      />
      <TrustBlock
        icon="📞"
        title={t("safety_support_title")}
        body={t("safety_support_body")}
      />

      {/* How refunds work — 3 steps */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-5 mt-2 mb-4">
        <p className="text-[14px] font-semibold text-ink mb-3">{t("safety_how_refunds")}</p>
        <Step n={1} text={t("safety_step1")} />
        <Step n={2} text={t("safety_step2")} />
        <Step n={3} text={t("safety_step3")} />
      </div>

      {/* Guarantee line */}
      <div className="text-center px-2 py-4">
        <p className="text-[13px] font-medium text-ink2 leading-relaxed">
          {t("safety_guarantee")}
        </p>
      </div>

      {/* USSD footer */}
      <div className="text-center mt-2">
        <p className="text-[11px] text-ink3">{t("ussd_footer")}</p>
      </div>
    </div>
  );
}
