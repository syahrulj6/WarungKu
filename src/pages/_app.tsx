import { type AppType } from "next/app";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/theme-provider";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (!gaId) return;

    const handleRouteChange = (url: string) => {
      if (typeof window === "undefined") return;

      type GtagFn = (
        command: "config",
        targetId: string,
        config?: { page_path?: string },
      ) => void;

      const gtag = (window as Window & { gtag?: GtagFn }).gtag;
      gtag?.("config", gaId, { page_path: url });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [gaId, router.events]);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service worker registered"))
        .catch((err) => console.warn("SW registration failed", err));
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      <div className="font-sans">
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </div>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
