"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider, useT, type I18nKey } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type TFn = (k: I18nKey) => string;

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | "language"
  | "phone"
  | "otp"
  | "pin"
  | "gift"
  | "firstwin"
  | "processing"
  | "success"
  | "unlock";

type WinChoice = "yaka" | "airtime";
type PinPhase = "create" | "confirm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUgPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

function markOnboarded() {
  try {
    document.cookie =
      "mc_onboarded=1; path=/; max-age=31536000; SameSite=Lax";
    localStorage.setItem("mc_onboarded", "1");
  } catch {}
}

// ─── Shared micro-components ──────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex flex-1 gap-1.5">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`flex-1 h-1 rounded-full transition-all duration-500 ${
            s <= step ? "bg-primary" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}

function BackChevron({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-soft transition-colors flex-shrink-0"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-ink"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

function OtpBoxes({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>(Array(5).fill(null));

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 4) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      const next = [...value];
      next[i - 1] = "";
      onChange(next);
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 5);
    const next = Array<string>(5).fill("");
    digits.split("").forEach((ch, idx) => {
      next[idx] = ch;
    });
    onChange(next);
    refs.current[Math.min(digits.length, 4)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {value.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={`w-12 h-14 text-center text-2xl font-bold rounded-card outline-none transition-all border-2 ${
            d
              ? "border-primary bg-primary/5 text-ink"
              : "border-line bg-soft text-ink"
          } focus:border-primary`}
        />
      ))}
    </div>
  );
}

function PinDots({
  count,
  error = false,
}: {
  count: number;
  error?: boolean;
}) {
  return (
    <div className="flex gap-5 justify-center">
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

const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"] as const;

function PinKeypad({
  onDigit,
  onBack,
}: {
  onDigit: (d: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-[272px] mx-auto w-full">
      {KEYPAD.map((key, i) => {
        if (key === "") return <div key={i} />;
        const isDel = key === "⌫";
        return (
          <button
            key={i}
            onPointerDown={(e) => {
              e.preventDefault();
              isDel ? onBack() : onDigit(key);
            }}
            className={`h-[52px] rounded-button flex items-center justify-center select-none transition-all active:scale-95 ${
              isDel
                ? "text-ink3 text-xl hover:bg-soft active:bg-line"
                : "bg-soft text-ink text-xl font-semibold hover:bg-line active:bg-line"
            }`}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-primary" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Main onboarding component ────────────────────────────────────────────────

function OnboardingInner() {
  const { t, lang, setLang } = useT();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("language");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(5).fill(""));
  const [createPin, setCreatePin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinPhase, setPinPhase] = useState<PinPhase>("create");
  const [pinError, setPinError] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [winChoice, setWinChoice] = useState<WinChoice | null>(null);
  const [countdown, setCountdown] = useState(24);
  const [phoneEmail, setPhoneEmail] = useState("");
  const [firstWinRef, setFirstWinRef] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneRaw = phone.replace(/\D/g, "");
  const displayPhone = "+256 " + formatUgPhone(phoneRaw);

  // Progress step (1-4 for the real steps; 0 for language)
  const progressStep: number = {
    language: 0, phone: 1, otp: 2, pin: 3,
    gift: 4, firstwin: 4, processing: 4, success: 4, unlock: 4,
  }[stage];

  const canGoBack =
    stage === "phone" || stage === "otp" || stage === "pin";

  // ── Effects ────────────────────────────────────────────────────────────────

  // On mount: resume if session already exists (e.g. user returned after clicking magic link)
  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded, pin_set")
        .eq("id", user.id)
        .single();
      if (!profile) return;
      if (profile.onboarded) { router.replace("/"); return; }
      if (profile.pin_set) { setStage("gift"); return; }
      setStage("pin");
    })();
  }, [router]);

  // Listen for magic-link sign-in while on OTP screen
  useEffect(() => {
    if (stage !== "otp") return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") setStage("pin");
      }
    );
    return () => subscription.unsubscribe();
  }, [stage]);

  // OTP countdown
  useEffect(() => {
    if (stage !== "otp") return;
    setCountdown(24);
    const id = setInterval(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [stage]);

  // OTP auto-advance: when all 5 boxes filled, verify session and proceed
  useEffect(() => {
    if (stage !== "otp") return;
    if (otp.join("").length !== 5) return;
    const supabase = createClient();
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setStage("pin");
    })();
  }, [otp, stage]);

  // PIN auto-advance
  useEffect(() => {
    if (pinPhase === "create" && createPin.length === 4) {
      const id = setTimeout(() => setPinPhase("confirm"), 280);
      return () => clearTimeout(id);
    }
    if (pinPhase === "confirm" && confirmPin.length === 4) {
      if (confirmPin === createPin) {
        // Persist pin_set + language to profile (best-effort)
        void (async () => {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("profiles")
              .update({ pin_set: true, language: lang })
              .eq("id", user.id);
          }
        })();
        const id = setTimeout(() => setStage("gift"), 350);
        return () => clearTimeout(id);
      }
      setPinError(true);
      const id = setTimeout(() => {
        setConfirmPin("");
        setPinError(false);
      }, 750);
      return () => clearTimeout(id);
    }
  }, [createPin, confirmPin, pinPhase, lang]);

  // Processing auto-advance
  useEffect(() => {
    if (stage !== "processing") return;
    const id = setTimeout(() => setStage("success"), 2500);
    return () => clearTimeout(id);
  }, [stage]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (stage === "phone") { setStage("language"); return; }
    if (stage === "otp") { setStage("phone"); return; }
    if (stage === "pin") {
      setCreatePin("");
      setConfirmPin("");
      setPinPhase("create");
      setStage("otp");
    }
  }, [stage]);

  const complete = useCallback(() => {
    void (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarded: true })
          .eq("id", user.id);
      }
      markOnboarded();
      router.replace("/");
    })();
  }, [router]);

  const handleContinue = useCallback(() => {
    if (stage === "language") { setStage("phone"); return; }

    if (stage === "phone") {
      setIsSubmitting(true);
      setAuthError(null);
      const email = `mc-${phoneRaw}@minicente.app`;
      const password = `MC-${phoneRaw}-dev`;
      setPhoneEmail(email);
      void (async () => {
        const supabase = createClient();

        // Try creating the account first (new user)
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { phone: `+256${phoneRaw}`, full_name: "Friend" } },
        });

        if (signUpError) {
          const isExisting =
            signUpError.message.toLowerCase().includes("already registered") ||
            signUpError.message.toLowerCase().includes("already been registered") ||
            signUpError.message.toLowerCase().includes("user already");
          if (isExisting) {
            // Returning user — sign straight in with the same derived credentials
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signInError) {
              setIsSubmitting(false);
              setAuthError(signInError.message);
              return;
            }
          } else {
            setIsSubmitting(false);
            setAuthError(signUpError.message);
            return;
          }
        }

        setIsSubmitting(false);
        setStage("otp");
      })();
      return;
    }

    if (stage === "otp") {
      // Session is already established by signUp/signInWithPassword above.
      // Verify and advance — any 5 digits accepted.
      void (async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) { setStage("pin"); }
        else { setAuthError("Session not found — please go back and try again."); }
      })();
      return;
    }
    if (stage === "gift") { setStage("firstwin"); return; }

    if (stage === "firstwin" && winChoice) {
      setStage("processing");
      void (async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const ref = `MC-1ST-${winChoice.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        if (user) {
          await supabase.from("transactions").insert({
            user_id: user.id,
            kind: winChoice === "yaka" ? "bill" : "airtime",
            status: "success",
            amount_minor: 1000,
            fee_minor: 0,
            currency: "UGX",
            counterparty: winChoice === "yaka" ? "YAKA Uganda" : `+256${phoneRaw}`,
            reference: ref,
            meta: { gift: true, first_win: true },
          });
        }
        setFirstWinRef(ref);
      })();
      return;
    }

    if (stage === "success") { setStage("unlock"); return; }
    if (stage === "unlock") { complete(); return; }
  }, [stage, phoneRaw, winChoice, complete]);

  // PIN helpers
  const handlePinDigit = useCallback(
    (d: string) => {
      if (pinPhase === "create") {
        setCreatePin((p) => (p.length < 4 ? p + d : p));
      } else {
        setConfirmPin((p) => (p.length < 4 ? p + d : p));
      }
    },
    [pinPhase]
  );

  const handlePinBack = useCallback(() => {
    if (pinPhase === "create") setCreatePin((p) => p.slice(0, -1));
    else setConfirmPin((p) => p.slice(0, -1));
  }, [pinPhase]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const showProgressBar = stage !== "language";
  const showTrustLine = ["language", "phone", "otp"].includes(stage);
  const showContinue = !["pin", "processing"].includes(stage);

  const canContinue: boolean = (() => {
    if (stage === "phone") return phoneRaw.length === 9 && !isSubmitting;
    if (stage === "otp") return otp.join("").length === 5 || otp.join("") === ""; // any 5 digits, or allow skip
    if (stage === "firstwin") return winChoice !== null;
    return true;
  })();

  const ctaLabel: string = (() => {
    if (stage === "gift") return t("gift_cta");
    if (stage === "success") return t("success_cta");
    if (stage === "unlock") return t("unlock_cta");
    return t("continue");
  })();

  const activePinStr = pinPhase === "create" ? createPin : confirmPin;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1">
      {/* Top bar */}
      {showProgressBar && (
        <div className="flex items-center gap-2 px-4 h-12 flex-shrink-0">
          {canGoBack ? (
            <BackChevron onClick={handleBack} />
          ) : (
            <div className="w-10 flex-shrink-0" />
          )}
          <ProgressBar step={progressStep} />
          <div className="w-10 flex-shrink-0" />
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {stage === "language" && (
          <StageLanguage lang={lang} setLang={setLang} t={t} />
        )}
        {stage === "phone" && (
          <StagePhone
            phone={phone}
            onChange={(v) => setPhone(v)}
            error={authError}
            isSubmitting={isSubmitting}
            t={t}
          />
        )}
        {stage === "otp" && (
          <StageOtp
            otp={otp}
            onChange={setOtp}
            displayPhone={displayPhone}
            countdown={countdown}
            onResend={() => setCountdown(24)}
            t={t}
          />
        )}
        {stage === "pin" && (
          <StagePin
            phase={pinPhase}
            pinCount={activePinStr.length}
            pinError={pinError}
            biometric={biometric}
            setBiometric={setBiometric}
            onDigit={handlePinDigit}
            onBack={handlePinBack}
            t={t}
          />
        )}
        {stage === "gift" && <StageGift t={t} />}
        {stage === "firstwin" && (
          <StageFirstWin
            choice={winChoice}
            onChoose={setWinChoice}
            t={t}
          />
        )}
        {stage === "processing" && <StageProcessing t={t} />}
        {stage === "success" && (
          <StageSuccess winChoice={winChoice ?? "yaka"} txnRef={firstWinRef} t={t} />
        )}
        {stage === "unlock" && (
          <StageUnlock onSkip={complete} t={t} />
        )}
      </div>

      {/* Bottom bar — CTA + trust line */}
      <div className="px-5 pt-3 pb-8 flex-shrink-0">
        {showContinue && (
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-14 rounded-button bg-primary text-white font-semibold text-[16px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primaryPress"
          >
            {ctaLabel}
          </button>
        )}
        {stage === "unlock" && (
          <button
            onClick={complete}
            className="w-full h-12 mt-3 rounded-button text-ink2 text-[14px] font-medium hover:bg-soft transition-colors"
          >
            {t("unlock_skip")}
          </button>
        )}
        {showTrustLine && (
          <p className="text-center text-[11px] text-ink3 mt-4 leading-relaxed">
            {t("trust_line")}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Stage: Language ──────────────────────────────────────────────────────────

function StageLanguage({
  lang,
  setLang,
  t,
}: {
  lang: string;
  setLang: (l: "en" | "lug") => void;
  t: TFn;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-160px)] px-5 py-10 text-center">
      {/* Logo */}
      <div className="w-16 h-16 rounded-big bg-primary flex items-center justify-center mb-8">
        <span className="font-display font-black text-white text-3xl leading-none">
          M
        </span>
      </div>

      <h1 className="font-display text-[28px] font-bold text-ink leading-tight mb-3">
        {t("onb_headline")}
      </h1>
      <p className="text-[15px] text-ink2 leading-relaxed mb-10 max-w-[300px]">
        {t("onb_subtext")}
      </p>

      {/* Language cards */}
      <div className="w-full space-y-3">
        {(
          [
            { id: "en" as const, flag: "🇬🇧", label: "English", sub: "English" },
            {
              id: "lug" as const,
              flag: "🇺🇬",
              label: "Luganda",
              sub: "Genda mu Luganda",
            },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setLang(opt.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-card border-2 transition-all text-left ${
              lang === opt.id
                ? "border-primary bg-primary/5"
                : "border-line bg-soft hover:border-ink3"
            }`}
          >
            <span className="text-3xl">{opt.flag}</span>
            <div className="flex-1">
              <p className="font-semibold text-[16px] text-ink">{opt.label}</p>
              <p className="text-[13px] text-ink3">{opt.sub}</p>
            </div>
            {lang === opt.id && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stage: Phone ─────────────────────────────────────────────────────────────

function StagePhone({
  phone,
  onChange,
  error,
  isSubmitting,
  t,
}: {
  phone: string;
  onChange: (v: string) => void;
  error: string | null;
  isSubmitting: boolean;
  t: TFn;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(id);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    onChange(raw);
  };

  return (
    <div className="px-5 pt-8 pb-4">
      <h1 className="font-display text-[24px] font-bold text-ink leading-tight mb-3">
        {t("phone_title")}
      </h1>
      <p className="text-[14px] text-ink2 leading-relaxed mb-8">
        {t("phone_reassurance")}
      </p>

      {/* Phone input */}
      <div className="flex items-center gap-0 rounded-card border-2 border-primary bg-soft overflow-hidden mb-4">
        <span className="px-4 py-4 text-[16px] font-semibold text-ink bg-soft border-r border-line flex-shrink-0">
          +256
        </span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={formatUgPhone(phone)}
          onChange={handleInput}
          placeholder="7XX XXX XXX"
          className="flex-1 px-4 py-4 text-[18px] font-semibold text-ink bg-transparent outline-none placeholder:text-ink3 tracking-wider"
        />
      </div>

      {/* USSD hint */}
      <div className="flex items-start gap-2 bg-soft rounded-button px-4 py-3 border border-line">
        <span className="text-base flex-shrink-0">📟</span>
        <p className="text-[12px] text-ink3 leading-relaxed">
          {t("phone_ussd_hint")}
        </p>
      </div>

      {isSubmitting && (
        <div className="flex items-center gap-2 mt-3">
          <div className="w-4 h-4 rounded-full border-2 border-line border-t-primary animate-spin" />
          <p className="text-[12px] text-ink3">Securing your account…</p>
        </div>
      )}
      {error && (
        <p className="text-[12px] text-danger mt-3">{error}</p>
      )}
    </div>
  );
}

// ─── Stage: OTP ───────────────────────────────────────────────────────────────

function StageOtp({
  otp,
  onChange,
  displayPhone,
  countdown,
  onResend,
  t,
}: {
  otp: string[];
  onChange: (v: string[]) => void;
  displayPhone: string;
  countdown: number;
  onResend: () => void;
  t: TFn;
}) {
  return (
    <div className="px-5 pt-8 pb-4">
      <h1 className="font-display text-[24px] font-bold text-ink leading-tight mb-2">
        {t("otp_title")}
      </h1>
      <p className="text-[14px] text-ink2 leading-relaxed mb-1">
        {t("otp_sent")}{" "}
        <span className="font-semibold text-ink">{displayPhone}</span>
      </p>

      <div className="bg-soft border border-line rounded-button px-3 py-2.5 mb-6">
        <p className="text-[12px] text-ink3 leading-relaxed">
          Enter any 5-digit code to confirm — your account is already secured.
          ({t("otp_demo")})
        </p>
      </div>

      <OtpBoxes value={otp} onChange={onChange} />

      {/* Resend */}
      <div className="flex items-center justify-center mt-6 gap-1">
        {countdown > 0 ? (
          <p className="text-[13px] text-ink3">
            {t("otp_resend")}{" "}
            <span className="font-semibold text-ink">
              0:{countdown.toString().padStart(2, "0")}
            </span>
          </p>
        ) : (
          <button
            onClick={onResend}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            {t("otp_resend_now")}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Stage: PIN ───────────────────────────────────────────────────────────────

function StagePin({
  phase,
  pinCount,
  pinError,
  biometric,
  setBiometric,
  onDigit,
  onBack,
  t,
}: {
  phase: PinPhase;
  pinCount: number;
  pinError: boolean;
  biometric: boolean;
  setBiometric: (v: boolean) => void;
  onDigit: (d: string) => void;
  onBack: () => void;
  t: TFn;
}) {
  const title =
    phase === "create" ? t("pin_title") : t("pin_confirm_title");

  return (
    <div className="px-5 pt-8 pb-4 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-1">
          {title}
        </h1>
        {pinError && (
          <p className="text-[13px] text-danger font-medium mt-1">
            {t("pin_mismatch")}
          </p>
        )}
      </div>

      {/* Dots */}
      <div className="py-4">
        <PinDots count={pinCount} error={pinError} />
      </div>

      {/* Keypad */}
      <PinKeypad onDigit={onDigit} onBack={onBack} />

      {/* Warning */}
      <p className="text-center text-[12px] text-ink3 leading-relaxed px-4">
        {t("pin_warning")}
      </p>

      {/* Biometric toggle */}
      <div className="flex items-center justify-between bg-soft rounded-button px-4 py-3.5 border border-line">
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
          <span className="text-xl flex-shrink-0">👆</span>
          <p className="text-[13px] text-ink leading-snug">
            {t("pin_biometric")}
          </p>
        </div>
        <Toggle checked={biometric} onChange={setBiometric} />
      </div>
    </div>
  );
}

// ─── Stage: Gift ──────────────────────────────────────────────────────────────

function StageGift({ t }: { t: TFn }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-200px)] px-5 py-10 text-center">
      {/* Gift icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-big bg-primary/10 flex items-center justify-center">
          <span className="text-5xl">🎁</span>
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      <p className="text-[14px] font-semibold text-primary uppercase tracking-wide mb-2">
        {t("gift_title")}
      </p>
      <p className="font-display text-[48px] font-black text-ink leading-none mb-1">
        {t("gift_amount")}
      </p>
      <p className="text-[16px] text-ink2 mb-6">{t("gift_on_balance")}</p>

      <div className="bg-soft rounded-card border border-line px-5 py-4 max-w-[320px]">
        <p className="text-[14px] text-ink2 leading-relaxed">
          {t("gift_subtext")}
        </p>
      </div>
    </div>
  );
}

// ─── Stage: First Win ─────────────────────────────────────────────────────────

function StageFirstWin({
  choice,
  onChoose,
  t,
}: {
  choice: WinChoice | null;
  onChoose: (c: WinChoice) => void;
  t: TFn;
}) {
  const options: { id: WinChoice; icon: string; label: string }[] = [
    { id: "yaka", icon: "💡", label: t("firstwin_yaka") },
    { id: "airtime", icon: "📞", label: t("firstwin_airtime") },
  ];

  return (
    <div className="px-5 pt-8 pb-4">
      <h1 className="font-display text-[24px] font-bold text-ink leading-tight mb-2">
        {t("firstwin_title")}
      </h1>
      <p className="text-[14px] text-ink2 mb-7">{t("firstwin_subtext")}</p>

      <div className="space-y-3 mb-6">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChoose(opt.id)}
            className={`w-full flex items-start gap-4 p-5 rounded-card border-2 text-left transition-all ${
              choice === opt.id
                ? "border-primary bg-primary/5"
                : "border-line bg-soft hover:border-ink3"
            }`}
          >
            <span className="text-3xl flex-shrink-0">{opt.icon}</span>
            <p
              className={`text-[15px] font-medium leading-snug ${
                choice === opt.id ? "text-ink" : "text-ink2"
              }`}
            >
              {opt.label}
            </p>
            {choice === opt.id && (
              <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-2">
        <span className="text-sm text-ink3 flex-shrink-0">🛡</span>
        <p className="text-[12px] text-ink3 leading-relaxed">
          {t("firstwin_protection")}
        </p>
      </div>
    </div>
  );
}

// ─── Stage: Processing ────────────────────────────────────────────────────────

function StageProcessing({ t }: { t: TFn }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-120px)] px-5 text-center">
      {/* Calm spinner */}
      <div className="relative w-20 h-20 mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-line" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>

      <h2 className="font-display text-[22px] font-bold text-ink mb-2">
        {t("processing_title")}
      </h2>
      <p className="text-[14px] text-ink2">{t("processing_sub")}</p>

      {/* Calm progress bar */}
      <div className="w-48 h-1 rounded-full bg-line mt-8 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ animation: "mc-grow 2.5s ease-in-out forwards" }}
        />
      </div>
    </div>
  );
}

// ─── Stage: Success ───────────────────────────────────────────────────────────

function StageSuccess({
  winChoice,
  txnRef,
  t,
}: {
  winChoice: WinChoice;
  txnRef: string;
  t: TFn;
}) {
  const sub =
    winChoice === "yaka" ? t("success_sub_yaka") : t("success_sub_airtime");
  const timeLabel = winChoice === "yaka" ? "4 seconds" : "2 seconds";
  const refCode = txnRef || (winChoice === "yaka" ? "MC-1ST-WIN-YAKA" : "MC-1ST-WIN-AIR");

  return (
    <div className="px-5 pt-8 pb-4">
      {/* Big check */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-[28px] font-bold text-ink leading-tight text-center mb-2">
          {t("success_title")}
        </h1>
        <p className="text-[15px] text-ink2 text-center leading-relaxed max-w-[280px]">
          {sub}
        </p>
      </div>

      {/* Receipt card */}
      <div className="bg-soft rounded-card border border-line p-5 space-y-3">
        <ReceiptRow
          label={t("success_paid")}
          value="UGX 1,000"
          valueClass="text-ink font-bold"
        />
        <ReceiptRow
          label={t("success_fee")}
          value="UGX 0"
          valueClass="text-accent font-bold"
        />
        <ReceiptRow
          label={t("success_time")}
          value={timeLabel}
          valueClass="text-ink font-bold"
        />
        <div className="border-t border-line pt-3">
          <div className="flex items-start justify-between gap-4">
            <span className="text-[13px] text-ink3">{t("success_ref")}</span>
            <span className="font-mono text-[11px] text-ink3 break-all text-right">
              {refCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-ink3">{label}</span>
      <span className={`text-[15px] money ${valueClass}`}>{value}</span>
    </div>
  );
}

// ─── Stage: Unlock ────────────────────────────────────────────────────────────

function StageUnlock({
  onSkip,
  t,
}: {
  onSkip: () => void;
  t: TFn;
}) {
  const perks = [
    { icon: "↑", label: t("unlock_perk1"), color: "text-primary" },
    { icon: "🎯", label: t("unlock_perk2"), color: "text-info" },
    { icon: "🏦", label: t("unlock_perk3"), color: "text-accent" },
  ];

  return (
    <div className="px-5 pt-8 pb-4">
      <div className="w-14 h-14 rounded-big bg-gold/10 flex items-center justify-center mb-6">
        <span className="text-3xl">🔓</span>
      </div>

      <h1 className="font-display text-[24px] font-bold text-ink leading-tight mb-3">
        {t("unlock_title")}
      </h1>
      <p className="text-[14px] text-ink2 leading-relaxed mb-8">
        {t("unlock_sub")}
      </p>

      <div className="space-y-3">
        {perks.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-4 bg-soft rounded-button px-4 py-3.5 border border-line"
          >
            <span className={`text-xl flex-shrink-0 w-7 text-center ${p.color}`}>
              {p.icon}
            </span>
            <p className="text-[14px] font-medium text-ink leading-snug">
              {p.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  return (
    <LanguageProvider>
      <OnboardingInner />
    </LanguageProvider>
  );
}
