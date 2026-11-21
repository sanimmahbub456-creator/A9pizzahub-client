import { PizzaIllustration } from "@/components/home/PizzaIllustration";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-px grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-3xl bg-sidebar p-10 text-sidebar-foreground lg:flex lg:h-full lg:min-h-[560px] lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">PizzaHub</p>
          <h2 className="mt-3 max-w-sm text-4xl font-bold">Your next slice is a few clicks away.</h2>
          <p className="mt-3 max-w-sm text-sidebar-foreground/70">Customers order from the best local pizzerias. Vendors reach hungry neighbours. Everyone wins.</p>
        </div>
        <PizzaIllustration className="absolute -right-24 -bottom-24 w-[420px] opacity-90" />
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
