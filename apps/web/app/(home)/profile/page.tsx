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
import { useAuthMe } from "@/features/auth/use-auth";
import { IconKey, IconShieldLock, IconUser } from "@tabler/icons-react";

type Row = {
  label: string;
  value: string | number | undefined;
  mono?: boolean;
  tabular?: boolean;
  breakAll?: boolean;
};

function DetailRows({ rows }: { rows: Row[] }) {
  return (
    <CardContent className="divide-y divide-border/60">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <span className="shrink-0 text-sm text-muted-foreground">
            {row.label}
          </span>
          <span
            className={[
              "min-w-0 text-right text-sm font-medium",
              row.mono ? "font-mono" : "",
              row.tabular ? "tabular-nums" : "",
              row.breakAll ? "break-all font-normal" : "truncate",
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
  );
}

export default function ProfilePage() {
  const { data, isLoading, isError, refetch } = useAuthMe();

  const profile = data?.data;
  const initial = profile?.name?.trim().charAt(0).toUpperCase() ?? "?";

  const accountRows: Row[] = [
    { label: "ID", value: profile?.id, mono: true, tabular: true },
    { label: "Nama", value: profile?.name },
    { label: "Username", value: profile?.username, mono: true },
    { label: "Email", value: profile?.email, breakAll: true },
  ];

  const roleRows: Row[] = [
    { label: "Nama role", value: profile?.role.name },
    { label: "Slug", value: profile?.role.slug, mono: true },
  ];

  const permissions = profile?.permissions ?? [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-card to-muted/30 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 border border-border/80 bg-background">
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {profile ? initial : <IconUser className="size-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            {profile && (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <IconShieldLock className="size-3.5" aria-hidden="true" />
                <span>Role: {profile.role.name}</span>
              </div>
            )}
            <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
              {profile?.name ?? "Memuat profil..."}
            </h1>
            {profile?.username && (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {profile.username}
              </code>
            )}
          </div>
        </div>
      </section>

      {isLoading && (
        <>
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </>
      )}

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

      {!isLoading && !isError && profile && (
        <>
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Detail Akun
              </CardTitle>
              <CardDescription>Identitas akun Anda.</CardDescription>
            </CardHeader>
            <DetailRows rows={accountRows} />
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Role</CardTitle>
              <CardDescription>
                {profile.role.description || "Role akun Anda."}
              </CardDescription>
            </CardHeader>
            <DetailRows rows={roleRows} />
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <IconKey className="size-4" stroke={1.5} aria-hidden="true" />
                </span>
                <div>
                  <CardTitle className="text-base font-semibold">
                    Hak Akses
                  </CardTitle>
                  <CardDescription>
                    {permissions.length > 0
                      ? `${permissions.length} permission aktif untuk role ini.`
                      : "Role ini belum memiliki hak akses."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {permissions.length > 0 && (
              <CardContent>
                <ul className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <li
                      key={permission}
                      className="rounded-md bg-muted px-2 py-1 font-mono text-xs break-all text-muted-foreground ring-1 ring-foreground/5"
                    >
                      {permission}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
