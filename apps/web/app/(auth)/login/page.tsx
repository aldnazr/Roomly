"use client";

import { IconDoorEnter } from "@tabler/icons-react";
import { type AxiosError } from "axios";
import { type SubmitEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function BrandMark() {
  return (
    <div className="flex items-center gap-3" aria-label="Roomly">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <IconDoorEnter aria-hidden="true" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        Roomly
      </span>
    </div>
  );
}

// function getErrorMessage(error: AxiosError<ApiError>) {
//   if (!error.response) {
//     return "Tidak dapat terhubung ke server. Coba lagi beberapa saat.";
//   }
//   if (error.response.status === 401) {
//     return "Email atau kata sandi tidak sesuai.";
//   }
//   return (
//     error.response.data.error?.message ?? "Login gagal. Silakan coba lagi."
//   );
// }

export default function LoginPage() {
  const [error, setError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result.error) {
      setError("Username/email atau password salah");
      return;
    }

    router.push("/");
  }

  return (
    <main className="grid min-h-svh bg-muted/40 lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      {/* ponytail: scoped dark mode for hero panel; add theme-specific imagery when marketing assets ready */}
      <section className="dark relative hidden min-h-svh overflow-hidden border-r border-border bg-background p-10 text-foreground lg:flex lg:flex-col xl:p-14">
        <div className="relative z-10 flex h-full flex-col">
          <BrandMark />

          <div className="my-auto max-w-xl py-16">
            <p className="mb-5 text-sm font-medium text-primary">
              Reservasi hotel
            </p>
            <h2 className="font-heading text-5xl leading-[1.05] font-semibold tracking-tight xl:text-6xl">
              Temukan dan kelola reservasi hotel Anda.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
              Masuk untuk melihat pesanan kamar, riwayat menginap, dan penawaran
              terbaik di Roomly.
            </p>
          </div>

          <div className="flex items-end justify-between gap-8 border-t border-border pt-6 text-sm text-muted-foreground">
            <p>Roomly Hotel & Stays</p>
            <p>Pemesanan kamar jadi lebih mudah</p>
          </div>
        </div>

        <div
          className="absolute -right-28 bottom-24 size-80 rotate-12 rounded-[4rem] border border-border"
          aria-hidden="true"
        />
        <div
          className="absolute right-12 -bottom-20 h-52 w-28 rotate-12 bg-primary"
          aria-hidden="true"
        />
      </section>

      <section className="flex min-h-svh flex-col px-4 py-6 sm:px-8 sm:py-10 lg:justify-center lg:px-12 xl:px-20">
        <div className="mb-10 lg:hidden">
          <BrandMark />
        </div>

        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle role="heading" aria-level={1}>
              Masuk ke akun
            </CardTitle>
            <CardDescription>
              Gunakan username atau email dan kata sandi yang terdaftar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Username atau email</FieldLabel>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="username atau email"
                    className="h-11"
                    ref={usernameRef}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    className="h-11"
                    ref={passwordRef}
                    required
                  />
                </Field>

                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <Field>
                  <Button type="submit" size="lg" className="w-full">
                    "Masuk"
                    <IconDoorEnter data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="border-t">
            <p className="text-sm text-muted-foreground">
              Belum memiliki akun? Daftar untuk mulai memesan hotel.
            </p>
          </CardFooter>
        </Card>

        <p className="mx-auto mt-6 max-w-md text-center text-xs leading-5 text-muted-foreground">
          Dengan masuk, Anda menyetujui syarat dan ketentuan pemesanan Roomly.
        </p>
      </section>
    </main>
  );
}
