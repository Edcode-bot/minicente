"use client";

import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/hooks/useProfile";
import { useLevel } from "@/lib/hooks/useLevel";
import { LevelCard } from "@/components/LevelCard";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MePage() {
  const { t, lang, setLang } = useT();
  const { profile, loading } = useProfile();
  const level = useLevel();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/onboarding");
  };

  const handleShare = () => {
    if (navigator.share && profile?.referral_code) {
      void navigator.share({
        title: "Join Minicente",
        text: `Use my code ${profile.referral_code} to sign up for Minicente.`,
        url: `https://minicente.app/join/${profile.referral_code}`,
      });
    } else if (profile?.referral_code) {
      void navigator.clipboard.writeText(profile.referral_code);
    }
  };

  const KYC_TIERS = [1, 2, 3] as const;

  return (
    <div className="px-4 pt-5 pb-4">
      {/* Profile card */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="font-display font-black text-white text-xl">
              {loading
                ? "…"
                : (profile?.full_name ?? "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-ink truncate">
              {profile?.full_name ?? "—"}
            </p>
            <p className="text-[12px] text-ink3">{profile?.phone ?? "—"}</p>
            {profile?.level && (
              <span className="inline-block text-[10px] font-bold bg-gold/10 text-gold px-2 py-0.5 rounded-full mt-1">
                {t("level")} {profile.level}
              </span>
            )}
          </div>
        </div>

        {/* KYC tier pills */}
        <div className="flex gap-2">
          {KYC_TIERS.map((tier) => {
            const done = (profile?.kyc_tier ?? 0) >= tier;
            return (
              <div
                key={tier}
                className={`flex-1 text-center py-1.5 rounded-xl text-[11px] font-bold border ${
                  done
                    ? "bg-accent/10 text-accent border-accent/20"
                    : "bg-soft text-ink3 border-line"
                }`}
              >
                Tier {tier}
                {done && " ✓"}
              </div>
            );
          })}
        </div>
      </div>

      <LevelCard level={level} />

      {/* Referral */}
      {profile?.referral_code && (
        <div className="rounded-card border border-line bg-card shadow-subtle p-4 mb-4 flex items-center justify-between min-h-[52px]">
          <div>
            <p className="text-[11px] text-ink3 font-medium">
              {t("referral_code")}
            </p>
            <p className="font-mono text-[15px] font-bold text-ink tracking-wider mt-0.5">
              {profile.referral_code}
            </p>
          </div>
          <button
            onClick={handleShare}
            className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-2 rounded-button hover:bg-primary/20 transition-colors"
          >
            {t("share")}
          </button>
        </div>
      )}

      {/* Language */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-4 flex items-center justify-between mb-4 min-h-[52px]">
        <p className="text-[14px] font-medium text-ink">Language</p>
        <button
          onClick={() => setLang(lang === "en" ? "lug" : "en")}
          className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-2 rounded-button hover:bg-primary/20 transition-colors"
        >
          {t("switch_lang")}
        </button>
      </div>

      {/* Safety link */}
      <div className="rounded-card border border-line bg-card shadow-subtle divide-y divide-line mb-4">
        <a
          href="/safety"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-soft transition-colors min-h-[52px]"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🛡</span>
            <p className="text-[14px] font-medium text-ink">{t("safety")}</p>
          </div>
          <span className="text-ink3">›</span>
        </a>
      </div>

      {/* Sign out */}
      <button
        onClick={() => void handleSignOut()}
        className="w-full rounded-card border border-danger/20 bg-danger/5 text-danger text-[14px] font-semibold py-4 hover:bg-danger/10 transition-colors min-h-[52px]"
      >
        {t("sign_out")}
      </button>

      <p className="text-center text-[11px] text-ink3 mt-4">
        Minicente v0.1.0 · {t("safety_tagline")}
      </p>
    </div>
  );
}
