import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PageContainer } from "~/components/layout/PageContainer";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { type AuthFormSchema, authFormSchema } from "../forms/auth";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { LoginFormInner } from "../components/LoginFormInner";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";


const LoginPage = () => {
  const form = useForm<AuthFormSchema>({
    resolver: zodResolver(authFormSchema),
  });
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const router = useRouter();
  const { mutateAsync: loginUser, isPending: loginUserIsPending } =
    api.auth.login.useMutation();
  const { mutateAsync: resendVerificationEmail, isPending: resendIsPending } =
    api.auth.resendVerificationEmail.useMutation();

  const handleLoginSubmit = async (values: AuthFormSchema) => {
    try {
      const result = await loginUser(values);
      setUnverifiedEmail(null);

      if (result.mfaRequired) {
        await router.replace("/verify-mfa");
      } else {
        await router.replace("/dashboard/kasir");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message.includes("Email atau password salah")) {
        form.setError("email", { message: "Email atau password salah" });
        form.setError("password", { message: "Email atau password salah" });
        return;
      }

      if (message.includes("Akun belum terverifikasi")) {
        setUnverifiedEmail(values.email);
        toast.error("Email belum diverifikasi", {
          description:
            "Klik tombol kirim ulang verifikasi di bawah form login.",
        });
        return;
      }

      toast.error(message || "Terjadi kesalahan, silakan coba lagi");
    }
  };

  const handleResendVerification = async () => {
    const email = unverifiedEmail ?? form.getValues("email");

    if (!email) {
      toast.error("Isi email terlebih dahulu");
      return;
    }

    try {
      const result = await resendVerificationEmail({ email });
      if (result.emailSent) {
        toast.success("Link verifikasi berhasil dikirim", {
          description: "Silakan cek inbox atau folder spam email Anda.",
        });
      } else {
        toast.message("Permintaan diproses", {
          description:
            "Jika akun belum aktif, link verifikasi akan dikirim ke email Anda.",
        });
      }
    } catch {
      toast.error("Gagal mengirim ulang verifikasi");
    }
  };

  // Array of image paths
  const images = [
    "/assets/image1.jpg",
    "/assets/image2.jpg",
    "/assets/image3.jpg",
  ];

  return (
    <>
      <PageContainer
        metaTitle="Login"
        metaDescription="Aplikasi POS modern untuk Kasirium Anda. Login untuk mengelola transaksi, stok, dan laporan penjualan."
        pathname="/login"
        withHeader={false}
        withFooter={false}
      >
        <div className="relative">
          <div className="absolute top-12 left-6 md:top-14 md:left-14">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft />
                Kembali
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex min-h-screen">
          {/* Left Section - Login Form */}
          <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-24">
            <div className="-ml-4 flex items-center">
              <div className="relative h-14 w-14">
                <Image
                  src="/warungku-notext.png"
                  alt="Kasirium Logo"
                  fill
                  sizes="80px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold">Kasirium</span>
            </div>

            <h1 className="mt-8 mb-2 text-3xl font-bold">
              Selamat Datang Kembali
            </h1>
            <p className="text-muted-foreground mb-8">
              Aplikasi Kasir Modern untuk Kasirium Anda
            </p>

            <Form {...form}>
              <LoginFormInner
                onLoginSubmit={handleLoginSubmit}
                isLoading={loginUserIsPending}
                buttonText="Masuk"
                showPassword={true}
              />
            </Form>

            {/* OAuth providers removed - Google OAuth disabled */}

            {unverifiedEmail && (
              <div className="bg-primary/10 border-primary/30 mt-4 rounded-lg border p-4">
                <p className="text-sm font-medium">Email belum diverifikasi</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Kami kirim ulang link verifikasi ke <b>{unverifiedEmail}</b>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendIsPending}
                  >
                    {resendIsPending
                      ? "Mengirim..."
                      : "Kirim Ulang Link Verifikasi"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="https://mail.google.com" target="_blank">
                      Buka Inbox
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-sm">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-primary font-bold hover:underline"
              >Daftar</Link>
            </p>
          </div>

          {/* Right Section - Image Swiper */}
          <div className="relative hidden w-1/2 md:flex">
            {isClient ? (
              <Swiper
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                modules={[Autoplay, Pagination, Navigation]}
                className="h-full w-full"
              >
                {images.map((src, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative h-full w-full">
                      <Image
                        src={src}
                        alt={`Login Background ${index + 1}`}
                        fill
                        sizes="50vw"
                        className="object-cover"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#D3E671]/20 to-[#0D4715]/20" />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={images[0] ?? "/assets/image1.jpg"}
                  alt="Login Background"
                  fill
                  sizes="50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#D3E671]/20 to-[#0D4715]/20" />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default LoginPage;




