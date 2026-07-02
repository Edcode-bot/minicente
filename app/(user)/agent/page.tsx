"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { formatUGX } from "@/lib/types";
import type { AgentAccount, AgentTransaction } from "@/lib/types";
import { safeWrite } from "@/lib/offline";

// ─── Commission rates by tier ────────────────────────────────────────────────

const COMMISSION: Record<string, number> = {
  bronze: 0.008,
  silver: 0.010,
  gold: 0.012,
};

const TIER_NEXT_TXN: Record<string, number> = {
  bronze: 50,
  silver: 200,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-card border border-line bg-card shadow-subtle p-4">
      <p className="text-[11px] text-ink3 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="money text-[20px] font-black text-ink leading-none">{value}</p>
      {sub && <p className="text-[10px] text-ink3 mt-1">{sub}</p>}
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-card border border-line bg-card shadow-subtle p-4 flex flex-col items-center gap-2 hover:bg-soft transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[12px] font-semibold text-ink text-center leading-tight">{label}</span>
    </button>
  );
}

// ─── CICO Sheet ───────────────────────────────────────────────────────────────

function CicoSheet({
  kind,
  title,
  commissionRate,
  agentId,
  onDone,
  onClose,
}: {
  kind: "cashin" | "cashout";
  title: string;
  commissionRate: number;
  agentId: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [commission, setCommission] = useState(0);

  const amountNum = parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const commissionNum = Math.round(amountNum * commissionRate);

  const [offlineErr, setOfflineErr] = useState(false);

  const handleSubmit = async () => {
    if (!phone || amountNum < 1000) return;
    setLoading(true);
    setOfflineErr(false);
    const supabase = createClient();
    const ref = "MC-AG-" + Math.random().toString(16).slice(2, 10).toUpperCase();
    const row = { agent_id: agentId, kind, amount_minor: amountNum, commission_minor: commissionNum, customer_phone: phone, reference: ref };
    const res = await safeWrite(async () => { await supabase.from("agent_transactions").insert(row); });
    if (!res.ok && res.offline) { setOfflineErr(true); setLoading(false); return; }
    setCommission(commissionNum);
    setDone(true);
    setLoading(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl p-5 pb-8 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-2" />
        <h2 className="font-display text-[18px] font-bold text-ink">{title}</h2>

        {done ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-[16px] font-bold text-ink">{t("agent_done")}</p>
            <p className="text-[13px] text-ink3 mt-1">
              {t("agent_commission_label")}: <span className="font-bold text-accent">{formatUGX(commission)}</span>
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-button bg-primary text-white font-bold text-[14px] px-8 py-3"
            >
              OK
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="text-[11px] font-semibold text-ink3 uppercase tracking-wide block mb-1">
                {t("agent_customer_phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07X XXX XXXX"
                className="w-full border border-line rounded-button px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-ink3 uppercase tracking-wide block mb-1">
                {t("agent_amount_label")}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                className="w-full border border-line rounded-button px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-primary"
              />
            </div>
            {amountNum > 0 && (
              <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 flex justify-between items-center">
                <span className="text-[12px] text-ink3">{t("agent_commission_label")}</span>
                <span className="font-bold text-accent">{formatUGX(commissionNum)}</span>
              </div>
            )}
            {offlineErr && (
              <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-button px-3 py-2">
                📶 You&apos;re offline — we&apos;ll retry when you&apos;re back.
              </p>
            )}
            <button
              onClick={() => void handleSubmit()}
              disabled={loading || !phone || amountNum < 1000}
              className="w-full rounded-button bg-primary text-white font-bold text-[16px] py-4 disabled:opacity-50 transition-opacity"
            >
              {loading ? "…" : kind === "cashin" ? t("agent_cashin") : t("agent_cashout")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Float Sheet ──────────────────────────────────────────────────────────────

function FloatSheet({
  kind,
  title,
  sub,
  agentId,
  onDone,
  onClose,
}: {
  kind: "float_topup" | "float_repay";
  title: string;
  sub: string;
  agentId: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const amountNum = parseInt(amount.replace(/\D/g, ""), 10) || 0;

  const handleSubmit = async () => {
    if (amountNum < 1000) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("agent_transactions").insert({
      agent_id: agentId,
      kind,
      amount_minor: amountNum,
      commission_minor: 0,
      customer_phone: null,
      reference: null,
    });
    if (kind === "float_topup") {
      await supabase.rpc("increment_agent_float", { p_agent_id: agentId, p_amount: amountNum }).maybeSingle();
    } else {
      await supabase.rpc("decrement_agent_float", { p_agent_id: agentId, p_amount: amountNum }).maybeSingle();
    }
    setLoading(false);
    onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl p-5 pb-8 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-2" />
        <h2 className="font-display text-[18px] font-bold text-ink">{title}</h2>
        <p className="text-[12px] text-ink3">{sub}</p>
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (UGX)"
            className="w-full border border-line rounded-button px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => void handleSubmit()}
          disabled={loading || amountNum < 1000}
          className="w-full rounded-button bg-primary text-white font-bold text-[16px] py-4 disabled:opacity-50 transition-opacity"
        >
          {loading ? "…" : title}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Sheet =
  | { kind: "cashin" | "cashout" }
  | { kind: "float_topup" | "float_repay" }
  | null;

export default function AgentPage() {
  const { t } = useT();
  const router = useRouter();
  const [account, setAccount] = useState<AgentAccount | null>(null);
  const [txns, setTxns] = useState<AgentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<Sheet>(null);

  // Income calculator
  const [calcTxns, setCalcTxns] = useState(10);
  const [calcAvg, setCalcAvg] = useState(20000);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/onboarding"); return; }

    const { data: acc } = await supabase
      .from("agent_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!acc) { router.replace("/agent/join"); return; }
    setAccount(acc as AgentAccount);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: t2 } = await supabase
      .from("agent_transactions")
      .select("*")
      .eq("agent_id", acc.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });
    setTxns((t2 ?? []) as AgentTransaction[]);
    setLoading(false);
  }, [router]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const commissionRate = COMMISSION[account.tier] ?? 0.008;
  const todayEarnings = txns.reduce((s, tx) => s + tx.commission_minor, 0);
  const floatPct = account.float_limit_minor > 0
    ? (account.float_minor / account.float_limit_minor) * 100
    : 0;
  const floatLow = floatPct < 20;

  const monthlyCalc = Math.round(calcTxns * calcAvg * commissionRate * 22);

  const tierNext = TIER_NEXT_TXN[account.tier];
  const txnTotal = txns.length; // simplified — ideally lifetime count

  const tierKey =
    account.tier === "bronze"
      ? "agent_next_tier_bronze"
      : account.tier === "silver"
      ? "agent_next_tier_silver"
      : "agent_top_tier";

  const tierLabel =
    account.tier === "bronze"
      ? t("tier_bronze")
      : account.tier === "silver"
      ? t("tier_silver")
      : t("tier_gold");

  const tierColor =
    account.tier === "gold"
      ? "text-gold border-gold/30 bg-gold/5"
      : account.tier === "silver"
      ? "text-slate-600 border-slate-200 bg-slate-50"
      : "text-amber-700 border-amber-200 bg-amber-50";

  return (
    <>
      <div className="px-4 pt-5 pb-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[20px] font-black text-ink leading-tight">
              🏪 {t("agent_row")}
            </h1>
            <p className="text-[11px] font-mono text-ink3 mt-0.5">{account.agent_code}</p>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${tierColor}`}>
            {tierLabel}
          </span>
        </div>

        {/* Earnings hero */}
        <div className="rounded-card border border-accent/20 bg-gradient-to-br from-primary/5 to-accent/10 p-5">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">
            {t("agent_earnings_today")}
          </p>
          <p className="money text-[36px] font-black text-ink leading-none">
            {formatUGX(todayEarnings)}
          </p>
          <p className="text-[12px] text-ink3 mt-1.5">
            {t("agent_earnings_lifetime")}: <span className="font-semibold text-ink">{formatUGX(account.earnings_minor)}</span>
          </p>
        </div>

        {/* 3 stat tiles */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            label={t("agent_txns_today")}
            value={String(txns.length)}
          />
          <StatTile
            label={t("agent_float_available")}
            value={formatUGX(account.float_minor)}
          />
          <StatTile
            label={t("agent_tier_label")}
            value={tierLabel}
          />
        </div>

        {/* CICO 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <ActionBtn icon="📥" label={t("agent_cashin")} onClick={() => setSheet({ kind: "cashin" })} />
          <ActionBtn icon="📤" label={t("agent_cashout")} onClick={() => setSheet({ kind: "cashout" })} />
          <ActionBtn icon="🆕" label={t("agent_open_account")} onClick={() => alert(t("agent_open_stub"))} />
          <ActionBtn icon="🧾" label={t("agent_pay_bill")} onClick={() => alert(t("agent_open_stub"))} />
        </div>

        {/* Float card */}
        <div className="rounded-card border border-line bg-card shadow-subtle p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-ink">{t("agent_float_section")}</p>
            {floatLow && (
              <span className="text-[11px] text-amber-700 font-semibold">{t("agent_float_low")}</span>
            )}
          </div>
          <div className="h-2 rounded-full bg-soft mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${floatLow ? "bg-amber-400" : "bg-accent"}`}
              style={{ width: `${Math.min(floatPct, 100)}%` }}
            />
          </div>
          <p className="text-[12px] text-ink3 mb-4">
            {formatUGX(account.float_minor)} / {formatUGX(account.float_limit_minor)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSheet({ kind: "float_topup" })}
              className="flex-1 rounded-button border border-primary text-primary font-semibold text-[13px] py-2.5 hover:bg-primary/5 transition-colors"
            >
              {t("agent_float_topup")}
            </button>
            <button
              onClick={() => setSheet({ kind: "float_repay" })}
              className="flex-1 rounded-button border border-line text-ink2 font-semibold text-[13px] py-2.5 hover:bg-soft transition-colors"
            >
              {t("agent_float_repay")}
            </button>
          </div>
        </div>

        {/* Income calculator */}
        <div className="rounded-card border border-line bg-card shadow-subtle p-5">
          <p className="text-[14px] font-semibold text-ink mb-4">{t("agent_calc_title")}</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-ink3">{t("agent_calc_txns")}</span>
                <span className="text-[12px] font-bold text-ink">{calcTxns}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={calcTxns}
                onChange={(e) => setCalcTxns(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-ink3">{t("agent_calc_avg")}</span>
                <span className="text-[12px] font-bold text-ink">{formatUGX(calcAvg)}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={500000}
                step={1000}
                value={calcAvg}
                onChange={(e) => setCalcAvg(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4 text-center">
            <p className="text-[11px] text-ink3 mb-1">{t("agent_calc_monthly")}</p>
            <p className="money text-[28px] font-black text-accent">{formatUGX(monthlyCalc)}</p>
          </div>
          <p className="text-[10px] text-ink3 text-center mt-2">{t("agent_calc_note")}</p>
        </div>

        {/* Tier strip */}
        <div className="rounded-card border border-line bg-card shadow-subtle p-5">
          <p className="text-[12px] font-semibold text-ink3 uppercase tracking-wide mb-3">
            {t("agent_tier_strip_title")}
          </p>
          {(
            [
              { tier: "bronze", label: t("tier_bronze"), perk: t("agent_tier_perk_bronze"), color: "border-amber-200 bg-amber-50 text-amber-800" },
              { tier: "silver", label: t("tier_silver"), perk: t("agent_tier_perk_silver"), color: "border-slate-200 bg-slate-50 text-slate-700" },
              { tier: "gold", label: t("tier_gold"), perk: t("agent_tier_perk_gold"), color: "border-gold/30 bg-gold/5 text-gold" },
            ] as const
          ).map((row) => (
            <div
              key={row.tier}
              className={`rounded-xl border px-4 py-3 mb-2 last:mb-0 ${row.color} ${account.tier === row.tier ? "ring-2 ring-offset-1 ring-primary/40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold">{row.label}</p>
                  <p className="text-[11px] opacity-75 mt-0.5">{row.perk}</p>
                </div>
                {account.tier === row.tier && (
                  <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">YOU</span>
                )}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-ink3 mt-3 text-center">
            {tierNext != null
              ? t(tierKey as Parameters<typeof t>[0]).replace("{n}", String(Math.max(0, tierNext - txnTotal)))
              : t("agent_top_tier")}
          </p>
        </div>
      </div>

      {/* Sheets */}
      {sheet?.kind === "cashin" && (
        <CicoSheet
          kind="cashin"
          title={t("agent_cashin_title")}
          commissionRate={commissionRate}
          agentId={account.id}
          onDone={() => void fetchData()}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === "cashout" && (
        <CicoSheet
          kind="cashout"
          title={t("agent_cashout_title")}
          commissionRate={commissionRate}
          agentId={account.id}
          onDone={() => void fetchData()}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === "float_topup" && (
        <FloatSheet
          kind="float_topup"
          title={t("agent_float_topup_title")}
          sub={t("agent_float_topup_sub")}
          agentId={account.id}
          onDone={() => void fetchData()}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === "float_repay" && (
        <FloatSheet
          kind="float_repay"
          title={t("agent_float_repay_title")}
          sub=""
          agentId={account.id}
          onDone={() => void fetchData()}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}
