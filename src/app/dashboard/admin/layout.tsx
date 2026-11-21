import { requireRole } from "@/lib/session";

/** Server-side guard: only admins can open /dashboard/admin/* (changing the URL won't work) */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin", "/dashboard/admin");
  return <>{children}</>;
}
