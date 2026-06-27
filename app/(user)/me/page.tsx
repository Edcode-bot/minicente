"use client";

import { useT } from "@/lib/i18n";
import { USER } from "@/lib/data";

export default function MePage() {
  const { t, lang, setLang } = useT();

  return (
    <div className="px-4 pt-5 pb-2">
      <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-4">
        {t("me")}
      </h1>

      {/* Profile card */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-4 flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="font-display font-black text-white text-xl">
            {USER.initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold text-ink truncate">
            {USER.name}
          </p>
          <p className="text-[12px] text-ink3">{USER.phone}</p>
          <span className="inline-block text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full mt-1">
            KYC Tier {USER.kyc.tier}
          </span>
        </div>
      </div>

      {/* Language toggle */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-4 flex items-center justify-between mb-4 min-h-[52px]">
        <p className="text-[14px] font-medium text-ink">Language</p>
        <button
          onClick={() => setLang(lang === "en" ? "lug" : "en")}
          className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-button hover:bg-primary/20 transition-colors"
        >
          {t("switch_lang")}
        </button>
      </div>

      <div className="rounded-card border border-line bg-card shadow-subtle p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⚙️</span>
          <p className="text-[15px] font-semibold text-ink">
            {t("coming_soon")}
          </p>
        </div>
        <p className="text-[13px] text-ink3 leading-relaxed">
          KYC completion, settings, security, and agent dashboard will appear
          here in P5.
        </p>
      </div>
    </div>
  );
}
