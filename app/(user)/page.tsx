"use client";

import { TrustRibbon } from "@/components/TrustRibbon";
import { useT, type I18nKey } from "@/lib/i18n";
type TFn = (k: I18nKey) => string;
import { useProfile } from "@/lib/hooks/useProfile";
import { useWallet } from "@/lib/hooks/useWallet";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { formatUGX } from "@/lib/types";
import type { Transaction } from "@/lib/types";
import Link from "next/link";

function txnIcon(kind: string) {
  if (kind === "bill") return "⚡";
  if (kind === "airtime") return "📡";
  if (kind === "send") return "↑";
  if (kind === "savings") return "📈";
  return "↓";
}

function txnColor(kind: string) {
  if (kind === "send" || kind === "bill" || kind === "airtime")
    return "text-ink bg-soft";
  return "text-accent bg-accent/10";
}

function amountSign(kind: string) {
  if (kind === "receive" || kind === "savings") return "+";
  return "−";
}

function TxnRow({ txn, t }: { txn: Transaction; t: TFn }) {
  const kindLabel: Record<string, string> = {
    bill: t("kind_bill"),
    airtime: t("kind_airtime"),
    send: t("kind_send"),
    receive: t("kind_receive"),
    savings: t("kind_savings"),
  };

  const date = new Date(txn.created_at).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCredit = txn.kind === "receive";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${txnColor(txn.kind)}`}
      >
        {txnIcon(txn.kind)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink truncate">
          {kindLabel[txn.kind] ?? txn.kind}
        </p>
        <p className="text-[11px] text-ink3 mt-0.5">
          {txn.counterparty ?? txn.reference ?? date}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={`text-[13px] font-semibold money ${
            isCredit ? "text-accent" : "text-ink"
          }`}
        >
          {amountSign(txn.kind)}
          {formatUGX(txn.amount_minor)}
        </p>
        {txn.fee_minor === 0 && (
          <p className="text-[10px] text-ink3 mt-0.5">free</p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useT();
  const { profile } = useProfile();
  const { wallet, loading: walletLoading } = useWallet();
  const { txns, loading: txnsLoading } = useTransactions(5);

  const firstName =
    profile?.full_name?.split(" ")[0] ?? "Friend";

  return (
    <div className="pb-4">
      <TrustRibbon />

      {/* Balance hero */}
      <div className="mx-4 mt-4 rounded-big bg-primary p-6 shadow-elevated">
        <p className="text-[11px] text-white/70 font-medium uppercase tracking-wider">
          {t("balance")}
        </p>
        <p className="money text-[36px] text-white mt-1 leading-none">
          {walletLoading ? "—" : formatUGX(wallet?.balance_minor ?? 0)}
        </p>
        <p className="text-[13px] text-white/60 mt-1.5">{firstName}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        <Link
          href="/cash"
          className="rounded-card border border-line bg-card shadow-subtle p-4 flex items-center gap-3 hover:border-ink3 transition-colors min-h-[52px]"
        >
          <span className="text-xl text-primary font-bold">↑</span>
          <span className="text-[14px] font-semibold text-ink">{t("send")}</span>
        </Link>
        <Link
          href="/cash"
          className="rounded-card border border-line bg-card shadow-subtle p-4 flex items-center gap-3 hover:border-ink3 transition-colors min-h-[52px]"
        >
          <span className="text-xl text-accent font-bold">↓</span>
          <span className="text-[14px] font-semibold text-ink">{t("receive")}</span>
        </Link>
      </div>

      {/* Transactions */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            {t("recent_activity")}
          </h2>
          <button className="text-[12px] text-primary font-medium">
            {t("see_all")}
          </button>
        </div>

        <div className="rounded-card border border-line bg-card shadow-subtle overflow-hidden">
          {txnsLoading ? (
            <div className="px-4 py-6 text-center">
              <div className="w-6 h-6 rounded-full border-2 border-line border-t-primary animate-spin mx-auto" />
            </div>
          ) : txns.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[14px] font-medium text-ink mb-1">
                {t("no_transactions")}
              </p>
              <p className="text-[12px] text-ink3">{t("no_transactions_sub")}</p>
            </div>
          ) : (
            txns.map((txn) => (
              <TxnRow key={txn.id} txn={txn} t={t} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
