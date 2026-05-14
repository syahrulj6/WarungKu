import Image from "next/image";
import React from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { Card } from "~/components/ui/card";
import { SectionCard } from "../components/SectionCard";
import {
  IoPlayOutline,
  IoStorefrontOutline,
  IoListOutline,
  IoPersonOutline,
  IoCartOutline,
  IoCashOutline,
  IoHelpCircleOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";

const DocsPage = () => {
  const sections = [
    {
      title: "Memulai",
      icon: <IoPlayOutline className="text-primary text-xl" />,
      content: [
        "Pengenalan Kasirium",
        "Persyaratan Sistem",
        "Tampilan Antarmuka",
      ],
    },
    {
      title: "Autentikasi",
      icon: <IoPersonOutline className="text-primary text-xl" />,
      content: [
        "Registrasi dan verifikasi email",
        "Login aman ke dashboard",
        "Reset password jika lupa",
        "Keluar dari akun",
      ],
    },
    {
      title: "Manajemen Kasirium",
      icon: <IoStorefrontOutline className="text-primary text-xl" />,
      content: [
        "Buat data usaha pertama",
        "Atur profil usaha",
        "Kelola banyak outlet/usaha",
        "Nonaktifkan usaha yang tidak dipakai",
      ],
    },
    {
      title: "Manajemen Produk",
      icon: <IoListOutline className="text-primary text-xl" />,
      content: [
        "Tambah kategori sebelum input produk",
        "Input produk, harga, dan stok awal",
        "Atur diskon atau promo",
        "Pantau produk yang hampir habis",
      ],
    },
    {
      title: "Transaksi",
      icon: <IoCartOutline className="text-primary text-xl" />,
      content: [
        "Buat transaksi penjualan",
        "Pilih metode pembayaran",
        "Cetak atau simpan struk",
        "Cek riwayat transaksi",
      ],
    },
    {
      title: "Laporan",
      icon: <IoCashOutline className="text-primary text-xl" />,
      content: [
        "Review ringkasan penjualan harian",
        "Analisis produk dan kategori terlaris",
        "Pantau diskon dan pajak",
        "Ekspor data untuk pembukuan",
      ],
    },

    {
      title: "Bantuan",
      icon: <IoHelpCircleOutline className="text-primary text-xl" />,
      content: ["FAQ penggunaan", "Panduan troubleshooting", "Kebijakan privasi"],
    },
  ];

  const quickStart = [
    {
      title: "Registrasi dan Login",
      description:
        "Buat akun, verifikasi email, lalu masuk ke dashboard untuk mulai setup usaha.",
    },
    {
      title: "Buat Usaha/Kasir",
      description:
        "Isi nama usaha, alamat, dan informasi penting agar data transaksi tercatat rapi.",
    },
    {
      title: "Siapkan Kategori",
      description:
        "Buat kategori seperti Makanan, Minuman, atau Sembako sebelum menambah produk.",
    },
    {
      title: "Tambah Produk",
      description:
        "Masukkan nama produk, harga jual, stok awal, dan kategori yang sesuai.",
    },
    {
      title: "Mulai Transaksi",
      description:
        "Gunakan halaman kasir untuk checkout, pilih metode bayar, dan terbitkan struk.",
    },
    {
      title: "Cek Laporan Harian",
      description:
        "Tutup hari dengan mengecek omzet, produk terlaris, serta transaksi yang perlu ditinjau.",
    },
  ];

  const dailyWorkflow = [
    {
      icon: <IoFlashOutline className="text-primary mt-0.5 text-xl" />,
      title: "Sebelum Buka Toko",
      points: [
        "Pastikan stok produk utama sudah terisi.",
        "Perbarui harga atau promo jika ada perubahan.",
        "Cek koneksi internet dan perangkat kasir.",
      ],
    },
    {
      icon: <IoCartOutline className="text-primary mt-0.5 text-xl" />,
      title: "Saat Jam Operasional",
      points: [
        "Input semua penjualan langsung dari menu transaksi.",
        "Pilih metode pembayaran sesuai pembayaran pelanggan.",
        "Simpan struk untuk memudahkan pengecekan jika ada komplain.",
      ],
    },
    {
      icon: <IoCheckmarkCircleOutline className="text-primary mt-0.5 text-xl" />,
      title: "Saat Tutup Toko",
      points: [
        "Bandingkan uang fisik dengan total transaksi kas.",
        "Cek laporan harian untuk melihat selisih atau anomali.",
        "Catat produk yang perlu restock untuk esok hari.",
      ],
    },
  ];

  const bestPractices = [
    "Selalu buat kategori dulu sebelum input banyak produk agar manajemen lebih cepat.",
    "Gunakan nama produk yang konsisten supaya laporan mudah dibaca.",
    "Lakukan audit stok rutin minimal 1 kali seminggu.",
    "Review laporan diskon dan pajak tiap akhir minggu.",
  ];

  const commonMistakes = [
    "Produk tidak diberi kategori, sehingga laporan kategori kurang akurat.",
    "Harga diubah saat transaksi tanpa update data produk.",
    "Menunda input transaksi, menyebabkan angka kas dan sistem tidak sinkron.",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 py-8 md:space-y-8 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Image src="/warungku-notext.png" alt="logo" width={60} height={60} />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold md:text-3xl">
              Kasirium Documentation
            </h1>
            <p className="text-muted-foreground text-sm">
              Panduan praktis agar Anda bisa menjalankan POS dengan cepat dan rapi
            </p>
          </div>
        </div>

        {/* Pengenalan */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Apa itu Kasirium?</h2>
          <p className="text-muted-foreground mb-4">
            Kasirium adalah aplikasi Point of Sale (POS) yang dirancang khusus
            untuk UMKM dan usaha kecil. Dengan aplikasi ini, Anda dapat dengan
            mudah mengelola:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>Data usaha Anda</li>
            <li>Katalog produk dengan kategori</li>
            <li>Stok dan harga produk</li>
            <li>Transaksi penjualan harian</li>
            <li>Laporan keuangan</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Quick Start (10 Menit)</h2>
          <div className="space-y-4">
            {quickStart.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Daftar Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sections.map((section, index) => (
            <SectionCard
              key={index}
              icon={section.icon}
              title={section.title}
              content={section.content}
            />
          ))}
        </div>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Alur Pemakaian Harian yang Disarankan
          </h2>
          <div className="space-y-6">
            {dailyWorkflow.map((flow) => (
              <div key={flow.title} className="flex items-start gap-3">
                {flow.icon}
                <div>
                  <h3 className="font-medium">{flow.title}</h3>
                  <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
                    {flow.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Praktik Terbaik</h2>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6 text-sm">
              {bestPractices.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <IoAlertCircleOutline className="text-primary text-xl" />
              <h2 className="text-xl font-semibold">Kesalahan yang Sering Terjadi</h2>
            </div>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6 text-sm">
              {commonMistakes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="mb-3 text-xl font-semibold">Checklist Mingguan</h2>
          <p className="text-muted-foreground text-sm">
            Gunakan checklist ini supaya data tetap bersih dan laporan makin akurat.
          </p>
          <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-6 text-sm">
            <li>Audit stok fisik dan cocokkan dengan sistem.</li>
            <li>Evaluasi 5 produk terlaris dan 5 produk paling lambat.</li>
            <li>Tinjau histori diskon agar margin tetap sehat.</li>
            <li>Ekspor laporan untuk arsip pembukuan.</li>
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="mb-3 text-xl font-semibold">Butuh Bantuan Cepat?</h2>
          <p className="text-muted-foreground text-sm">
            Mulai dari menu dokumentasi sesuai masalah Anda: akun, produk, transaksi,
            atau laporan. Jika ada error, cek riwayat aktivitas terakhir agar proses
            troubleshooting lebih cepat.
          </p>
        </Card>
        <div className="h-2" />
      </div>
    </DashboardLayout>
  );
};

export default DocsPage;


