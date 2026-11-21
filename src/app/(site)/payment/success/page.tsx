import { Suspense } from "react";
import { PaymentSuccess } from "@/components/dashboard/PaymentSuccess";
import { PageLoader } from "@/components/shared/Loader";

export const metadata = { title: "Payment Success" };

export default function PaymentSuccessPage() {
  return (
    <div className="container-px">
      <Suspense fallback={<PageLoader label="Processing payment…" />}>
        <PaymentSuccess />
      </Suspense>
    </div>
  );
}
