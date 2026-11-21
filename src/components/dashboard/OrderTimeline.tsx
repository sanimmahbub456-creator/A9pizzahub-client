import { CheckCircle2, CircleDashed, Clock, XCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const meta = {
  pending: { label: "Order placed", desc: "Waiting for the restaurant to confirm", icon: Clock, color: "bg-warning text-white" },
  accepted: { label: "Accepted", desc: "The restaurant confirmed your order", icon: CheckCircle2, color: "bg-success text-white" },
  rejected: { label: "Rejected", desc: "The restaurant couldn't take this order", icon: XCircle, color: "bg-destructive text-white" },
  cancelled: { label: "Cancelled", desc: "This order was cancelled", icon: CircleDashed, color: "bg-muted-foreground text-white" },
};

/** Order status timeline (optional feature) */
export function OrderTimeline({ order }: { order: Order }) {
  const steps = [...order.statusHistory];
  const upcoming = order.status === "pending" ? [{ status: "accepted" as const, at: null as string | null }] : [];
  return (
    <ol className="relative space-y-6 border-l-2 border-dashed border-border pl-8">
      {steps.map((s, i) => {
        const m = meta[s.status];
        const Icon = m.icon;
        return (
          <li key={i} className="relative">
            <span className={cn("absolute top-0 -left-[45px] grid size-8 place-items-center rounded-full ring-4 ring-card", m.color)}><Icon className="size-4" /></span>
            <p className="font-semibold">{m.label}</p>
            <p className="text-sm text-muted-foreground">{m.desc}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(s.at, true)}</p>
          </li>
        );
      })}
      {upcoming.map((s) => (
        <li key={s.status} className="relative opacity-50">
          <span className="absolute top-0 -left-[45px] grid size-8 place-items-center rounded-full bg-muted ring-4 ring-card"><CheckCircle2 className="size-4" /></span>
          <p className="font-semibold">Restaurant confirms</p>
          <p className="text-sm text-muted-foreground">Next step</p>
        </li>
      ))}
    </ol>
  );
}
