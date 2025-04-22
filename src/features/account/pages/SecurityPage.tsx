import React, { useState } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { api } from "~/utils/api";
import { toast } from "sonner";

const SecurityPage = () => {
  const [step, setStep] = useState<"initial" | "verify" | "enabled">("initial");
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);

  const { data: mfaData, refetch } = api.security.getMfaStatus.useQuery();
  const generateSecret = api.security.generateMfaSecret.useMutation();
  const enableMfa = api.security.enableMfa.useMutation();
  const disableMfa = api.security.disableMfa.useMutation();
  const resendCode = api.security.sendMfaCode.useMutation();

  const handleGenerateMfa = async () => {
    try {
      const secret = await generateSecret.mutateAsync();
      setMfaSecret(secret.secret);
      setStep("verify");
      toast.success("Verification code sent to your email");
    } catch (error) {
      toast.error("Failed to generate MFA secret");
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
      toast.success("MFA enabled successfully");
    } catch (error) {
      toast.error("Invalid verification code");
    }
  };

  const handleDisableMfa = async () => {
    try {
      await disableMfa.mutateAsync();
      await refetch();
      toast.success("MFA disabled successfully");
    } catch (error) {
      toast.error("Failed to disable MFA");
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCode.mutateAsync();
      toast.success("New verification code sent to your email");
    } catch (error) {
      toast.error("Failed to resend code");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-xl font-semibold md:text-2xl">
            Multi-Factor Authentication
          </h1>
          <p className="text-muted-foreground text-sm">
            Tambahkan lapisan keamanan tambahan ke akun Anda dengan meminta
            lebih dari sekadar kata sandi untuk masuk.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          {mfaData?.mfaEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">MFA is enabled</h3>
                  <p className="text-muted-foreground text-sm">
                    Your account is protected with email verification
                  </p>
                </div>
                <button
                  onClick={handleDisableMfa}
                  className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Disable MFA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">MFA is disabled</h3>
                  <p className="text-muted-foreground text-sm">
                    Enable email verification for extra security
                  </p>
                </div>
                <button
                  onClick={handleGenerateMfa}
                  className="bg-primary hover:bg-primary-dark rounded-md px-4 py-2 text-white"
                >
                  Enable MFA
                </button>
              </div>

              {step === "verify" && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Email Verification</h4>
                  <p className="text-muted-foreground text-sm">
                    We've sent a 6-digit verification code to your email
                    address.
                  </p>

                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium">
                      Verification code
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full rounded-md border p-2"
                      placeholder="Enter 6-digit code"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleEnableMfa}
                        className="bg-primary hover:bg-primary-dark rounded-md px-4 py-2 text-white"
                      >
                        Verify and enable
                      </button>
                      <button
                        onClick={handleResendCode}
                        className="text-primary hover:text-primary-dark rounded-md px-4 py-2"
                      >
                        Resend code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === "enabled" && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">MFA enabled successfully</h4>
                  <p className="text-muted-foreground text-sm">
                    Please save these backup codes in a safe place. You can use
                    them to access your account if you can't receive emails.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                      <div
                        key={i}
                        className="rounded-md bg-gray-100 p-2 text-center font-mono"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep("initial")}
                    className="bg-primary hover:bg-primary-dark rounded-md px-4 py-2 text-white"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecurityPage;
