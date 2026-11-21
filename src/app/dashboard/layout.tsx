import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getServerSession } from "@/lib/session";
import type { Role } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
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
