"use client";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Something got burnt in the oven</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Please try again. If the site was just updated, a reload fixes it.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>}
      <div className="mt-6 flex gap-3">
        {/* full reload loads the newest version of the site (fixes tabs opened before a deployment) */}
        <Button onClick={() => window.location.reload()}>Try again</Button>
        <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
      </div>
    </div>
  );
}