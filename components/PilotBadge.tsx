"use client";

import { useT } from "@/lib/i18n";

// Calm, honest pilot disclosure pill — shown on Home and pay confirm screens.
// Not alarming; uses muted bank-like tokens (soft/line/ink3).
export function PilotBadge({ className = "" }: { className?: string }) {
  const { t } = useT();
  return (
    <div className={`flex justify-center ${className}`}>
      <span className="inline-flex items-center gap-1.5 border border-line bg-soft rounded-full px-3 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
        <span className="text-[11px] font-medium text-ink3">{t("pilot_badge")}</span>
      </span>
    </div>
  );
}
