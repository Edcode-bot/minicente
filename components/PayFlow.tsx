"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT, type I18nKey } from "@/lib/i18n";
import { useWallet } from "@/lib/hooks/useWallet";
import { useProfile } from "@/lib/hooks/useProfile";
import { usePayment, type PaymentKind } from "@/lib/payments";
import { formatUGX } from "@/lib/types";

type Stage = "enter" | "confirm" | "processing" | "result";

const JOB_CONFIG: Record<
  PaymentKind,
  { labelKey: I18nKey; fieldKey: I18nKey; placeholder: string; quickPicks?: number[] }
> = {
  yaka: { labelKey: "pay_label_yaka", fieldKey: "pay_field_meter", placeholder: "0000-0000" },
  water: { labelKey: "pay_label_water", fieldKey: "pay_field_account", placeholder: "Account number" },
  airtime: {
    labelKey: "pay_label_airtime",
    fieldKey: "pay_field_phone",
    placeholder: "+256",
    quickPicks: [1000, 2000, 5000, 10000],
  },
  send: { labelKey: "pay_label_send", fieldKey: "pay_field_recipient", placeholder: "+256" },
};

export function PayFlow({ job }: { job: PaymentKind }) {
  const { t } = useT();
  const router = useRouter();
  const { wallet } = useWallet();
  const { profile } = useProfile();
  const { run, result } = usePayment();

  const config = JOB_CONFIG[job];
  const [stage, setStage] = useState<Stage>("enter");
  const [amount, setAmount] = useState("");
  const [field, setField] = useState(job === "airtime" ? (profile?.phone ?? "") : "");
  const [note, setNote] = useState("");

  const amountMinor = useMemo(() => {
    const n = parseInt(amount.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? n * 100 : 0;
  }, [amount]);

  const balanceMinor = wallet?.balance_minor ?? 0;
  const insufficientLocal = amountMinor > 0 && amountMinor > balanceMinor;

  const handleStartConfirm = () => {
    if (amountMinor <= 0 || insufficientLocal || !field.trim()) return;
    setStage("confirm");
  };

  const handlePay = async () => {
    setStage("processing");
    await run({
      kind: job,
      amountMinor,
      counterparty: field.trim(),
      meta: note ? { note } : undefined,
    });
    setStage("result");
  };

  if (stage === "enter") {
    return (
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-display text-[20px] font-bold text-ink mb-4">{t(config.labelKey)}</h1>

        <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-4">
          <label className="text-[11px] text-ink3 font-medium uppercase tracking-wider">
            {t("pay_amount")}
          </label>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[22px] font-semibold text-ink3">UGX</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="money text-[32px] font-bold text-ink bg-transparent outline-none flex-1 min-w-0"
            />
          </div>

          {config.quickPicks && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {config.quickPicks.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  className="text-[12px] font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5"
                >
                  {formatUGX(amt * 100)}
                </button>
              ))}
            </div>
          )}

          <label className="text-[11px] text-ink3 font-medium uppercase tracking-wider mt-4 block">
            {t(config.fieldKey)}
          </label>
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder={config.placeholder}
            className="text-[16px] text-ink bg-transparent outline-none mt-1 w-full border-b border-line pb-2"
          />

          {job === "send" && (
            <>
              <label className="text-[11px] text-ink3 font-medium uppercase tracking-wider mt-4 block">
                {t("pay_field_note")}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-[14px] text-ink bg-transparent outline-none mt-1 w-full border-b border-line pb-2"
              />
            </>
          )}

          <p className="text-[12px] text-ink3 mt-4">{t("pay_fee_line")}</p>

          {insufficientLocal && (
            <p className="text-[12px] text-danger mt-2">{t("pay_not_enough")}</p>
          )}

          <div className="mt-4 flex items-start gap-2 bg-soft rounded-button px-3 py-2.5">
            <span className="text-[14px]">🛡</span>
            <p className="text-[11px] text-ink2 leading-relaxed">{t("pay_protected")}</p>
          </div>
        </div>

        <button
          onClick={handleStartConfirm}
          disabled={amountMinor <= 0 || insufficientLocal || !field.trim()}
          className="w-full rounded-button bg-primary text-white font-semibold text-[15px] py-4 disabled:opacity-40 transition-opacity"
        >
          {t("pay_continue")}
        </button>
      </div>
    );
  }

  if (stage === "confirm") {
    return (
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-display text-[20px] font-bold text-ink mb-4">
          {t("pay_confirm_title")}
        </h1>

        <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-6">
          <Row label={t("pay_confirm_paying_for")} value={t(config.labelKey)} />
          <Row label={t("pay_confirm_to")} value={field} />
          <Row label={t("pay_confirm_amount")} value={formatUGX(amountMinor)} />
          <Row label={t("pay_confirm_fee")} value="UGX 0" />
          <div className="border-t border-line mt-3 pt-3">
            <Row label={t("pay_confirm_total")} value={formatUGX(amountMinor)} bold />
          </div>
        </div>

        <button
          onClick={handlePay}
          className="w-full rounded-button bg-primary text-white font-semibold text-[15px] py-4"
        >
          {t("pay_confirm_cta").replace("{amount}", formatUGX(amountMinor))}
        </button>
      </div>
    );
  }

  if (stage === "processing") {
    return (
      <div className="px-4 pt-24 pb-2 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full border-4 border-line border-t-primary animate-spin mb-6" />
        <p className="text-[17px] font-semibold text-ink">{t("pay_processing_title")}</p>
        <p className="text-[13px] text-ink3 mt-1">{t("pay_processing_sub")}</p>
      </div>
    );
  }

  // stage === "result"
  if (result?.ok) {
    return (
      <SuccessResult
        amountMinor={amountMinor}
        reference={result.reference}
        onDone={() => router.push("/")}
        onAnother={() => {
          setStage("enter");
          setAmount("");
        }}
      />
    );
  }

  if (result?.refundReference) {
    return (
      <RefundResult
        amountMinor={amountMinor}
        refundReference={result.refundReference}
        onDone={() => router.push("/")}
      />
    );
  }

  return (
    <div className="px-4 pt-10 pb-2 text-center">
      <p className="text-[15px] font-semibold text-ink">{t("pay_not_enough")}</p>
      <Link href="/" className="text-[13px] text-primary font-medium mt-3 inline-block">
        {t("result_done_btn")}
      </Link>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-[13px] ${bold ? "font-semibold text-ink" : "text-ink3"}`}>{label}</span>
      <span className={`text-[13px] money ${bold ? "font-bold text-ink text-[16px]" : "font-medium text-ink"}`}>
        {value}
      </span>
    </div>
  );
}

function SuccessResult({
  amountMinor,
  reference,
  onDone,
  onAnother,
}: {
  amountMinor: number;
  reference: string;
  onDone: () => void;
  onAnother: () => void;
}) {
  const { t } = useT();
  return (
    <div className="px-4 pt-10 pb-2 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <span className="text-3xl text-accent">✓</span>
      </div>
      <p className="font-display text-[19px] font-bold text-ink">
        {t("result_done_seconds").replace("{seconds}", "4")}
      </p>

      <div className="rounded-card border border-line bg-card shadow-subtle p-5 mt-6 w-full">
        <Row label={t("result_paid")} value={formatUGX(amountMinor)} />
        <Row label={t("result_fee")} value="UGX 0" />
        <Row label={t("result_time")} value="4s" />
        <Row label={t("result_reference")} value={reference} />
      </div>

      <div className="w-full mt-6 flex flex-col gap-3">
        <button
          onClick={onDone}
          className="w-full rounded-button bg-primary text-white font-semibold text-[15px] py-4"
        >
          {t("result_done_btn")}
        </button>
        <button
          onClick={onAnother}
          className="w-full rounded-button border border-line text-ink font-semibold text-[15px] py-4"
        >
          {t("result_pay_another")}
        </button>
      </div>
    </div>
  );
}

function RefundResult({
  amountMinor,
  refundReference,
  onDone,
}: {
  amountMinor: number;
  refundReference: string;
  onDone: () => void;
}) {
  const { t } = useT();
  const [refunded, setRefunded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / 12000) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setRefunded(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  if (refunded) {
    return (
      <div className="px-4 pt-10 pb-2 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <span className="text-3xl text-accent">✓</span>
        </div>
        <p className="font-display text-[18px] font-bold text-ink leading-snug">
          {t("result_refunded_title").replace("{amount}", formatUGX(amountMinor)).replace("{seconds}", "12")}
        </p>
        <div className="rounded-card border border-line bg-card shadow-subtle p-5 mt-6 w-full">
          <Row label={t("result_refund_ref")} value={refundReference} />
        </div>
        <Link href="/safety" className="text-[12px] text-primary font-medium mt-4">
          {t("how_refunds_work")}
        </Link>
        <button
          onClick={onDone}
          className="w-full rounded-button bg-primary text-white font-semibold text-[15px] py-4 mt-6"
        >
          {t("result_done_btn")}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-2 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
        <span className="text-3xl text-gold">⟲</span>
      </div>
      <p className="text-[15px] font-semibold text-ink leading-relaxed">
        {t("result_failed_title")}
      </p>
      <p className="text-[13px] text-ink3 mt-2">{t("result_refunding")}</p>

      <div className="w-full h-2 rounded-full bg-soft mt-6 overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Link href="/safety" className="text-[12px] text-primary font-medium mt-4">
        {t("how_refunds_work")}
      </Link>
    </div>
  );
}
