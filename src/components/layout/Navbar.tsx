"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const roleLinks: Record<string, { href: string; label: string }[]> = {
  customer: [{ href: "/dashboard/customer/orders", label: "My Orders" }],
  vendor: [
    { href: "/dashboard/vendor/items", label: "My Menu" },
    { href: "/dashboard/vendor/orders", label: "Orders" },
  ],
  admin: [
    { href: "/dashboard/admin/items", label: "Review Items" },
    { href: "/dashboard/admin/users", label: "Users" },
  ],
};

export function Navbar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const user = session?.user;
  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Browse Menu" },
    ...(user ? (roleLinks[user.role as string] ?? []) : []),
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled ? "border-b bg-background/85 shadow-sm backdrop-blur-md" : "bg-background",
      )}
    >
      <nav className="container-px flex h-16 items-center justify-between gap-4">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-primary",
                  isActive(l.href) ? "bg-secondary text-primary" : "text-foreground/80",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <Skeleton className="size-9 rounded-full" />
          ) : user ? (
            <UserMenu user={user as never} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost"><Link href="/signin">Sign In</Link></Button>
              <Button asChild><Link href="/signup">Sign Up</Link></Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="border-t bg-background md:hidden">
          <ul className="container-px flex flex-col gap-1 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn("block rounded-xl px-4 py-2.5 font-semibold", isActive(l.href) ? "bg-secondary text-primary" : "hover:bg-muted")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {!user && !isPending && (
              <li className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline"><Link href="/signin">Sign In</Link></Button>
                <Button asChild><Link href="/signup">Sign Up</Link></Button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
