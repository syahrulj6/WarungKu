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
  });

  const { mutate: registerUser, isPending: registerUserIsPending } =
    api.auth.register.useMutation({
      onSuccess: () => {
        toast("Akun kamu berhasil dibuat!");
        form.setValue("email", "");
        form.setValue("password", "");
      },
      onError: () => {
        toast.error("Ada kesalahan terjadi, coba beberapa saat lagi");
      },
    });

  const handleRegisterSubmit = (values: AuthFormSchema) => {
    registerUser(values);
  };

  return (
    <GuestRoute>
      <PageContainer>
        <SectionContainer
          padded
          className="mt-20 mb-4 flex min-h-[calc(100vh-144px)] flex-col justify-center md:mb-0"
        >
          <Card className="w-full max-w-[480px] self-center">
            <CardHeader className="flex flex-col items-center justify-center">
              <h1 className="text-primary text-center text-2xl font-bold md:text-3xl">
                Buat Akun
              </h1>
              <p className="text-muted-foreground text-sm"></p>
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
                <div className="h-[2px] w-full border-t-2" />
                <p className="text-muted-foreground flex-1 text-sm text-nowrap">
                  Atau lanjut dengan
                </p>
                <div className="h-[2px] w-full border-t-2" />
              </div>

              <Button variant="secondary" className="w-full" size="lg">
                <FcGoogle />
                Buat Akun dengan Google
              </Button>

              <p>
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-primary font-bold transition-all hover:underline"
                >
                  P, Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </SectionContainer>
      </PageContainer>
    </GuestRoute>
  );
};

export default RegisterPage;
