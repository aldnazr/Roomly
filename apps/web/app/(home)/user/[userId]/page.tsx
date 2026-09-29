"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoles } from "@/features/roles/use-roles";
import { UserCreatePayload, UserUpdatePayload } from "@/features/users/types";
import {
  useUserCreate,
  useUserDetail,
  useUserUpdate,
} from "@/features/users/use-users";
import {
  IconArrowLeft,
  IconAt,
  IconDeviceFloppy,
  IconKey,
  IconLoader2,
  IconRefresh,
  IconShieldLock,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SyntheticEvent } from "react";

function UserFormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Memuat data pengguna">
      <Skeleton className="h-52 w-full rounded-4xl" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Skeleton className="h-125 w-full rounded-4xl" />
        <Skeleton className="h-72 w-full rounded-4xl" />
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const isEditing = userId !== "create";

  const createUser = useUserCreate();
  const updateUser = useUserUpdate();
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch,
  } = useUserDetail(isEditing ? userId : undefined);
  const {
    data: listRole,
    isLoading: isRoleLoading,
    isError: isRoleError,
  } = useRoles();

  const roleItems =
    listRole?.data.map((item) => ({
      label: item.name,
      value: item.slug,
    })) ?? [];
  const isPending = createUser.isPending || updateUser.isPending;

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const role = String(formData.get("role"));
    const onSuccess = () => router.push("/user");

    if (isEditing) {
      const payload: UserUpdatePayload = { username, email, role };
      if (password) payload.password = password;
      updateUser.mutate({ id: userId, payload }, { onSuccess });
      return;
    }

    const payload: UserCreatePayload = { username, email, password, role };
    createUser.mutate(payload, { onSuccess });
  }

  if (isEditing && isUserLoading) return <UserFormSkeleton />;

  if (isEditing && isUserError) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Data pengguna belum dapat dimuat</CardTitle>
          <CardDescription>
            Periksa koneksi server atau pastikan pengguna masih tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <IconRefresh data-icon="inline-start" aria-hidden="true" />
            Coba lagi
          </Button>
          <Button render={<Link href="/user" />} nativeButton={false}>
            <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
            Kembali
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initial =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.username?.trim().charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-4xl bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-28 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-2xl">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/user" />}
              nativeButton={false}
              className="-ml-3 mb-5"
            >
              <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
              Semua pengguna
            </Button>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {isEditing ? "Pengaturan akun" : "Onboarding anggota"}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {isEditing ? "Edit pengguna" : "Tambah pengguna"}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {isEditing ?
                "Perbarui identitas dan tingkat akses pengguna tanpa mengubah alur kerja tim."
              : "Buat akun baru dan tetapkan akses yang tepat sejak hari pertama."
              }
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-3xl bg-muted/60 p-3 pr-5 ring-1 ring-foreground/5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-lg font-semibold text-primary ring-1 ring-foreground/5">
              {isEditing ?
                initial
              : <IconUserPlus
                  className="size-5"
                  stroke={1.5}
                  aria-hidden="true"
                />
              }
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user?.name || user?.username || "Akun baru"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "Siap ditambahkan ke workspace"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="animate-in rounded-4xl bg-muted/50 p-1 ring-1 ring-foreground/5 fade-in slide-in-from-bottom-4 animation-duration-[800ms] fill-mode-[both] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)]">
          <Card className="rounded-[calc(2rem-4px)] ring-0">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Detail akun</CardTitle>
                <CardDescription>
                  Informasi ini digunakan untuk login dan pengelolaan akses.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <FieldSet>
                  <FieldLegend className="sr-only">
                    Detail akun pengguna
                  </FieldLegend>
                  <FieldGroup className="grid gap-5 md:grid-cols-2">
                    <Field>
                      <div className="flex items-center gap-2">
                        <IconUser
                          className="size-4 text-muted-foreground"
                          stroke={1.5}
                          aria-hidden="true"
                        />
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                      </div>
                      <Input
                        id="username"
                        name="username"
                        placeholder="mis. nabila.putri"
                        type="text"
                        defaultValue={user?.username ?? ""}
                        autoComplete="username"
                        minLength={3}
                        required
                      />
                      <FieldDescription>
                        Minimal 3 karakter; gunakan huruf, angka, titik, atau
                        garis bawah.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <div className="flex items-center gap-2">
                        <IconAt
                          className="size-4 text-muted-foreground"
                          stroke={1.5}
                          aria-hidden="true"
                        />
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                      </div>
                      <Input
                        id="email"
                        name="email"
                        placeholder="nama@contoh.com"
                        type="email"
                        defaultValue={user?.email ?? ""}
                        autoComplete="email"
                        required
                      />
                      <FieldDescription>
                        Gunakan alamat email aktif milik pengguna.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <div className="flex items-center gap-2">
                        <IconKey
                          className="size-4 text-muted-foreground"
                          stroke={1.5}
                          aria-hidden="true"
                        />
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        placeholder={
                          isEditing ?
                            "Biarkan kosong jika tidak diubah"
                          : "Minimal 8 karakter"
                        }
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required={!isEditing}
                      />
                      <FieldDescription>
                        {isEditing ?
                          "Isi hanya jika Anda ingin mengganti password."
                        : "Buat password sementara yang aman untuk pengguna."}
                      </FieldDescription>
                    </Field>

                    <Field>
                      <div className="flex items-center gap-2">
                        <IconShieldLock
                          className="size-4 text-muted-foreground"
                          stroke={1.5}
                          aria-hidden="true"
                        />
                        <FieldLabel htmlFor="role">Role</FieldLabel>
                      </div>
                      <Select
                        name="role"
                        items={roleItems}
                        defaultValue={user?.role}
                        disabled={isRoleLoading || isRoleError}
                      >
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue
                            placeholder={
                              isRoleLoading ? "Memuat role..." : "Pilih role"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Role tersedia</SelectLabel>
                            {roleItems.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {isRoleError ?
                          "Role gagal dimuat. Muat ulang halaman untuk mencoba lagi."
                        : "Role menentukan fitur dan data yang dapat diakses."}
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </CardContent>

              <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || isRoleLoading || isRoleError}
                  className="w-full transition-[transform] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] sm:w-auto"
                >
                  {isPending ?
                    <IconLoader2
                      data-icon="inline-start"
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  : <IconDeviceFloppy
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                  }
                  {isPending ?
                    "Menyimpan..."
                  : isEditing ?
                    "Simpan perubahan"
                  : "Buat pengguna"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom-4 animation-duration-[800ms] fill-mode-[both] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-20">
          <CardHeader>
            <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
              <IconShieldLock
                className="size-5"
                stroke={1.5}
                aria-hidden="true"
              />
            </span>
            <CardTitle>Akses yang terukur</CardTitle>
            <CardDescription>
              Pastikan setiap akun mendapat akses sesuai tanggung jawabnya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex gap-3">
                <span className="mt-0.5 font-mono text-xs text-primary">
                  01
                </span>
                <span className="text-muted-foreground">
                  Gunakan identitas yang mudah dikenali oleh admin.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 font-mono text-xs text-primary">
                  02
                </span>
                <span className="text-muted-foreground">
                  Pilih role dengan hak akses paling minimum yang diperlukan.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 font-mono text-xs text-primary">
                  03
                </span>
                <span className="text-muted-foreground">
                  Minta pengguna mengganti password sementara setelah login.
                </span>
              </li>
            </ul>
          </CardContent>
          {isEditing && user && (
            <CardFooter className="border-t">
              <p className="font-mono text-[11px] text-muted-foreground">
                USER ID · {user.id}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
