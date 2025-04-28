import Image from "next/image";
import React from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { PageContainer } from "~/components/layout/PageContainer";
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
} from "react-icons/io5";

const DocsPage = () => {
  const sections = [
    {
      title: "Memulai",
      icon: <IoPlayOutline className="text-primary text-xl" />,
      content: [
        "Pengenalan WarungKu",
        "Persyaratan Sistem",
        "Tampilan Antarmuka",
      ],
    },
    {
      title: "Autentikasi",
      icon: <IoPersonOutline className="text-primary text-xl" />,
      content: [
        "Registrasi Akun Baru",
        "Login ke Sistem",
        "Multifactor Authentication",
        "Reset Password",
        "Keluar dari Sistem",
      ],
    },
    {
      title: "Manajemen Warung",
      icon: <IoStorefrontOutline className="text-primary text-xl" />,
      content: [
        "Membuat Warung Baru",
        "Mengelola Data Warung",
        "Multi Warung",
        "Hapus Warung",
      ],
    },
    {
      title: "Manajemen Produk",
      icon: <IoListOutline className="text-primary text-xl" />,
      content: [
        "Menambahkan Produk Baru",
        "Kategori Produk",
        "Stok dan Harga",
        "Promo dan Diskon",
      ],
    },
    {
      title: "Transaksi",
      icon: <IoCartOutline className="text-primary text-xl" />,
      content: [
        "Membuat Transaksi Baru",
        "Struk Pembayaran",
        "Riwayat Transaksi",
        "Retur Produk",
      ],
    },
    {
      title: "Laporan",
      icon: <IoCashOutline className="text-primary text-xl" />,
      content: [
        "Laporan Harian",
        "Laporan Bulanan",
        "Laporan Produk Terlaris",
        "Ekspor Data",
      ],
    },

    {
      title: "Bantuan",
      icon: <IoHelpCircleOutline className="text-primary text-xl" />,
      content: ["FAQ", "Hubungi Support", "Kebijakan Privasi"],
    },
  ];

  return (
    <PageContainer
      metaTitle="Warungku Docs"
      withFooter={true}
      withHeader={false}
    >
      <DashboardLayout>
        <div className="space-y-6 px-4 py-8 md:space-y-8 md:px-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Image
              src="/warungku-notext.png"
              alt="logo"
              width={60}
              height={60}
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold md:text-3xl">
                WarungKu Documentation
              </h1>
              <p className="text-muted-foreground text-sm">
                Panduan lengkap untuk menggunakan Pos WarungKu
              </p>
            </div>
          </div>

          {/* Pengenalan */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Apa itu WarungKu?</h2>
            <p className="text-muted-foreground mb-4">
              WarungKu adalah aplikasi Point of Sale (POS) yang dirancang khusus
              untuk UMKM dan warung kecil. Dengan aplikasi ini, Anda dapat
              dengan mudah mengelola:
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6">
              <li>Data warung/usaha Anda</li>
              <li>Katalog produk dengan kategori</li>
              <li>Stok dan harga produk</li>
              <li>Transaksi penjualan harian</li>
              <li>Laporan keuangan</li>
            </ul>
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

          {/* Getting Started Section */}
          <Card className="mt-8 p-6">
            <h2 className="mb-4 text-xl font-semibold">Langkah Awal</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Registrasi Akun</h3>
                  <p className="text-muted-foreground text-sm">
                    Buat akun baru dengan mengisi formulir registrasi. Anda akan
                    menerima email verifikasi.
                  </p>
                </div>
              </div>
              {/* ... rest of the steps ... */}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </PageContainer>
  );
};

export default DocsPage;
