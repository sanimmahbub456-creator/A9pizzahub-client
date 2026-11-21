import { cn } from "@/lib/utils";

/** One heading style for every homepage/public section */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("mb-10 max-w-2xl", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow && <p className="mb-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>}
      <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}
