import { Suspense } from "react";
import { AdminItems } from "@/components/dashboard/AdminItems";
import { PageLoader } from "@/components/shared/Loader";

export default function ManageItemsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminItems />
    </Suspense>
  );
}
