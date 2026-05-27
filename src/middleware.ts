import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, MFA_COOKIE_NAME } from "~/lib/auth/constants";

export default async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const path = nextUrl.pathname;
  const sessionCookie = cookies.get(AUTH_COOKIE_NAME)?.value;
  const mfaVerified = cookies.get(MFA_COOKIE_NAME)?.value === "true";

  const isDashboardRoute =
    path === "/dashboard" || path.startsWith("/dashboard/");
  const isProtectedRoute =
    isDashboardRoute ||
    path.startsWith("/docs") ||
    path === "/staff" ||
    path.startsWith("/shift");
  const isAuthRoute = path === "/login" || path === "/register";

  if (isAuthRoute && sessionCookie) {
    const url = nextUrl.clone();
    url.pathname = mfaVerified ? "/dashboard/kasir" : "/verify-mfa";
    return NextResponse.redirect(url);
  }

  if (path === "/verify-mfa") {
    if (!sessionCookie) {
      const url = nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (mfaVerified) {
      const url = nextUrl.clone();
      url.pathname = "/dashboard/kasir";
      return NextResponse.redirect(url);
    }
  }

  if (isProtectedRoute) {
    if (!sessionCookie) {
      const url = nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (!mfaVerified) {
      const url = nextUrl.clone();
      url.pathname = "/verify-mfa";
      return NextResponse.redirect(url);
    }

    if (path === "/dashboard") {
      const url = nextUrl.clone();
      url.pathname = "/dashboard/kasir";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


