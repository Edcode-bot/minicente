import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { getSmsProvider } from "@/lib/otp/index";

// Required SQL (run in Supabase SQL editor before using this route):
//
// CREATE TABLE IF NOT EXISTS otp_codes (
//   id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   phone      text NOT NULL,
//   code       text NOT NULL,          -- stores SHA-256 hash of the actual code
//   expires_at timestamptz NOT NULL,
//   consumed   bool NOT NULL DEFAULT false
// );
// CREATE INDEX ON otp_codes (phone, consumed);
//
// -- Allow anon access (this table holds only hashes, never plaintext codes):
// ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "otp_anon_all" ON otp_codes FOR ALL TO anon USING (true) WITH CHECK (true);

function hashCode(code: string, phone: string): string {
  return createHash("sha256").update(`${code}:${phone}`).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const digits = String(body.phone ?? "").replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 12) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  // 5-digit code (10000–99999)
  const code = String(randomInt(10000, 100000));
  const codeHash = hashCode(code, digits);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Remove any existing unconsumed codes for this phone, then insert fresh one
  await supabase.from("otp_codes").delete().eq("phone", digits).eq("consumed", false);

  const { error: insertError } = await supabase.from("otp_codes").insert({
    phone: digits,
    code: codeHash,
    expires_at: expiresAt,
    consumed: false,
  });

  if (insertError) {
    console.error("[OTP request] insert error:", insertError.message);
    return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
  }

  try {
    await getSmsProvider().sendOtp(digits, code);
  } catch (err) {
    console.error("[OTP request] SMS provider error:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }

  const simMode = (process.env.OTP_MODE ?? "sim") === "sim";
  return NextResponse.json({
    ok: true,
    // Only expose the code in sim mode — never in production
    ...(simMode ? { devCode: code } : {}),
  });
}
