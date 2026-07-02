"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

const PERKS = [
  { icon: "💸", en: "Earn commission on every cash in & out", lug: "Funa komisayo ku buli sendi ne funa" },
  { icon: "📱", en: "Free priority support line", lug: "Simu w'obujja ogw'obumugufu" },
  { icon: "📈", en: "Grow to Silver & Gold for higher rates", lug: "Genda ku Fedha ne Zaabu okufuna ebingi" },
];

export default function AgentJoinPage() {
  const { t, lang } = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/onboarding"); return; }

      const hex = Array.from(crypto.getRandomValues(new Uint8Array(3)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      const agentCode = `MC-AG-${hex}`;

      const { error: insertErr } = await supabase.from("agent_accounts").insert({
        user_id: user.id,
        agent_code: agentCode,
        tier: "bronze",
        float_minor: 0,
        float_limit_minor: 200_000_00,
        earnings_minor: 0,
      });

      if (insertErr) throw insertErr;
      router.replace("/agent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-8 max-w-sm mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🏪</span>
        </div>
        <h1 className="font-display text-[22px] font-black text-ink leading-tight mb-2">
          {t("agent_join_headline")}
        </h1>
        <p className="text-[13px] text-ink3 leading-relaxed">
          {t("agent_join_sub")}
        </p>
      </div>

      {/* Perks */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-6 space-y-4">
        {PERKS.map((p) => (
          <div key={p.icon} className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{p.icon}</span>
            <p className="text-[13px] text-ink leading-snug">
              {lang === "lug" ? p.lug : p.en}
            </p>
          </div>
        ))}
      </div>

      {/* Tier ladder */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-6">
        <p className="text-[12px] font-semibold text-ink3 uppercase tracking-wide mb-3">
          {t("agent_tier_strip_title")}
        </p>
        {(
          [
            { tier: t("tier_bronze"), perk: t("agent_tier_perk_bronze"), color: "text-amber-700 bg-amber-50 border-amber-200" },
            { tier: t("tier_silver"), perk: t("agent_tier_perk_silver"), color: "text-slate-600 bg-slate-50 border-slate-200" },
            { tier: t("tier_gold"), perk: t("agent_tier_perk_gold"), color: "text-gold bg-gold/5 border-gold/20" },
          ] as const
        ).map((row) => (
          <div key={row.tier} className={`rounded-xl border px-4 py-3 mb-2 last:mb-0 ${row.color}`}>
            <p className="text-[13px] font-bold">{row.tier}</p>
            <p className="text-[11px] opacity-80 mt-0.5">{row.perk}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-[12px] text-danger text-center mb-4">{error}</p>
      )}

      <button
        onClick={() => void handleJoin()}
        disabled={loading}
        className="w-full rounded-button bg-primary text-white font-bold text-[16px] py-4 disabled:opacity-60 transition-opacity min-h-[56px]"
      >
        {loading ? t("agent_joining") : t("agent_join_cta")}
      </button>

      <p className="text-center text-[11px] text-ink3 mt-4">
        {lang === "lug"
          ? "Wetaagaana ne makumuganye gaffe."
          : "By joining you agree to our agent terms."}
      </p>
    </div>
  );
}
