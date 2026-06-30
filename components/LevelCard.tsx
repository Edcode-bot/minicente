"use client";

import { useT } from "@/lib/i18n";
import type { LevelState } from "@/lib/hooks/useLevel";

const BADGE_STYLE: Record<string, string> = {
  Starter: "bg-soft text-ink3 border-line",
  Silver: "bg-[#e8e8ee] text-[#6b6b8a] border-[#c8c8d8]",
  Gold: "bg-gold/10 text-gold border-gold/30",
  Platinum: "bg-info/10 text-info border-info/30",
};

export function LevelCard({ level }: { level: LevelState }) {
  const { t } = useT();
  if (level.loading) return null;

  const name = level.currentLevel?.name ?? "Starter";
  const badgeClass = BADGE_STYLE[name] ?? BADGE_STYLE.Starter;
  const pct = level.nextLevel
    ? Math.round(
        ((level.txnCount - (level.currentLevel?.unlock_txns ?? 0)) /
          (level.nextLevel.unlock_txns - (level.currentLevel?.unlock_txns ?? 0))) *
          100
      )
    : 100;

  return (
    <div className="rounded-card border border-line bg-card shadow-subtle p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-ink">{t("level_card_title")}</p>
        <span className={`text-[11px] font-bold border rounded-full px-3 py-1 ${badgeClass}`}>
          {name}
        </span>
      </div>

      <div className="w-full h-1.5 bg-soft rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {level.nextLevel ? (
        <p className="text-[11px] text-ink3">
          {t("level_progress")
            .replace("{n}", String(level.toNextLevel))
            .replace("{level}", level.nextLevel.name)}
          {" · "}
          {t("level_unlock_hint")
            .replace("{level}", level.nextLevel.name)
            .replace("{perks}", level.nextLevel.perks)}
        </p>
      ) : (
        <p className="text-[11px] text-ink3">{t("level_maxed")}</p>
      )}
    </div>
  );
}
