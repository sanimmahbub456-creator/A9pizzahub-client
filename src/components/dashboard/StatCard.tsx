import { cn } from "@/lib/utils";

const tones = {
  red: "bg-primary/10 text-primary",
  orange: "bg-accent/15 text-accent",
  green: "bg-success/15 text-success",
  amber: "bg-warning/15 text-warning",
  brown: "bg-secondary text-secondary-foreground",
};

export function StatCard({ label, value, icon: Icon, tone = "red", hint }: { label: string; value: React.ReactNode; icon: React.ElementType; tone?: keyof typeof tones; hint?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl", tones[tone])}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold capitalize">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function StatGridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => <div key={i} className="h-[92px] animate-pulse rounded-2xl bg-muted" />)}
    </div>
  );
}
