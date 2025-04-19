import { type ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { useRouter } from "next/router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Menu } from "lucide-react";

const menuItems = [
  {
    title: "All Warung",
    url: "/dashboard",
  },
  {
    title: "Menu",
    url: "/menu",
  },
];

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
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
  }, [isMobile]);

  const enhancedMenuItems = menuItems.map((item) => ({
    ...item,
    active: router.pathname.startsWith(item.url),
  }));

  return (
    <div className="bg-background flex min-h-screen">
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
            <SheetContent side="left" className="w-2/4 p-0">
              <SheetTitle>WarungKu</SheetTitle>
              <AppSidebar menuItems={enhancedMenuItems} />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop left sidebar */}
      {!isMobile && <AppSidebar menuItems={enhancedMenuItems} />}

      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
};
