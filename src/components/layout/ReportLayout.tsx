import {
  BadgeDollarSign,
  ChartColumnBig,
  CreditCard,
  LayoutGrid,
  List,
  Menu,
  NotebookText,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";
import { ReportSidebar } from "./ReportSidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";

const menuItems = [
  {
    title: "Ringkasan Penjualan",
    icon: <ChartColumnBig size={18} />,
    url: "/dashboard/kasir/[id]/report",
    path: (id: string) => `/dashboard/kasir/${id}/report`,
  },
  {
    title: "Metode Pembayaran",
    icon: <CreditCard size={18} />,
    url: "/dashboard/kasir/[id]/report/payment-method",
    path: (id: string) => `/dashboard/kasir/${id}/report/payment-method`,
  },
  {
    title: "Penjualan Produk",
    icon: <LayoutGrid size={18} />,
    url: "/dashboard/kasir/[id]/report/item-sales",
    path: (id: string) => `/dashboard/kasir/${id}/report/item-sales`,
  },
  {
    title: "Penjualan Kategori",
    icon: <List size={18} />,
    url: "/dashboard/kasir/[id]/report/category-sales",
    path: (id: string) => `/dashboard/kasir/${id}/report/category-sales`,
  },
  {
    title: "Diskon",
    icon: <BadgeDollarSign size={18} />,
    url: "/dashboard/kasir/[id]/report/discounts",
    path: (id: string) => `/dashboard/kasir/${id}/report/discounts`,
  },
  {
    title: "Pajak",
    icon: <NotebookText size={18} />,
    url: "/dashboard/kasir/[id]/report/taxes",
    path: (id: string) => `/dashboard/kasir/${id}/report/taxes`,
  },
];

type ReportLayoutProps = {
  children: ReactNode;
};

export const ReportLayout = ({ children }: ReportLayoutProps) => {
  const router = useRouter();
  const { id } = router.query;
  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
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
    setIsReportSidebarOpen(!isMobile);
  }, [isMobile]);

  const enhancedMenuItems = menuItems.map((item) => {
    const isActive =
      router.pathname === item.url ||
      (item.url !== "/dashboard/kasir/[id]/report" &&
        router.pathname.startsWith(item.url));

    return {
      ...item,
      active: isActive,
      href: item.path(id as string),
    };
  });

  if (!id) return null;

  return (
    <div className="flex flex-1">
      {/* Report Sidebar (Desktop) */}
      {!isMobile && (
        <div className="fixed top-0 left-40 z-20 h-screen w-52 border-r">
          <ReportSidebar menuItems={enhancedMenuItems} />
        </div>
      )}

      {/* Mobile Report Sidebar Toggle */}
      {isMobile && (
        <div className="fixed top-4 left-16 z-40 md:hidden">
          <Sheet
            open={isReportSidebarOpen}
            onOpenChange={setIsReportSidebarOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-48 p-0">
              <SheetHeader className="p-4">
                <SheetTitle className="text-lg font-semibold">
                  Menu Laporan
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menu navigasi untuk bagian laporan
                </SheetDescription>
              </SheetHeader>
              <ReportSidebar menuItems={enhancedMenuItems} />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${!isMobile ? "ml-52" : ""}`}>
        <div className="flex flex-col p-2">{children}</div>
      </main>
    </div>
  );
};


