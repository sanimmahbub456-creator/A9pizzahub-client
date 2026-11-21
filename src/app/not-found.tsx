import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-checker px-4 text-center">
      <Logo />
      <div className="rounded-3xl border bg-card/95 p-10 shadow-xl">
        <p className="font-display text-8xl font-bold text-primary">4🍕4</p>
        <h1 className="mt-4 text-2xl font-bold">This slice went missing</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild><Link href="/">Back to Home</Link></Button>
          <Button asChild variant="outline"><Link href="/menu">Browse Menu</Link></Button>
        </div>
      </div>
    </div>
  );
}
