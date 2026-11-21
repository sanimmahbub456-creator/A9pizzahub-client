import Link from "next/link";
import { cn } from "@/lib/utils";

/** PizzaHub wordmark - same size & style everywhere (navbar, footer, dashboard) */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)} aria-label="PizzaHub home">
      <svg viewBox="0 0 40 40" className="size-9 shrink-0 transition-transform duration-500 group-hover:rotate-[20deg]" aria-hidden>
        <path d="M20 3 L37 33 Q20 40 3 33 Z" fill="var(--crust)" />
        <path d="M20 8 L33.5 31 Q20 36.5 6.5 31 Z" fill="#f6c85f" />
        <circle cx="19" cy="19" r="3" fill="var(--primary)" />
        <circle cx="14" cy="27" r="2.6" fill="var(--primary)" />
        <circle cx="25" cy="28" r="2.6" fill="var(--primary)" />
        <circle cx="22.5" cy="22" r="1.2" fill="var(--basil)" />
        <circle cx="16" cy="22.5" r="1.1" fill="var(--basil)" />
      </svg>
      <span className={cn("font-display text-2xl font-bold tracking-tight", light ? "text-sidebar-foreground" : "text-foreground")}>
        Pizza<span className="text-primary">Hub</span>
      </span>
    </Link>
  );
}
