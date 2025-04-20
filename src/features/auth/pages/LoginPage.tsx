import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PageContainer } from "~/components/layout/PageContainer";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { type AuthFormSchema, authFormSchema } from "../forms/auth";
import { toast } from "sonner";
import { supabase } from "~/lib/supabase/client";
import { type AuthError } from "@supabase/supabase-js";
import { SupabaseAuthErrorCode } from "~/lib/supabase/authErrorCodes";
import { useRouter } from "next/router";
import { LoginFormInner } from "../components/LoginFormInner";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const form = useForm<AuthFormSchema>({
    resolver: zodResolver(authFormSchema),
  });

  const router = useRouter();

  const handleLoginSubmit = async (values: AuthFormSchema) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      await router.replace("/dashboard");
    } catch (error) {
      switch ((error as AuthError).code) {
        case SupabaseAuthErrorCode.invalid_credentials:
          form.setError("email", { message: "Email atau password salah" });
          form.setError("password", { message: "Email atau password salah" });
          break;
        case SupabaseAuthErrorCode.email_not_confirmed:
          form.setError("email", { message: "Email belum diverifikasi" });
          break;
        default:
          toast.error("Terjadi kesalahan, silakan coba lagi");
      }
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
        metaDescription="Aplikasi POS modern untuk warung Anda. Login untuk mengelola transaksi, stok, dan laporan penjualan."
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
                  alt="WarungKu Logo"
                  fill
                  sizes="80px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold">WarungKu</span>
            </div>

            <h1 className="mt-8 mb-2 text-3xl font-bold">
              Selamat Bekerja! 🏪
            </h1>
            <p className="text-muted-foreground mb-8">
              Aplikasi Kasir Modern untuk Warung Anda
            </p>

            <Form {...form}>
              <LoginFormInner
                onLoginSubmit={handleLoginSubmit}
                buttonText="Sign In"
              />
            </Form>

            <p className="mt-6 text-center text-sm">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-primary font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Right Section - Image Swiper */}
          <div className="relative hidden w-1/2 md:flex">
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
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default LoginPage;
