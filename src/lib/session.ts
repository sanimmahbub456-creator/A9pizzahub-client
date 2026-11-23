import "server-only";
import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./types";

/**
 * Reads the Better Auth session on the server.
 * Retries once, because serverless functions sometimes hit a brief database hiccup on a cold start.
 */
export async function getServerSession() {
  const h = await headers();
  // disableRefresh: a Server Component cannot set cookies, so refreshing the session here would only
  // do an extra DB write that can fail. The browser's own get-session call (a route handler) refreshes it.
  const read = () => auth.api.getSession({ headers: h, query: { disableRefresh: true } });
  try {
    return await read();
  } catch (first) {
    unstable_rethrow(first);
    console.error("[session] first attempt failed:", describeError(first), first);
    await new Promise((r) => setTimeout(r, 400));
    return read();
  }
}

/** Better Auth wraps the real problem in error.cause: walk the chain so the actual reason is visible */
export function describeError(e: unknown): string {
  const parts: string[] = [];
  let cur: unknown = e;
  for (let i = 0; cur && i < 4; i++) {
    const err = cur as { name?: string; message?: string; code?: string | number; cause?: unknown; body?: { cause?: unknown } };
    const msg = err.message ?? String(cur);
    const label = err.name && err.name !== "Error" && err.name !== "APIError" ? `${err.name}: ${msg}` : msg;
    if (label && !parts.includes(label)) parts.push(label);
    cur = err.cause ?? err.body?.cause;
  }
  return parts.join(" → ") || "Unknown error";
}

/** Like getServerSession, but returns the error instead of crashing the page */
export async function getServerSessionSafe() {
  try {
    return { session: await getServerSession(), error: null as string | null };
  } catch (e) {
    unstable_rethrow(e); // let Next.js handle its own internal signals (dynamic rendering, redirects)
    const detail = describeError(e);
    console.error("[session] failed:", detail, e);
    return { session: null, error: detail };
  }
}

/** Server-side guard for dashboard layouts: unauthenticated -> sign in, wrong role -> their own dashboard */
export async function requireRole(role: Role, from: string) {
  const { session, error } = await getServerSessionSafe();
  if (error) return; // the dashboard layout already shows a friendly error for this case
  if (!session) redirect(`/signin?redirect=${encodeURIComponent(from)}`);
  const user = session.user as typeof session.user & { role: Role; onboarded?: boolean; isBlocked?: boolean };
  if (user.isBlocked) redirect("/signin?blocked=1");
  if (user.onboarded === false) redirect("/onboarding");
  if (user.role !== role) redirect(`/dashboard?denied=${role}`);
  return session;
}
