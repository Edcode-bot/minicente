import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/otp/verify
// Checks the submitted 5-digit code against the otp_codes table, then establishes
// a Supabase session via admin generateLink → verifyOtp exchange (no email sent).
// The email bridge uses mc-<digits>@minicente.dev; admin API bypasses domain validation.

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
  const anon = anonClient();

  // Look up a valid, unconsumed, unexpired OTP record
  const { data: record, error: lookupError } = await anon
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

  // Mark consumed (best-effort)
  await anon.from("otp_codes").update({ consumed: true }).eq("id", record.id);

  // ── Establish Supabase identity via admin magic-link exchange ─────────────
  // admin.generateLink creates the user if new, or issues a fresh token if existing.
  // hashed_token is exchanged immediately via verifyOtp — no email is ever sent.
  // Identity: mc-<digits>@minicente.dev (admin API is permissive about email domains)
  const email = `mc-${digits}@minicente.dev`;
  const admin = createAdminClient();

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: { phone: `+256${digits}` } },
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("[OTP verify] generateLink error:", linkError?.message);

    // Fallback: email+password bridge if generateLink failed
    const password = `MC-${digits}-auth`;
    const { data: createData, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone: `+256${digits}` },
      });

    let userId = createData?.user?.id;

    if (createError && !createError.message.toLowerCase().includes("already")) {
      console.error("[OTP verify] createUser fallback error:", createError.message);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    if (!userId) {
      // User already existed — find them and reset password
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users?.find((u) => u.email === email);
      if (!existing) {
        return NextResponse.json({ error: "Auth failed" }, { status: 500 });
      }
      userId = existing.id;
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    }

    const { data: si, error: siError } = await anon.auth.signInWithPassword({ email, password });
    if (siError || !si.session) {
      console.error("[OTP verify] fallback signIn error:", siError?.message);
      return NextResponse.json({ error: siError?.message ?? "Auth failed" }, { status: 500 });
    }

    console.log(`[OTP verify] identity=email-pw-fallback user=${si.session.user.id}`);
    return NextResponse.json({
      ok: true,
      accessToken: si.session.access_token,
      refreshToken: si.session.refresh_token,
      identity: "email-pw-fallback",
    });
  }

  // Exchange hashed_token for a live session (no redirect, no email sent)
  const { data: verifyData, error: verifyError } = await anon.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });

  if (verifyError || !verifyData.session) {
    console.error("[OTP verify] verifyOtp error:", verifyError?.message);
    return NextResponse.json(
      { error: verifyError?.message ?? "Session creation failed" },
      { status: 500 }
    );
  }

  console.log(
    `[OTP verify] identity=email-bridge-minicente.dev user=${verifyData.session.user.id}`
  );

  return NextResponse.json({
    ok: true,
    accessToken: verifyData.session.access_token,
    refreshToken: verifyData.session.refresh_token,
    identity: "email-bridge-minicente.dev",
  });
}
