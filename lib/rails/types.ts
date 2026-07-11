// Provider interfaces — swap sim ↔ live by changing the factory return value.
// All amounts are in minor units (whole UGX — no subdivision).

export interface CollectRequest {
  amountMinor: number;
  currency: "UGX";
  phoneNumber: string; // local digits only, e.g. "256772000000"
  reference: string;   // our internal MC-XXXXXX reference
  payerMessage: string;
  payeeNote: string;
}

export interface DisburseRequest {
  amountMinor: number;
  currency: "UGX";
  phoneNumber: string;
  reference: string;
  payerMessage: string;
  payeeNote: string;
}

export interface ProviderResult {
  ok: boolean;
  providerRef: string;   // e.g. MOMO-AB12CD34 or BILL-AB12CD34
  status: "pending" | "success" | "failed";
  reason?: string;
}

export interface StatusResult {
  providerRef: string;
  status: "pending" | "success" | "failed";
  reason?: string;
}

// MTN MoMo Collection (cash-in) and Disbursement (send / cash-out)
export interface PaymentProvider {
  /** MTN: requestToPay / Airtel: ussdpush */
  collect(req: CollectRequest): Promise<ProviderResult>;
  /** MTN: transfer / Airtel: transaction */
  disburse(req: DisburseRequest): Promise<ProviderResult>;
  /** MTN: getTransactionStatus / Airtel: getTransactionEnquiry */
  status(providerRef: string): Promise<StatusResult>;
}

// Biller — YAKA (UMEME), NWSC water, Airtime
export type BillerCode = "YAKA" | "NWSC" | "AIRTIME";

export interface ValidateRequest {
  billerCode: BillerCode;
  accountNumber: string; // meter / account / phone
}

export interface ValidateResult {
  ok: boolean;
  customerName?: string;
  accountNumber?: string;
  reason?: string;
}

export interface BillPayRequest {
  billerCode: BillerCode;
  accountNumber: string;
  amountMinor: number;
  currency: "UGX";
  reference: string;
}

export interface BillerProvider {
  /** Validate meter / account — returns customer name for confirm screen */
  validate(req: ValidateRequest): Promise<ValidateResult>;
  /** Execute the bill payment */
  pay(req: BillPayRequest): Promise<ProviderResult>;
}
