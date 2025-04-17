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
import { RegisterFormInner } from "../components/RegisterFormInner";
import { type AuthFormSchema, authFormSchema } from "../forms/auth";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { GuestRoute } from "~/components/layout/GuestRoute";

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

  return (
    <GuestRoute>
      <PageContainer
        metaTitle="Daftar Akun"
        metaDescription="Daftarkan akun staff baru untuk mengakses sistem POS WarungKu"
        pathname="/register"
      >
        <SectionContainer
          padded
          className="mt-20 mb-4 flex min-h-[calc(100vh-144px)] flex-col justify-center md:mb-0"
        >
          <Card className="w-full max-w-[480px] self-center">
            <CardHeader className="flex flex-col items-center justify-center space-y-2">
              <h1 className="text-primary text-center text-2xl font-bold md:text-3xl">
                Buat Akun
              </h1>
              <p className="text-muted-foreground text-center text-sm">
                Untuk pemilik warung: daftarkan akun staff Anda
              </p>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <RegisterFormInner
                  isLoading={registerUserIsPending}
                  onRegisterSubmit={handleRegisterSubmit}
                  showPassword={true}
                />
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between gap-x-4">
                <div className="bg-border h-[1px] w-full" />
                <p className="text-muted-foreground flex-1 text-center text-sm text-nowrap">
                  Atau daftar dengan
                </p>
                <div className="bg-border h-[1px] w-full" />
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                size="lg"
                type="button"
              >
                <FcGoogle className="text-lg" />
                Google
              </Button>

              <p className="text-center text-sm">
                Sudah memiliki akun?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold transition-all hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>

              <p className="text-muted-foreground text-center text-xs">
                Dengan mendaftar, Anda menyetujui Syarat dan Ketentuan kami
              </p>
            </CardFooter>
          </Card>
        </SectionContainer>
      </PageContainer>
    </GuestRoute>
  );
};

export default RegisterPage;
