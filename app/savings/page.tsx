"use client";

import Link from "next/link";
import { SAVINGS_PRODUCTS, CHAMAS, type SavingsProduct, type Chama } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

const TOTAL_SAVINGS = SAVINGS_PRODUCTS.reduce((s, p) => s + p.balance, 0);

function ProductCard({ product }: { product: SavingsProduct }) {
  const pct = product.target ? (product.balance / product.target) * 100 : null;

  const typeIcon: Record<SavingsProduct["type"], string> = {
    flexi: "⚡",
    goal: "🎯",
    fixed: "🔒",
    micro: "💧",
  };

  return (
    <div className="bg-card rounded-xl2 border border-line p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: `${product.accent}18` }}
        >
          {typeIcon[product.type]}
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color: product.accent, backgroundColor: `${product.accent}18` }}
        >
          {product.apy}% APY
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">{product.name}</p>
        <p className="text-xs text-ink3 mt-0.5 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-ink3">Balance</span>
          <span className="text-xs font-semibold text-ink">
            ${product.balance.toLocaleString()}
          </span>
        </div>
        {pct !== null && (
          <>
            <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, pct)}%`, backgroundColor: product.accent }}
              />
            </div>
            <p className="text-[10px] text-ink3 mt-1">
              {pct.toFixed(0)}% of ${product.target?.toLocaleString()} goal
            </p>
          </>
        )}
      </div>

      <button
        className="w-full text-xs font-semibold py-2 rounded-xl border border-line hover:border-line2 transition-colors text-ink2 hover:text-ink"
      >
        Deposit
      </button>
    </div>
  );
}

function ChamaRow({ chama }: { chama: Chama }) {
  const pct = (chama.balance / chama.target) * 100;
  return (
    <div className="bg-card rounded-xl p-4 border border-line">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{chama.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink truncate">{chama.name}</p>
            {chama.role === "admin" && (
              <span className="text-[10px] bg-lime/10 text-lime px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-ink3">
            {chama.members} members · Next: {chama.nextContribution}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-ink">
            ${chama.balance.toLocaleString()}
          </p>
          <p className="text-[10px] text-ink3">
            of ${chama.target.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="text-[10px] text-ink3 mt-1">{pct.toFixed(0)}% of target</p>
    </div>
  );
}

export default function SavingsPage() {
  return (
    <div className="px-4 pb-6">
      <PageHeader
        title="Savings"
        subtitle="Grow your money with DeFi yields"
        action={
          <button className="text-xs bg-lime text-bg font-bold px-3 py-1.5 rounded-xl">
            + Add
          </button>
        }
      />

      {/* ── Total savings hero ───────────────────────────── */}
      <div className="bg-gradient-to-br from-teal/10 to-bg3 rounded-xl3 p-5 border border-line mb-5">
        <p className="text-ink3 text-xs font-medium">Total Saved</p>
        <p className="font-display text-4xl font-bold text-ink mt-1">
          ${TOTAL_SAVINGS.toLocaleString("en", { minimumFractionDigits: 2 })}
        </p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-[10px] text-ink3">Avg APY</p>
            <p className="text-sm font-bold text-teal">7.8%</p>
          </div>
          <div>
            <p className="text-[10px] text-ink3">Earned this month</p>
            <p className="text-sm font-bold text-lime">+$18.40</p>
          </div>
          <div>
            <p className="text-[10px] text-ink3">Products</p>
            <p className="text-sm font-bold text-ink">{SAVINGS_PRODUCTS.length}</p>
          </div>
        </div>
      </div>

      {/* ── 2x2 product grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {SAVINGS_PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* ── Chama groups ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold text-ink">
            Chama Groups
          </h2>
          <button className="text-xs text-lime font-medium">Join / Create</button>
        </div>
        <div className="space-y-2">
          {CHAMAS.map((c) => (
            <ChamaRow key={c.id} chama={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
