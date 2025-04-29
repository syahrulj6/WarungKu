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
import { PanelRightOpen, PanelRightClose, Menu } from "lucide-react";

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
  rightPanel?: ReactNode;
  rightPanelTitle?: string;
};

export const WarungDashboardLayout = ({
  children,
  rightPanel,
  rightPanelTitle = "Current Orders",
}: WarungDashboardLayoutProps) => {
  const router = useRouter();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
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
          className={!isMobile ? "ml-40" : ""}
        />

        <div className="flex flex-1">
          <main
            className={`flex-1 overflow-auto bg-gray-50 ${!isMobile ? "ml-40" : ""}`}
          >
            <div className="p-6">{children}</div>
          </main>

          {/* Right Sidebar (Desktop) */}
          {rightPanel && !isMobile && (
            <div className="relative w-72 border-l bg-white">
              {/* Content starts below header */}
              <div className="absolute inset-0 overflow-y-auto p-4">
                <h3 className="mb-4 text-lg font-semibold">
                  {rightPanelTitle}
                </h3>
                {rightPanel}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Right Panel */}
      {rightPanel && isMobile && (
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
                  <PanelRightOpen className="h-5 w-5" />
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
              <div className="p-4">{rightPanel}</div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};
