import { redirect } from "next/navigation";
import { getServerSessionSafe } from "@/lib/session";

/** /dashboard -> the dashboard for the user's role (used after login) */
export default async function DashboardIndex({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { session, error } = await getServerSessionSafe();
  if (error) return null; // the layout shows the error message
  if (!session) redirect("/signin");
  const { denied } = await searchParams;
  const role = (session.user as { role?: string }).role ?? "customer";
  redirect(`/dashboard/${role}${denied ? "?denied=1" : ""}`);
}
