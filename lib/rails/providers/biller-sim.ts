import type {
  BillerProvider,
  ValidateRequest,
  ValidateResult,
  BillPayRequest,
  ProviderResult,
} from "../types";

// Deterministic name lookup — same meter always returns the same customer name
const YAKA_NAMES = [
  "James Ssebunya", "Grace Namutebi", "Moses Kagwa", "Harriet Nakato",
  "Robert Kizito", "Juliet Namukasa", "Patrick Ssemwanga", "Prossy Nalwoga",
  "David Mugisha", "Agnes Nakayima",
];
const NWSC_NAMES = [
  "Emmanuel Ssekandi", "Fatuma Nabukenya", "Charles Wamala", "Sarah Nakigozi",
  "Joseph Byamugisha", "Irene Nabirye", "Simon Kasozi", "Lydia Nantume",
];

function pickName(names: string[], account: string): string {
  const sum = account.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return names[sum % names.length];
}

function genRef(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("").toUpperCase();
  return `BILL-${hex}`;
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const billerSim: BillerProvider = {
  async validate(req: ValidateRequest): Promise<ValidateResult> {
    await wait(800 + Math.random() * 400); // realistic biller lookup latency

    const { billerCode, accountNumber } = req;
    const trimmed = accountNumber.trim();

    if (!trimmed || trimmed.length < 4) {
      return { ok: false, reason: "Invalid account number" };
    }

    if (billerCode === "YAKA") {
      const name = pickName(YAKA_NAMES, trimmed);
      return { ok: true, customerName: name, accountNumber: trimmed };
    }

    if (billerCode === "NWSC") {
      const name = pickName(NWSC_NAMES, trimmed);
      return { ok: true, customerName: name, accountNumber: trimmed };
    }

    // AIRTIME — phone number is its own identifier
    return { ok: true, customerName: trimmed, accountNumber: trimmed };
  },

  async pay(req: BillPayRequest): Promise<ProviderResult> {
    await wait(1800 + Math.random() * 700);
    const ok = Math.random() >= 0.1;
    return {
      ok,
      providerRef: genRef(),
      status: ok ? "success" : "failed",
      reason: ok ? undefined : "BILLER_TIMEOUT",
    };
  },
};
