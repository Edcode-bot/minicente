"use client";

import { useState, useCallback } from "react";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── PIN keypad (minimal inline, mirrors onboarding) ─────────────────────────

const KEYPAD = ["1","2","3","4","5","6","7","8","9","","0","⌫"] as const;

function PinDots({ count, error }: { count: number; error?: boolean }) {
  return (
    <div className="flex gap-5 justify-center my-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
            error
              ? "border-danger bg-danger/30"
              : i < count
              ? "border-primary bg-primary scale-110"
              : "border-ink3"
          }`}
        />
      ))}
    </div>
  );
}

function PinKeypad({ onDigit, onBack }: { onDigit: (d: string) => void; onBack: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-[256px] mx-auto w-full">
      {KEYPAD.map((key, i) => {
        if (key === "") return <div key={i} />;
        const isDel = key === "⌫";
        return (
          <button
            key={i}
            onPointerDown={(e) => { e.preventDefault(); isDel ? onBack() : onDigit(key); }}
            className={`h-[48px] rounded-button flex items-center justify-center select-none transition-all active:scale-95 ${
              isDel ? "text-ink3 text-xl hover:bg-soft" : "bg-soft text-ink text-xl font-semibold hover:bg-line"
            }`}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}

type PinStage = "idle" | "current" | "new" | "confirm" | "done" | "error";

function PinChangeSheet({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const [stage, setStage] = useState<PinStage>("current");
  const [current, setCurrent] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState(false);

  const active = stage === "current" ? current : stage === "new" ? newPin : confirm;
  const setActive = stage === "current" ? setCurrent : stage === "new" ? setNewPin : setConfirm;
  const label = stage === "current" ? t("settings_pin_current") : stage === "new" ? t("settings_pin_new") : t("settings_pin_confirm");

  const handleDigit = (d: string) => {
    if (active.length >= 4) return;
    const next = active + d;
    setActive(next);

    if (next.length === 4) {
      setTimeout(() => {
        if (stage === "current") {
          // No real pin verification — just advance (PIN stored locally, not in DB)
          setStage("new");
          setCurrent(next);
        } else if (stage === "new") {
          setStage("confirm");
          setNewPin(next);
        } else if (stage === "confirm") {
          if (next === newPin) {
            setStage("done");
            // In production: hash and store; here mark pin_set
            const supabase = createClient();
            void supabase.auth.getUser().then(({ data }) => {
              if (data.user) {
                void supabase.from("profiles").update({ pin_set: true }).eq("id", data.user.id);
              }
            });
          } else {
            setErr(true);
            setTimeout(() => { setErr(false); setConfirm(""); }, 700);
          }
        }
      }, 180);
    }
  };

  const handleBack = () => setActive((p) => p.slice(0, -1));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-card w-full rounded-t-3xl p-5 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />
        {stage === "done" ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-[16px] font-bold text-ink">{t("settings_pin_changed")}</p>
            <button onClick={onClose} className="mt-5 rounded-button bg-primary text-white font-bold text-[14px] px-8 py-3">
              OK
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-[15px] font-semibold text-ink mb-1">{label}</p>
            <PinDots count={active.length} error={err} />
            <PinKeypad onDigit={handleDigit} onBack={handleBack} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────

function Row({ icon, label, sub, right, onClick, href }: {
  icon: string; label: string; sub?: string;
  right?: React.ReactNode; onClick?: () => void; href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5 min-h-[52px]">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-ink">{label}</p>
        {sub && <p className="text-[11px] text-ink3 mt-0.5">{sub}</p>}
      </div>
      {right ?? <span className="text-ink3 text-[16px]">›</span>}
    </div>
  );

  if (href) {
    return <Link href={href} className="block hover:bg-soft transition-colors border-b border-line last:border-0">{inner}</Link>;
  }
  if (onClick) {
    return <button onClick={onClick} className="w-full text-left hover:bg-soft transition-colors border-b border-line last:border-0">{inner}</button>;
  }
  return <div className="border-b border-line last:border-0">{inner}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t, lang, setLang } = useT();
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [showPinChange, setShowPinChange] = useState(false);

  const handleLangToggle = useCallback(async () => {
    const next = lang === "en" ? "lug" : "en";
    setLang(next);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ language: next }).eq("id", user.id);
  }, [lang, setLang]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/onboarding");
  };

  return (
    <>
      <div className="px-4 pt-5 pb-8">
        <h1 className="font-display text-[20px] font-bold text-ink mb-5">{t("settings_title")}</h1>

        {/* Preferences */}
        <p className="text-[11px] font-semibold text-ink3 uppercase tracking-wide mb-2 px-1">Preferences</p>
        <div className="rounded-card border border-line bg-card shadow-subtle mb-5 overflow-hidden">
          <Row
            icon="🌐"
            label={t("settings_language")}
            onClick={() => void handleLangToggle()}
            right={
              <span className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-button">
                {lang === "en" ? "Luganda" : "English"}
              </span>
            }
          />
          <Row
            icon="🔔"
            label={t("settings_notifications")}
            sub={t("settings_notifications_sub")}
            onClick={() => setNotificationsOn((v) => !v)}
            right={
              <div
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notificationsOn ? "bg-primary" : "bg-line"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notificationsOn ? "translate-x-5" : "translate-x-0"}`}
                />
              </div>
            }
          />
        </div>

        {/* Security */}
        <p className="text-[11px] font-semibold text-ink3 uppercase tracking-wide mb-2 px-1">Security</p>
        <div className="rounded-card border border-line bg-card shadow-subtle mb-5 overflow-hidden">
          <Row icon="🔑" label={t("settings_pin_change")} onClick={() => setShowPinChange(true)} />
          <Row icon="🛡" label={t("settings_safety_link")} href="/safety" />
        </div>

        {/* Support */}
        <p className="text-[11px] font-semibold text-ink3 uppercase tracking-wide mb-2 px-1">Support</p>
        <div className="rounded-card border border-line bg-card shadow-subtle mb-5 overflow-hidden">
          <Row
            icon="📞"
            label={t("settings_support")}
            sub={t("settings_support_sub")}
            href="tel:0800000000"
            right={<span className="text-[12px] font-semibold text-primary">Call</span>}
          />
        </div>

        {/* About */}
        <p className="text-[11px] font-semibold text-ink3 uppercase tracking-wide mb-2 px-1">About</p>
        <div className="rounded-card border border-line bg-card shadow-subtle mb-5 overflow-hidden">
          <Row
            icon="ℹ️"
            label={t("settings_version")}
            right={<span className="text-[12px] text-ink3">v0.1.0</span>}
          />
        </div>

        {/* Sign out */}
        <button
          onClick={() => void handleSignOut()}
          className="w-full rounded-card border border-danger/20 bg-danger/5 text-danger text-[14px] font-semibold py-4 hover:bg-danger/10 transition-colors"
        >
          {t("sign_out")}
        </button>
      </div>

      {showPinChange && <PinChangeSheet onClose={() => setShowPinChange(false)} />}
    </>
  );
}
