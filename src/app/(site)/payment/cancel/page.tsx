import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment Cancelled" };

export default function PaymentCancelPage() {
  return (
    <div className="container-px">
      <div className="mx-auto my-16 max-w-lg rounded-3xl border bg-card p-8 text-center shadow-lg">
        <XCircle className="mx-auto size-16 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold">Payment cancelled</h1>
        <p className="mt-2 text-muted-foreground">No charge was made and your plan hasn&apos;t changed. You can upgrade whenever you&apos;re ready.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild><Link href="/dashboard/vendor/subscription">Back to Subscription</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/vendor">Dashboard</Link></Button>
        </div>
      </div>
    </div>
  );
}
