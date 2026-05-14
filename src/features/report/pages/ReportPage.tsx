import { ArrowUpRight, Loader, ShoppingCart, Utensils } from "lucide-react";
import { useRouter } from "next/router";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { ReportHeader } from "../components/ReportHeader";
import { useKasirDashboardData } from "~/hooks/useDashboardData";
import { MetricsCard } from "~/features/kasir/components/MetricsCard";
import { BarChartCard } from "~/features/kasir/components/BarChartCard";
import { chartActivityConfig } from "~/utils/type";
import { Card } from "~/components/ui/card";
import { useState } from "react";
import { generatePDFReport } from "~/utils/pdfExport";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

type TimePeriod = "7-hari" | "30-hari" | "1-tahun";

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("7-hari");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const {
    sortedChartData,
    revenue,
    orders,
    customers,
    lowStock,
    grossSales,
    cogs,
    unpaidAmount,
  } = useKasirDashboardData(id as string, timePeriod, dateRange);

  const handleTimePeriodChange = (value: string) => {
    setDateRange(undefined);
    setTimePeriod(value as TimePeriod);
  };

  const periodLabelMap: Record<TimePeriod, string> = {
    "7-hari": "7 Hari Terakhir",
    "30-hari": "30 Hari Terakhir",
    "1-tahun": "1 Tahun Terakhir",
  };

  const dashboardLabel = dateRange?.from
    ? `Dari ${format(dateRange.from, "dd MMM yyyy")} sampai ${format(
        dateRange.to ?? dateRange.from,
        "dd MMM yyyy",
      )}`
    : periodLabelMap[timePeriod];

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

        await generatePDFReport(reportData, "Kasirium Dashboard");

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
    <KasirDashboardLayout
      headerContent={
        <ReportHeader
          onExportFormatChange={handleExportFormatChange}
          onTimePeriodChange={handleTimePeriodChange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          isExporting={isExporting}
        />
      }
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai Kasirium Anda"
      pathname={`/dashboard/kasir/${id}/report/`}
    >
      <ReportLayout>
        <div id="report-content" className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold md:text-2xl">
            Dashboard Laporan ({dashboardLabel})
          </h1>
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

          <BarChartCard
            data={sortedChartData}
            config={chartActivityConfig}
            timePeriod={timePeriod}
          />

          {/* Sales Summary Table */}
          <Card className="p-4">
            <h3 className="mb-4 text-lg font-semibold">Ringkasan Penjualan</h3>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Penjualan</th>
                    <th className="px-4 py-3">Potongan</th>
                    <th className="px-4 py-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Penjualan Kotor
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{grossSales?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">0</td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{grossSales?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      COGS
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{cogs?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">0</td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{cogs?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Laba Bersih
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{grossSales?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{cogs?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Nominal Belum Dibayar
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{unpaidAmount?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[100px] truncate px-4 py-2">0</td>
                    <td className="max-w-[100px] truncate px-4 py-2">
                      Rp{unpaidAmount?.current.toLocaleString("id-ID") || "0"}
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
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Penjualan</th>
                    <th className="px-4 py-3">Potongan</th>
                    <th className="px-4 py-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Penjualan Kotor
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{grossSales?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      0
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{grossSales?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      COGS
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{cogs?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      0
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{cogs?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Laba Bersih
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{grossSales?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{cogs?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{revenue?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Nominal Belum Dibayar
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{unpaidAmount?.current.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      0
                    </td>
                    <td className="max-w-[70px] truncate px-4 py-2 text-xs">
                      Rp{unpaidAmount?.current.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </ReportLayout>
    </KasirDashboardLayout>
  );
};

export default ReportPage;



