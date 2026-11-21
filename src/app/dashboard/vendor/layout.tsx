import { requireRole } from "@/lib/session";

/** Server-side guard: only vendors can open /dashboard/vendor/* (changing the URL won't work) */
export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("vendor", "/dashboard/vendor");
  return <>{children}</>;
}
