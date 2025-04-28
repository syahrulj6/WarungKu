import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const publicRoutes = ["/login", "/register"];
  const protectedRoutes = ["/dashboard", "/verify-mfa", "/docs"];

  // Handle unauthenticated users
  if (!user) {
    const isProtectedRoute = protectedRoutes.some(
      (route) => path === route || path.startsWith(route),
    );

    if (isProtectedRoute || path === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Handle authenticated users
  if (user) {
    const mfaVerified = request.cookies.get("mfa_verified")?.value === "true";
    const isMfaRequired = path === "/verify-mfa";
    const isDashboard = path.startsWith("/dashboard");
    const isRootPath = path === "/";

    // Redirect root path based on MFA status
    if (isRootPath) {
      const url = request.nextUrl.clone();
      url.pathname = mfaVerified ? "/dashboard/warungku" : "/verify-mfa";
      return NextResponse.redirect(url);
    }

    // Redirect /dashboard/ to /dashboard/warungku
    if (path === "/dashboard" || path === "/dashboard/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/warung";
      return NextResponse.redirect(url);
    }

    // Block unverified users from dashboard
    if (!mfaVerified && isDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-mfa";
      return NextResponse.redirect(url);
    }

    // Block verified users from MFA page
    if (mfaVerified && isMfaRequired) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/warung";
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from public routes
    if (publicRoutes.includes(path)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/warung";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
