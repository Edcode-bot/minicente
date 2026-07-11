import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

// POST /api/otp/verify
//
// Lookup order:
//   1. Check otp_codes via anon client (no service role needed)
//   2. Auth bridge: anon signUp / signIn with mc-<digits>@minicente.dev
//      — @minicente.dev is not a reserved domain; works without service role key
//      — Falls back to admin generateLink if SUPABASE_SERVICE_ROLE_KEY is present
//   3. Mark code consumed ONLY after auth succeeds (prevents burning the OTP on auth errors)
//
// Diagnostic: set NEXT_PUBLIC_OTP_DEBUG=true in .env.local to print hash comparisons.

const DEBUG = process.env.NEXT_PUBLIC_OTP_DEBUG === "true";

function hashCode(code: string, phone: string): string {
  return createHash("sha256").update(`${code}:${phone}`).digest("hex");
}

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const digits = String(body.phone ?? "").replace(/\D/g, "");
  const codeInput = String(body.code ?? "").trim();

  if (!digits || !codeInput || codeInput.length !== 5) {
    return NextResponse.json({ error: "phone and 5-digit code required" }, { status: 400 });
  }

  const submittedHash = hashCode(codeInput, digits);
  const now = new Date().toISOString();
  const anon = anonClient();

  if (DEBUG) {
    console.log(`[OTP verify] phone=${digits} code=${codeInput} hash=${submittedHash}`);
  }

  // ── 1. Look up the OTP record ────────────────────────────────────────────
  // Fetch the stored hash for this phone so we can compare and log differences.
  const { data: record, error: lookupError } = await anon
    .from("otp_codes")
    .select("id, code")
    .eq("phone", digits)
    .eq("consumed", false)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("[OTP verify] DB lookup error:", lookupError.message, lookupError.code);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }

  if (!record) {
    console.warn(`[OTP verify] No valid record for phone=${digits} (expired or consumed)`);
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  // Hash comparison with diagnostic logging
  const storedHash = record.code as string;
  if (storedHash !== submittedHash) {
    console.warn(
      `[OTP verify] Hash mismatch for phone=${digits}`,
      DEBUG ? `stored=${storedHash} submitted=${submittedHash}` : "(set NEXT_PUBLIC_OTP_DEBUG=true to see hashes)"
    );
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  // ── 2. Auth bridge — establish Supabase identity ─────────────────────────
  // Try admin generateLink first (best: no password needed).
  // Fall back to anon signUp/signIn (works without service role key).
  const email = `mc-${digits}@minicente.dev`;
  const password = `MC-${digits}-auth`;

  const admin = adminClient();
  if (!admin) {
    console.warn(
      "[OTP verify] SUPABASE_SERVICE_ROLE_KEY not set — using anon email bridge. " +
        "Set the key to enable admin generateLink (recommended for production)."
    );
  }

  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let identityMethod = "";

  // Path A: admin generateLink → verifyOtp (preferred; no email confirmation needed)
  if (admin) {
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { data: { phone: `+256${digits}` } },
      });

    if (!linkError && linkData?.properties?.hashed_token) {
      const { data: vd, error: ve } = await anon.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: "magiclink",
      });
      if (!ve && vd.session) {
        accessToken = vd.session.access_token;
        refreshToken = vd.session.refresh_token;
        identityMethod = "admin-generateLink";
      } else {
        console.error("[OTP verify] verifyOtp error:", ve?.message);
      }
    } else {
      console.error("[OTP verify] generateLink error:", linkError?.message);
    }
  }

  // Path B: anon signUp / signIn with @minicente.dev (works without service role key)
  // @minicente.dev is not a reserved domain and is not blocked by Supabase.
  // Email confirmation must be disabled in the Supabase dashboard (Auth → Settings).
  if (!accessToken) {
    const { data: signUpData, error: signUpError } = await anon.auth.signUp({
      email,
      password,
      options: { data: { phone: `+256${digits}` } },
    });

    if (signUpError) {
      if (!signUpError.message.toLowerCase().includes("already registered")) {
        console.error("[OTP verify] signUp error:", signUpError.message);
        return NextResponse.json({ error: signUpError.message }, { status: 500 });
      }
      // Existing user — sign in with password
    } else if (signUpData.session) {
      accessToken = signUpData.session.access_token;
      refreshToken = signUpData.session.refresh_token;
      identityMethod = "anon-signUp";
    }

    // Sign in (for existing users, or if signUp returned no session)
    if (!accessToken) {
      const { data: siData, error: siError } = await anon.auth.signInWithPassword({
        email,
        password,
      });
      if (siError || !siData.session) {
        // Existing user with stale password — update via admin if available, else fail
        if (admin) {
          const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const existing = listData?.users?.find((u) => u.email === email);
          if (existing) {
            await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
            const { data: si2, error: si2Error } = await anon.auth.signInWithPassword({ email, password });
            if (!si2Error && si2.session) {
              accessToken = si2.session.access_token;
              refreshToken = si2.session.refresh_token;
              identityMethod = "anon-signIn-pw-reset";
            } else {
              console.error("[OTP verify] signIn after pw-reset error:", si2Error?.message);
            }
          }
        }
        if (!accessToken) {
          console.error("[OTP verify] signIn error:", siError?.message);
          return NextResponse.json(
            { error: siError?.message ?? "Auth failed" },
            { status: 500 }
          );
        }
      } else {
        accessToken = siData.session.access_token;
        refreshToken = siData.session.refresh_token;
        identityMethod = "anon-signIn";
      }
    }
  }

  // ── 3. Mark consumed AFTER successful auth ───────────────────────────────
  // Doing this last means a failed auth attempt doesn't burn the code.
  await anon.from("otp_codes").update({ consumed: true }).eq("id", record.id);

  console.log(`[OTP verify] SUCCESS phone=${digits} identity=${identityMethod}`);

  return NextResponse.json({
    ok: true,
    accessToken,
    refreshToken,
    identity: identityMethod,
  });
}
