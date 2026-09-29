"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/features/users/components/table-skeleton";
import { TableUser } from "@/features/users/components/table-user";
import { useUser } from "@/features/users/use-users";
import {
  IconRefresh,
  IconShieldLock,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";
import Link from "next/link";

export default function UserPage() {
  const { data, isLoading, isError, refetch } = useUser();
  const users = data?.data ?? [];
  const roleCount = new Set(users.map((user) => user.role)).size;

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-4xl bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-28 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Direktori tim
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Pengguna
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Kelola akun tim, identitas, dan role yang terhubung ke setiap
              pengguna Roomly.
            </p>
          </div>

          <Button
            size="lg"
            render={<Link href="/user/create" />}
            nativeButton={false}
            className="w-full transition-[transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] md:w-auto"
          >
            <IconUserPlus
              data-icon="inline-start"
              stroke={1.5}
              aria-hidden="true"
            />
            Tambah pengguna
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-3xl bg-muted/50 p-4 ring-1 ring-foreground/5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card text-primary ring-1 ring-foreground/5">
            <IconUsersGroup
              className="size-5"
              stroke={1.5}
              aria-hidden="true"
            />
          </span>
          <div>
            <div className="text-xl font-semibold tabular-nums">
              {isLoading ?
                <Skeleton className="h-6 w-8" />
              : users.length}
            </div>
            <p className="text-xs text-muted-foreground">Total pengguna</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-muted/50 p-4 ring-1 ring-foreground/5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card text-primary ring-1 ring-foreground/5">
            <IconShieldLock
              className="size-5"
              stroke={1.5}
              aria-hidden="true"
            />
          </span>
          <div>
            <div className="text-xl font-semibold tabular-nums">
              {isLoading ?
                <Skeleton className="h-6 w-8" />
              : roleCount}
            </div>
            <p className="text-xs text-muted-foreground">Role aktif</p>
          </div>
        </div>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-4 animation-duration-[800ms] fill-mode-[both] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)]">
        <CardHeader>
          <CardTitle>Daftar pengguna</CardTitle>
          <CardDescription>
            Semua akun yang memiliki akses ke workspace ini.
          </CardDescription>
          <CardAction>
            {!isLoading && !isError && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {users.length} akun
              </span>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading && <TableSkeleton />}
          {isError && !isLoading && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
              <div>
                <p className="font-medium">Data pengguna belum dapat dimuat</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Periksa koneksi server, lalu coba kembali.
                </p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                <IconRefresh data-icon="inline-start" aria-hidden="true" />
                Coba lagi
              </Button>
            </div>
          )}
          {!isLoading && !isError && <TableUser users={data} />}
        </CardContent>
      </Card>
    </div>
  );
}
