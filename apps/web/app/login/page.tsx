import type { Metadata } from "next"
import { IconDoorEnter } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Masuk | Roomly",
  description: "Masuk ke akun Roomly Anda.",
}

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
  )
}

export default function LoginPage() {
  return (
    <main className="grid min-h-svh bg-muted/40 lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col xl:p-14">
        <div className="relative z-10 flex h-full flex-col">
          <BrandMark />

          <div className="my-auto max-w-xl py-16">
            <p className="mb-5 text-sm font-medium text-primary">
              Reservasi hotel
            </p>
            <h2 className="font-heading text-5xl leading-[1.05] font-semibold tracking-tight xl:text-6xl">
              Temukan dan kelola reservasi hotel Anda.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-background/65">
              Masuk untuk melihat pesanan kamar, riwayat menginap, dan penawaran terbaik di Roomly.
            </p>
          </div>

          <div className="flex items-end justify-between gap-8 border-t border-background/15 pt-6 text-sm text-background/55">
            <p>Roomly Hotel & Stays</p>
            <p>Pemesanan kamar jadi lebih mudah</p>
          </div>
        </div>

        <div
          className="absolute -right-28 bottom-24 size-80 rotate-12 rounded-[4rem] border border-background/10"
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
              Gunakan email dan kata sandi yang terdaftar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* ponytail: auth backend belum tersedia; submit saat ini memvalidasi browser native lalu POST ke route sendiri */}
            <form method="post">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="h-11"
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
                    required
                  />
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
  )
}
