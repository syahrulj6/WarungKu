import { type ReactNode, useState, useEffect } from "react";
import { KasirSidebar } from "./KasirSidebar";
import { KasirHeader } from "./KasirHeader";
import { GoHomeFill, GoClockFill } from "react-icons/go";
import {
  FaConciergeBell,
  FaShoppingCart,
  FaBook,
  FaBell,
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Menu, PanelRightClose, ShoppingCart } from "lucide-react";
import { OrderPanel } from "./OrderPanel";
import { HeadMetaData } from "./HeadMetaData";

const menuItems = [
  {
    title: "Ringkasan",
    icon: <GoHomeFill />,
    url: "/dashboard/kasir/[id]",
    path: (id: string) => `/dashboard/kasir/${id}`,
  },
  {
    title: "Produk",
    icon: <FaConciergeBell />,
    url: "/dashboard/kasir/[id]/product",
    path: (id: string) => `/dashboard/kasir/${id}/product`,
  },
  {
    title: "Pesanan",
    icon: <FaShoppingCart />,
    url: "/dashboard/kasir/[id]/order",
    path: (id: string) => `/dashboard/kasir/${id}/order`,
  },
  {
    title: "Riwayat",
    icon: <GoClockFill />,
    url: "/dashboard/kasir/[id]/history",
    path: (id: string) => `/dashboard/kasir/${id}/history`,
  },
  {
    title: "Laporan",
    icon: <FaBook />,
    url: "/dashboard/kasir/[id]/report",
    path: (id: string) => `/dashboard/kasir/${id}/report`,
  },
  {
    title: "Peringatan",
    icon: <FaBell />,
    url: "/dashboard/kasir/[id]/alert",
    path: (id: string) => `/dashboard/kasir/${id}/alert`,
  },
  {
    title: "Pengaturan",
    icon: <IoSettingsSharp />,
    url: "/dashboard/kasir/[id]/settings",
    path: (id: string) => `/dashboard/kasir/${id}/settings`,
  },
];

type KasirDashboardLayoutProps = {
  children: ReactNode;
  withRightPanel?: boolean;
  headerContent?: ReactNode;
  metaTitle?: string;
  metaDescription?: string;
  pathname?: string;
};

export const KasirDashboardLayout = ({
  children,
  withRightPanel = false,
  headerContent,
  metaDescription,
  metaTitle,
  pathname,
}: KasirDashboardLayoutProps) => {
  const router = useRouter();
  const { id } = router.query;
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsLeftSidebarOpen(!isMobile);
    setIsRightPanelOpen(!isMobile);
  }, [isMobile]);

  const enhancedMenuItems = menuItems.map((item) => {
    const isActive =
      router.pathname === item.url ||
      (item.url !== "/dashboard/kasir/[id]" &&
        router.pathname.startsWith(item.url));

    return {
      ...item,
      active: isActive,
      href: item.path(id as string),
    };
  });

  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);
  const toggleRightPanel = () => setIsRightPanelOpen(!isRightPanelOpen);

  return (
    <div className="bg-background flex min-h-screen flex-col md:flex-row">
      <HeadMetaData
        title={metaTitle}
        metaDescription={metaDescription}
        pathname={pathname || router.pathname}
      />
      {/* Fixed Left Sidebar (Desktop) */}
      {!isMobile && (
        <div className="fixed top-0 left-0 z-30 h-screen w-40 border-r">
          <KasirSidebar menuItems={enhancedMenuItems} />
        </div>
      )}

      {/* Mobile Left Sidebar */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Sheet open={isLeftSidebarOpen} onOpenChange={setIsLeftSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-2/4 p-0">
              <SheetHeader className="p-4">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <SheetDescription className="sr-only">
                  Menu navigasi utama aplikasi
                </SheetDescription>
              </SheetHeader>
              <KasirSidebar menuItems={enhancedMenuItems} />
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <KasirHeader
          toggleSidebar={toggleLeftSidebar}
          toggleRightPanel={withRightPanel ? toggleRightPanel : undefined}
          className={!isMobile ? "ml-40" : ""}
          showRightPanelButton={withRightPanel}
        >
          {headerContent}
        </KasirHeader>

        <div className="flex flex-1">
          <main
            className={`bg-accent/20 flex-1 overflow-auto ${!isMobile ? "ml-40" : ""}`}
          >
            <div className="flex flex-col p-4">{children}</div>
          </main>

          {/* Right Sidebar (Desktop) */}
          {withRightPanel && !isMobile && (
            <div
              className={`relative transition-all duration-300 ${isRightPanelOpen ? "w-72 lg:w-80" : "w-0"}`}
            >
              <div className="bg-background absolute inset-y-0 right-0 flex h-full border-l">
                {isRightPanelOpen && (
                  <div className="h-full w-72 overflow-y-auto overflow-x-hidden p-4 lg:w-80">
                    <h3 className="mb-4 text-lg font-semibold">
                      Pesanan Saat Ini
                    </h3>
                    <OrderPanel />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Right Panel */}
      {withRightPanel && isMobile && (
        <div className="fixed right-4 bottom-4 z-50 md:hidden">
          <Sheet open={isRightPanelOpen} onOpenChange={setIsRightPanelOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-lg"
              >
                {isRightPanelOpen ? (
                  <PanelRightClose className="h-5 w-5" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="p-4">
                <SheetTitle>Pesanan Saat Ini</SheetTitle>
                <SheetDescription>
                  Panel yang menampilkan informasi pesanan saat ini
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <OrderPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};


