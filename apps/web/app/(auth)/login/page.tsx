"use client";

import { IconDoorEnter } from "@tabler/icons-react";
import { type SubmitEvent, useState } from "react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginFormErrors, loginSchema } from "@/features/auth/scheme";
import { z } from "zod";

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

export default function LoginPage() {
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const router = useRouter();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { data, success, error } = loginSchema.safeParse(
      Object.fromEntries(form),
    );

    if (!success) {
      setErrors(z.flattenError(error).fieldErrors);
      return;
    }
    setErrors({});

    const result = await signIn("credentials", {
      username: data.identifier,
      password: data.password,
      redirect: false,
    });

    if (result.error) {
      setErrors({ identifier: ["Username/email atau password salah"] });
      return;
    }

    router.push("/");
  }

  return (
    <main className="grid min-h-svh bg-muted/40 lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
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
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="identifier">Username/Email</FieldLabel>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan Username/Email"
                    className="h-11"
                  />
                  {errors.identifier && (
                    <FieldError>{errors.identifier[0]}</FieldError>
                  )}
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
                  />
                  {errors.password && (
                    <FieldError>{errors.password[0]}</FieldError>
                  )}
                </Field>

                <Field>
                  <Button type="submit" size="lg" className="w-full">
                    Masuk
                    <IconDoorEnter data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t">
            <p>Atau login sebagai tamu</p>
            <Button variant={"secondary"} size="lg" className="w-full">
              Guest
              <IconDoorEnter data-icon="inline-end" aria-hidden="true" />
            </Button>
          </CardFooter>
        </Card>

        <p className="mx-auto mt-6 max-w-md text-center text-xs leading-5 text-muted-foreground">
          Dengan masuk, Anda menyetujui syarat dan ketentuan pemesanan Roomly.
        </p>
      </section>
    </main>
  );
}
