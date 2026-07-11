import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

// TODO (P15): switch to Supabase native phone auth (supabase.auth.signInWithOtp)
// when the Africa's Talking SMS integration goes live. For now we keep the
// deterministic email bridge (mc-<digits>@example.com / MC-<digits>-dev) as the
// actual Supabase identity — the user-facing flow is purely phone + code.

function hashCode(code: string, phone: string): string {
  return createHash("sha256").update(`${code}:${phone}`).digest("hex");
}

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const digits = String(body.phone ?? "").replace(/\D/g, "");
  const code = String(body.code ?? "").trim();

  if (!digits || !code || code.length !== 5) {
    return NextResponse.json({ error: "phone and 5-digit code required" }, { status: 400 });
  }

  const codeHash = hashCode(code, digits);
  const now = new Date().toISOString();
  const supabase = anonClient();

  // Look up a valid, unconsumed, unexpired record
  const { data: record, error: lookupError } = await supabase
    .from("otp_codes")
    .select("id")
    .eq("phone", digits)
    .eq("code", codeHash)
    .eq("consumed", false)
    .gt("expires_at", now)
    .maybeSingle();

  if (lookupError) {
    console.error("[OTP verify] lookup error:", lookupError.message);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  // Mark consumed (best-effort — already checked uniqueness above)
  await supabase.from("otp_codes").update({ consumed: true }).eq("id", record.id);

  // Establish Supabase identity via email bridge
  const email = `mc-${digits}@example.com`;
  const password = `MC-${digits}-dev`;

  // Try sign-in (returning user)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData.session) {
    return NextResponse.json({
      ok: true,
      accessToken: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token,
    });
  }

  // New user — sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { phone: `+256${digits}`, full_name: "Friend" } },
  });

  if (signUpError && !signUpError.message.toLowerCase().includes("already")) {
    console.error("[OTP verify] signUp error:", signUpError.message);
    return NextResponse.json({ error: signUpError.message }, { status: 500 });
  }

  // If email confirmation is disabled, signUp returns a session directly
  if (signUpData?.session) {
    return NextResponse.json({
      ok: true,
      accessToken: signUpData.session.access_token,
      refreshToken: signUpData.session.refresh_token,
    });
  }

  // Otherwise sign in after signup
  const { data: si2, error: si2Error } = await supabase.auth.signInWithPassword({ email, password });
  if (si2Error || !si2.session) {
    console.error("[OTP verify] final signIn error:", si2Error?.message);
    return NextResponse.json({ error: si2Error?.message ?? "Auth failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    accessToken: si2.session.access_token,
    refreshToken: si2.session.refresh_token,
  });
}
