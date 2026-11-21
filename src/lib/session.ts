import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./types";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Server-side guard for dashboard layouts: unauthenticated -> sign in, wrong role -> their own dashboard */
export async function requireRole(role: Role, from: string) {
  const session = await getServerSession();
  if (!session) redirect(`/signin?redirect=${encodeURIComponent(from)}`);
  const user = session.user as typeof session.user & { role: Role; onboarded?: boolean; isBlocked?: boolean };
  if (user.isBlocked) redirect("/signin?blocked=1");
  if (user.onboarded === false) redirect("/onboarding");
  if (user.role !== role) redirect(`/dashboard?denied=${role}`);
  return session;
}
