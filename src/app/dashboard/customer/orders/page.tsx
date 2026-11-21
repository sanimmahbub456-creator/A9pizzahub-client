"use client";
import { CalendarDays, Eye, MapPin, Store, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate, formatPrice } from "@/lib/utils";

export default function MyOrdersPage() {
  const { data, loading, error, reload } = useFetch<Order[]>("/api/orders/my");
  const [toCancel, setToCancel] = useState<Order | null>(null);

  const cancel = async () => {
    if (!toCancel) return;
    try {
      const r = await api<{ message: string }>(`/api/orders/${toCancel._id}/cancel`, { method: "PATCH" });
      toast.success(r.message);
    } catch (e) {
      toast.error(errorMessage(e));
    }
    reload();
  };

  return (
    <>
      <PageHeader title="My Orders" description="Track your orders. You can cancel an order while it's still pending." />
      {loading ? <PageLoader label="Loading orders…" /> : error ? (
        <EmptyState title="Couldn't load orders" description={error} action={<Button onClick={reload}>Retry</Button>} />
      ) : !data?.length ? (
        <EmptyState title="No orders yet" description="Your future pizza orders will appear here." action={<Button asChild><Link href="/menu">Browse Menu</Link></Button>} />
      ) : (
        <div className="grid gap-4">
          {data.map((o) => (
            <article key={o._id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24 sm:aspect-square">
                {o.item?.images?.[0] && <Image src={o.item.images[0]} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{o.item?.itemName ?? "Deleted item"}</h3>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-1.5 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                  <p className="flex items-center gap-1.5"><Store className="size-3.5 text-accent" /> {o.vendor?.businessName ?? o.vendor?.name}</p>
                  <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-accent" /> Delivery {formatDate(o.deliveryDate)}</p>
                  <p className="flex items-center gap-1.5 sm:col-span-2"><MapPin className="size-3.5 shrink-0 text-accent" /> <span className="truncate">{o.deliveryAddress}</span></p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Requested {formatDate(o.createdAt, true)}{o.item ? ` · ${formatPrice(o.item.price)}` : ""}</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <Button asChild size="sm" variant="outline"><Link href={`/dashboard/customer/orders/${o._id}`}><Eye /> Details</Link></Button>
                {o.status === "pending" && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToCancel(o)}><XCircle /> Cancel</Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!toCancel} onOpenChange={(o) => !o && setToCancel(null)} title="Cancel this order?"
        description="The restaurant will be notified. This can't be undone." confirmLabel="Cancel order" variant="destructive" onConfirm={cancel} />
    </>
  );
}
