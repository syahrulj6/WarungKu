import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { PageContainer } from "~/components/layout/PageContainer";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { type AuthFormSchema, authFormSchema } from "../forms/auth";
import { toast } from "sonner";
import { GuestRoute } from "~/components/layout/GuestRoute";
import { RegisterFormInner } from "../components/RegisterFormInner";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { api } from "~/utils/api";

const RegisterPage = () => {
  const form = useForm<AuthFormSchema>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: registerUser, isPending: registerUserIsPending } =
    api.auth.register.useMutation({
      onSuccess: () => {
        toast.success("Akun berhasil dibuat!", {
          description:
            "Silakan login menggunakan email dan password yang telah didaftarkan",
        });
        form.reset();
      },
      onError: (error) => {
        toast.error("Pendaftaran gagal", {
          description: error.message || "Silakan coba beberapa saat lagi",
        });
      },
    });

  const handleRegisterSubmit = (values: AuthFormSchema) => {
    registerUser(values);
  };

  const images = [
    "/assets/image1.jpg",
    "/assets/image2.jpg",
    "/assets/image3.jpg",
  ];

  return (
    <GuestRoute>
      <PageContainer
        metaTitle="Daftar Akun"
        metaDescription="Daftarkan akun staff baru untuk mengakses sistem POS WarungKu"
        pathname="/register"
        withHeader={false}
        withFooter={false}
      >
        <div className="relative">
          <div className="absolute top-8 left-6 z-10 md:top-10 md:left-14">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft />
                Kembali
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex min-h-screen">
          {/* Left Section - Register Form */}
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

            <h1 className="mb-2 text-2xl font-bold">Daftar Akun Baru</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Aplikasi Kasir Modern untuk Warung Anda
            </p>

            <Form {...form}>
              <RegisterFormInner
                isLoading={registerUserIsPending}
                onRegisterSubmit={handleRegisterSubmit}
                showPassword={true}
                buttonText="Daftar"
              />
            </Form>

            <div className="mt-6 flex w-full items-center justify-between gap-x-4">
              <div className="bg-border h-[1px] w-full" />
              <p className="text-muted-foreground flex-1 text-center text-sm text-nowrap">
                Atau daftar dengan
              </p>
              <div className="bg-border h-[1px] w-full" />
            </div>

            <Button
              variant="outline"
              className="mt-4 w-full gap-2"
              size="lg"
              type="button"
            >
              <FcGoogle className="text-lg" />
              Google
            </Button>

            <p className="mt-6 text-center text-sm">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline"
              >
                Masuk di sini
              </Link>
            </p>

            <p className="text-muted-foreground mt-2 text-center text-xs">
              Dengan mendaftar, Anda menyetujui{" "}
              <button className="hover:text-foreground underline transition-colors hover:cursor-pointer">
                Syarat dan Ketentuan
              </button>{" "}
              kami
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
                      alt={`Register Background ${index + 1}`}
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
    </GuestRoute>
  );
};

export default RegisterPage;
