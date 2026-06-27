import { NextRequest, NextResponse } from "next/server";

const USER_ROUTES = new Set(["/", "/grow", "/cash", "/me", "/safety"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!USER_ROUTES.has(pathname)) return NextResponse.next();

  const onboarded = request.cookies.get("mc_onboarded")?.value === "1";
  if (!onboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/grow", "/cash", "/me", "/safety"],
};
