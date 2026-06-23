"use client";

import { LOANS, type Loan } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

const CREDIT_SCORE = 712;
const CREDIT_MAX = 850;
const SCORE_PCT = (CREDIT_SCORE / CREDIT_MAX) * 100;

// SVG ring dimensions
const R = 44;
const CIRC = 2 * Math.PI * R;
const OFFSET = CIRC - (SCORE_PCT / 100) * CIRC;

function scoreLabel(score: number) {
  if (score >= 800) return { label: "Excellent", color: "#2dd4a0" };
  if (score >= 740) return { label: "Very Good", color: "#c8f045" };
  if (score >= 670) return { label: "Good", color: "#f0a830" };
  return { label: "Fair", color: "#e85540" };
}

function LoanCard({ loan }: { loan: Loan }) {
  const statusColors: Record<Loan["status"], string> = {
    active: "text-teal bg-teal/10",
    available: "text-lime bg-lime/10",
    pending: "text-amber bg-amber/10",
  };

  const typeAccent: Record<Loan["type"], string> = {
    personal: "#4a9eff",
    business: "#c8f045",
    bnpl: "#a78bfa",
  };

  return (
    <div className="bg-card rounded-xl2 border border-line p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-ink">{loan.name}</p>
          <p className="text-xs text-ink3 mt-0.5">{loan.term}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[loan.status]}`}>
          {loan.status.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div>
          <p className="text-[10px] text-ink3">APR</p>
          <p
            className="font-display text-xl font-bold"
            style={{ color: typeAccent[loan.type] }}
          >
            {loan.apr === 0 ? "0%" : `${loan.apr}%`}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-ink3">Limit</p>
          <p className="font-display text-xl font-bold text-ink">
            ${loan.limit.toLocaleString()}
          </p>
        </div>
        {loan.outstanding !== undefined && (
          <div>
            <p className="text-[10px] text-ink3">Outstanding</p>
            <p className="font-display text-xl font-bold text-amber">
              ${loan.outstanding.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {loan.features.map((f) => (
          <span
            key={f}
            className="text-[10px] px-2 py-0.5 rounded-full bg-bg3 border border-line text-ink2 font-medium"
          >
            {f}
          </span>
        ))}
      </div>

      <button
        className="w-full text-xs font-bold py-2.5 rounded-xl text-center transition-all active:scale-95"
        style={{
          backgroundColor: `${typeAccent[loan.type]}18`,
          color: typeAccent[loan.type],
          border: `1px solid ${typeAccent[loan.type]}30`,
        }}
      >
        {loan.status === "active" ? "Manage Loan" : "Apply Now"}
      </button>
    </div>
  );
}

export default function LoansPage() {
  const { label: scoreLabel_, color: scoreColor } = scoreLabel(CREDIT_SCORE);

  return (
    <div className="px-4 pb-6">
      <PageHeader
        title="Loans"
        subtitle="On-chain credit, instant approval"
      />

      {/* ── Credit score ring ────────────────────────────── */}
      <div className="flex items-center gap-5 bg-card rounded-xl3 border border-line p-5 mb-5">
        <div className="relative flex-shrink-0">
          <svg width="112" height="112" viewBox="0 0 112 112">
            {/* Track */}
            <circle
              cx="56"
              cy="56"
              r={R}
              fill="none"
              stroke="#1c1f18"
              strokeWidth="10"
            />
            {/* Score arc */}
            <circle
              cx="56"
              cy="56"
              r={R}
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={OFFSET}
              transform="rotate(-90 56 56)"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display text-2xl font-black"
              style={{ color: scoreColor }}
            >
              {CREDIT_SCORE}
            </span>
            <span className="text-[9px] text-ink3">{CREDIT_MAX}</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs text-ink3 font-medium">On-chain Credit Score</p>
          <p
            className="font-display text-lg font-bold mt-0.5"
            style={{ color: scoreColor }}
          >
            {scoreLabel_}
          </p>
          <p className="text-xs text-ink3 mt-2 leading-relaxed">
            Based on 6 months of on-chain activity across Base and Arbitrum.
          </p>
          <div className="flex gap-2 mt-3">
            <span className="text-[10px] bg-teal/10 text-teal px-2 py-1 rounded-full font-medium">
              On-time payments
            </span>
            <span className="text-[10px] bg-blue/10 text-blue px-2 py-1 rounded-full font-medium">
              Low utilisation
            </span>
          </div>
        </div>
      </div>

      {/* ── Loan products ────────────────────────────────── */}
      <h2 className="font-display text-base font-semibold text-ink mb-3">
        Loan Products
      </h2>
      <div className="space-y-3">
        {LOANS.map((l) => (
          <LoanCard key={l.id} loan={l} />
        ))}
      </div>
    </div>
  );
}
