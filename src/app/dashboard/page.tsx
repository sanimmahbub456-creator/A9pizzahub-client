import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

/** /dashboard -> the dashboard for the user's role (used after login) */
export default async function DashboardIndex({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await getServerSession();
  if (!session) redirect("/signin");
  const { denied } = await searchParams;
  const role = (session.user as { role?: string }).role ?? "customer";
  redirect(`/dashboard/${role}${denied ? "?denied=1" : ""}`);
}
