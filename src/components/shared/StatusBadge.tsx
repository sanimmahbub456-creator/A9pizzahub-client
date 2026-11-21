import { CheckCircle2, CircleDashed, Clock, PauseCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const map: Record<string, { variant: "success" | "warning" | "danger" | "muted"; icon: React.ElementType; label?: string }> = {
  pending: { variant: "warning", icon: Clock },
  approved: { variant: "success", icon: CheckCircle2 },
  accepted: { variant: "success", icon: CheckCircle2 },
  paid: { variant: "success", icon: CheckCircle2 },
  rejected: { variant: "danger", icon: XCircle },
  failed: { variant: "danger", icon: XCircle },
  cancelled: { variant: "muted", icon: CircleDashed },
  expired: { variant: "muted", icon: CircleDashed },
  inactive: { variant: "muted", icon: PauseCircle },
};

export function StatusBadge({ status }: { status: string }) {
  const s = map[status] ?? { variant: "muted" as const, icon: CircleDashed };
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} className="capitalize">
      <Icon /> {status}
    </Badge>
  );
}
