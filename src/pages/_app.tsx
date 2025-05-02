import { type AppType } from "next/app";
import { Poppins } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "500"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className={poppins.className}>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </div>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
