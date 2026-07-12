"use client";

import { useT } from "@/lib/i18n";

export function TrustRibbon() {
  const { t } = useT();
  return (
    <div className="mx-4 mt-3 flex items-start gap-3 bg-soft rounded-button px-4 py-3 border border-line">
      <span className="text-[18px] flex-shrink-0 mt-0.5" role="img" aria-label="shield">
        🛡
      </span>
      <p className="text-[12px] text-ink2 leading-relaxed flex-1">
        {t("trust_ribbon")}
      </p>
      <span className="flex-shrink-0 text-[10px] font-bold text-accent bg-accent/10 rounded-full px-2.5 py-1 whitespace-nowrap self-center">
        {t("success_rate")}
      </span>
    </div>
  );
}
