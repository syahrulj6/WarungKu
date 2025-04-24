import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { PageContainer } from "~/components/layout/PageContainer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const VerifyMfaPage = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const initialCodeSent = useRef(false);
  const router = useRouter();

  const verifyMfa = api.auth.verifyMfaLogin.useMutation();
  const sendMfaCode = api.security.sendMfaCode.useMutation();

  useEffect(() => {
    // Only send the initial code if we haven't sent one yet
    if (!initialCodeSent.current) {
      const sendInitialCode = async () => {
        try {
          await sendMfaCode.mutateAsync();
          initialCodeSent.current = true;
          toast.success("Verification code sent to your email");
        } catch (error) {
          toast.error("Failed to send verification code");
        }
      };

      sendInitialCode();
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyMfa.mutateAsync({ token: code });
      document.cookie = "mfa_verified=true; path=/; max-age=86400";
      await router.push("/dashboard/warung");
    } catch (error) {
      toast.error("Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendMfaCode.mutateAsync();
      setCanResend(false);
      setCountdown(60);
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

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
              disabled={!canResend}
            >
              {canResend ? "Resend Code" : `Resend in ${countdown}s`}
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default VerifyMfaPage;
