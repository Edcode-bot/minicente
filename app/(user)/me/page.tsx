"use client";

import { useEffect, useState, useCallback } from "react";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/hooks/useProfile";
import { useLevel } from "@/lib/hooks/useLevel";
import { LevelCard } from "@/components/LevelCard";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { AgentAccount } from "@/lib/types";
import { SkeletonCard } from "@/components/Skeleton";
import Link from "next/link";

// ─── Edit-profile bottom sheet ────────────────────────────────────────────────

function EditProfileSheet({
  initialName,
  onSave,
  onClose,
}: {
  initialName: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useT();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim());
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-card w-full rounded-t-3xl p-5 pb-10 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-2" />
        <h2 className="font-display text-[18px] font-bold text-ink">
          {t("edit_profile")}
        </h2>

        <div>
          <label className="text-[11px] font-semibold text-ink3 uppercase tracking-wide block mb-1.5">
            {t("edit_profile_name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-line rounded-button px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={saving || !name.trim()}
          className="w-full rounded-button bg-primary text-white font-bold text-[15px] py-4 disabled:opacity-50 transition-opacity"
        >
          {saving ? t("edit_profile_saving") : t("edit_profile_save")}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MePage() {
  const { t, lang, setLang } = useT();
  const { profile, loading } = useProfile();
  const [profileData, setProfileData] = useState(profile);
  const level = useLevel();
  const router = useRouter();
  const [agentAccount, setAgentAccount] = useState<AgentAccount | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  // Keep local copy so edits reflect immediately
  useEffect(() => {
    if (profile) setProfileData(profile);
  }, [profile]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      void supabase
        .from("agent_accounts")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle()
        .then(({ data: acc }) => setAgentAccount(acc));
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/onboarding");
  };

  const handleShare = () => {
    const code = profileData?.referral_code;
    if (!code) return;
    if (navigator.share) {
      void navigator.share({
        title: "Join Minicente",
        text: `Use my code ${code} — get UGX 1,000 free on Minicente.`,
        url: `https://minicente.app/join/${code}`,
      });
    } else {
      void navigator.clipboard.writeText(code);
    }
  };

  const handleSaveProfile = useCallback(async (newName: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ full_name: newName }).eq("id", user.id);
    setProfileData((prev) => prev ? { ...prev, full_name: newName } : prev);
  }, []);

  const handleLangToggle = async () => {
    const next = lang === "en" ? "lug" : "en";
    setLang(next);
    // Persist to profile
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ language: next }).eq("id", user.id);
    }
  };

  const initials = (profileData?.full_name ?? "?")
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const KYC_TIERS = [1, 2, 3] as const;
  const kycTier = profileData?.kyc_tier ?? 0;

  if (loading) {
    return (
      <div className="px-4 pt-5 pb-4 space-y-3">
        <SkeletonCard rows={3} />
        <SkeletonCard rows={2} />
        <SkeletonCard rows={1} />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-5 pb-6">
        {/* Profile card */}
        <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="font-display font-black text-white text-xl">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-semibold text-ink truncate">
                {profileData?.full_name ?? "—"}
              </p>
              <p className="text-[12px] text-ink3">{profileData?.phone ?? "—"}</p>
            </div>
            <button
              onClick={() => setShowEdit(true)}
              className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-2 rounded-button hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              {t("edit_profile")}
            </button>
          </div>

          {/* KYC tier pills */}
          <div className="flex gap-2">
            {KYC_TIERS.map((tier) => {
              const done = kycTier >= tier;
              return (
                <Link
                  key={tier}
                  href="/verify"
                  className={`flex-1 text-center py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                    done
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-soft text-ink3 border-line hover:border-primary/40"
                  }`}
                >
                  T{tier} {done ? "✓" : "›"}
                </Link>
              );
            })}
          </div>
        </div>

        <LevelCard level={level} />

        {/* Referral */}
        {profileData?.referral_code && (
          <div className="rounded-card border border-line bg-card shadow-subtle p-4 mb-4 flex items-center justify-between min-h-[52px]">
            <div>
              <p className="text-[11px] text-ink3 font-medium">{t("referral_code")}</p>
              <p className="font-mono text-[15px] font-bold text-ink tracking-wider mt-0.5">
                {profileData.referral_code}
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

        {/* Menu rows */}
        <div className="rounded-card border border-line bg-card shadow-subtle divide-y divide-line mb-4">
          {/* Language */}
          <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
            <div className="flex items-center gap-3">
              <span className="text-lg">🌐</span>
              <p className="text-[14px] font-medium text-ink">{t("settings_language")}</p>
            </div>
            <button
              onClick={() => void handleLangToggle()}
              className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-2 rounded-button hover:bg-primary/20 transition-colors"
            >
              {lang === "en" ? "Luganda" : "English"}
            </button>
          </div>

          {/* Agent */}
          <Link
            href={agentAccount ? "/agent" : "/agent/join"}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-soft transition-colors min-h-[52px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🏪</span>
              <div>
                <p className="text-[14px] font-medium text-ink">{t("agent_row")}</p>
                {agentAccount && (
                  <p className="text-[11px] text-ink3 font-mono">{agentAccount.agent_code}</p>
                )}
              </div>
            </div>
            <span className="text-ink3">›</span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-soft transition-colors min-h-[52px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">⚙️</span>
              <p className="text-[14px] font-medium text-ink">{t("settings_title")}</p>
            </div>
            <span className="text-ink3">›</span>
          </Link>

          {/* Safety */}
          <Link
            href="/safety"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-soft transition-colors min-h-[52px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🛡</span>
              <p className="text-[14px] font-medium text-ink">{t("safety")}</p>
            </div>
            <span className="text-ink3">›</span>
          </Link>
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

      {showEdit && (
        <EditProfileSheet
          initialName={profileData?.full_name ?? ""}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
