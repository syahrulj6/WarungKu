import { type ReactNode, useState, useEffect } from "react";
import { WarungSidebar } from "./WarungSidebar";
import { WarungHeader } from "./WarungHeader";
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
    title: "Overview",
    icon: <GoHomeFill />,
    url: "/dashboard/warung/[id]",
    path: (id: string) => `/dashboard/warung/${id}`,
  },
  {
    title: "Menu",
    icon: <FaConciergeBell />,
    url: "/dashboard/warung/[id]/menu",
    path: (id: string) => `/dashboard/warung/${id}/menu`,
  },
  {
    title: "Order",
    icon: <FaShoppingCart />,
    url: "/dashboard/warung/[id]/order",
    path: (id: string) => `/dashboard/warung/${id}/order`,
  },
  {
    title: "History",
    icon: <GoClockFill />,
    url: "/dashboard/warung/[id]/history",
    path: (id: string) => `/dashboard/warung/${id}/history`,
  },
  {
    title: "Report",
    icon: <FaBook />,
    url: "/dashboard/warung/[id]/report",
    path: (id: string) => `/dashboard/warung/${id}/report`,
  },
  {
    title: "Alert",
    icon: <FaBell />,
    url: "/dashboard/warung/[id]/alert",
    path: (id: string) => `/dashboard/warung/${id}/alert`,
  },
  {
    title: "Settings",
    icon: <IoSettingsSharp />,
    url: "/dashboard/warung/[id]/settings",
    path: (id: string) => `/dashboard/warung/${id}/settings`,
  },
];

type WarungDashboardLayoutProps = {
  children: ReactNode;
  withRightPanel?: boolean;
  headerContent?: ReactNode;
  metaTitle?: string;
  metaDescription?: string;
  pathname?: string;
};

export const WarungDashboardLayout = ({
  children,
  withRightPanel = false,
  headerContent,
  metaDescription,
  metaTitle,
  pathname,
}: WarungDashboardLayoutProps) => {
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
      (item.url !== "/dashboard/warung/[id]" &&
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
          <WarungSidebar menuItems={enhancedMenuItems} />
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
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu for the application
                </SheetDescription>
              </SheetHeader>
              <WarungSidebar menuItems={enhancedMenuItems} />
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <WarungHeader
          toggleSidebar={toggleLeftSidebar}
          toggleRightPanel={withRightPanel ? toggleRightPanel : undefined}
          className={!isMobile ? "ml-40" : ""}
          showRightPanelButton={withRightPanel}
        >
          {headerContent}
        </WarungHeader>

        <div className="flex flex-1">
          <main
            className={`bg-accent/20 flex-1 overflow-auto ${!isMobile ? "ml-40" : ""}`}
          >
            <div className="flex flex-col p-4">{children}</div>
          </main>

          {/* Right Sidebar (Desktop) */}
          {withRightPanel && !isMobile && (
            <div
              className={`relative transition-all duration-300 ${isRightPanelOpen ? "w-64" : "w-0"}`}
            >
              <div className="bg-bacgkround absolute inset-y-0 right-0 flex h-full border-l">
                {isRightPanelOpen && (
                  <div className="h-full w-64 overflow-y-auto p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                      Current Order
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
                <SheetTitle>Current Order</SheetTitle>
                <SheetDescription>
                  Panel showing current order information
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
