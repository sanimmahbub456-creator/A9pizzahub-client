"use client";
import { Check, Eye, EyeOff, Loader2, ShoppingBag, Store, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearTokenCache } from "@/lib/api";
import { signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { GoogleButton, OrDivider } from "./GoogleButton";

const rules = [
  { test: (p: string) => p.length >= 6, label: "At least 6 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
];

type Role = "customer" | "vendor";

export function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [image, setImage] = useState<string[]>([]);
  const [role, setRole] = useState<Role>("customer");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!rules.every((r) => r.test(form.password))) e.password = "Password doesn't meet the rules below";
    if (role === "vendor" && form.businessName.trim().length < 2) e.businessName = "Enter your restaurant name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp.email({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      image: image[0],
      // read server-side by Better Auth hooks; "admin" is never accepted
      accountType: role,
      restaurantName: role === "vendor" ? form.businessName.trim() : undefined,
    } as Parameters<typeof signUp.email>[0]);
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Sign up failed");
      return;
    }
    clearTokenCache();
    toast.success("Account created! Welcome to PizzaHub 🎉");
    router.replace(role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer");
    router.refresh();
  };

  return (
    <>
      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-semibold">I want to join as</legend>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "customer", label: "Customer", desc: "Order pizza", icon: ShoppingBag },
            { value: "vendor", label: "Vendor", desc: "Restaurant owner", icon: Store },
          ] as const).map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              aria-pressed={role === value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 text-left transition",
                role === value ? "border-primary bg-primary/5" : "hover:border-primary/40",
              )}
            >
              <span className={cn("grid size-10 place-items-center rounded-xl", role === value ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{label}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <GoogleButton label={`Sign up with Google as ${role}`} newUserCallbackURL={`/onboarding?role=${role}`} />
      <OrDivider />

      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} placeholder="Jane Doe" autoComplete="name" />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        {role === "vendor" && (
          <div className="grid gap-2">
            <Label htmlFor="businessName">Restaurant / Business Name</Label>
            <Input id="businessName" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} aria-invalid={!!errors.businessName} placeholder="Napoli Corner" />
            {errors.businessName && <p className="text-xs text-destructive">{errors.businessName}</p>}
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} placeholder="you@example.com" autoComplete="email" />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={!!errors.password} className="pr-11" autoComplete="new-password" placeholder="Create a password" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <ul className="grid gap-1 text-xs">
            {rules.map((r) => {
              const ok = r.test(form.password);
              return (
                <li key={r.label} className={cn("flex items-center gap-1.5", ok ? "text-success" : "text-muted-foreground")}>
                  {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />} {r.label}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="grid gap-2">
          <Label>Profile Image <span className="font-normal text-muted-foreground">(optional, you can skip this)</span></Label>
          <ImageUploader value={image} onChange={setImage} shape="circle" />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2">
          {loading && <Loader2 className="animate-spin" />} {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/signin" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </>
  );
}
