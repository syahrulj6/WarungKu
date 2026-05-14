import React, { useState } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { Loader2, ShieldCheck, ShieldAlert, Mail } from "lucide-react";

const SecurityPage = () => {
  const [step, setStep] = useState<"initial" | "verify" | "enabled">("initial");
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);

  const { data: mfaData, refetch, isLoading } = api.security.getMfaStatus.useQuery();
  const generateSecret = api.security.generateMfaSecret.useMutation();
  const enableMfa = api.security.enableMfa.useMutation();
  const disableMfa = api.security.disableMfa.useMutation();
  const resendCode = api.security.sendMfaCode.useMutation();

  const handleGenerateMfa = async () => {
    try {
      const secret = await generateSecret.mutateAsync();
      setMfaSecret(secret.secret);
      setStep("verify");
      toast.success("Kode verifikasi sudah dikirim ke email Anda");
    } catch {
      toast.error("Gagal memulai aktivasi MFA");
    }
  };

  const handleEnableMfa = async () => {
    try {
      if (!mfaSecret) {
        throw new Error("No MFA secret generated");
      }

      const result = await enableMfa.mutateAsync({
        token,
        secret: mfaSecret,
      });
      setBackupCodes(result.backupCodes);
      setStep("enabled");
      await refetch();
      toast.success("MFA berhasil diaktifkan");
    } catch {
      toast.error("Kode verifikasi tidak valid");
    }
  };

  const handleDisableMfa = async () => {
    try {
      await disableMfa.mutateAsync();
      await refetch();
      setStep("initial");
      setToken("");
      setMfaSecret(null);
      setBackupCodes([]);
      toast.success("MFA berhasil dinonaktifkan");
    } catch {
      toast.error("Gagal menonaktifkan MFA");
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCode.mutateAsync();
      toast.success("Kode verifikasi baru telah dikirim");
    } catch {
      toast.error("Gagal mengirim ulang kode");
    }
  };

  const isMutating =
    generateSecret.isPending ||
    enableMfa.isPending ||
    disableMfa.isPending ||
    resendCode.isPending;

  return (
    <DashboardLayout
      metaTitle="Account Security"
      metaDescription="Kelola keamanan akun anda"
      pathname="/dashboard/account/security"
    >
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-xl font-semibold md:text-2xl">
            Multi-Factor Authentication
          </h1>
          <p className="text-muted-foreground text-sm">
            Tambahkan verifikasi email saat login untuk meningkatkan keamanan akun.
          </p>
        </div>

        <Card>
          <CardHeader className="-mb-2">
            <CardTitle className="text-base font-semibold">Status Keamanan</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 pt-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-36" />
              </div>
            ) : mfaData?.mfaEnabled ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      MFA Aktif
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Akun Anda sudah dilindungi verifikasi email saat proses login.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDisableMfa}
                    disabled={isMutating}
                  >
                    {disableMfa.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Nonaktifkan MFA"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="flex items-center gap-2 font-medium">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    MFA Belum Aktif
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Aktifkan MFA untuk mengurangi risiko akses akun yang tidak sah.
                  </p>
                </div>
                <Button onClick={handleGenerateMfa} disabled={isMutating}>
                  {generateSecret.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Aktifkan MFA"
                  )}
                </Button>
              </div>
            )}

            {step === "verify" && !mfaData?.mfaEnabled && (
              <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium">Verifikasi Email</h4>
                <p className="text-muted-foreground text-sm">
                  Masukkan kode 6 digit yang dikirim ke email Anda untuk
                  menyelesaikan aktivasi MFA.
                </p>

                <div className="space-y-2">
                  <label htmlFor="mfa-token" className="text-sm font-medium">
                    Kode Verifikasi
                  </label>
                  <Input
                    id="mfa-token"
                    type="text"
                    value={token}
                    maxLength={6}
                    onChange={(e) =>
                      setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Contoh: 123456"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleEnableMfa}
                    disabled={isMutating || token.length !== 6}
                  >
                    {enableMfa.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verifikasi dan Aktifkan"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={isMutating}
                  >
                    <Mail className="h-4 w-4" />
                    Kirim Ulang Kode
                  </Button>
                </div>
              </div>
            )}

            {step === "enabled" && backupCodes.length > 0 && (
              <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium">Backup Codes</h4>
                <p className="text-muted-foreground text-sm">
                  Simpan kode ini di tempat aman. Kode dapat dipakai jika Anda
                  tidak bisa menerima email verifikasi.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code) => (
                    <div
                      key={code}
                      className="bg-muted rounded-md p-2 text-center font-mono text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => setStep("initial")}>
                  Selesai
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SecurityPage;
