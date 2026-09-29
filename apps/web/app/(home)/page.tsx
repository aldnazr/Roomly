"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  IconArrowRight,
  IconKey,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoles } from "@/features/roles/use-roles";
import { usePermission } from "@/features/permissions/use-permissions";

export default function Page() {
  const { data: session } = useSession();
  const {
    data: rolesData,
    isLoading: rLoading,
    isError: rErr,
    refetch: refetchRoles,
  } = useRoles();
  const {
    data: permsData,
    isLoading: pLoading,
    isError: pErr,
    refetch: refetchPerms,
  } = usePermission();

  const roles = rolesData?.data ?? [];
  const permissions = permsData?.data ?? [];
  const isLoading = rLoading || pLoading;
  const isError = rErr || pErr;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-card to-muted/30 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <IconShieldLock className="size-3.5" aria-hidden="true" />
            <span>Role: {session?.user?.role || "Staf"}</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Selamat datang, {session?.user?.name || "Pengguna"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola hak akses dan perizinan operasional hotel Roomly.
          </p>
        </div>
      </section>

      {isLoading && <Skeleton className="h-64 rounded-xl" />}

      {isError && !isLoading && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              Gagal memuat ringkasan
            </CardTitle>
            <CardDescription>Periksa koneksi server.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchRoles();
                refetchPerms();
              }}
            >
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Role
                </CardTitle>
                <IconUsers
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                  {roles.length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Guest, Staff, Manager, Admin
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Hak Akses
                </CardTitle>
                <IconKey
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                  {permissions.length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Domain kamar, booking, harga, laporan
                </p>
              </CardContent>
            </Card>
          </section>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Distribusi Hak Akses
                </CardTitle>
                <CardDescription>
                  Cakupan operasional tiap role.
                </CardDescription>
              </div>
              <Link
                href="/role"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <span>Kelola role</span>
                <IconArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {roles.map((role) => (
                <div
                  key={role.slug}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {role.name}
                      </p>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {role.slug}
                      </code>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold tabular-nums text-foreground">
                      {role.permissions.length}
                    </span>
                    <span>izin</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
