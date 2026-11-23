"use client";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Shown instead of crashing when the server couldn't verify the session (e.g. a brief database hiccup) */
export function SessionError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-secondary">
        <RefreshCw className="size-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">We couldn&apos;t load your dashboard</h1>
      <p className="mt-2 max-w-md text-muted-foreground">This is usually temporary. Please reload the page.</p>
      <p className="mt-3 max-w-md rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
      </div>
    </div>
  );
}
