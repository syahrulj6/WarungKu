import { ArrowUpRight, Loader, ShoppingCart, Utensils } from "lucide-react";
import { useRouter } from "next/router";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { ReportHeader } from "../components/ReportHeader";
import { useWarungDashboardData } from "~/hooks/useDashboardData";
import { MetricsCard } from "~/features/warung/components/MetricsCard";
import { BarChartCard } from "~/features/warung/components/BarChartCard";
import { chartActivityConfig } from "~/utils/type";

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { sortedChartData, revenue, orders, lowStock } = useWarungDashboardData(
    id as string,
  );

  if (!router.isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex h-screen items-center justify-center">
        Invalid warung ID
      </div>
    );
  }

  return (
    <WarungDashboardLayout
      headerContent={<ReportHeader />}
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/report/`}
    >
      {/* TODO: Report Sidebar */}
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
        </div>
      </ReportLayout>
    </WarungDashboardLayout>
  );
};

export default ReportPage;
