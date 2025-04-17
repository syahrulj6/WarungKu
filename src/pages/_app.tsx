import { type AppType } from "next/app";
import { Poppins } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "sonner";

const geist = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "500"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={geist.className}>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </div>
  );
};

export default api.withTRPC(MyApp);
