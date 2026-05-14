import type { IncomingMessage } from "http";

export function getAppBaseUrl(req?: IncomingMessage) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  if (configured && !configured.includes("localhost")) {
    return configured;
  }

  const forwardedProto = req?.headers["x-forwarded-proto"];
  const forwardedHost = req?.headers["x-forwarded-host"];
  const hostHeader = req?.headers.host;

  const proto =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0]?.trim()
      : "https";
  const host =
    typeof forwardedHost === "string"
      ? forwardedHost.split(",")[0]?.trim()
      : hostHeader;

  if (host) {
    return `${proto}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return configured || "http://localhost:3000";
}

