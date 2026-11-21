"use client";
import { ArrowLeft, CalendarDays, MapPin, MessageSquare, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";
import { OrderTimeline } from "@/components/dashboard/OrderTimeline";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate, formatPrice } from "@/lib/utils";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: o, loading, error, reload } = useFetch<Order>(`/api/orders/${id}`);
  const [confirm, setConfirm] = useState(false);

  if (loading) return <PageLoader />;
  if (error || !o) return <EmptyState title="Order not found" description={error ?? ""} action={<Button asChild><Link href="/dashboard/customer/orders">Back to orders</Link></Button>} />;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link href="/dashboard/customer/orders"><ArrowLeft /> All orders</Link></Button>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted sm:w-48">
              {o.item?.images?.[0] && <Image src={o.item.images[0]} alt="" fill sizes="200px" className="object-cover" />}
            </div>
            <div className="flex-1">
              <StatusBadge status={o.status} />
              <h1 className="mt-2 text-2xl font-bold">{o.item?.itemName ?? "Deleted item"}</h1>
              {o.item && <p className="font-display text-xl font-bold text-primary">{formatPrice(o.item.price)}</p>}
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><Store className="size-4 text-accent" /> {o.vendor?.businessName ?? o.vendor?.name}</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 border-t pt-6 text-sm sm:grid-cols-2">
            <div><dt className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="size-4" /> Delivery date</dt><dd className="mt-1 font-semibold">{formatDate(o.deliveryDate)}</dd></div>
            <div><dt className="text-muted-foreground">Requested on</dt><dd className="mt-1 font-semibold">{formatDate(o.createdAt, true)}</dd></div>
            <div className="sm:col-span-2"><dt className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-4" /> Delivery address</dt><dd className="mt-1 font-semibold">{o.deliveryAddress}</dd></div>
            <div className="sm:col-span-2"><dt className="flex items-center gap-1.5 text-muted-foreground"><MessageSquare className="size-4" /> Special instructions</dt><dd className="mt-1">{o.message || <span className="italic text-muted-foreground">None</span>}</dd></div>
            <div><dt className="text-muted-foreground">Payment</dt><dd className="mt-1 font-semibold">Cash on Delivery</dd></div>
          </dl>
          {o.status === "pending" && <Button variant="destructive" className="mt-6" onClick={() => setConfirm(true)}>Cancel order</Button>}
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">Order timeline</h2>
          <OrderTimeline order={o} />
        </div>
      </div>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Cancel this order?" confirmLabel="Cancel order" variant="destructive"
        onConfirm={async () => {
          try {
            const r = await api<{ message: string }>(`/api/orders/${o._id}/cancel`, { method: "PATCH" });
            toast.success(r.message);
          } catch (e) {
            toast.error(errorMessage(e));
          }
          reload();
        }} />
    </>
  );
}
