"use client";

import { IconDoorEnter } from "@tabler/icons-react";
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
import { LoginInput, loginSchema } from "@/features/auth/scheme";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    try {
      const result = await signIn("credentials", {
        username: data.identifier,
        password: data.password,
        redirect: false,
      });

      if (result.error) {
        setError("identifier", {
          message: "Username/email atau password salah",
        });
        return;
      }

      router.push("/");
    } catch {
      setError("root", {
        message: "Tidak dapat terhubung ke server. Coba lagi.",
      });
    }
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
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Field data-invalid={!!errors.identifier}>
                  <FieldLabel htmlFor="identifier">Username/Email</FieldLabel>
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan Username/Email"
                    className="h-11"
                    aria-invalid={!!errors.identifier}
                    aria-describedby={
                      errors.identifier ? "identifier-error" : undefined
                    }
                    {...register("identifier")}
                  />
                  <FieldError id="identifier-error" errors={[errors.identifier]} />
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    className="h-11"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password")}
                  />
                  <FieldError id="password-error" errors={[errors.password]} />
                </Field>

                {errors.root && <FieldError>{errors.root.message}</FieldError>}

                <Field>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ?
                      <Spinner />
                    : <IconDoorEnter />}
                    Masuk
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t">
            <p>Atau login sebagai tamu</p>
            <Button
              variant={"secondary"}
              size="lg"
              className="w-full"
              onClick={() => router.push("/guest")}
            >
              <IconDoorEnter />
              Guest
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
