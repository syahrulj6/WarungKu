import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { PageContainer } from "~/components/layout/PageContainer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const VerifyMfaPage = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const verifyMfa = api.auth.verifyMfaLogin.useMutation();
  const resendCode = api.security.sendMfaCode.useMutation();

  const sendMfaCode = api.security.sendMfaCode.useMutation();

  useEffect(() => {
    // Send code when page loads
    sendMfaCode.mutateAsync().catch(() => {
      toast.error("Failed to send verification code");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyMfa.mutateAsync({ token: code });
      await router.push("/dashboard");
    } catch (error) {
      toast.error("Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendCode.mutateAsync();
      toast.success("New code sent to your email");
    } catch (error) {
      toast.error("Failed to resend code");
    }
  };

  return (
    <PageContainer metaTitle="Verify MFA" withHeader={false} withFooter={false}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-lg border p-8">
          <h1 className="mb-4 text-2xl font-bold">Verify Your Identity</h1>
          <p className="mb-6 text-gray-600">
            We've sent a 6-digit verification code to your email address
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              className="w-full"
            >
              Resend Code
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default VerifyMfaPage;
