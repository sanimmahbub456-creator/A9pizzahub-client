import { requireRole } from "@/lib/session";

/** Server-side guard: only customers can open /dashboard/customer/* (changing the URL won't work) */
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("customer", "/dashboard/customer");
  return <>{children}</>;
}
