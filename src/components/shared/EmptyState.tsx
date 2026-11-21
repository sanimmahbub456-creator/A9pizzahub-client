import { PizzaIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = PizzaIcon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card/50 px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-secondary">
        <Icon className="size-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
