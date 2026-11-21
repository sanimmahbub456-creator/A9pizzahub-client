import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { PageLoader } from "@/components/shared/Loader";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to order, manage your menu, or run the platform.">
      <Suspense fallback={<PageLoader />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
