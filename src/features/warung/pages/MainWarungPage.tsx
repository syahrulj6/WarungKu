import { useRouter } from "next/router";
import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { api } from "~/utils/api";
import { MetricsCard } from "../components/MetricsCard";
import {
  ArrowUpRight,
  CupSoda,
  Mail,
  ShoppingCart,
  Utensils,
} from "lucide-react";
import { BarChartCard } from "../components/BarChartCard";
import { PieChartCard } from "../components/PieChartCard";
import { useWarungDashboardData } from "~/hooks/useDashboardData";
import { chartActivityConfig } from "~/utils/type";

const MainDashboardPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: warung } = api.warung.getWarungById.useQuery(
    {
      warungId: id as string,
    },
    {
      enabled: !!id,
    },
  );

  const {
    sortedChartData,
    pieChartData,
    totalActivities,
    last7DaysCount,
    activityCounts,
  } = useWarungDashboardData(id as string);

  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("id-ID", options);

  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
      headerContent={
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold md:text-xl">
              Warung {warung?.name || "Warung Dashboard"}
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              {formattedDate}
            </p>
          </div>
        </div>
      }
    >
      {/* Metrics Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <MetricsCard
          title="Pendapatan"
          value="Rp 1.250.000"
          iconBg="bg-primary"
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <MetricsCard
          title="Pesanan"
          value={totalActivities.toString()}
          iconBg="bg-yellow-500"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <MetricsCard
          title="Aktivitas 7 Hari"
          value={last7DaysCount.toString()}
          iconBg="bg-red-500"
          icon={<Utensils className="h-4 w-4" />}
        />
        <MetricsCard
          title="Produk Terjual"
          value="24"
          iconBg="bg-blue-500"
          icon={<CupSoda className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <BarChartCard data={sortedChartData} config={chartActivityConfig} />
        </div>
        <PieChartCard
          data={pieChartData}
          totalActivities={totalActivities}
          config={chartActivityConfig}
        />
      </div>
    </WarungDashboardLayout>
  );
};

export default MainDashboardPage;
