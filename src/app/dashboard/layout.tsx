import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SessionError } from "@/components/shared/SessionError";
import { getServerSessionSafe } from "@/lib/session";
import type { Role } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };
// always render per request (reads the session cookie)
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, error } = await getServerSessionSafe();
  if (error) return <SessionError message={error} />;
  if (!session) redirect("/signin?redirect=/dashboard");
  const u = session.user as typeof session.user & { role: Role; onboarded?: boolean; isBlocked?: boolean; subscriptionPlan?: string };
  if (u.isBlocked) redirect("/signin?blocked=1");
  if (u.onboarded === false) redirect("/onboarding");

  return (
    <DashboardShell initialUser={{ name: u.name, email: u.email, image: u.image, role: u.role, subscriptionPlan: u.subscriptionPlan }}>
      {children}
    </DashboardShell>
  );
}
