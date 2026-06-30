"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { useLevel } from "@/lib/hooks/useLevel";
import { calcLoanEligibility } from "@/lib/hooks/useLoanEligibility";
import { formatUGX } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-line last:border-0">
      <span className="text-[13px] text-ink3">{label}</span>
      <span className="text-[13px] font-semibold text-ink money">{value}</span>
    </div>
  );
}

export default function LoanPage() {
  const { t } = useT();
  const router = useRouter();
  const level = useLevel();
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);

  const loan = calcLoanEligibility(level.txnCount, 0);

  const handleApply = async () => {
    if (busy || applied) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("transactions").insert({
        user_id: user.id,
        kind: "loan",
        status: "pending",
        amount_minor: loan.amountMinor,
        fee_minor: loan.feeMinor,
        currency: "UGX",
        counterparty: "Minicente",
        reference: `LOAN-${Date.now()}`,
        meta: { term_days: loan.termDays, auto_repay: true },
      });
    }
    setBusy(false);
    setApplied(true);
  };

  if (!loan.eligible) {
    return (
      <div className="px-4 pt-10 pb-2 flex flex-col items-center text-center">
        <span className="text-4xl mb-4">🔒</span>
        <p className="text-[15px] font-semibold text-ink">
          {t("loan_not_eligible").replace("{n}", String(loan.paymentsNeeded))}
        </p>
        <p className="text-[13px] text-ink3 mt-2">{t("loan_not_eligible_sub")}</p>
        <Link
          href="/grow"
          className="mt-6 rounded-button bg-primary text-white font-semibold text-[14px] px-8 py-3.5"
        >
          {t("back")}
        </Link>
      </div>
    );
  }

  if (applied) {
    return (
      <div className="px-4 pt-16 pb-2 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <span className="text-3xl text-accent">✓</span>
        </div>
        <p className="font-display text-[19px] font-bold text-ink">{t("loan_applied_title")}</p>
        <p className="text-[13px] text-ink3 mt-3 leading-relaxed max-w-[280px]">
          {t("loan_applied_sub")}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 w-full rounded-button bg-primary text-white font-semibold text-[15px] py-4"
        >
          {t("result_done_btn")}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-6">
      <h1 className="font-display text-[20px] font-bold text-ink mb-1">
        {t("loan_terms_title")}
      </h1>
      <p className="text-[13px] text-ink3 mb-5 leading-relaxed">{t("loan_apply_note")}</p>

      {/* Terms card */}
      <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-5">
        <Row label={t("loan_amount_label")} value={formatUGX(loan.amountMinor)} />
        <Row label={t("loan_term_label")} value={t("loan_term_value")} />
        <Row label={t("loan_fee_label")} value={formatUGX(loan.feeMinor)} />
        <div className="pt-3">
          <p className="text-[12px] text-ink3 leading-relaxed">{t("loan_how")}</p>
        </div>
      </div>

      {/* Trust reassurance */}
      <div className="flex items-start gap-3 bg-soft rounded-button px-4 py-3 border border-line mb-6">
        <span className="text-[16px] flex-shrink-0">🛡</span>
        <p className="text-[12px] text-ink2 leading-relaxed">{t("pay_protected")}</p>
      </div>

      <button
        onClick={() => void handleApply()}
        disabled={busy}
        className="w-full rounded-button bg-primary text-white font-semibold text-[15px] py-4 disabled:opacity-50"
      >
        {busy ? "…" : t("loan_apply")}
      </button>

      <p className="text-center text-[11px] text-ink3 mt-3">{t("safety_guarantee")}</p>
    </div>
  );
}
