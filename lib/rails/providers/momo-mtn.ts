import type {
  PaymentProvider,
  CollectRequest,
  DisburseRequest,
  ProviderResult,
  StatusResult,
} from "../types";

// Live MTN MoMo stub — throws until real credentials are configured.
// Wire up by setting RAILS_MODE=live, RAILS_PROVIDER=mtn and providing:
//   MTN_SUBSCRIPTION_KEY, MTN_API_USER, MTN_API_KEY, MTN_TARGET_ENV
export const momoMtn: PaymentProvider = {
  async collect(_req: CollectRequest): Promise<ProviderResult> {
    throw new Error("MTN MoMo live provider not configured");
  },
  async disburse(_req: DisburseRequest): Promise<ProviderResult> {
    throw new Error("MTN MoMo live provider not configured");
  },
  async status(_providerRef: string): Promise<StatusResult> {
    throw new Error("MTN MoMo live provider not configured");
  },
};
