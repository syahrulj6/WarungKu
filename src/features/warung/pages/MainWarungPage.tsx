import { useRouter } from "next/router";
import React, { useState } from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { api } from "~/utils/api";
import { MetricsCard } from "../components/MetricsCard";
import { ArrowUpRight, ShoppingCart, Users, Utensils } from "lucide-react";
import { BarChartCard } from "../components/BarChartCard";
import { PieChartCard } from "../components/PieChartCard";
import {
  useWarungDashboardData,
  type TimePeriod,
} from "~/hooks/useDashboardData";
import { chartActivityConfig } from "~/utils/type";
import { DishCard } from "../components/DishCard";
import { Button } from "~/components/ui/button";

const MainDashboardPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all-time");

  const { data: warung } = api.warung.getWarungById.useQuery(
    {
      warungId: id as string,
    },
    {
      enabled: !!id,
    },
  );

  const { data: productData } = api.product.getTrendingProduct.useQuery();

  const {
    sortedChartData,
    pieChartData,
    totalActivities,
    revenue,
    orders,
    customers,
    lowStock,
    activitiesChange,
  } = useWarungDashboardData(id as string, timePeriod);

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
      metaTitle="Warung Dashboard"
      metaDescription="Kelola warung Anda dengan mudah melalui dashboard Warung"
      pathname={`/dashboard/warung/${id}/`}
      withRightPanel={true}
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
      <div className="flex flex-col gap-4">
        {/* Time period selector */}
        <div className="flex gap-2">
          <Button
            variant={timePeriod === "all-time" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimePeriod("all-time")}
          >
            Semua Waktu
          </Button>
          <Button
            variant={timePeriod === "30-hari" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimePeriod("30-hari")}
          >
            30 Hari
          </Button>
          <Button
            variant={timePeriod === "1-tahun" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimePeriod("1-tahun")}
          >
            1 Tahun
          </Button>
        </div>

        {/* Metrics Card */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <MetricsCard
            title="Pendapatan"
            value={`Rp${revenue?.current.toLocaleString("id-ID") || "0"}`}
            iconBg="bg-primary"
            icon={<ArrowUpRight className="h-4 w-4" />}
            change={revenue?.change}
            showChange={timePeriod !== "all-time"}
          />
          <MetricsCard
            title="Pesanan"
            value={orders?.current.toString() || "0"}
            iconBg="bg-yellow-500"
            icon={<ShoppingCart className="h-4 w-4" />}
            change={orders?.change}
            showChange={timePeriod !== "all-time"}
          />
          <MetricsCard
            title="Stok Rendah"
            value={lowStock?.toString() || "0"}
            iconBg="bg-red-500"
            icon={<Utensils className="h-4 w-4" />}
          />
          <MetricsCard
            title="Pelanggan Baru"
            value={customers?.current.toString() || "0"}
            iconBg="bg-blue-500"
            icon={<Users className="h-4 w-4" />}
            change={customers?.change}
            showChange={timePeriod !== "all-time"}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <BarChartCard
              data={sortedChartData}
              config={chartActivityConfig}
              timePeriod={timePeriod}
            />
          </div>
          <PieChartCard
            data={pieChartData}
            totalActivities={totalActivities}
            config={chartActivityConfig}
            change={activitiesChange}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <DishCard title="Trending Dishes" dishesData={productData} />
          <DishCard title="Out of Stock" dishesData={productData} />
        </div>
      </div>
    </WarungDashboardLayout>
  );
};

export default MainDashboardPage;
