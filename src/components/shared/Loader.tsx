import { cn } from "@/lib/utils";

/** Spinning pizza loader */
export function PizzaSpinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 50" className={cn("size-12 animate-spin [animation-duration:1.4s]", className)} aria-hidden>
      <circle cx="25" cy="25" r="22" fill="var(--crust)" />
      <circle cx="25" cy="25" r="18" fill="#f6c85f" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line key={deg} x1="25" y1="25" x2="25" y2="3" stroke="var(--crust)" strokeWidth="1.2" transform={`rotate(${deg} 25 25)`} />
      ))}
      <circle cx="18" cy="18" r="3" fill="var(--primary)" />
      <circle cx="32" cy="20" r="3" fill="var(--primary)" />
      <circle cx="24" cy="32" r="3" fill="var(--primary)" />
      <circle cx="31" cy="31" r="1.3" fill="var(--basil)" />
    </svg>
  );
}

export function PageLoader({ label = "Firing up the oven…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex min-h-[50vh] flex-col items-center justify-center gap-4", className)}>
      <PizzaSpinner />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
