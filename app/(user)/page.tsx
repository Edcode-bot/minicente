"use client";

import { TrustRibbon } from "@/components/TrustRibbon";
import { useT } from "@/lib/i18n";
import { USER, BALANCE } from "@/lib/data";

export default function HomePage() {
  const { t } = useT();

  return (
    <div className="pb-2">
      <TrustRibbon />

      {/* Balance hero */}
      <div className="mx-4 mt-4 rounded-big bg-primary p-6 shadow-elevated">
        <p className="text-[12px] text-white/70 font-medium">{t("balance")}</p>
        <p className="money text-[36px] text-white mt-1 leading-none">
          ${BALANCE.usd.toLocaleString("en", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[13px] text-white/60 mt-1">
          {BALANCE.localSymbol}
          {BALANCE.local.toLocaleString()} {BALANCE.localCurrency}
        </p>
      </div>

      {/* Coming soon card */}
      <div className="mx-4 mt-4 rounded-card border border-line bg-card shadow-subtle p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏗</span>
          <p className="text-[15px] font-semibold text-ink">
            {t("coming_soon")}
          </p>
        </div>
        <p className="text-[13px] text-ink3 leading-relaxed">
          Home screen — Send, Receive, recent transactions, and more are coming
          in the next build step (P2).
        </p>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 min-h-[52px] rounded-button bg-primary flex items-center justify-center">
            <span className="text-[13px] font-semibold text-white">
              {t("send")}
            </span>
          </div>
          <div className="flex-1 min-h-[52px] rounded-button bg-soft border border-line flex items-center justify-center">
            <span className="text-[13px] font-semibold text-ink2">
              {t("receive")}
            </span>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="mx-4 mt-3 rounded-card border border-line bg-card shadow-subtle p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="font-display font-black text-white text-base">
            {USER.initials}
          </span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-ink">{USER.name}</p>
          <p className="text-[12px] text-ink3">{USER.phone}</p>
        </div>
      </div>
    </div>
  );
}
