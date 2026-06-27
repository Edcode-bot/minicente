"use client";

import { useState } from "react";
import { USER } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-inv-lime" : "bg-inv-bg3 border border-inv-line2"
      }`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
        checked ? "translate-x-4 bg-inv-bg" : "translate-x-0 bg-inv-ink3"
      }`} />
    </button>
  );
}

function SettingsRow({ label, subtitle, icon, toggle, checked, onToggle, danger }: {
  label: string; subtitle?: string; icon: string;
  toggle?: boolean; checked?: boolean; onToggle?: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-inv-card2 transition-colors">
      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-inv-red" : "text-inv-ink"}`}>{label}</p>
        {subtitle && <p className="text-xs text-inv-ink3 mt-0.5">{subtitle}</p>}
      </div>
      {toggle && checked !== undefined && onToggle
        ? <Toggle checked={checked} onChange={onToggle} />
        : <span className="text-inv-ink3">›</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] text-inv-ink3 font-semibold uppercase tracking-widest px-4 mb-2">{title}</p>
      <div className="bg-inv-card rounded-xl2 border border-inv-line divide-y divide-inv-line overflow-hidden">{children}</div>
    </div>
  );
}

export default function InvestorSettingsPage() {
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [autoSave, setAutoSave] = useState(false);

  const KYC_TIERS: Array<{ tier: 1 | 2 | 3; done: boolean }> = [
    { tier: 1, done: USER.kyc.tier >= 1 },
    { tier: 2, done: USER.kyc.tier >= 2 },
    { tier: 3, done: USER.kyc.tier >= 3 },
  ];

  return (
    <div className="pb-6">
      <PageHeader title="Settings" />

      <div className="mx-4 mb-5 bg-inv-card rounded-xl3 border border-inv-line p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl2 bg-inv-lime flex items-center justify-center flex-shrink-0">
            <span className="font-display font-black text-inv-bg text-xl">{USER.initials}</span>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-inv-ink">{USER.name}</p>
            <p className="text-sm text-inv-ink3 mt-0.5">{USER.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {KYC_TIERS.map((t) => (
            <div key={t.tier} className={`flex-1 text-center py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              t.done ? "bg-inv-lime/10 text-inv-lime border-inv-lime/20" : "bg-inv-bg3 text-inv-ink3 border-inv-line"
            }`}>
              Tier {t.tier}{t.done && " ✓"}
            </div>
          ))}
        </div>
        {USER.kyc.tier < 3 && (
          <button className="mt-3 w-full text-xs font-bold py-2.5 rounded-xl bg-inv-amber/10 text-inv-amber border border-inv-amber/20 hover:bg-inv-amber/20 transition-colors">
            Complete KYC Tier {USER.kyc.tier + 1} →
          </button>
        )}
      </div>

      <Section title="Account">
        <SettingsRow icon="👤" label="Personal Info" subtitle="Name, phone, email" />
        <SettingsRow icon="🏦" label="Linked Accounts" subtitle="Bank & mobile money" />
        <SettingsRow icon="💳" label="Payment Methods" subtitle="Cards and wallets" />
        <SettingsRow icon="💾" label="Auto-save" subtitle="Round-up savings on every spend" toggle checked={autoSave} onToggle={setAutoSave} />
      </Section>
      <Section title="Security">
        <SettingsRow icon="👆" label="Biometric Auth" subtitle="Face ID / Fingerprint" toggle checked={biometrics} onToggle={setBiometrics} />
        <SettingsRow icon="🔑" label="Change PIN" />
        <SettingsRow icon="🔐" label="Recovery Phrase" subtitle="View or back up" />
        <SettingsRow icon="📱" label="Trusted Devices" />
      </Section>
      <Section title="App">
        <SettingsRow icon="🔔" label="Notifications" subtitle="Push, SMS and email" toggle checked={notifications} onToggle={setNotifications} />
        <SettingsRow icon="🌙" label="Dark Mode" toggle checked={darkMode} onToggle={setDarkMode} />
        <SettingsRow icon="📊" label="Analytics" subtitle="Help improve Minicente" toggle checked={analytics} onToggle={setAnalytics} />
        <SettingsRow icon="🌍" label="Language" subtitle="English (UK)" />
        <SettingsRow icon="💬" label="Support" />
        <SettingsRow icon="📄" label="Legal & Privacy" />
        <SettingsRow icon="🚪" label="Sign Out" danger />
      </Section>

      <p className="text-center text-xs text-inv-ink3 mt-2">
        Minicente Investor Demo · v0.1.0
      </p>
    </div>
  );
}
