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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Permission } from "@/features/permissions/types";
import { useSetPermission } from "@/features/permissions/use-permissions";
import { useRoleDetail } from "@/features/roles/use-roles";
import { capitalize, cn } from "@/lib/utils";
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconKey,
  IconLoader2,
  IconRefresh,
  IconRotate,
  IconShieldLock,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface PermissionGroup {
  group: string;
  items: Permission[];
}

function groupPermissions(data: Permission[]): PermissionGroup[] {
  const grouped = data.reduce<Record<string, Permission[]>>((acc, item) => {
    const prefix = item.slug.split(".")[0];

    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(item);

    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([prefix, items]) => ({
      group: prefix,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

function RoleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Memuat detail role">
      <Skeleton className="h-56 w-full rounded-4xl" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-4xl" />
        ))}
      </div>
    </div>
  );
}

export default function RoleDetailPage() {
  const { slug: roleSlug } = useParams<{ slug: string }>();
  const { roles, permissions, isLoading, error, isError, refetch } =
    useRoleDetail();
  const { mutate, isPending } = useSetPermission(roleSlug);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const role = roles?.data.find((item) => item.slug === roleSlug);

  useEffect(() => {
    if (role) setChecked(new Set(role.permissions));
  }, [role]);

  const groups = useMemo(
    () => groupPermissions(permissions?.data ?? []),
    [permissions?.data],
  );

  const hasFormChange =
    !!role &&
    (checked.size !== role.permissions.length ||
      Array.from(checked).some(
        (permission) => !role.permissions.includes(permission),
      ));

  function toggleChecked(permission: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  }

  function toggleGroup(group: PermissionGroup) {
    setChecked((current) => {
      const next = new Set(current);
      const allSelected = group.items.every((item) => next.has(item.slug));

      group.items.forEach((item) => {
        if (allSelected) next.delete(item.slug);
        else next.add(item.slug);
      });

      return next;
    });
  }

  function reset() {
    if (role) setChecked(new Set(role.permissions));
  }

  function save() {
    mutate({ permissions: Array.from(checked) });
  }

  if (isLoading) return <RoleDetailSkeleton />;

  if (isError) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Permission belum dapat dimuat</CardTitle>
          <CardDescription>
            {error instanceof Error
              ? error.message
              : "Periksa koneksi server, lalu coba kembali."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetch()}>
            <IconRefresh data-icon="inline-start" aria-hidden="true" />
            Muat ulang
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!role) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Role tidak ditemukan</CardTitle>
          <CardDescription>
            Role dengan slug “{roleSlug}” tidak tersedia atau telah dihapus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/role" />} nativeButton={false}>
            <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
            Kembali ke daftar role
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalPermissions = permissions?.data.length ?? 0;
  const selectedPercentage =
    totalPermissions > 0
      ? Math.round((checked.size / totalPermissions) * 100)
      : 0;

  return (
    <div className={cn("flex flex-col gap-6", hasFormChange && "pb-28")}>
      <section className="relative overflow-hidden rounded-4xl bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
          <div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/role" />}
              nativeButton={false}
              className="-ml-3 mb-5"
            >
              <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
              Semua role
            </Button>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Matriks akses · {role.slug}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {role.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {role.description ||
                "Tentukan area dan tindakan yang dapat diakses oleh role ini."}
            </p>
          </div>

          <div className="rounded-4xl bg-muted/50 p-1 ring-1 ring-foreground/5">
            <div className="rounded-[calc(2rem-4px)] bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <IconShieldLock
                    className="size-5"
                    stroke={1.5}
                    aria-hidden="true"
                  />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {selectedPercentage}% aktif
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold tabular-nums">
                {checked.size}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  / {totalPermissions}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Permission diberikan
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Konfigurasi
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold tracking-tight">
            Hak akses per area
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground sm:text-right">
          Pilih hanya akses yang dibutuhkan agar akun tetap aman dan terkontrol.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada permission</CardTitle>
            <CardDescription>
              Permission yang tersedia akan ditampilkan di area ini.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2">
          {groups.map((group, index) => {
            const selectedInGroup = group.items.filter((item) =>
              checked.has(item.slug),
            ).length;
            const allSelected = selectedInGroup === group.items.length;

            return (
              <div
                key={group.group}
                className="animate-in rounded-4xl bg-muted/50 p-1 ring-1 ring-foreground/5 fade-in slide-in-from-bottom-4 animation-duration-700 fill-mode-[both] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <Card className="gap-5 rounded-[calc(2rem-4px)] shadow-none ring-0">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <IconKey
                          className="size-4"
                          stroke={1.5}
                          aria-hidden="true"
                        />
                      </span>
                      <div>
                        <CardTitle>{capitalize(group.group)}</CardTitle>
                        <CardDescription>
                          {selectedInGroup} dari {group.items.length} dipilih
                        </CardDescription>
                      </div>
                    </div>
                    <CardAction>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => toggleGroup(group)}
                        disabled={isPending}
                      >
                        {allSelected ? "Kosongkan" : "Pilih semua"}
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <FieldSet>
                      <FieldLegend className="sr-only">
                        Permission {capitalize(group.group)}
                      </FieldLegend>
                      <FieldGroup className="gap-2">
                        {group.items.map((item) => (
                          <Field
                            key={item.slug}
                            orientation="horizontal"
                            className="rounded-3xl bg-muted/40 p-4 ring-1 ring-foreground/5 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-muted/70"
                          >
                            <Checkbox
                              id={item.slug}
                              name={item.name}
                              className="size-5 rounded-lg"
                              checked={checked.has(item.slug)}
                              onCheckedChange={() => toggleChecked(item.slug)}
                              disabled={isPending}
                            />
                            <FieldContent>
                              <FieldLabel htmlFor={item.slug}>
                                {item.name}
                              </FieldLabel>
                              <FieldDescription className="leading-5">
                                {item.description}
                              </FieldDescription>
                              <span className="font-mono text-[10px] text-muted-foreground/70">
                                {item.slug}
                              </span>
                            </FieldContent>
                          </Field>
                        ))}
                      </FieldGroup>
                    </FieldSet>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {hasFormChange && (
        <div className="fixed inset-x-0 bottom-0 z-20 p-3 sm:p-4">
          <div className="mx-auto max-w-3xl rounded-4xl bg-background/70 p-1 shadow-lg ring-1 ring-foreground/10 backdrop-blur-2xl">
            <div className="flex flex-col gap-3 rounded-[calc(2rem-4px)] bg-card/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconCheck
                    className="size-4"
                    stroke={1.5}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="text-sm font-medium">Perubahan siap disimpan</p>
                  <p className="text-xs text-muted-foreground">
                    {checked.size} permission akan diterapkan ke {role.name}.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  disabled={isPending}
                >
                  <IconRotate data-icon="inline-start" aria-hidden="true" />
                  Batal
                </Button>
                <Button size="sm" onClick={save} disabled={isPending}>
                  {isPending ? (
                    <IconLoader2
                      data-icon="inline-start"
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <IconDeviceFloppy
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                  )}
                  {isPending ? "Menyimpan..." : "Simpan akses"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
