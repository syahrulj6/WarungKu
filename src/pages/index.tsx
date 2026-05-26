import {
  BadgeCheck,
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  Store,
} from "lucide-react";
import { PageContainer } from "~/components/layout/PageContainer";
import { SectionContainer } from "~/components/layout/SectionContainer";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export default function Home() {
  const fiturItems = [
    {
      title: "Manajemen Produk",
      description: "Kelola produk, kategori, harga, dan stok dari satu tempat.",
      icon: <Store className="h-5 w-5" />,
    },
    {
      title: "Transaksi Cepat",
      description:
        "Proses checkout lebih cepat dengan alur kasir yang sederhana.",
      icon: <ReceiptText className="h-5 w-5" />,
    },
    {
      title: "Laporan Otomatis",
      description:
        "Pantau penjualan, diskon, pajak, dan performa produk secara real-time.",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ];

  const caraKerjaSteps = [
    {
      title: "1. Setup Kasir",
      description: "Buat kasir/outlet Anda, lalu isi profil usaha dasar.",
    },
    {
      title: "2. Input Produk",
      description:
        "Tambahkan kategori dan produk lengkap dengan harga dan stok.",
    },
    {
      title: "3. Mulai Jualan",
      description:
        "Gunakan halaman pesanan untuk transaksi harian dan cetak struk.",
    },
    {
      title: "4. Cek Laporan",
      description: "Lihat ringkasan harian untuk evaluasi omzet dan restock.",
    },
  ];

  const hargaPlans = [
    {
      name: "Starter",
      price: "Rp 0",
      period: "/bulan",
      points: ["1 kasir", "Fitur transaksi dasar", "Laporan harian"],
      cta: "Mulai Gratis",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "Rp 99.000",
      period: "/bulan",
      points: ["Multi kasir", "Laporan lengkap", "Dukungan prioritas"],
      cta: "Pilih Growth",
      highlighted: true,
    },
    {
      name: "Pro",
      price: "Rp 249.000",
      period: "/bulan",
      points: [
        "Semua fitur Growth",
        "Analitik lanjutan",
        "Pendampingan onboarding",
      ],
      cta: "Hubungi Sales",
      highlighted: false,
    },
  ];

  return (
    <PageContainer className="overflow-hidden">
      <SectionContainer
        padded
        className="relative mt-20 mb-8 flex min-h-[calc(100vh-144px)] w-full flex-col items-start justify-center gap-6 py-10 md:mt-20 md:mb-0 md:gap-8 lg:!max-w-screen-xl lg:pr-20 lg:pl-6 xl:pl-0"
      >
        <div className="animate-float-gentle from-primary/20 to-chart-4/20 absolute -top-16 -left-20 h-64 w-64 rounded-full bg-gradient-to-br blur-3xl" />
        <div
          className="animate-float-gentle from-chart-2/20 to-primary/20 absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tl blur-3xl"
          style={{ animationDelay: "0.9s" }}
        />

        <div className="relative w-full max-w-6xl">
          <div
            className="animate-reveal-up bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            POS Modern untuk UMKM
          </div>
          <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h1
                className="animate-reveal-up text-4xl leading-tight font-bold tracking-tight md:text-6xl"
                style={{ animationDelay: "0.2s" }}
              >
                Kelola kasir lebih cepat,{" "}
                <span className="text-primary">rapi, dan profitable.</span>
              </h1>
              <p
                className="text-muted-foreground animate-reveal-up mt-5 max-w-xl text-sm tracking-tight md:text-base"
                style={{ animationDelay: "0.3s" }}
              >
                Dari input produk sampai laporan harian, Kasirium bantu
                operasional usaha Anda jadi lebih praktis dalam satu dashboard.
              </p>

              <div
                className="animate-reveal-up mt-7 flex flex-col gap-3 sm:flex-row"
                style={{ animationDelay: "0.4s" }}
              >
                <Button asChild size="lg" className="sm:min-w-44">
                  <Link href="/login">Coba Gratis</Link>
                </Button>
                {/* <Button size="lg" variant="outline" className="sm:min-w-44">
                  <CirclePlay />
                  Lihat Demo
                </Button> */}
              </div>
            </div>

            <div
              className="animate-reveal-up bg-background/70 border-primary/20 relative rounded-2xl border p-5 shadow-lg backdrop-blur"
              style={{ animationDelay: "0.45s" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium">Ringkasan Hari Ini</p>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">
                  Live
                </span>
              </div>
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Omzet</p>
                  <p className="text-xl font-semibold">Rp 3.450.000</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Transaksi</p>
                  <p className="text-xl font-semibold">47 Pesanan</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">
                    Produk Terlaris
                  </p>
                  <p className="text-xl font-semibold">Es Kopi Gula Aren</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer id="features" padded className="py-16 md:py-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Fitur</h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Semua yang dibutuhkan untuk operasional kasir harian.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {fiturItems.map((fitur, idx) => (
            <Card
              key={fitur.title}
              className="animate-reveal-up group hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              style={{ animationDelay: `${idx * 0.12}s` }}
            >
              <CardHeader>
                <div className="bg-primary/10 text-primary mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  {fitur.icon}
                </div>
                <CardTitle>{fitur.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {fitur.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer id="how-it-works" padded className="py-16 md:py-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Cara Kerja</h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Mulai dari setup sampai laporan dalam 4 langkah.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {caraKerjaSteps.map((step, idx) => (
            <Card
              key={step.title}
              className="animate-reveal-up relative overflow-hidden"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="bg-primary/10 text-primary absolute -top-4 -right-4 flex h-16 w-16 items-end justify-start rounded-bl-3xl pb-2 pl-2 text-lg font-semibold">
                {idx + 1}
              </div>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer id="pricing" padded className="py-16 md:py-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Harga</h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Pilih paket yang sesuai dengan skala usaha Anda.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {hargaPlans.map((plan, idx) => (
            <Card
              key={plan.name}
              className={cn(
                "animate-reveal-up flex flex-col",
                plan.highlighted &&
                  "border-primary relative border-2 shadow-lg",
              )}
              style={{ animationDelay: `${idx * 0.12}s` }}
            >
              {plan.highlighted && (
                <div className="bg-primary text-primary-foreground absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold">
                  Paling Populer
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div>
                  <p className="text-2xl font-bold">{plan.price}</p>
                  <p className="text-muted-foreground text-sm">{plan.period}</p>
                </div>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {plan.points.map((point) => (
                    <li
                      key={point}
                      className="flex list-none items-center gap-2 pl-0"
                    >
                      <BadgeCheck className="text-primary h-4 w-4 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-auto w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href="/login">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </PageContainer>
  );
}
