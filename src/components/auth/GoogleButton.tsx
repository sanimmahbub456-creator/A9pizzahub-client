"use client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/shared/SocialIcons";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export function GoogleButton({ callbackURL = "/dashboard", newUserCallbackURL = "/onboarding", label = "Continue with Google" }: { callbackURL?: string; newUserCallbackURL?: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const { error } = await signIn.social({ provider: "google", callbackURL, newUserCallbackURL, errorCallbackURL: "/signin?error=google" });
        if (error) {
          toast.error(error.message ?? "Google sign-in failed");
          setLoading(false);
        }
      }}
    >
      {loading ? <Loader2 className="animate-spin" /> : <GoogleIcon className="size-4" />} {label}
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-semibold text-muted-foreground uppercase">
      <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
    </div>
  );
}
