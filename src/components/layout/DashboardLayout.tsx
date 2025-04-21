import { type ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { useRouter } from "next/router";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Menu } from "lucide-react";
import AccountDropdown from "./AccountDropdown";
import { IoMailOutline } from "react-icons/io5";
import { MdOutlineArrowOutward } from "react-icons/md";

const menuItems = [
  {
    title: "Semua warung",
    category: "Warung",
    url: "/dashboard",
  },
  {
    title: "Preferensi akun",
    category: "Account",
    url: "/dashboard/account/me",
  },
  {
    title: "Keamanan",
    category: "Account",
    url: "/dashboard/account/security",
  },
  {
    title: "Pandudan",
    category: "Documentation",
    url: "/docs",
    icon: <MdOutlineArrowOutward />,
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
        <div className="fixed top-3 left-3 z-50 md:hidden">
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
            <SheetContent side="left" className="w-2/3 p-0">
              <AppSidebar menuItems={enhancedMenuItems} />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop left sidebar */}
      {!isMobile && <AppSidebar menuItems={enhancedMenuItems} />}

      <main className="bg-background flex flex-1 flex-col overflow-auto">
        <div className="flex h-14 justify-end border-b px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <button className="hover:bg-muted-foreground/15 group rounded-md p-1 transition-colors hover:cursor-pointer">
              <IoMailOutline className="text-muted-foreground text-lg group-hover:text-current" />
            </button>
            <AccountDropdown />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};
