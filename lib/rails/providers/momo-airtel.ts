import type {
  PaymentProvider,
  CollectRequest,
  DisburseRequest,
  ProviderResult,
  StatusResult,
} from "../types";

// Live Airtel Money stub — throws until real credentials are configured.
// Wire up by setting RAILS_MODE=live, RAILS_PROVIDER=airtel and providing:
//   AIRTEL_CLIENT_ID, AIRTEL_CLIENT_SECRET
export const momoAirtel: PaymentProvider = {
  async collect(_req: CollectRequest): Promise<ProviderResult> {
    throw new Error("Airtel Money live provider not configured");
  },
  async disburse(_req: DisburseRequest): Promise<ProviderResult> {
    throw new Error("Airtel Money live provider not configured");
  },
  async status(_providerRef: string): Promise<StatusResult> {
    throw new Error("Airtel Money live provider not configured");
  },
};
