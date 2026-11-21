"use client";
import { CalendarDays, Check, MapPin, MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { cn, formatDate, formatPrice, initials } from "@/lib/utils";

const TABS = ["all", "pending", "accepted", "rejected", "cancelled"] as const;

export default function CustomerOrdersPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const { data, loading, error, reload } = useFetch<Order[]>(`/api/vendor/orders${tab === "all" ? "" : `?status=${tab}`}`);
  const [action, setAction] = useState<{ order: Order; status: "accepted" | "rejected" } | null>(null);

  const decide = async () => {
    if (!action) return;
    try {
      const r = await api<{ message: string }>(`/api/vendor/orders/${action.order._id}`, { method: "PATCH", body: { status: action.status } });
      toast.success(r.message);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
      reload();
    }
  };

  return (
    <>
      <PageHeader title="Customer Orders" description="Accept or reject incoming orders. Each order can be decided only once." />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="capitalize">{t}</Button>
        ))}
      </div>
      {loading ? <PageLoader label="Loading orders…" /> : error ? (
        <EmptyState title="Couldn't load orders" description={error} action={<Button onClick={reload}>Retry</Button>} />
      ) : !data?.length ? (
        <EmptyState title="No orders here" description="When customers order your items, they'll show up here." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.map((o) => (
            <article key={o._id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {o.item?.images?.[0] && <Image src={o.item.images[0]} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-lg font-semibold">{o.item?.itemName ?? "Deleted item"}</h3>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{o.item ? formatPrice(o.item.price) : ""} · requested {formatDate(o.createdAt)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                <Avatar><AvatarImage src={o.customer?.image ?? undefined} /><AvatarFallback>{initials(o.customer?.name)}</AvatarFallback></Avatar>
                <div className="min-w-0 text-sm"><p className="font-semibold">{o.customer?.name}</p><p className="truncate text-muted-foreground">{o.customer?.email}{o.customer?.phone ? ` · ${o.customer.phone}` : ""}</p></div>
              </div>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex gap-2"><CalendarDays className="size-4 shrink-0 text-accent" /><dt className="sr-only">Delivery date</dt><dd>Deliver on <b>{formatDate(o.deliveryDate)}</b></dd></div>
                <div className="flex gap-2"><MapPin className="size-4 shrink-0 text-accent" /><dt className="sr-only">Address</dt><dd>{o.deliveryAddress}</dd></div>
                <div className="flex gap-2"><MessageSquare className="size-4 shrink-0 text-accent" /><dt className="sr-only">Message</dt><dd className={cn(!o.message && "text-muted-foreground italic")}>{o.message || "No special instructions"}</dd></div>
              </dl>
              {o.status === "pending" && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button variant="success" onClick={() => setAction({ order: o, status: "accepted" })}><Check /> Accept</Button>
                  <Button variant="outline" className="hover:border-destructive hover:text-destructive" onClick={() => setAction({ order: o, status: "rejected" })}><X /> Reject</Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!action} onOpenChange={(o) => !o && setAction(null)}
        title={action?.status === "accepted" ? "Accept this order?" : "Reject this order?"}
        description="This decision is final and the customer will see it immediately."
        confirmLabel={action?.status === "accepted" ? "Accept order" : "Reject order"}
        variant={action?.status === "accepted" ? "success" : "destructive"} onConfirm={decide} />
    </>
  );
}
