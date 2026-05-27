import nodemailer from "nodemailer";

interface SendEmailParams {
  email: string;
  token?: string;
  verificationUrl?: string;
}

interface SendInvitationEmailParams {
  email: string;
  invitationUrl: string;
}

export const sendVerificationEmail = async ({
  email,
  token,
  verificationUrl,
}: SendEmailParams) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? "587");
    const secure = String(process.env.SMTP_SECURE ?? "false") === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? user;

    if (!host || !user || !pass || !from) {
      throw new Error("SMTP config is incomplete");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const emailHtml = verificationUrl
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Kasirium Security</h1>
          <p>Terima kasih sudah mendaftar. Klik tombol di bawah untuk verifikasi email akun Anda.</p>
          <div style="margin: 24px 0;">
            <a href="${verificationUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;text-decoration:none;border-radius:8px;display:inline-block;">
              Verifikasi Email
            </a>
          </div>
          <p>Link ini berlaku selama 24 jam.</p>
          <p style="font-size: 14px; color: #6b7280;">Jika tombol tidak berfungsi, buka link ini:</p>
          <p style="font-size: 14px; word-break: break-all;">
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Jika Anda tidak merasa mendaftar, email ini dapat diabaikan.
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Kasirium Security</h1>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #4f46e5;">
            ${token ?? "-"}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `;

    const subject = verificationUrl
      ? "Verifikasi Email Akun Kasirium"
      : "Your Kasirium Verification Code";

    await transporter.sendMail({
      from,
      to: email,
      subject,
      html: emailHtml,
    });
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email service unavailable");
  }
};

export const sendInvitationEmail = async ({
  email,
  invitationUrl,
}: SendInvitationEmailParams) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? "587");
    const secure = String(process.env.SMTP_SECURE ?? "false") === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? user;

    if (!host || !user || !pass || !from) {
      throw new Error("SMTP config is incomplete");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const subject = "Undangan Bergabung Tim Kasirium";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Undangan Tim Kasirium</h1>
        <p>Anda menerima undangan untuk bergabung sebagai staf di Kasirium.</p>
        <p>Klik tombol di bawah untuk menerima undangan dan mengaktifkan akses Anda.</p>
        <div style="margin: 24px 0;">
          <a href="${invitationUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;text-decoration:none;border-radius:8px;display:inline-block;">
            Terima Undangan
          </a>
        </div>
        <p>Link undangan ini berlaku selama 7 hari.</p>
        <p style="font-size: 14px; color: #6b7280;">Jika tombol tidak berfungsi, buka link ini:</p>
        <p style="font-size: 14px; word-break: break-all;">
          <a href="${invitationUrl}">${invitationUrl}</a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Jika Anda tidak merasa menerima undangan ini, email dapat diabaikan.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error("Invitation email sending failed:", error);
    throw new Error("Email service unavailable");
  }
};


