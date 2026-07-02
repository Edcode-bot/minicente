"use client";

import { useState, useRef, useCallback } from "react";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// ─── Tier card shell ──────────────────────────────────────────────────────────

function TierCard({
  n,
  title,
  body,
  limit,
  status,
  children,
}: {
  n: number;
  title: string;
  body: string;
  limit: string;
  status: "done" | "active" | "locked";
  children?: React.ReactNode;
}) {
  const colors = {
    done: "border-accent/30 bg-accent/5",
    active: "border-primary/40 bg-primary/5",
    locked: "border-line bg-card",
  };
  const badgeColors = {
    done: "bg-accent text-white",
    active: "bg-primary text-white",
    locked: "bg-soft text-ink3",
  };

  return (
    <div className={`rounded-card border p-5 mb-4 ${colors[status]}`}>
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black flex-shrink-0 mt-0.5 ${badgeColors[status]}`}
        >
          {status === "done" ? "✓" : n}
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-bold text-ink">{title}</p>
          <p className="text-[12px] text-ink3 mt-1 leading-relaxed">{body}</p>
          <p className="text-[11px] font-semibold text-primary mt-1.5">{limit}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Tier 2 form ──────────────────────────────────────────────────────────────

function Tier2Form({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [idNumber, setIdNumber] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [stage, setStage] = useState<"form" | "reviewing" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!idNumber.trim()) return;
    setError(null);
    setStage("reviewing");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      // Upload photo to Storage if provided
      let filePath: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/id-front.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("kyc")
          .upload(path, photoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        filePath = path;
      }

      // Insert KYC record (pending)
      await supabase.from("kyc_submissions").insert({
        user_id: user.id,
        tier: 2,
        id_number: idNumber.trim(),
        file_path: filePath,
        status: "approved", // auto-approve for demo
      });

      // Simulate a short review delay, then update tier
      await new Promise((r) => setTimeout(r, 2000));
      await supabase.from("profiles").update({ kyc_tier: 2 }).eq("id", user.id);
      setStage("done");
      setTimeout(onDone, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStage("form");
    }
  }, [idNumber, photoFile, onDone]);

  if (stage === "reviewing") {
    return (
      <div className="py-3 text-center space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-[13px] text-ink3">{t("tier2_reviewing")}</p>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="py-3 text-center">
        <p className="text-[15px] font-bold text-accent">{t("tier2_done")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-1">
      <div>
        <label className="text-[11px] font-semibold text-ink3 uppercase tracking-wide block mb-1">
          {t("tier2_id_label")}
        </label>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="CM900XXXXXXX"
          className="w-full border border-line rounded-button px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="text-[11px] font-semibold text-ink3 uppercase tracking-wide block mb-1">
          {t("tier2_photo_label")}
        </label>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-line rounded-button py-3 text-[13px] text-ink3 hover:border-primary/50 transition-colors"
        >
          {photoName || `📷 ${t("tier2_upload")}`}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setPhotoFile(f); setPhotoName(f.name); }
          }}
        />
      </div>

      {error && <p className="text-[12px] text-danger">{error}</p>}

      <button
        onClick={() => void handleSubmit()}
        disabled={!idNumber.trim()}
        className="w-full rounded-button bg-primary text-white font-bold text-[14px] py-3.5 disabled:opacity-50 transition-opacity"
      >
        {t("tier2_cta")}
      </button>
    </div>
  );
}

// ─── Tier 3 form ──────────────────────────────────────────────────────────────

function Tier3Form({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("");
  const [stage, setStage] = useState<"form" | "reviewing" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!bizName.trim() || !bizType.trim()) return;
    setError(null);
    setStage("reviewing");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      await supabase.from("kyc_submissions").insert({
        user_id: user.id,
        tier: 3,
        id_number: bizName.trim(),
        file_path: bizType.trim(),
        status: "approved",
      });

      await new Promise((r) => setTimeout(r, 2000));
      await supabase.from("profiles").update({ kyc_tier: 3 }).eq("id", user.id);
      setStage("done");
      setTimeout(onDone, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStage("form");
    }
  }, [bizName, bizType, onDone]);

  if (stage === "reviewing") {
    return (
      <div className="py-3 text-center space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-[13px] text-ink3">{t("tier3_reviewing")}</p>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="py-3 text-center">
        <p className="text-[15px] font-bold text-accent">{t("tier3_done")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-1">
      <div>
        <label className="text-[11px] font-semibold text-ink3 uppercase tracking-wide block mb-1">
          {t("tier3_biz_name")}
        </label>
        <input
          type="text"
          value={bizName}
          onChange={(e) => setBizName(e.target.value)}
          placeholder="Nakawa General Store"
          className="w-full border border-line rounded-button px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="text-[11px] font-semibold text-ink3 uppercase tracking-wide block mb-1">
          {t("tier3_biz_type")}
        </label>
        <select
          value={bizType}
          onChange={(e) => setBizType(e.target.value)}
          className="w-full border border-line rounded-button px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-primary bg-white"
        >
          <option value="">— Select —</option>
          <option value="retail">Retail shop</option>
          <option value="restaurant">Restaurant / food</option>
          <option value="salon">Salon / beauty</option>
          <option value="transport">Transport / boda</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && <p className="text-[12px] text-danger">{error}</p>}

      <button
        onClick={() => void handleSubmit()}
        disabled={!bizName.trim() || !bizType}
        className="w-full rounded-button bg-primary text-white font-bold text-[14px] py-3.5 disabled:opacity-50 transition-opacity"
      >
        {t("tier3_cta")}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyPage() {
  const { t } = useT();
  const { profile, loading } = useProfile();
  const [kycTier, setKycTier] = useState<number | null>(null);

  // Use live tier once profile loads; support optimistic bump after submit
  const tier = kycTier ?? profile?.kyc_tier ?? 0;

  if (loading) {
    return (
      <div className="px-4 pt-5 pb-6">
        <div className="h-6 w-1/2 rounded bg-line/60 animate-pulse mb-3" />
        <div className="h-32 rounded-card bg-line/40 animate-pulse mb-3" />
        <div className="h-32 rounded-card bg-line/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-8">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-1">
          {t("verify_title")}
        </h1>
        <p className="text-[13px] text-ink3 leading-relaxed">{t("verify_sub")}</p>
      </div>

      {/* Why verify callout */}
      <div className="rounded-card border border-line bg-soft p-4 mb-5 flex gap-3">
        <span className="text-xl flex-shrink-0">🔓</span>
        <div>
          <p className="text-[13px] font-semibold text-ink">{t("kyc_why")}</p>
          <p className="text-[12px] text-ink3 leading-relaxed mt-0.5">{t("kyc_why_body")}</p>
        </div>
      </div>

      {/* Tier 1 — always done */}
      <TierCard
        n={1}
        title={t("tier1_title")}
        body={t("tier1_body")}
        limit={t("tier1_limit")}
        status="done"
      />

      {/* Tier 2 */}
      <TierCard
        n={2}
        title={t("tier2_title")}
        body={t("tier2_body")}
        limit={t("tier2_limit")}
        status={tier >= 2 ? "done" : tier >= 1 ? "active" : "locked"}
      >
        {tier < 2 && (
          <Tier2Form onDone={() => setKycTier(2)} />
        )}
      </TierCard>

      {/* Tier 3 */}
      <TierCard
        n={3}
        title={t("tier3_title")}
        body={t("tier3_body")}
        limit={t("tier3_limit")}
        status={tier >= 3 ? "done" : tier >= 2 ? "active" : "locked"}
      >
        {tier >= 2 && tier < 3 && (
          <Tier3Form onDone={() => setKycTier(3)} />
        )}
        {tier < 2 && (
          <p className="text-[12px] text-ink3 mt-1">Complete Tier 2 first</p>
        )}
      </TierCard>

      <div className="text-center mt-2">
        <Link href="/me" className="text-[13px] font-medium text-primary">
          ← Back to profile
        </Link>
      </div>
    </div>
  );
}
