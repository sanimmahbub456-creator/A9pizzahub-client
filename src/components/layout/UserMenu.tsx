"use client";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearTokenCache } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import { initials } from "@/lib/utils";

type U = { name: string; email: string; image?: string | null; role?: string; subscriptionPlan?: string };

export function UserMenu({ user }: { user: U }) {
  const router = useRouter();

  const logout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          clearTokenCache();
          toast.success("Signed out. See you soon! 🍕");
          router.push("/");
          router.refresh();
        },
        onError: () => {
          toast.error("Could not sign out. Try again.");
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition hover:ring-primary outline-none">
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="truncate font-semibold">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex gap-1.5">
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
            {user.subscriptionPlan === "premium" && <Badge variant="premium">Premium</Badge>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard"><LayoutDashboard /> Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile"><Settings /> Profile Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive [&_svg]:text-destructive">
          <LogOut /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
