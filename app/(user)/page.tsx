"use client";

import { useT, type I18nKey } from "@/lib/i18n";
type TFn = (k: I18nKey) => string;
import { useProfile } from "@/lib/hooks/useProfile";
import { useWallet } from "@/lib/hooks/useWallet";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { usePlatformStats } from "@/lib/hooks/usePlatformStats";
import { formatUGX } from "@/lib/types";
import type { Transaction, SavingsPot } from "@/lib/types";
import { useLevel } from "@/lib/hooks/useLevel";
import { calcLoanEligibility } from "@/lib/hooks/useLoanEligibility";
import { computeNudge } from "@/lib/hooks/useNudge";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BalanceSkeleton, TxnRowSkeleton, Skeleton } from "@/components/Skeleton";
import { PilotBadge } from "@/components/PilotBadge";

function txnIcon(kind: string) {
  if (kind === "bill" || kind === "yaka") return "💡";
  if (kind === "water") return "💧";
  if (kind === "airtime") return "📡";
  if (kind === "send") return "↑";
  if (kind === "savings") return "📈";
  if (kind === "refund") return "↩";
  return "↓";
}

function txnColor(kind: string) {
  if (kind === "refund") return "text-gold bg-gold/10";
  if (kind === "send" || kind === "bill" || kind === "yaka" || kind === "water" || kind === "airtime")
    return "text-ink bg-soft";
  return "text-accent bg-accent/10";
}

function amountSign(kind: string) {
  if (kind === "receive" || kind === "savings" || kind === "refund") return "+";
  return "−";
}

function statusBadge(status: string) {
  if (status === "success") return "✓";
  if (status === "pending") return "⏳";
  if (status === "failed") return "✕";
  return "";
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const KIND_LABEL: Record<string, I18nKey> = {
  bill: "kind_bill",
  yaka: "job_yaka",
  water: "job_water",
  airtime: "kind_airtime",
  send: "kind_send",
  receive: "kind_receive",
  savings: "kind_savings",
};

function TxnRow({ txn, t }: { txn: Transaction; t: TFn }) {
  const labelKey = KIND_LABEL[txn.kind];
  const label = txn.kind === "refund" ? "Refund" : labelKey ? t(labelKey) : txn.kind;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${txnColor(txn.kind)}`}
      >
        {txnIcon(txn.kind)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink truncate">{label}</p>
        <p className="text-[11px] text-ink3 mt-0.5">
          {txn.counterparty ?? relativeTime(txn.created_at)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={`text-[13px] font-semibold money ${
            txn.kind === "receive" || txn.kind === "refund" ? "text-accent" : "text-ink"
          }`}
        >
          {amountSign(txn.kind)}
          {formatUGX(txn.amount_minor)}
        </p>
        <p className="text-[10px] text-ink3 mt-0.5">
          {statusBadge(txn.status)} {relativeTime(txn.created_at)}
        </p>
      </div>
    </div>
  );
}

function JobButton({
  href,
  icon,
  label,
  hero = false,
}: {
  href: string;
  icon: string;
  label: string;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <Link
        href={href}
        className="col-span-2 rounded-card bg-primary text-white shadow-elevated p-5 flex items-center gap-4 min-h-[64px] hover:bg-primaryPress transition-colors"
      >
        <span className="text-3xl">{icon}</span>
        <span className="text-[17px] font-semibold">{label}</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-card border border-line bg-card shadow-subtle p-4 flex flex-col items-center justify-center gap-2 min-h-[56px] hover:border-ink3 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[12px] font-semibold text-ink">{label}</span>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useT();
  const { profile } = useProfile();
  const { wallet, loading: walletLoading } = useWallet();
  const { txns, loading: txnsLoading } = useTransactions(20);
  const { stats } = usePlatformStats();
  const level = useLevel();
  const [pots, setPots] = useState<SavingsPot[]>([]);
  const [chamaNames, setChamaNames] = useState<string[]>([]);
  const [loanApplied, setLoanApplied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: potsData }, { data: membersData }, { data: loanData }] = await Promise.all([
        supabase.from("savings_pots").select("*").eq("user_id", user.id),
        supabase.from("chama_members").select("*, chamas(name)").eq("user_id", user.id),
        supabase.from("transactions").select("id").eq("user_id", user.id).eq("kind", "loan").limit(1),
      ]);
      setPots((potsData ?? []) as SavingsPot[]);
      const names = (membersData ?? []).map((m: { chamas: { name: string } | null }) => m.chamas?.name ?? "").filter(Boolean);
      setChamaNames(names);
      setLoanApplied(Array.isArray(loanData) && loanData.length > 0);
    })();
  }, []);
  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const lastRefund = txns.find((tx) => tx.kind === "refund");
  const successRateLabel = stats ? `${stats.success_rate.toFixed(1)}%` : "99.4%";

  const totalSavings = pots.reduce((s, p) => s + p.saved_minor, 0);
  const loan = calcLoanEligibility(level.txnCount, totalSavings);
  const nudge = computeNudge({ txns, pots, chamaNames, loan, loanEverApplied: loanApplied });

  return (
    <div className="pb-4">
      {/* Trust line */}
      <div className="mx-4 mt-3 flex items-start gap-3 bg-soft rounded-button px-4 py-3 border border-line">
        <span className="text-[18px] flex-shrink-0 mt-0.5" role="img" aria-label="shield">
          🛡
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-ink">
            {firstName}, {t("safety_tagline").toLowerCase()}
          </p>
          <p className="text-[11px] text-ink2 leading-relaxed mt-0.5">{t("trust_ribbon")}</p>
        </div>
        <span className="flex-shrink-0 text-[10px] font-bold text-accent bg-accent/10 rounded-full px-2.5 py-1 whitespace-nowrap self-center">
          {successRateLabel}
        </span>
      </div>

      {/* Nudge card */}
      <div className="mx-4 mt-3 rounded-card border border-line bg-card shadow-subtle p-4 flex items-center gap-3">
        <span className="text-2xl flex-shrink-0">{nudge.icon}</span>
        <p className="text-[13px] text-ink flex-1 leading-relaxed">{nudge.title}</p>
        <Link
          href={nudge.href}
          className="text-[12px] font-semibold text-primary whitespace-nowrap flex-shrink-0"
        >
          {nudge.cta}
        </Link>
      </div>

      {/* Balance hero */}
      {walletLoading ? (
        <BalanceSkeleton />
      ) : (
        <div className="mx-4 mt-3 rounded-big bg-primary p-6 shadow-elevated">
          <p className="text-[11px] text-white/70 font-medium uppercase tracking-wider">
            {t("balance")}
          </p>
          <p className="money text-[36px] text-white mt-1 leading-none">
            {formatUGX(wallet?.balance_minor ?? 0)}
          </p>
        </div>
      )}

      {/* Jobs grid */}
      <div className="mx-4 mt-4">
        <h2 className="font-display text-[15px] font-semibold text-ink mb-2">
          {t("what_to_do")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <JobButton href="/pay/yaka" icon="💡" label={t("job_yaka")} hero />
          <JobButton href="/pay/water" icon="💧" label={t("job_water")} />
          <JobButton href="/pay/send" icon="↑" label={t("job_send")} />
          <JobButton href="/cash" icon="🏪" label={t("job_cash")} />
          <JobButton href="/pay/airtime" icon="📞" label={t("job_airtime")} />
        </div>
      </div>

      {/* Last refund surfaced */}
      {lastRefund && (
        <div className="mx-4 mt-3 rounded-card border border-gold/30 bg-gold/5 px-4 py-2.5 flex items-center gap-2">
          <span className="text-[13px] text-ink2">
            {t("last_refund_line").replace("{seconds}", "12")}
          </span>
        </div>
      )}

      {/* Fees saved */}
      {loan.eligible && (
        <div className="mx-4 mt-3 rounded-card border border-accent/20 bg-accent/5 p-4 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🏦</span>
          <div className="flex-1">
            <p className="text-[12px] text-ink3">{t("loan_card_title")}</p>
            <p className="money text-[18px] text-ink font-semibold">{formatUGX(loan.amountMinor)}</p>
          </div>
          <Link href="/grow/loan" className="text-[12px] font-semibold text-primary whitespace-nowrap">
            {t("loan_card_view")}
          </Link>
        </div>
      )}

      {/* Transactions */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            {t("recent_activity")}
          </h2>
          <Link href="/cash" className="text-[12px] text-primary font-medium">
            {t("see_all")}
          </Link>
        </div>

        <div className="rounded-card border border-line bg-card shadow-subtle overflow-hidden">
          {txnsLoading ? (
            <>
              <TxnRowSkeleton />
              <TxnRowSkeleton />
              <TxnRowSkeleton />
            </>
          ) : txns.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[14px] font-medium text-ink mb-1">{t("no_transactions")}</p>
              <p className="text-[12px] text-ink3">{t("no_transactions_sub")}</p>
            </div>
          ) : (
            txns.map((txn) => <TxnRow key={txn.id} txn={txn} t={t} />)
          )}
        </div>
      </div>

      {/* Social proof */}
      <div className="mx-4 mt-3 text-center">
        <p className="text-[12px] text-ink3">
          {t("social_proof")
            .replace("{count}", String(stats?.bills_today ?? 0))
            .replace("{city}", stats?.city ?? "Kampala")}
        </p>
      </div>

      {/* USSD footer */}
      <div className="mx-4 mt-4 text-center">
        <p className="text-[11px] text-ink3">{t("ussd_footer")}</p>
      </div>

      {/* Pilot disclosure */}
      <PilotBadge className="mx-4 mt-3 mb-1" />
    </div>
  );
}
