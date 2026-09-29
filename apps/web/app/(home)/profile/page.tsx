"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDetail } from "@/features/users/use-users";
import { IconShieldLock, IconUser } from "@tabler/icons-react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: sessionData } = useSession();
  const id = sessionData?.user.id;
  const { data, isLoading, isError, refetch } = useUserDetail(id);

  const initial = data?.name?.trim().charAt(0).toUpperCase() ?? "?";

  const rows: {
    label: string;
    value: string | number | undefined;
    mono?: boolean;
    tabular?: boolean;
    breakAll?: boolean;
  }[] = [
    { label: "Username", value: data?.username, mono: true },
    { label: "Email", value: data?.email, breakAll: true },
    { label: "Role", value: data?.role },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-card to-muted/30 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 border border-border/80 bg-background">
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {data ? initial : <IconUser className="size-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <IconShieldLock className="size-3.5" aria-hidden="true" />
              <span>
                Role: {data?.role || sessionData?.user.role || "Staf"}
              </span>
            </div>
            <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
              {data?.name || sessionData?.user.name || "Memuat profil..."}
            </h1>
            {data?.username && (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {data.username}
              </code>
            )}
          </div>
        </div>
      </section>

      {isLoading && <Skeleton className="h-64 rounded-xl" />}

      {isError && !isLoading && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              Gagal memuat profil
            </CardTitle>
            <CardDescription>Periksa koneksi server.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Detail Akun
            </CardTitle>
            <CardDescription>Informasi dasar akun Anda.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-muted-foreground">
                  {row.label}
                </span>
                <span
                  className={[
                    "min-w-0 truncate text-right text-sm font-medium",
                    row.mono ? "font-mono" : "",
                    row.tabular ? "tabular-nums" : "",
                    row.breakAll ? "break-all font-normal" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {row.value ?? (
                    <span className="font-normal text-muted-foreground">—</span>
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ponytail: profil read-only — userApi.update belum menerima payload; tambah form edit saat PATCH payload di-wire */}
    </div>
  );
}
