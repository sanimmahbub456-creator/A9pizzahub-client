"use client";
import { Loader2, ShoppingBag, Store } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageLoader } from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorMessage } from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/** Shown once after Google sign-up so the user can choose Customer or Vendor */
export function Onboarding() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, isPending } = useSession();
  const [role, setRole] = useState<"customer" | "vendor">(params.get("role") === "vendor" ? "vendor" : "customer");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user && session.user.onboarded) router.replace("/dashboard");
  }, [session, router]);

  if (isPending || !session || session.user.onboarded) return <PageLoader />;

  const submit = async () => {
    if (role === "vendor" && businessName.trim().length < 2) return toast.error("Enter your restaurant name");
    setLoading(true);
    try {
      await api("/api/users/me/onboard", { method: "POST", body: { role, businessName: role === "vendor" ? businessName.trim() : undefined } });
      await authClient.getSession({ query: { disableCookieCache: true } });
      toast.success("All set! Welcome to PizzaHub 🍕");
      window.location.href = `/dashboard/${role}`;
    } catch (e) {
      toast.error(errorMessage(e));
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-3xl font-bold">One last step, {session.user.name.split(" ")[0]}!</h1>
      <p className="mt-2 text-muted-foreground">How will you use PizzaHub? This can&apos;t be changed later.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {([
          { value: "customer", label: "Customer", icon: ShoppingBag },
          { value: "vendor", label: "Vendor", icon: Store },
        ] as const).map(({ value, label, icon: Icon }) => (
          <button key={value} type="button" onClick={() => setRole(value)}
            className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-6 transition", role === value ? "border-primary bg-primary/5" : "hover:border-primary/40")}>
            <Icon className="size-8 text-primary" />
            <span className="font-semibold">{label}</span>
          </button>
        ))}
      </div>
      {role === "vendor" && (
        <div className="mt-5 grid gap-2">
          <Label htmlFor="biz">Restaurant / Business Name</Label>
          <Input id="biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Napoli Corner" />
        </div>
      )}
      <Button size="lg" className="mt-6 w-full" onClick={submit} disabled={loading}>
        {loading && <Loader2 className="animate-spin" />} Continue
      </Button>
    </div>
  );
}
