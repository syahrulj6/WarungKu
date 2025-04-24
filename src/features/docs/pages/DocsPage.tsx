import Image from "next/image";
import React from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { PageContainer } from "~/components/layout/PageContainer";
import { Card } from "~/components/ui/card";
import {
  IoPlayOutline,
  IoStorefrontOutline,
  IoListOutline,
  IoPersonOutline,
  IoCartOutline,
  IoCashOutline,
  IoSettingsOutline,
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
              <Card
                key={index}
                className="p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 mt-1 rounded-md p-2">
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-3 text-xl font-semibold">
                      {section.title}
                    </h2>
                    <ul className="text-muted-foreground space-y-2">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
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
              <div className="flex gap-4">
                <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Login ke Dashboard</h3>
                  <p className="text-muted-foreground text-sm">
                    Setelah verifikasi, login menggunakan email dan password
                    yang telah didaftarkan.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Buat Warung Pertama</h3>
                  <p className="text-muted-foreground text-sm">
                    Isi data warung Anda seperti nama, alamat, dan informasi
                    kontak.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Tambahkan Produk</h3>
                  <p className="text-muted-foreground text-sm">
                    Mulai tambahkan produk-produk yang dijual di warung Anda
                    beserta harga dan stok.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </PageContainer>
  );
};

export default DocsPage;
