"use client";

import { useState, useEffect, useMemo } from "react";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { Agent, AgentCashStatus } from "@/lib/types";

function statusBadgeClass(status: AgentCashStatus) {
  if (status === "ready") return "text-accent bg-accent/10";
  if (status === "low") return "text-gold bg-gold/10";
  return "text-ink3 bg-soft";
}

function mockDistance(seed: number): string {
  const m = 60 + (seed * 137) % 440;
  return `${m}m`;
}

export default function CashPage() {
  const { t } = useT();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Agent | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data } = await supabase.from("agents").select("*");
      setAgents((data ?? []) as Agent[]);
      setLoading(false);
    })();
  }, []);

  const sorted = useMemo(
    () =>
      agents
        .map((a, i) => ({ agent: a, distance: mockDistance(i + 1) }))
        .sort((a, b) => parseInt(a.distance) - parseInt(b.distance)),
    [agents]
  );

  const statusLabel: Record<AgentCashStatus, string> = {
    ready: t("cash_status_ready"),
    low: t("cash_status_low"),
    out: t("cash_status_out"),
  };

  return (
    <div className="px-4 pt-5 pb-2">
      <h1 className="font-display text-[20px] font-bold text-ink leading-tight mb-1">
        {t("cash_header")}
      </h1>
      <p className="text-[13px] text-ink3 mb-4 leading-relaxed">{t("cash_sub")}</p>

      {/* Map-like panel */}
      <div className="rounded-card bg-gradient-to-br from-primary/10 via-soft to-accent/10 border border-line h-32 flex items-center justify-center mb-4">
        <p className="text-[13px] font-semibold text-ink">
          📍 {t("cash_nearby_count").replace("{count}", String(agents.length))}
        </p>
      </div>

      <div className="rounded-card border border-line bg-card shadow-subtle overflow-hidden">
        {loading ? (
          <div className="px-4 py-6 text-center">
            <div className="w-6 h-6 rounded-full border-2 border-line border-t-primary animate-spin mx-auto" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[14px] font-medium text-ink">{t("no_agents")}</p>
          </div>
        ) : (
          sorted.map(({ agent, distance }) => (
            <button
              key={agent.id}
              onClick={() => setSelected(agent)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0 text-left hover:bg-soft transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-soft flex items-center justify-center text-sm flex-shrink-0">
                🏪
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink truncate flex items-center gap-1">
                  {agent.shop_name}
                  {agent.verified && <span className="text-accent text-[11px]">✓</span>}
                </p>
                <p className="text-[11px] text-ink3 mt-0.5">
                  {agent.area} · {distance}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold rounded-full px-2.5 py-1 whitespace-nowrap flex-shrink-0 ${statusBadgeClass(agent.cash_status)}`}
              >
                {statusLabel[agent.cash_status]}
              </span>
            </button>
          ))
        )}
      </div>

      <p className="text-[11px] text-ink3 mt-3 text-center">{t("cash_verified")}</p>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card w-full max-w-[460px] rounded-t-big p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />
            <p className="text-[16px] font-semibold text-ink">{selected.shop_name}</p>
            <p className="text-[12px] text-ink3 mt-0.5">{selected.area}</p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <a
                href={`/pay/send?agent=${selected.id}`}
                className="rounded-button bg-primary text-white font-semibold text-[14px] py-3.5 text-center"
              >
                {t("cash_in")}
              </a>
              <a
                href={`/pay/send?agent=${selected.id}`}
                className="rounded-button border border-line text-ink font-semibold text-[14px] py-3.5 text-center"
              >
                {t("cash_out")}
              </a>
            </div>

            {selected.phone && (
              <a
                href={`tel:${selected.phone}`}
                className="block text-center text-[13px] font-medium text-primary mt-4"
              >
                📞 {t("cash_call")} · {selected.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
