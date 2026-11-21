import { Suspense } from "react";
import { Onboarding } from "@/components/auth/Onboarding";
import { PageLoader } from "@/components/shared/Loader";

export default function OnboardingPage() {
  return (
    <div className="container-px">
      <Suspense fallback={<PageLoader />}>
        <Onboarding />
      </Suspense>
    </div>
  );
}
