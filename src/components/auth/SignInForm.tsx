"use client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearTokenCache } from "@/lib/api";
import { signIn, useSession } from "@/lib/auth-client";
import { GoogleButton, OrDivider } from "./GoogleButton";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session } = useSession();
  const redirectTo = params.get("redirect")?.startsWith("/") ? params.get("redirect")! : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.get("blocked")) toast.error("Your account has been blocked. Please contact support.");
    if (params.get("error")) toast.error("Google sign-in failed or your account is blocked.");
  }, [params]);

  // Already signed in? go straight to where they were heading
  useEffect(() => {
    if (session?.user && !params.get("blocked")) router.replace(redirectTo);
  }, [session, redirectTo, router, params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const { error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.status === 401 ? "Invalid email or password" : (error.message ?? "Sign in failed"));
      return;
    }
    clearTokenCache();
    toast.success("Welcome back! 🍕");
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <>
      <GoogleButton callbackURL={redirectTo} />
      <OrDivider />
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} placeholder="••••••••" className="pr-11" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2">
          {loading && <Loader2 className="animate-spin" />} {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to PizzaHub? <Link href="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </>
  );
}
