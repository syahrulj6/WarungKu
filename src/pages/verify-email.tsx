import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const VerifyEmailPage = () => {
  const router = useRouter();
  const token = useMemo(() => {
    const raw = router.query.token;
    return typeof raw === "string" ? raw : "";
  }, [router.query.token]);

  const verifyEmail = api.auth.verifyEmail.useMutation();
  const { mutateAsync, isPending, isSuccess, isError, error } = verifyEmail;

  useEffect(() => {
    if (!router.isReady || !token || isPending || isSuccess) {
      return;
    }

    void mutateAsync({ token });
  }, [isPending, isSuccess, mutateAsync, router.isReady, token]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border p-6 text-center">
        {isPending && (
          <>
            <h1 className="text-xl font-semibold">Memverifikasi email...</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Mohon tunggu sebentar.
            </p>
          </>
        )}

        {isSuccess && (
          <>
            <h1 className="text-xl font-semibold">Email berhasil diverifikasi</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Akun Anda sudah aktif, silakan login.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/login">Ke Halaman Login</Link>
            </Button>
          </>
        )}

        {isError && (
          <>
            <h1 className="text-xl font-semibold">Verifikasi gagal</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {error.message}
            </p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link href="/register">Kembali ke Daftar</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
};

export default VerifyEmailPage;
