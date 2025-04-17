import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { PageContainer } from "~/components/layout/PageContainer";
import { SectionContainer } from "~/components/layout/SectionContainer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { type AuthFormSchema, authFormSchema } from "../forms/auth";
import { toast } from "sonner";
import { supabase } from "~/lib/supabase/client";
import { type AuthError } from "@supabase/supabase-js";
import { SupabaseAuthErrorCode } from "~/lib/supabase/authErrorCodes";
import { useRouter } from "next/router";
import { GuestRoute } from "~/components/layout/GuestRoute";
import { LoginFormInner } from "../components/LoginFormInner";

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

  return (
    <GuestRoute>
      <PageContainer
        metaTitle="Login"
        metaDescription="Aplikasi POS modern untuk warung Anda. Login untuk mengelola transaksi, stok, dan laporan penjualan."
        pathname="/login"
      >
        <SectionContainer
          padded
          className="mt-20 mb-4 flex min-h-[calc(100vh-144px)] w-full flex-col justify-center md:mt-20 md:mb-0"
        >
          <Card className="w-full max-w-[480px] self-center">
            <CardHeader className="flex flex-col items-center justify-center">
              <h1 className="text-primary text-center text-2xl font-bold md:text-3xl">
                Selamat Bekerja! 🏪
              </h1>
              <p className="text-muted-foreground text-sm">
                Aplikasi Kasir Modern untuk Warung Anda
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <LoginFormInner
                  onLoginSubmit={handleLoginSubmit}
                  buttonText="Masuk ke Dashboard"
                />
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between gap-x-4">
                <div className="h-[2px] w-full border-t-2" />
                <p className="text-muted-foreground flex-1 text-sm text-nowrap">
                  Atau masuk dengan
                </p>
                <div className="h-[2px] w-full border-t-2" />
              </div>

              <Button variant="secondary" className="w-full" size="lg">
                <FcGoogle />
                Masuk dengan Akun Google
              </Button>

              <p className="text-center text-xs">
                Belum memiliki akses?{" "}
                <Link
                  href="/register"
                  className="text-primary font-bold transition-all hover:underline"
                >
                  Buat akun (Owner)
                </Link>{" "}
                / Minta akun ke pemilik warung
              </p>
              <p className="text-muted-foreground text-center text-xs">
                Hanya untuk staf warung terdaftar
              </p>
            </CardFooter>
          </Card>
        </SectionContainer>
      </PageContainer>
    </GuestRoute>
  );
};

export default LoginPage;
