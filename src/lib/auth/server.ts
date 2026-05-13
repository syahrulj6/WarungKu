import crypto from "crypto";
import type { NextApiResponse } from "next";
import {
  AUTH_COOKIE_NAME,
  MFA_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "./constants";

const AUTH_SECRET = process.env.AUTH_SECRET ?? "warungku-local-auth-secret";

type CookieOptions = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

function createSignature(value: string) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(value).digest("hex");
}

export function createSessionToken(userId: string) {
  return `${userId}.${createSignature(userId)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return null;

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const userId = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = createSignature(userId);

  if (signature.length !== expectedSignature.length) return null;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    )
  ) {
    return null;
  }

  return userId;
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });
  });

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined,
) {
  if (!storedHash) return false;

  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) return false;

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });
  });

  const expectedKey = Buffer.from(expectedHash, "hex");
  if (expectedKey.length !== derivedKey.length) return false;

  return crypto.timingSafeEqual(expectedKey, derivedKey);
}

function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  parts.push(`Path=${options.path ?? "/"}`);

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  parts.push(`SameSite=${options.sameSite ?? "lax"}`);

  if (options.httpOnly ?? true) {
    parts.push("HttpOnly");
  }

  if (options.secure ?? process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function appendSetCookie(res: NextApiResponse, cookie: string) {
  const existing = res.getHeader("Set-Cookie");

  if (!existing) {
    res.setHeader("Set-Cookie", cookie);
    return;
  }

  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing, cookie]);
    return;
  }

  res.setHeader("Set-Cookie", [String(existing), cookie]);
}

export function setSessionCookies(
  res: NextApiResponse,
  userId: string,
  options?: { mfaVerified?: boolean },
) {
  appendSetCookie(
    res,
    serializeCookie(AUTH_COOKIE_NAME, createSessionToken(userId), {
      maxAge: SESSION_COOKIE_MAX_AGE,
    }),
  );

  appendSetCookie(
    res,
    serializeCookie(MFA_COOKIE_NAME, options?.mfaVerified ? "true" : "", {
      maxAge: options?.mfaVerified ? SESSION_COOKIE_MAX_AGE : 0,
    }),
  );
}

export function clearSessionCookies(res: NextApiResponse) {
  appendSetCookie(
    res,
    serializeCookie(AUTH_COOKIE_NAME, "", {
      maxAge: 0,
    }),
  );

  appendSetCookie(
    res,
    serializeCookie(MFA_COOKIE_NAME, "", {
      maxAge: 0,
    }),
  );
}

export function readSessionUserId(cookieHeader?: string) {
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex === -1) return [cookie.trim(), ""];

      const key = cookie.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(cookie.slice(separatorIndex + 1));

      return [key, value];
    }),
  );

  return verifySessionToken(cookies[AUTH_COOKIE_NAME]);
}

export function readMfaVerified(cookieHeader?: string) {
  if (!cookieHeader) return false;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex === -1) return [cookie.trim(), ""];

      const key = cookie.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(cookie.slice(separatorIndex + 1));

      return [key, value];
    }),
  );

  return cookies[MFA_COOKIE_NAME] === "true";
}

