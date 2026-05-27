import React from "react";
import { useRouter } from "next/router";
import { useSession } from "~/hooks/useSession";
import { api } from "~/utils/api";
import { PageContainer } from "~/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const token = Array.isArray(router.query.token)
    ? router.query.token[0]
    : router.query.token;
  const { session } = useSession();
  const acceptInvitation = api.staff.acceptInvitation.useMutation();
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);
  const attemptedTokenRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!router.isReady) return;
    if (!token) {
      setStatus("error");
      setError("Token undangan tidak ditemukan.");
      return;
    }

    if (!session) {
      setStatus("idle");
      setError("Anda harus masuk terlebih dahulu untuk menerima undangan.");
      return;
    }

    if (attemptedTokenRef.current === token) return;
    attemptedTokenRef.current = token;

    void (async () => {
      setStatus("loading");
      setError(null);
      try {
        await acceptInvitation.mutateAsync({ token });
        setStatus("success");
        setTimeout(() => {
          void router.push("/");
        }, 1200);
      } catch (err: any) {
        setStatus("error");
        setError(err?.message ?? "Gagal menerima undangan");
      }
    })();
  }, [acceptInvitation, router, router.isReady, session, token]);

  return (
    <PageContainer metaTitle="Terima Undangan">
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Terima Undangan Tim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                Sedang memproses undangan, mohon tunggu...
              </div>
            )}
            {status === "success" && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                Undangan berhasil diterima. Mengarahkan...
              </div>
            )}
            {status === "idle" && error && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                {error}
              </div>
            )}
            {status === "error" && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {error && !session && (
              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    void router.push(
                      `/login?next=${encodeURIComponent(router.asPath)}`,
                    );
                  }}
                >
                  Masuk untuk menerima undangan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
