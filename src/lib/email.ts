// src/server/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  email: string;
  token: string;
}

export const sendVerificationEmail = async ({
  email,
  token,
}: SendEmailParams) => {
  try {
    // Use your domain if verified, otherwise use test domain
    const fromDomain =
      process.env.NODE_ENV === "production"
        ? "security@warungku.com"
        : "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from: fromDomain,
      to: email,
      subject: "Your WarungKu Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">WarungKu Security</h1>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #4f46e5;">
            ${token}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email service unavailable");
  }
};
