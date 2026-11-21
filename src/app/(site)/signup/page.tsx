import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" subtitle="Join as a customer to order, or as a vendor to sell your pizzas.">
      <SignUpForm />
    </AuthShell>
  );
}
