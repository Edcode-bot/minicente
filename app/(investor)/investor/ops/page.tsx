import { createAdminClient } from "@/lib/supabase/admin";
import { config } from "@/lib/config";
import { formatUGX } from "@/lib/types";

// Internal ops cockpit — direct URL only (/investor/ops), no user-facing nav link.
// Reads live data using the service-role client. Requires SUPABASE_SERVICE_ROLE_KEY.

interface Stat {
  label: string;
  value: string;
  accent: string;
  sub?: string;
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="bg-inv-card rounded-xl2 border border-inv-line p-4">
      <p className="text-[10px] text-inv-ink3 font-medium uppercase tracking-wider leading-tight">
        {stat.label}
      </p>
      <p className="font-display text-xl font-bold mt-1.5" style={{ color: stat.accent }}>
        {stat.value}
      </p>
      {stat.sub && <p className="text-[10px] text-inv-ink3 mt-1">{stat.sub}</p>}
    </div>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const isLive = mode === "live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
        isLive ? "bg-inv-teal/10 text-inv-teal" : "bg-inv-amber/10 text-inv-amber"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-inv-teal" : "bg-inv-amber"} ${isLive ? "animate-pulse" : ""}`} />
      {mode.toUpperCase()}
    </span>
  );
}

export default async function OpsPage() {
  // ── Data fetch (gracefully handles missing service role key) ───────────────
  let stats: Stat[] = [];
  let recentTxns: Array<{ reference: string; kind: string; status: string; amount_minor: number; created_at: string }> = [];
  let settlements: Array<{ txn_id: string; chain: string; status: string; amount_minor: number; created_at: string }> = [];
  let totalFloat = 0;
  let agentCount = 0;
  let noAccess = false;

  try {
    const admin = createAdminClient();

    const [txnRes, settleRes, agentRes, statsRes] = await Promise.all([
      admin
        .from("transactions")
        .select("reference, kind, status, amount_minor, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("settlements")
        .select("txn_id, chain, status, amount_minor, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("agent_accounts")
        .select("float_minor"),
      admin
        .from("platform_stats")
        .select("success_rate, bills_today, city")
        .limit(1)
        .maybeSingle(),
    ]);

    recentTxns = txnRes.data ?? [];
    settlements = settleRes.data ?? [];

    const agents = agentRes.data ?? [];
    agentCount = agents.length;
    totalFloat = agents.reduce((sum, a) => sum + (a.float_minor ?? 0), 0);

    const platformStat = statsRes.data;
    const successRate = platformStat?.success_rate ?? "—";
    const billsToday = platformStat?.bills_today ?? 0;

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const todayTxns = recentTxns.filter(
      (t) => new Date(t.created_at) >= todayMidnight
    );
    const todayVolume = todayTxns.reduce((sum, t) => sum + (t.amount_minor ?? 0), 0);
    const refundCount = recentTxns.filter((t) => t.kind === "refund").length;
    const failedCount = recentTxns.filter((t) => t.status === "failed").length;

    stats = [
      {
        label: "Today's Volume",
        value: formatUGX(todayVolume),
        accent: "#2dd4a0",
        sub: `${todayTxns.length} transactions`,
      },
      {
        label: "Success Rate",
        value: typeof successRate === "number" ? `${successRate}%` : String(successRate),
        accent: "#4a9eff",
        sub: `${billsToday} bills today`,
      },
      {
        label: "Refunds",
        value: String(refundCount),
        accent: refundCount > 0 ? "#f59e0b" : "#2dd4a0",
        sub: `${failedCount} failed (last 10)`,
      },
      {
        label: "Agent Float",
        value: formatUGX(totalFloat),
        accent: "#a78bfa",
        sub: `${agentCount} active agents`,
      },
    ];
  } catch {
    noAccess = true;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-display text-[18px] font-bold text-inv-ink">Ops Cockpit</h1>
          <p className="text-[11px] text-inv-ink3 mt-0.5">
            Internal · {new Date().toLocaleDateString("en-UG", { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </div>
        <span className="text-[10px] bg-inv-red/10 text-inv-red px-2 py-1 rounded-full font-bold">
          INTERNAL
        </span>
      </div>

      {/* Provider mode strip */}
      <div className="bg-inv-card rounded-xl2 border border-inv-line p-4 mb-4">
        <p className="text-[10px] text-inv-ink3 font-medium uppercase tracking-wider mb-3">
          Provider Modes
        </p>
        <div className="grid grid-cols-3 gap-y-2.5">
          {[
            { label: "Rails", mode: config.railsMode },
            { label: "OTP", mode: config.otpMode },
            { label: "Settlement", mode: config.settlementMode },
          ].map(({ label, mode }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[11px] text-inv-ink3 w-16">{label}</span>
              <ModeBadge mode={mode} />
            </div>
          ))}
        </div>
      </div>

      {noAccess ? (
        <div className="bg-inv-amber/10 border border-inv-amber/20 rounded-xl2 p-5 text-center">
          <p className="text-inv-amber font-semibold text-sm">SUPABASE_SERVICE_ROLE_KEY not configured</p>
          <p className="text-inv-ink3 text-xs mt-1">Set it in .env.local to see live data</p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {stats.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </div>

          {/* Recent transactions */}
          <div className="mb-5">
            <h2 className="font-display text-[13px] font-semibold text-inv-ink mb-2.5">
              Recent Transactions
            </h2>
            <div className="space-y-1.5">
              {recentTxns.length === 0 && (
                <p className="text-[12px] text-inv-ink3 py-3 text-center">No transactions yet</p>
              )}
              {recentTxns.map((txn) => (
                <div
                  key={txn.reference}
                  className="bg-inv-card rounded-xl border border-inv-line px-3.5 py-2.5 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-inv-ink2 truncate">{txn.reference}</p>
                    <p className="text-[10px] text-inv-ink3 mt-0.5 capitalize">{txn.kind}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-semibold text-inv-ink">{formatUGX(txn.amount_minor)}</p>
                    <p
                      className={`text-[10px] mt-0.5 font-medium ${
                        txn.status === "success"
                          ? "text-inv-teal"
                          : txn.status === "failed"
                          ? "text-inv-red"
                          : "text-inv-amber"
                      }`}
                    >
                      {txn.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlements table */}
          <div>
            <h2 className="font-display text-[13px] font-semibold text-inv-ink mb-2.5">
              Settlements
            </h2>
            <div className="space-y-1.5">
              {settlements.length === 0 && (
                <p className="text-[12px] text-inv-ink3 py-3 text-center">No settlements recorded yet</p>
              )}
              {settlements.map((s, i) => (
                <div
                  key={`${s.txn_id}-${i}`}
                  className="bg-inv-card rounded-xl border border-inv-line px-3.5 py-2.5 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-inv-ink2 truncate">{s.txn_id}</p>
                    <p className="text-[10px] text-inv-ink3 mt-0.5 uppercase font-mono">{s.chain}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-semibold text-inv-ink">{formatUGX(s.amount_minor)}</p>
                    <p
                      className={`text-[10px] mt-0.5 font-medium ${
                        s.status === "settled" ? "text-inv-teal" : "text-inv-red"
                      }`}
                    >
                      {s.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Health link */}
      <div className="mt-6 pt-4 border-t border-inv-line">
        <p className="text-[10px] text-inv-ink3 text-center">
          Full readiness report:{" "}
          <a href="/api/health" className="text-inv-lime font-mono hover:underline">
            /api/health
          </a>
        </p>
      </div>
    </div>
  );
}
