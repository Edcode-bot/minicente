import type { PaymentProvider, BillerProvider } from "./types";
import { momoSim } from "./providers/momo-sim";
import { billerSim } from "./providers/biller-sim";
import { momoMtn } from "./providers/momo-mtn";
import { momoAirtel } from "./providers/momo-airtel";

// NEXT_PUBLIC_RAILS_MODE is available on both client and server.
// RAILS_MODE (no prefix) is available server-side only.
function railsMode(): string {
  return (
    process.env.NEXT_PUBLIC_RAILS_MODE ??
    process.env.RAILS_MODE ??
    "sim"
  );
}

function railsProvider(): string {
  return (
    process.env.NEXT_PUBLIC_RAILS_PROVIDER ??
    process.env.RAILS_PROVIDER ??
    "mtn"
  );
}

export function getPaymentProvider(): PaymentProvider {
  if (railsMode() !== "live") return momoSim;
  return railsProvider() === "airtel" ? momoAirtel : momoMtn;
}

export function getBillerProvider(): BillerProvider {
  // All bill payment goes through billerSim in sim mode.
  // In live mode, this would return a live biller client (UMEME / NWSC API).
  if (railsMode() !== "live") return billerSim;
  return billerSim; // TODO: replace with live biller when integrated
}

export type { PaymentProvider, BillerProvider } from "./types";
