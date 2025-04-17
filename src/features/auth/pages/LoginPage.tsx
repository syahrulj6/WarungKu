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

      await router.replace("/");
    } catch (error) {
      switch ((error as AuthError).code) {
        case SupabaseAuthErrorCode.invalid_credentials:
          form.setError("email", { message: "Email atau password salah" });
          form.setError("password", {
            message: "Email atau password salah",
          });
          break;
        case SupabaseAuthErrorCode.email_not_confirmed:
          form.setError("email", { message: "Email belum diverifikasi" });
          break;
        default:
          toast.error("Sebuah kesalahan terjadi, coba lagi beberapa saat.");
      }
    }
  };

  return (
    <GuestRoute>
      <PageContainer>
        <SectionContainer
          padded
          className="mb-4 mt-20 flex min-h-[calc(100vh-144px)] w-full flex-col justify-center md:mb-0 md:mt-20"
        >
          <Card className="w-full max-w-[480px] self-center">
            <CardHeader className="flex flex-col items-center justify-center">
              <h1 className="text-center text-2xl font-bold text-primary md:text-3xl">
                Selamat Datang Kembali 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                Qepoin kreator favorite kamu
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <LoginFormInner
                  // isLoading={registerUserIsPending}
                  onLoginSubmit={handleLoginSubmit}
                  buttonText="Masuk"
                />
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between gap-x-4">
                <div className="h-[2px] w-full border-t-2" />
                <p className="flex-1 text-nowrap text-sm text-muted-foreground">
                  Atau lanjut dengan
                </p>
                <div className="h-[2px] w-full border-t-2" />
              </div>

              <Button variant="secondary" className="w-full" size="lg">
                <FcGoogle />
                Masuk dengan Google
              </Button>

              <p>
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="font-bold text-primary transition-all hover:underline"
                >
                  Daftar dong
                </Link>
              </p>
            </CardFooter>
          </Card>
        </SectionContainer>
      </PageContainer>
    </GuestRoute>
  );
};

export default LoginPage;
