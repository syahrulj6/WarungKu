import { ArrowUpRight, Loader, ShoppingCart, Utensils } from "lucide-react";
import { useRouter } from "next/router";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { ReportHeader } from "../components/ReportHeader";
import { useWarungDashboardData } from "~/hooks/useDashboardData";
import { MetricsCard } from "~/features/warung/components/MetricsCard";
import { BarChartCard } from "~/features/warung/components/BarChartCard";
import { chartActivityConfig } from "~/utils/type";
import { Card } from "~/components/ui/card";
import { useState } from "react";
import { generatePDFReport } from "~/utils/pdfExport";
import { toast } from "sonner";

type TimePeriod = "7-days" | "30-days" | "1-year";

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("7-days");
  const [isExporting, setIsExporting] = useState(false);

  const { sortedChartData, revenue, orders, customers, lowStock } =
    useWarungDashboardData(id as string, timePeriod);

  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  const handleExportFormatChange = async (value: string) => {
    if (value === "pdf") {
      setIsExporting(true);
      try {
        const reportData = {
          revenue: revenue || { current: 0, previous: 0, change: 0 },
          orders: orders || { current: 0, previous: 0, change: 0 },
          customers: customers || { current: 0, previous: 0, change: 0 },
          lowStock: lowStock || 0,
          chartData: sortedChartData || [],
          timePeriod: timePeriod,
        };

        await generatePDFReport(reportData, "Warung Dashboard");

        toast.success("Export Berhasil");
      } catch (error) {
        console.error("Error exporting PDF:", error);
        toast.error("Export Gagal");
      } finally {
        setIsExporting(false);
      }
    } else if (value === "excel") {
      // Handle Excel export here
      console.log("Export excel");
    }
  };

  if (!router.isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <WarungDashboardLayout
      headerContent={
        <ReportHeader
          onExportFormatChange={handleExportFormatChange}
          onTimePeriodChange={handleTimePeriodChange}
          isExporting={isExporting}
        />
      }
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/report/`}
    >
      <ReportLayout>
        <div id="report-content" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricsCard
              title="Pendapatan"
              value={`Rp${revenue?.current.toLocaleString("id-ID") || "0"}`}
              iconBg="bg-primary"
              icon={<ArrowUpRight className="h-4 w-4" />}
              change={revenue?.change}
            />
            <MetricsCard
              title="Pesanan"
              value={orders?.current.toString() || "0"}
              iconBg="bg-yellow-500"
              icon={<ShoppingCart className="h-4 w-4" />}
              change={orders?.change}
            />
            <MetricsCard
              title="Stok Rendah"
              value={lowStock?.toString() || "0"}
              iconBg="bg-red-500"
              icon={<Utensils className="h-4 w-4" />}
            />
          </div>

          <BarChartCard data={sortedChartData} config={chartActivityConfig} />

          {/* Sales Summary Table */}
          <Card className="p-4">
            <h3 className="mb-4 text-lg font-semibold">Ringkasan Penjualan</h3>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Refunds</th>
                    <th className="px-4 py-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Gross Sales
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">0</td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Net Sales
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">0</td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Total Collected
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">0</td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Table */}
            <div className="overflow-x-auto md:hidden">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b text-left text-xs">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Refunds</th>
                    <th className="px-4 py-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Gross Sales
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      0
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Net Sales
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      0
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Total Collected
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      0
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </ReportLayout>
    </WarungDashboardLayout>
  );
};

export default ReportPage;
