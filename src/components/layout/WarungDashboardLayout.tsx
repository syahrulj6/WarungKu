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
import { PanelRightClose, Menu, ShoppingCart } from "lucide-react";

const menuItems = [
  {
    title: "Overview",
    icon: <GoHomeFill />,
    url: "/dashboard/warung",
  },
  {
    title: "Menu",
    icon: <FaConciergeBell />,
    url: "/warung/menu",
  },
  {
    title: "Order",
    icon: <FaShoppingCart />,
    url: "/warung/order",
  },
  {
    title: "History",
    icon: <GoClockFill />,
    url: "/warung/history",
  },
  {
    title: "Report",
    icon: <FaBook />,
    url: "/warung/report",
  },
  {
    title: "Alert",
    icon: <FaBell />,
    url: "/warung/alerts",
  },
  {
    title: "Settings",
    icon: <IoSettingsSharp />,
    url: "/warung/settings",
  },
];

type WarungDashboardLayoutProps = {
  children: ReactNode;
  withRightPanel?: boolean;
  rightPanelContent?: ReactNode;
  rightPanelTitle?: string;
  headerContent?: ReactNode;
};

export const WarungDashboardLayout = ({
  children,
  withRightPanel = false,
  rightPanelContent,
  rightPanelTitle = "Current Orders",
  headerContent,
}: WarungDashboardLayoutProps) => {
  const router = useRouter();
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

  const enhancedMenuItems = menuItems.map((item) => ({
    ...item,
    active: router.pathname.startsWith(item.url),
  }));

  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);
  const toggleRightPanel = () => setIsRightPanelOpen(!isRightPanelOpen);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Fixed Left Sidebar (Desktop) */}
      {!isMobile && (
        <div className="fixed top-0 left-0 z-30 h-screen w-40 border-r">
          <WarungSidebar menuItems={enhancedMenuItems} />
        </div>
      )}

      {/* Mobile Left Sidebar */}
      {isMobile && (
        <Sheet open={isLeftSidebarOpen} onOpenChange={setIsLeftSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 rounded-full shadow-sm md:hidden"
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
      )}

      <div className="flex flex-1 flex-col">
        <WarungHeader
          toggleSidebar={toggleLeftSidebar}
          toggleRightPanel={toggleRightPanel}
          className={!isMobile ? "ml-40" : ""}
        >
          {" "}
          {headerContent}
        </WarungHeader>

        <div className="flex flex-1">
          <main
            className={`flex-1 overflow-auto bg-gray-50 ${!isMobile ? "ml-40" : ""}`}
          >
            <div className="flex flex-col p-4">{children}</div>
          </main>

          {/* Right Sidebar (Desktop) */}
          {withRightPanel && !isMobile && (
            <div
              className={`relative transition-all duration-300 ${isRightPanelOpen ? "w-72" : "w-0"}`}
            >
              <div className="absolute inset-y-0 right-0 flex h-full border-l bg-white">
                {isRightPanelOpen && (
                  <div className="h-full w-72 overflow-y-auto p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                      {rightPanelTitle}
                    </h3>
                    {rightPanelContent}
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
                <SheetTitle>{rightPanelTitle}</SheetTitle>
                <SheetDescription>
                  Panel showing current order information
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">{rightPanelContent}</div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};
