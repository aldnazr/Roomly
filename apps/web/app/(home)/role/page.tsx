"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoles } from "@/features/roles/use-roles";
import {
  IconArrowUpRight,
  IconBriefcase,
  IconHeadset,
  IconIdBadge2,
  IconKey,
  IconRefresh,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

const roleIcons = {
  guest: IconUser,
  staff: IconHeadset,
  manager: IconBriefcase,
  admin: IconShieldLock,
};

export default function RolePage() {
  const { isLoading, isError, data, refetch } = useRoles();
  const roles = data?.data ?? [];
  const permissionCount = new Set(roles.flatMap((role) => role.permissions))
    .size;

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-4xl bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Kontrol akses
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Role &amp; permission
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Atur batas akses setiap level pengguna agar operasional hotel
              tetap aman dan terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:min-w-64">
            <div className="rounded-3xl bg-muted/60 p-4 ring-1 ring-foreground/5">
              <div className="text-2xl font-semibold tabular-nums">
                {isLoading ?
                  <Skeleton className="h-7 w-10" />
                : roles.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Total role</p>
            </div>
            <div className="rounded-3xl bg-muted/60 p-4 ring-1 ring-foreground/5">
              <div className="text-2xl font-semibold tabular-nums">
                {isLoading ?
                  <Skeleton className="h-7 w-10" />
                : permissionCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Hak akses</p>
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2" aria-label="Memuat role">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-4xl bg-muted/50 p-1 ring-1 ring-foreground/5"
            >
              <div className="flex min-h-44 items-start gap-4 rounded-[calc(2rem-4px)] bg-card p-5">
                <Skeleton className="size-11 shrink-0 rounded-2xl" />
                <div className="flex flex-1 flex-col gap-3">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-5 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <Card className="ring-destructive/20">
          <CardHeader>
            <CardTitle>Role belum dapat dimuat</CardTitle>
            <CardDescription>
              Terjadi kendala saat mengambil data akses. Silakan coba kembali.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetch()}>
              <IconRefresh data-icon="inline-start" aria-hidden="true" />
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && roles.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada role</CardTitle>
            <CardDescription>
              Role yang tersedia akan tampil di area ini.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !isError && roles.length > 0 && (
        <ItemGroup className="grid gap-4 md:grid-cols-2">
          {roles.map((role, index) => {
            const RoleIcon =
              roleIcons[role.slug.toLowerCase() as keyof typeof roleIcons] ??
              IconIdBadge2;

            return (
              <Card
                key={role.slug}
                className="animate-in rounded-4xl bg-muted/50 p-1 ring-1 ring-foreground/5 fade-in slide-in-from-bottom-4 animation-duration-700 fill-mode-[both] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <Item
                  className="min-h-44 items-start rounded-[calc(2rem-4px)] bg-card p-5 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  render={<Link href={`/role/${role.slug}`} />}
                >
                  <ItemMedia
                    variant="icon"
                    className="size-11 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10"
                  >
                    <RoleIcon
                      className="size-5"
                      stroke={1.5}
                      aria-hidden="true"
                    />
                  </ItemMedia>
                  <ItemContent className="min-w-0 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ItemTitle className="font-heading text-base">
                        {role.name}
                      </ItemTitle>
                      <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-foreground/5">
                        {role.slug}
                      </span>
                    </div>
                    <ItemDescription className="line-clamp-2 leading-5">
                      {role.description}
                    </ItemDescription>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <IconKey
                        className="size-3.5"
                        stroke={1.5}
                        aria-hidden="true"
                      />
                      <span>{role.permissions.length} permission</span>
                    </div>
                  </ItemContent>
                  <ItemActions className="self-center">
                    <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[transform,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-foreground">
                      <IconArrowUpRight
                        className="size-4"
                        stroke={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </ItemActions>
                </Item>
              </Card>
            );
          })}
        </ItemGroup>
      )}
    </div>
  );
}
