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
  FieldError,
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
import { toast } from "@/components/ui/toast";
import { useRoles } from "@/features/roles/use-roles";
import { UserFormSkeleton } from "@/features/users/components/user-form-skeleton";
import {
  userCreateSchema,
  UserFormErrors,
  userUpdateSchema,
} from "@/features/users/schema";
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
import isError from "next/dist/lib/is-error";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";
import { z } from "zod";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [errors, setErrors] = useState<UserFormErrors>({});
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
    const onSuccess = router.back;
    const result = (isEditing ? userUpdateSchema : userCreateSchema).safeParse(
      Object.fromEntries(formData),
    );

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setErrors({});

    if (isEditing) {
      const payload = result.data as UserUpdatePayload;
      toast.promise(
        updateUser.mutateAsync({ id: userId, payload }, { onSuccess }),
        {
          loading: "Updating user…",
          success: `${payload.username} updated.`,
          error: "Could not update user.",
        },
      );
      return;
    }

    const payload = result.data as UserCreatePayload;
    toast.promise(createUser.mutateAsync(payload, { onSuccess }), {
      loading: "Creating user…",
      success: `${payload.username} created.`,
      error: "Could not create user.",
    });
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
          <Button onClick={router.back} nativeButton={false}>
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
            <form onSubmit={handleSubmit} noValidate>
              <CardHeader>
                <CardTitle>Detail akun</CardTitle>
                <CardDescription>
                  Informasi ini digunakan untuk login dan pengelolaan akses.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <FieldSet className="my-6">
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
                        aria-invalid={!!errors.username}
                      />
                      {errors.username ?
                        <FieldError>{errors.username[0]}</FieldError>
                      : <FieldDescription>
                          Minimal 3 karakter; gunakan huruf, angka, titik, atau
                          garis bawah.
                        </FieldDescription>
                      }
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
                      />
                      {errors.email ?
                        <FieldError>{errors.email[0]}</FieldError>
                      : <FieldDescription>
                          Gunakan alamat email aktif milik pengguna.
                        </FieldDescription>
                      }
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
                      />
                      {errors.password ?
                        <FieldError>{errors.password[0]}</FieldError>
                      : <FieldDescription>
                          {isEditing ?
                            "Isi hanya jika Anda ingin mengganti password."
                          : "Buat password sementara yang aman untuk pengguna."}
                        </FieldDescription>
                      }
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
                      {errors.role ?
                        <FieldError>{errors.role[0]}</FieldError>
                      : <FieldDescription>
                          {isRoleError ?
                            "Role gagal dimuat. Muat ulang halaman untuk mencoba lagi."
                          : "Role menentukan fitur dan data yang dapat diakses."
                          }
                        </FieldDescription>
                      }
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
                  className="w-full transition-[transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] sm:w-auto"
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
