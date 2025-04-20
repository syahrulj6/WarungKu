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

  const publicRoutes = ["/", "/login", "/register"];
  const protectedRoutes = ["/dashboard", "/dashboard/"];

  // Handle unauthenticated users
  if (!user) {
    // Check if trying to access route starts with any protected route
    const isProtectedRoute =
      protectedRoutes.some(
        (route) => path === route || path.startsWith(route),
      ) || path.startsWith("/dashboard/");

    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Handle authenticated users
  if (user) {
    if (path === "/dashboard" || path === "/dashboard/") {
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
