"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function GuestPage() {
  const router = useRouter();
  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/60 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <h1>Guest</h1>
        </div>
        <div className="flex gap-2">
          <ModeToggle />
          <Button onClick={() => router.push("/login")}>Login</Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Area Tamu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman tamu — riwayat booking akan tampil di sini.
        </p>
      </main>
    </>
  );
}
