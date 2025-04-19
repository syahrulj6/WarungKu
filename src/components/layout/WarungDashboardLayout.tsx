import { type ReactNode, useState, useEffect } from "react";
import { WarungSidebar } from "./WarungSidebar";
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
  SheetTrigger,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { PanelRightOpen, PanelRightClose, Menu } from "lucide-react";

const menuItems = [
  {
    title: "Home",
    icon: <GoHomeFill />,
    url: "/dashboard",
  },
  {
    title: "Menu",
    icon: <FaConciergeBell />,
    url: "/menu",
  },
  {
    title: "Order",
    icon: <FaShoppingCart />,
    url: "/order",
  },
  {
    title: "History",
    icon: <GoClockFill />,
    url: "/history",
  },
  {
    title: "Report",
    icon: <FaBook />,
    url: "/report",
  },
  {
    title: "Alert",
    icon: <FaBell />,
    url: "/alerts",
  },
  {
    title: "Settings",
    icon: <IoSettingsSharp />,
    url: "/settings",
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

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile left sidebar toggle button */}
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
            <SheetContent side="left" className="w-36 p-0">
              <WarungSidebar menuItems={enhancedMenuItems} />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop left sidebar */}
      {!isMobile && <WarungSidebar menuItems={enhancedMenuItems} />}

      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        {children}

        {/* Mobile right panel toggle button */}
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
              <SheetContent side="right" className="p w-[300px]">
                <SheetHeader className="flex items-center justify-between p-4">
                  <SheetTitle>Current Orders</SheetTitle>
                  <button></button>
                </SheetHeader>
                <div className="p-4">{rightPanel}</div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>

      {/* Desktop right panel */}
      {rightPanel && !isMobile && (
        <aside className="hidden w-[300px] overflow-y-auto border-l bg-white p-4 md:block">
          <h3 className="mb-4 text-lg font-semibold">Current Orders</h3>
          {rightPanel}
        </aside>
      )}
    </div>
  );
};
