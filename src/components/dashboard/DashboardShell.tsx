"use client";
import {
  ClipboardList, CreditCard, Crown, Home, LayoutDashboard, ListPlus, LogOut, Menu, Pizza, Receipt, Settings, ShieldCheck, Users, UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { clearTokenCache } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import type { Role } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

const NAV: Record<Role, NavItem[]> = {
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/items", label: "My Menu Items", icon: UtensilsCrossed },
    { href: "/dashboard/vendor/items/new", label: "Add Menu Item", icon: ListPlus },
    { href: "/dashboard/vendor/orders", label: "Customer Orders", icon: ClipboardList },
    { href: "/dashboard/vendor/subscription", label: "Subscription", icon: Crown },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/orders", label: "My Orders", icon: ClipboardList },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/items", label: "Manage Menu Items", icon: Pizza },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
};

type ShellUser = { name: string; email: string; image?: string | null; role: Role; subscriptionPlan?: string };

function Sidebar({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV[user.role];
  // longest-prefix match so "/items/new" doesn't also highlight "/items"
  const activeHref = items.map((i) => i.href).filter((h) => pathname === h || pathname.startsWith(h + "/")).sort((a, b) => b.length - a.length)[0];

  const logout = () =>
    signOut({
      fetchOptions: {
        onSuccess: () => {
          clearTokenCache();
          toast.success("Signed out");
          router.push("/");
          router.refresh();
        },
      },
    });

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5"><Logo light /></div>
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
        <Avatar className="size-11 ring-2 ring-accent/60">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold">{user.name}</p>
          <div className="mt-0.5 flex gap-1">
            <Badge className="bg-white/10 text-sidebar-foreground capitalize">{user.role === "admin" && <ShieldCheck />}{user.role}</Badge>
            {user.subscriptionPlan === "premium" && <Badge variant="premium"><Crown /> Premium</Badge>}
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              activeHref === href ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-sidebar-foreground",
            )}>
            <Icon className="size-4.5" /> {label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/75 hover:bg-white/5"><Home className="size-4.5" /> Back to site</Link>
        <button onClick={logout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/75 hover:bg-white/5"><LogOut className="size-4.5" /> Logout</button>
      </div>
    </div>
  );
}

/**
 * Shows a one-time "access denied" toast, then removes ?denied=1 from the URL.
 * The toast id stops duplicates (React Strict Mode runs effects twice in development).
 */
function DeniedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (params.get("denied")) {
      toast.error("You don't have access to that dashboard", { id: "access-denied" });
      router.replace(pathname);
    }
  }, [params, router, pathname]);
  return null;
}

export function DashboardShell({ initialUser, children }: { initialUser: ShellUser; children: React.ReactNode }) {
  const { data } = useSession();
  const user = (data?.user as unknown as ShellUser) ?? initialUser;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen">
      <Suspense><DeniedToast /></Suspense>
      <aside className="sticky top-0 hidden h-screen w-68 shrink-0 lg:block"><Sidebar user={user} /></aside>
      <Dialog open={open} onOpenChange={setOpen}>
        <SheetContent>
          <DialogTitle className="sr-only">Dashboard navigation</DialogTitle>
          <Sidebar user={user} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Dialog>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar"><Menu className="size-5" /></Button>
            <p className="text-sm text-muted-foreground">Hello, <span className="font-semibold text-foreground">{user.name.split(" ")[0]}</span> 👋</p>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "vendor" && user.subscriptionPlan !== "premium" && (
              <Button asChild size="sm" variant="accent" className="hidden sm:inline-flex"><Link href="/dashboard/vendor/subscription"><CreditCard /> Upgrade</Link></Button>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}