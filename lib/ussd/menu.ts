// USSD menu tree — pure logic, no I/O.
// Africa's Talking calls POST /api/ussd with:
//   sessionId, phoneNumber, networkCode, serviceCode, text
// text is the cumulative user input, each selection separated by "*".
// Return "CON <message>" to keep the session open, "END <message>" to close it.

export interface UssdInput {
  sessionId: string;
  phoneNumber: string; // e.g. +256772000000
  text: string;        // e.g. "1*01234*5000*1"
}

export interface UssdContext {
  getBalance(phoneDigits: string): Promise<number>;
  findNearestAgent(): Promise<{ shop_name: string; area: string; phone: string } | null>;
  processPayment(
    phoneDigits: string,
    kind: "yaka" | "water" | "airtime" | "send",
    counterparty: string,
    amountMinor: number
  ): Promise<{ ok: boolean; reference?: string; reason?: string }>;
}

// Menu strings — English only for now; Luganda pass coming later.
const M = {
  welcome:
    "CON Welcome to Minicente *384#\n1. Pay YAKA\n2. Send money\n3. Buy airtime\n4. Check balance\n5. Find agent",
  enterMeter: "CON Enter your YAKA meter number:",
  enterAccount: "CON Enter your NWSC account number:",
  enterPhone: "CON Enter the recipient number (07XXXXXXXX):",
  enterAirtimePhone: "CON Enter phone for airtime (07XXXXXXXX or 0 for this number):",
  enterAmount: "CON Enter amount in UGX:",
  cancelled: "END Cancelled. Dial *384# again any time.",
  invalid: "END Invalid option. Dial *384# to try again.",
  busy: "END Service busy — try again shortly. Your money is safe.",
};

function confirmMsg(label: string, counterparty: string, amount: string): string {
  return `CON Pay UGX ${amount} ${label} ${counterparty}\n1. Confirm\n2. Cancel`;
}

function sendConfirmMsg(phone: string, amount: string): string {
  return `CON Send UGX ${amount} to ${phone}\n1. Confirm\n2. Cancel`;
}

export async function handleUssd(input: UssdInput, ctx: UssdContext): Promise<string> {
  const phoneDigits = input.phoneNumber.replace(/\D/g, "").replace(/^256/, "");
  const parts = input.text.split("*").filter((p) => p !== "");

  // ── Root menu ──────────────────────────────────────────────────────────────
  if (parts.length === 0) return M.welcome;

  const top = parts[0];

  // ── 1: Pay YAKA ───────────────────────────────────────────────────────────
  if (top === "1") {
    if (parts.length === 1) return M.enterMeter;
    if (parts.length === 2) return M.enterAmount;
    if (parts.length === 3)
      return confirmMsg("to YAKA meter", parts[1], parts[2]);
    if (parts.length === 4) {
      if (parts[3] === "2") return M.cancelled;
      if (parts[3] !== "1") return M.invalid;
      const amountMinor = parseInt(parts[2], 10);
      if (!Number.isFinite(amountMinor) || amountMinor <= 0) return M.invalid;
      try {
        const result = await ctx.processPayment(phoneDigits, "yaka", parts[1], amountMinor);
        if (result.ok)
          return `END YAKA paid. UGX ${parts[2]} loaded to meter ${parts[1]}. Ref: ${result.reference ?? "—"}`;
        return `END Payment failed — ${result.reason ?? "try again"}. No money was taken.`;
      } catch {
        return M.busy;
      }
    }
  }

  // ── 2: Send money ──────────────────────────────────────────────────────────
  if (top === "2") {
    if (parts.length === 1) return M.enterPhone;
    if (parts.length === 2) return M.enterAmount;
    if (parts.length === 3)
      return sendConfirmMsg(parts[1], parts[2]);
    if (parts.length === 4) {
      if (parts[3] === "2") return M.cancelled;
      if (parts[3] !== "1") return M.invalid;
      const amountMinor = parseInt(parts[2], 10);
      if (!Number.isFinite(amountMinor) || amountMinor <= 0) return M.invalid;
      try {
        const result = await ctx.processPayment(phoneDigits, "send", parts[1], amountMinor);
        if (result.ok)
          return `END Sent UGX ${parts[2]} to ${parts[1]}. Ref: ${result.reference ?? "—"}`;
        return `END Transfer failed — ${result.reason ?? "try again"}. No money was taken.`;
      } catch {
        return M.busy;
      }
    }
  }

  // ── 3: Buy airtime ────────────────────────────────────────────────────────
  if (top === "3") {
    if (parts.length === 1) return M.enterAirtimePhone;
    if (parts.length === 2) return M.enterAmount;
    if (parts.length === 3) {
      const target = parts[1] === "0" ? phoneDigits : parts[1];
      return confirmMsg("airtime for", target, parts[2]);
    }
    if (parts.length === 4) {
      if (parts[3] === "2") return M.cancelled;
      if (parts[3] !== "1") return M.invalid;
      const target = parts[1] === "0" ? phoneDigits : parts[1];
      const amountMinor = parseInt(parts[2], 10);
      if (!Number.isFinite(amountMinor) || amountMinor <= 0) return M.invalid;
      try {
        const result = await ctx.processPayment(phoneDigits, "airtime", target, amountMinor);
        if (result.ok)
          return `END UGX ${parts[2]} airtime sent to ${target}. Ref: ${result.reference ?? "—"}`;
        return `END Airtime failed — ${result.reason ?? "try again"}. No money was taken.`;
      } catch {
        return M.busy;
      }
    }
  }

  // ── 4: Check balance ──────────────────────────────────────────────────────
  if (top === "4") {
    try {
      const balanceMinor = await ctx.getBalance(phoneDigits);
      const formatted = balanceMinor.toLocaleString("en-UG");
      return `END Your Minicente balance: UGX ${formatted}\n\nDial *384# any time.`;
    } catch {
      return M.busy;
    }
  }

  // ── 5: Find agent ─────────────────────────────────────────────────────────
  if (top === "5") {
    try {
      const agent = await ctx.findNearestAgent();
      if (!agent)
        return "END No agents available right now. Try again soon.";
      return `END Nearest agent:\n${agent.shop_name}, ${agent.area}\nCall: ${agent.phone}`;
    } catch {
      return M.busy;
    }
  }

  return M.invalid;
}
