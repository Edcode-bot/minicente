import type {
  PaymentProvider,
  CollectRequest,
  DisburseRequest,
  ProviderResult,
  StatusResult,
} from "../types";

function genRef(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("").toUpperCase();
  return `MOMO-${hex}`;
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Simulate the MTN MoMo Collection API (requestToPay → poll getTransactionStatus)
async function simulate(reference: string): Promise<ProviderResult> {
  const providerRef = genRef();
  // Realistic latency: 2–3 s for the USSD push + bank auth
  await wait(2200 + Math.random() * 800);
  const ok = Math.random() >= 0.1; // ~10% failure rate
  return {
    ok,
    providerRef,
    status: ok ? "success" : "failed",
    reason: ok ? undefined : "PAYER_NOT_FOUND",
  };
}

export const momoSim: PaymentProvider = {
  /** MTN MoMo: POST /collection/v1_0/requesttopay */
  async collect(req: CollectRequest): Promise<ProviderResult> {
    return simulate(req.reference);
  },

  /** MTN MoMo: POST /disbursement/v1_0/transfer */
  async disburse(req: DisburseRequest): Promise<ProviderResult> {
    return simulate(req.reference);
  },

  /** MTN MoMo: GET /collection/v1_0/requesttopay/{referenceId} */
  async status(providerRef: string): Promise<StatusResult> {
    // Sim always returns success for a known ref; real impl would query the API
    return { providerRef, status: "success" };
  },
};
