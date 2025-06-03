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

type TimePeriod = "7-days" | "30-days" | "1-year";

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("7-days");

  // Fix: Pass the timePeriod state to the hook
  const { sortedChartData, revenue, orders, lowStock } = useWarungDashboardData(
    id as string,
    timePeriod, // This was missing!
  );

  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  const handleExportFormatChange = (value: string) => {
    // Handle export logic here
    console.log("Export format selected:", value);
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
        />
      }
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/report/`}
    >
      <ReportLayout>
        <div className="flex flex-col gap-4">
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

          <>
            {/* Desktop Table (hidden on mobile) */}
            <Card className="hidden overflow-x-auto md:block">
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
            </Card>

            {/* Mobile Table (shown on mobile) */}
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
          </>
        </div>
      </ReportLayout>
    </WarungDashboardLayout>
  );
};

export default ReportPage;
