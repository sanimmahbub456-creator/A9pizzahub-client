import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast, cookie-based gate for private pages (runs before render, so reloading a private
 * route never flashes the sign-in page for a logged-in user). Full session + role checks
 * happen in the server layouts, and again on every Express API call.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = !!getSessionCookie(request);

  if (!hasSession) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/menu/:id+", "/profile", "/payment/:path*", "/onboarding"],
};
