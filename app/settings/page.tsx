"use client";

import { useState } from "react";
import { USER } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-lime" : "bg-bg3 border border-line2"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-bg shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        } ${!checked && "bg-ink3"}`}
      />
    </button>
  );
}

interface SettingsRowProps {
  label: string;
  subtitle?: string;
  icon: string;
  toggle?: boolean;
  checked?: boolean;
  onToggle?: (v: boolean) => void;
  onClick?: () => void;
  danger?: boolean;
}

function SettingsRow({
  label,
  subtitle,
  icon,
  toggle,
  checked,
  onToggle,
  onClick,
  danger,
}: SettingsRowProps) {
  const handleClick = toggle ? undefined : onClick;
  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-card2 transition-colors text-left"
    >
      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red" : "text-ink"}`}>
          {label}
        </p>
        {subtitle && <p className="text-xs text-ink3 mt-0.5">{subtitle}</p>}
      </div>
      {toggle && checked !== undefined && onToggle ? (
        <Toggle checked={checked} onChange={onToggle} />
      ) : (
        <span className="text-ink3">›</span>
      )}
    </button>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <p className="text-[11px] text-ink3 font-semibold uppercase tracking-widest px-4 mb-2">
        {title}
      </p>
      <div className="bg-card rounded-xl2 border border-line divide-y divide-line overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [autoSave, setAutoSave] = useState(false);

  const KYC_TIERS: Array<{ tier: 1 | 2 | 3; label: string; done: boolean }> = [
    { tier: 1, label: "Tier 1", done: USER.kyc.tier >= 1 },
    { tier: 2, label: "Tier 2", done: USER.kyc.tier >= 2 },
    { tier: 3, label: "Tier 3", done: USER.kyc.tier >= 3 },
  ];

  return (
    <div className="pb-6">
      <PageHeader title="Settings" />

      {/* ── Profile card ─────────────────────────────────── */}
      <div className="mx-4 mb-5 bg-card rounded-xl3 border border-line p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl2 bg-lime flex items-center justify-center flex-shrink-0">
            <span className="font-display font-black text-bg text-xl">
              {USER.initials}
            </span>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink">
              {USER.name}
            </p>
            <p className="text-sm text-ink3 mt-0.5">{USER.phone}</p>
          </div>
        </div>

        {/* KYC tier pills */}
        <div className="flex gap-2">
          {KYC_TIERS.map((t) => (
            <div
              key={t.tier}
              className={`flex-1 text-center py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                t.done
                  ? "bg-lime/10 text-lime border-lime/20"
                  : "bg-bg3 text-ink3 border-line"
              }`}
            >
              {t.label}
              {t.done && " ✓"}
            </div>
          ))}
        </div>

        {USER.kyc.tier < 3 && (
          <button className="mt-3 w-full text-xs font-bold py-2.5 rounded-xl bg-amber/10 text-amber border border-amber/20 hover:bg-amber/20 transition-colors">
            Complete KYC Tier {USER.kyc.tier + 1} →
          </button>
        )}
      </div>

      {/* ── Account ──────────────────────────────────────── */}
      <SectionCard title="Account">
        <SettingsRow icon="👤" label="Personal Info" subtitle="Name, phone, email" />
        <SettingsRow icon="🏦" label="Linked Accounts" subtitle="Bank & mobile money" />
        <SettingsRow icon="💳" label="Payment Methods" subtitle="Cards and wallets" />
        <SettingsRow
          icon="💾"
          label="Auto-save"
          subtitle="Round-up savings on every spend"
          toggle
          checked={autoSave}
          onToggle={setAutoSave}
        />
      </SectionCard>

      {/* ── Security ─────────────────────────────────────── */}
      <SectionCard title="Security">
        <SettingsRow
          icon="👆"
          label="Biometric Auth"
          subtitle="Face ID / Fingerprint"
          toggle
          checked={biometrics}
          onToggle={setBiometrics}
        />
        <SettingsRow icon="🔑" label="Change PIN" />
        <SettingsRow icon="🔐" label="Recovery Phrase" subtitle="View or back up" />
        <SettingsRow icon="📱" label="Trusted Devices" />
      </SectionCard>

      {/* ── App ──────────────────────────────────────────── */}
      <SectionCard title="App">
        <SettingsRow
          icon="🔔"
          label="Notifications"
          subtitle="Push, SMS and email"
          toggle
          checked={notifications}
          onToggle={setNotifications}
        />
        <SettingsRow
          icon="🌙"
          label="Dark Mode"
          toggle
          checked={darkMode}
          onToggle={setDarkMode}
        />
        <SettingsRow
          icon="📊"
          label="Analytics"
          subtitle="Help improve Minicente"
          toggle
          checked={analytics}
          onToggle={setAnalytics}
        />
        <SettingsRow icon="🌍" label="Language" subtitle="English (UK)" />
        <SettingsRow icon="💬" label="Support" />
        <SettingsRow icon="📄" label="Legal & Privacy" />
        <SettingsRow icon="🚪" label="Sign Out" danger />
      </SectionCard>

      <p className="text-center text-xs text-ink3 mt-2">
        Minicente v0.1.0 · Built on Base, Arbitrum, Optimism
      </p>
    </div>
  );
}
