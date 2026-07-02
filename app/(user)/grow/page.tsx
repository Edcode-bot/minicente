"use client";

import { useState, useEffect, useCallback } from "react";
import { useT, type I18nKey } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { processPayment } from "@/lib/payments";
import { formatUGX } from "@/lib/types";
import type { SavingsPot, Chama, ChamaMember, AutoCadence } from "@/lib/types";
import { useLevel } from "@/lib/hooks/useLevel";
import { calcLoanEligibility } from "@/lib/hooks/useLoanEligibility";
import { safeWrite } from "@/lib/offline";
import Link from "next/link";

type TFn = (k: I18nKey) => string;

type MemberWithChama = ChamaMember & { chamas: Chama };

// ─── Sheet discriminated union ────────────────────────────────────────────────
type Sheet =
  | { kind: "none" }
  | { kind: "newPot" }
  | { kind: "addMoney"; pot: SavingsPot }
  | { kind: "contribute"; chama: Chama }
  | { kind: "joinStart" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cadenceLabel(c: AutoCadence, t: TFn): string {
  if (c === "weekly") return t("cadence_weekly");
  if (c === "monthly") return t("cadence_monthly");
  return t("cadence_none");
}

function weeksUntilTurn(position: number, memberCount: number, cadence: "weekly" | "monthly"): number {
  if (memberCount <= 0) return 0;
  const raw = ((position - 1) % memberCount) * (cadence === "monthly" ? 4 : 1);
  return raw;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-1.5 bg-soft rounded-full overflow-hidden mt-2">
      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function PotCard({
  pot,
  t,
  onAdd,
}: {
  pot: SavingsPot;
  t: TFn;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-card border border-line bg-card shadow-subtle p-4 mb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-ink">{pot.name}</p>
          <p className="money text-[12px] text-ink3 mt-0.5">
            {formatUGX(pot.saved_minor)}{" "}
            {t("pot_of_goal").replace("{goal}", formatUGX(pot.target_minor))}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="rounded-button bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1.5 whitespace-nowrap"
        >
          {t("pot_add")}
        </button>
      </div>
      <ProgressBar value={pot.saved_minor} max={pot.target_minor} />
      <div className="flex items-center gap-4 mt-2">
        <span className="text-[11px] text-accent font-medium">{t("pot_earning")}</span>
        {pot.auto_cadence !== "none" && pot.auto_amount_minor > 0 && (
          <span className="text-[11px] text-ink3">
            {t("pot_autosave_line")
              .replace("{amount}", formatUGX(pot.auto_amount_minor))
              .replace("{cadence}", pot.auto_cadence === "weekly" ? "Friday" : "month")}
          </span>
        )}
      </div>
    </div>
  );
}

function ChamaCard({
  member,
  chama,
  t,
  onContribute,
}: {
  member: ChamaMember;
  chama: Chama;
  t: TFn;
  onContribute: () => void;
}) {
  const weeks = weeksUntilTurn(member.position, chama.member_count, chama.cadence);
  const turnLine = weeks === 0 ? t("chama_turn_now") : t("chama_turn_in").replace("{n}", String(weeks));

  return (
    <div className="rounded-card border border-line bg-card shadow-subtle p-4 mb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-ink">{chama.name}</p>
          <p className="text-[12px] text-ink3 mt-0.5">
            {t("chama_members").replace("{n}", String(chama.member_count))} ·{" "}
            {chama.cadence === "weekly"
              ? t("chama_per_week").replace("{amount}", formatUGX(chama.contribution_minor).replace("UGX ", ""))
              : t("chama_per_month").replace("{amount}", formatUGX(chama.contribution_minor).replace("UGX ", ""))}
          </p>
        </div>
        <button
          onClick={onContribute}
          className="rounded-button bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1.5 whitespace-nowrap"
        >
          {t("chama_contribute")}
        </button>
      </div>
      <p className="text-[11px] text-accent font-medium mt-2">{turnLine}</p>
    </div>
  );
}

// ─── Overlay shell ────────────────────────────────────────────────────────────
function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-[460px] rounded-t-big p-5 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />
        {children}
      </div>
    </div>
  );
}

function AmountInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-line pb-2">
      <span className="text-[18px] font-semibold text-ink3">UGX</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="money text-[28px] font-bold text-ink bg-transparent outline-none flex-1 min-w-0"
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GrowPage() {
  const { t } = useT();
  const level = useLevel();
  const [pots, setPots] = useState<SavingsPot[]>([]);
  const [members, setMembers] = useState<MemberWithChama[]>([]);
  const [allChamas, setAllChamas] = useState<Chama[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>({ kind: "none" });
  const [loading, setLoading] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const [{ data: potsData }, { data: membersData }, { data: chamasData }] = await Promise.all([
      supabase.from("savings_pots").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("chama_members").select("*, chamas(*)").eq("user_id", user.id),
      supabase.from("chamas").select("*"),
    ]);

    setPots((potsData ?? []) as SavingsPot[]);
    setMembers((membersData ?? []) as MemberWithChama[]);
    setAllChamas((chamasData ?? []) as Chama[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const close = () => setSheet({ kind: "none" });

  // ─── Sheet: New pot ─────────────────────────────────────────────────────────
  const [potName, setPotName] = useState("");
  const [potTarget, setPotTarget] = useState("");
  const [potAutoAmt, setPotAutoAmt] = useState("");
  const [potCadence, setPotCadence] = useState<AutoCadence>("none");
  const [potSaving, setPotSaving] = useState(false);

  const handleCreatePot = async () => {
    if (!potName.trim() || !potTarget.trim() || !userId) return;
    setPotSaving(true);
    const supabase = createClient();
    const targetMinor = parseInt(potTarget.replace(/[^\d]/g, ""), 10);
    const autoMinor = parseInt(potAutoAmt.replace(/[^\d]/g, ""), 10) || 0;
    const { data } = await supabase.from("savings_pots").insert({
      user_id: userId,
      name: potName.trim(),
      target_minor: targetMinor || 100000,
      saved_minor: 0,
      apy: 9,
      auto_amount_minor: autoMinor,
      auto_cadence: potCadence,
    }).select().single();
    if (data) setPots((prev) => [...prev, data as SavingsPot]);
    setPotName(""); setPotTarget(""); setPotAutoAmt(""); setPotCadence("none");
    setPotSaving(false);
    close();
  };

  // ─── Sheet: Add money ───────────────────────────────────────────────────────
  const [addAmt, setAddAmt] = useState("");
  const [addStatus, setAddStatus] = useState<"idle" | "busy" | "ok" | "err" | "low">("idle");

  const handleAddMoney = async (pot: SavingsPot) => {
    const minor = parseInt(addAmt.replace(/[^\d]/g, ""), 10);
    if (!minor || minor <= 0) return;
    setAddStatus("busy");
    const result = await processPayment({ kind: "savings", amountMinor: minor, counterparty: pot.name });
    if (result.reason === "insufficient") { setAddStatus("low"); return; }
    if (!result.ok) { setAddStatus("err"); return; }

    // Optimistic update — show new total immediately
    const newSaved = pot.saved_minor + minor;
    setPots((prev) => prev.map((p) => p.id === pot.id ? { ...p, saved_minor: newSaved } : p));
    setAddAmt(""); setAddStatus("ok");

    // Persist to DB; if offline, queue and reconcile on reconnect
    const supabase = createClient();
    const write = await safeWrite(async () => { await supabase.from("savings_pots").update({ saved_minor: newSaved }).eq("id", pot.id); });
    if (!write.ok && write.offline) {
      // Rolled back by safeWrite queue; keep optimistic for now — will sync on reconnect
    }
    setTimeout(close, 1200);
  };

  // ─── Sheet: Contribute to chama ─────────────────────────────────────────────
  const [contribStatus, setContribStatus] = useState<"idle" | "busy" | "ok" | "err" | "low">("idle");

  const handleContribute = async (chama: Chama) => {
    setContribStatus("busy");
    const result = await processPayment({ kind: "savings", amountMinor: chama.contribution_minor, counterparty: chama.name });
    if (result.reason === "insufficient") { setContribStatus("low"); return; }
    if (!result.ok) { setContribStatus("err"); return; }
    setContribStatus("ok");
    setTimeout(close, 1200);
  };

  // ─── Sheet: Join / Start chama ──────────────────────────────────────────────
  const [newChamaName, setNewChamaName] = useState("");
  const [newChamaAmt, setNewChamaAmt] = useState("");
  const [newChamaCadence, setNewChamaCadence] = useState<"weekly" | "monthly">("weekly");
  const [chamaSaving, setChamaSaving] = useState(false);

  const joinedIds = new Set(members.map((m) => m.chama_id));
  const joinable = allChamas.filter((c) => !joinedIds.has(c.id));

  const handleJoinChama = async (chama: Chama) => {
    if (!userId) return;
    const supabase = createClient();
    const nextPos = chama.member_count + 1;
    await supabase.from("chama_members").insert({ chama_id: chama.id, user_id: userId, position: nextPos });
    await supabase.from("chamas").update({ member_count: nextPos }).eq("id", chama.id);
    await fetchAll();
    close();
  };

  const handleStartChama = async () => {
    if (!newChamaName.trim() || !newChamaAmt.trim() || !userId) return;
    setChamaSaving(true);
    const supabase = createClient();
    const contribMinor = parseInt(newChamaAmt.replace(/[^\d]/g, ""), 10);
    const { data: chamaRow } = await supabase.from("chamas").insert({
      name: newChamaName.trim(),
      contribution_minor: contribMinor || 10000,
      cadence: newChamaCadence,
      member_count: 1,
      created_by: userId,
    }).select().single();
    if (chamaRow) {
      await supabase.from("chama_members").insert({ chama_id: (chamaRow as Chama).id, user_id: userId, position: 1 });
    }
    setNewChamaName(""); setNewChamaAmt(""); setNewChamaCadence("weekly");
    setChamaSaving(false);
    await fetchAll();
    close();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 pt-5 pb-2 space-y-3">
        <div className="h-6 rounded bg-line/60 animate-pulse w-1/2" />
        <div className="h-16 rounded-card bg-line/40 animate-pulse" />
        <div className="h-24 rounded-card bg-line/40 animate-pulse" />
        <div className="h-24 rounded-card bg-line/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-2">
      {/* Header */}
      <h1 className="font-display text-[20px] font-bold text-ink leading-tight mb-1">
        {t("grow_headline")}
      </h1>
      <p className="text-[13px] text-ink3 mb-3 leading-relaxed">{t("grow_sub")}</p>
      <div className="flex items-center gap-2 bg-soft rounded-button px-3 py-2.5 mb-5 border border-line">
        <span className="text-[14px]">🏦</span>
        <p className="text-[11px] text-ink2 leading-relaxed">{t("grow_trust")}</p>
      </div>

      {/* ── Savings pots ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-[15px] font-semibold text-ink">{t("pot_section")}</h2>
        <button
          onClick={() => { setSheet({ kind: "newPot" }); }}
          className="text-[12px] font-semibold text-primary"
        >
          {t("pot_new")}
        </button>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-line border-t-primary animate-spin" />
        </div>
      ) : pots.length === 0 ? (
        <div className="rounded-card border border-line bg-card shadow-subtle p-5 mb-5 text-center">
          <p className="text-[22px] mb-2">🌱</p>
          <p className="text-[14px] font-semibold text-ink">{t("pot_empty_title")}</p>
          <p className="text-[12px] text-ink3 mt-1">{t("pot_empty_sub")}</p>
          <button
            onClick={() => setSheet({ kind: "newPot" })}
            className="mt-4 rounded-button bg-primary text-white font-semibold text-[13px] px-5 py-2.5"
          >
            {t("pot_empty_cta")}
          </button>
        </div>
      ) : (
        pots.map((pot) => (
          <PotCard
            key={pot.id}
            pot={pot}
            t={t}
            onAdd={() => { setAddAmt(""); setAddStatus("idle"); setSheet({ kind: "addMoney", pot }); }}
          />
        ))
      )}

      {/* ── Loan card ───────────────────────────────────────── */}
      {!level.loading && (() => {
        const totalSavings = pots.reduce((s, p) => s + p.saved_minor, 0);
        const loan = calcLoanEligibility(level.txnCount, totalSavings);
        if (loan.eligible) {
          return (
            <div className="rounded-card border border-accent/20 bg-accent/5 p-4 mt-4 mb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-ink">{t("loan_card_title")}</p>
                  <p className="money text-[20px] font-bold text-ink mt-1">{formatUGX(loan.amountMinor)}</p>
                  <p className="text-[11px] text-ink3 mt-0.5">{t("loan_card_sub")}</p>
                </div>
                <Link
                  href="/grow/loan"
                  className="rounded-button bg-primary text-white text-[12px] font-semibold px-4 py-2 whitespace-nowrap"
                >
                  {t("loan_card_view")}
                </Link>
              </div>
            </div>
          );
        }
        return (
          <div className="rounded-card border border-line bg-soft p-4 mt-4 mb-0">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🔒</span>
              <div>
                <p className="text-[13px] font-semibold text-ink">
                  {t("loan_not_eligible").replace("{n}", String(loan.paymentsNeeded))}
                </p>
                <p className="text-[12px] text-ink3 mt-0.5">{t("loan_not_eligible_sub")}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Chama ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <h2 className="font-display text-[15px] font-semibold text-ink">{t("chama_section")}</h2>
        <button
          onClick={() => setSheet({ kind: "joinStart" })}
          className="text-[12px] font-semibold text-primary"
        >
          {t("chama_join_start")}
        </button>
      </div>

      <p className="text-[11px] text-ink3 leading-relaxed mb-3">{t("chama_explain")}</p>

      {!loading && members.length === 0 && (
        <div className="rounded-card border border-line bg-card shadow-subtle p-5 text-center">
          <p className="text-[22px] mb-2">🤝</p>
          <p className="text-[14px] font-semibold text-ink">{t("chama_empty_title")}</p>
          <p className="text-[12px] text-ink3 mt-1">{t("chama_empty_sub")}</p>
          <button
            onClick={() => setSheet({ kind: "joinStart" })}
            className="mt-4 rounded-button bg-primary text-white font-semibold text-[13px] px-5 py-2.5"
          >
            {t("chama_join_start")}
          </button>
        </div>
      )}

      {members.map((m) => (
        <ChamaCard
          key={m.id}
          member={m}
          chama={m.chamas}
          t={t}
          onContribute={() => { setContribStatus("idle"); setSheet({ kind: "contribute", chama: m.chamas }); }}
        />
      ))}

      {/* ── Sheets ──────────────────────────────────────────── */}

      {sheet.kind === "newPot" && (
        <Sheet onClose={close}>
          <p className="text-[16px] font-semibold text-ink mb-4">{t("new_pot_title")}</p>

          <label className="block text-[11px] text-ink3 font-medium uppercase tracking-wider mb-1">{t("new_pot_name")}</label>
          <input
            type="text"
            value={potName}
            onChange={(e) => setPotName(e.target.value)}
            placeholder="School Fees pot"
            className="w-full text-[16px] text-ink bg-transparent outline-none border-b border-line pb-2 mb-4"
          />

          <label className="block text-[11px] text-ink3 font-medium uppercase tracking-wider mb-1">{t("new_pot_target")}</label>
          <input
            type="text"
            inputMode="numeric"
            value={potTarget}
            onChange={(e) => setPotTarget(e.target.value)}
            placeholder="500,000"
            className="w-full text-[16px] text-ink bg-transparent outline-none border-b border-line pb-2 mb-4"
          />

          <label className="block text-[11px] text-ink3 font-medium uppercase tracking-wider mb-1">{t("new_pot_autosave")}</label>
          <input
            type="text"
            inputMode="numeric"
            value={potAutoAmt}
            onChange={(e) => setPotAutoAmt(e.target.value)}
            placeholder="5,000"
            className="w-full text-[16px] text-ink bg-transparent outline-none border-b border-line pb-2 mb-4"
          />

          <label className="block text-[11px] text-ink3 font-medium uppercase tracking-wider mb-1">{t("new_pot_cadence")}</label>
          <div className="flex gap-2 mb-5">
            {(["none", "weekly", "monthly"] as AutoCadence[]).map((c) => (
              <button
                key={c}
                onClick={() => setPotCadence(c)}
                className={`flex-1 text-[12px] font-semibold rounded-button py-2 border transition-colors ${
                  potCadence === c ? "bg-primary text-white border-primary" : "text-ink2 border-line"
                }`}
              >
                {cadenceLabel(c, t)}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={close} className="flex-1 rounded-button border border-line text-ink font-semibold py-3.5 text-[14px]">
              {t("sheet_cancel")}
            </button>
            <button
              onClick={handleCreatePot}
              disabled={!potName.trim() || !potTarget.trim() || potSaving}
              className="flex-1 rounded-button bg-primary text-white font-semibold py-3.5 text-[14px] disabled:opacity-40"
            >
              {t("sheet_save")}
            </button>
          </div>
        </Sheet>
      )}

      {sheet.kind === "addMoney" && (
        <Sheet onClose={close}>
          <p className="text-[16px] font-semibold text-ink mb-4">
            {t("add_money_title").replace("{name}", sheet.pot.name)}
          </p>
          <AmountInput value={addAmt} onChange={setAddAmt} />
          <p className="text-[11px] text-ink3 mt-2">
            {formatUGX(sheet.pot.saved_minor)} → {formatUGX(sheet.pot.target_minor)} goal
          </p>

          {addStatus === "low" && (
            <p className="text-[12px] text-danger mt-2">{t("pay_not_enough")}</p>
          )}
          {addStatus === "ok" && (
            <p className="text-[12px] text-accent mt-2 font-semibold">✓ Added!</p>
          )}
          {addStatus === "err" && (
            <p className="text-[12px] text-danger mt-2">{t("result_failed_title")}</p>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={close} className="flex-1 rounded-button border border-line text-ink font-semibold py-3.5 text-[14px]">
              {t("sheet_cancel")}
            </button>
            <button
              onClick={() => handleAddMoney(sheet.pot)}
              disabled={addStatus === "busy" || addStatus === "ok" || !addAmt}
              className="flex-1 rounded-button bg-primary text-white font-semibold py-3.5 text-[14px] disabled:opacity-40"
            >
              {addStatus === "busy"
                ? "…"
                : t("add_money_btn").replace("{amount}", addAmt ? formatUGX(parseInt(addAmt.replace(/[^\d]/g, ""), 10) * 100) : "UGX 0")}
            </button>
          </div>
        </Sheet>
      )}

      {sheet.kind === "contribute" && (
        <Sheet onClose={close}>
          <p className="text-[16px] font-semibold text-ink mb-1">{sheet.chama.name}</p>
          <p className="text-[13px] text-ink3 mb-4">
            {sheet.chama.cadence === "weekly"
              ? t("chama_per_week").replace("{amount}", formatUGX(sheet.chama.contribution_minor).replace("UGX ", ""))
              : t("chama_per_month").replace("{amount}", formatUGX(sheet.chama.contribution_minor).replace("UGX ", ""))}
          </p>

          <div className="rounded-card border border-line bg-soft p-4 mb-4">
            <p className="money text-[28px] font-bold text-ink">
              {formatUGX(sheet.chama.contribution_minor)}
            </p>
            <p className="text-[11px] text-ink3 mt-1">contribution amount</p>
          </div>

          {contribStatus === "low" && (
            <p className="text-[12px] text-danger mb-2">{t("pay_not_enough")}</p>
          )}
          {contribStatus === "ok" && (
            <p className="text-[12px] text-accent font-semibold mb-2">✓ Contributed!</p>
          )}

          <div className="flex gap-3">
            <button onClick={close} className="flex-1 rounded-button border border-line text-ink font-semibold py-3.5 text-[14px]">
              {t("sheet_cancel")}
            </button>
            <button
              onClick={() => handleContribute(sheet.chama)}
              disabled={contribStatus === "busy" || contribStatus === "ok"}
              className="flex-1 rounded-button bg-primary text-white font-semibold py-3.5 text-[14px] disabled:opacity-40"
            >
              {contribStatus === "busy" ? "…" : t("chama_contribute")}
            </button>
          </div>
        </Sheet>
      )}

      {sheet.kind === "joinStart" && (
        <Sheet onClose={close}>
          <p className="text-[16px] font-semibold text-ink mb-4">{t("new_chama_title")}</p>

          {joinable.length > 0 && (
            <div className="mb-5">
              <p className="text-[12px] text-ink3 font-medium mb-2">{t("chama_existing")}</p>
              {joinable.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-3 border-b border-line"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{c.name}</p>
                    <p className="text-[11px] text-ink3">
                      {t("chama_members").replace("{n}", String(c.member_count))} ·{" "}
                      {formatUGX(c.contribution_minor)}/{c.cadence === "weekly" ? "wk" : "mo"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinChama(c)}
                    className="rounded-button bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1.5"
                  >
                    {t("chama_join_btn")}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-line pt-4">
            <p className="text-[13px] font-semibold text-ink mb-3">{t("chama_start_btn")}</p>

            <label className="block text-[11px] text-ink3 font-medium uppercase tracking-wider mb-1">{t("chama_name_label")}</label>
            <input
              type="text"
              value={newChamaName}
              onChange={(e) => setNewChamaName(e.target.value)}
              placeholder="Tukolere Wamu"
              className="w-full text-[16px] text-ink bg-transparent outline-none border-b border-line pb-2 mb-3"
            />

            <label className="block text-[11px] text-ink3 font-medium uppercase tracking-wider mb-1">{t("chama_contrib_label")}</label>
            <input
              type="text"
              inputMode="numeric"
              value={newChamaAmt}
              onChange={(e) => setNewChamaAmt(e.target.value)}
              placeholder="13,000"
              className="w-full text-[16px] text-ink bg-transparent outline-none border-b border-line pb-2 mb-3"
            />

            <label className="block text-[11px] text-ink3 font-medium uppercase tracking-wider mb-1">{t("chama_cadence_label")}</label>
            <div className="flex gap-2 mb-5">
              {(["weekly", "monthly"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setNewChamaCadence(c)}
                  className={`flex-1 text-[12px] font-semibold rounded-button py-2 border transition-colors ${
                    newChamaCadence === c ? "bg-primary text-white border-primary" : "text-ink2 border-line"
                  }`}
                >
                  {c === "weekly" ? t("cadence_weekly") : t("cadence_monthly")}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartChama}
              disabled={!newChamaName.trim() || !newChamaAmt.trim() || chamaSaving}
              className="w-full rounded-button bg-primary text-white font-semibold py-3.5 text-[14px] disabled:opacity-40"
            >
              {chamaSaving ? "…" : t("chama_start_btn")}
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
