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
  try {
    return await auth.api.getSession({ headers: h });
  } catch (first) {
    unstable_rethrow(first);
    console.error("[session] first attempt failed:", first);
    await new Promise((r) => setTimeout(r, 400));
    return auth.api.getSession({ headers: h });
  }
}

/** Like getServerSession, but returns the error instead of crashing the page */
export async function getServerSessionSafe() {
  try {
    return { session: await getServerSession(), error: null as string | null };
  } catch (e) {
    unstable_rethrow(e); // let Next.js handle its own internal signals (dynamic rendering, redirects)
    console.error("[session] failed:", e);
    return { session: null, error: e instanceof Error ? e.message : String(e) };
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
