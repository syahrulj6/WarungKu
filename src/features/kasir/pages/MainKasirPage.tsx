import { useRouter } from "next/router";
import React, { useState } from "react";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { api } from "~/utils/api";
import { MetricsCard } from "../components/MetricsCard";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  HandCoins,
  ShoppingCart,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";
import { BarChartCard } from "../components/BarChartCard";
import { PieChartCard } from "../components/PieChartCard";
import {
  useKasirDashboardData,
  type TimePeriod,
} from "~/hooks/useDashboardData";
import { chartActivityConfig } from "~/utils/type";
import { DishCard } from "../components/DishCard";
import { Button } from "~/components/ui/button";

const MainDashboardPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30-hari");

  const { data: Kasir } = api.kasir.getKasirById.useQuery(
    {
      warungId: id as string,
    },
    {
      enabled: !!id,
    },
  );

  const { data: productData } = api.product.getTrendingProduct.useQuery();
  const { data: lowStockProducts } = api.product.getLowStockProduct.useQuery(
    {
      warungId: id as string,
      limit: 4,
    },
    { enabled: !!id },
  );

  const {
    sortedChartData,
    pieChartData,
    totalActivities,
    revenue,
    grossSales,
    cogs,
    orders,
    customers,
    lowStock,
    unpaidOrders,
    averageOrderValue,
    activitiesChange,
  } = useKasirDashboardData(id as string, timePeriod);

  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("id-ID", options);

  return (
    <KasirDashboardLayout
      metaTitle="Kasirium Dashboard"
      metaDescription="Kelola Bisnis Anda dengan mudah melalui dashboard Kasirium"
      pathname={`/dashboard/kasir/${id}/`}
      withRightPanel={true}
      headerContent={
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold md:text-xl">
              Kasir {Kasir?.name || "Kasirium Dashboard"}
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
            title="Laba Kotor"
            value={`Rp${revenue?.current.toLocaleString("id-ID") || "0"}`}
            iconBg="bg-emerald-600"
            icon={<ArrowUpRight className="h-4 w-4" />}
            change={revenue?.change}
            showChange={true}
          />
          <MetricsCard
            title="Omzet (Penjualan)"
            value={`Rp${grossSales?.current.toLocaleString("id-ID") || "0"}`}
            iconBg="bg-primary"
            icon={<Banknote className="h-4 w-4" />}
            change={grossSales?.change}
            showChange={true}
          />
          <MetricsCard
            title="Modal Terjual"
            value={`Rp${cogs?.current.toLocaleString("id-ID") || "0"}`}
            iconBg="bg-orange-500"
            icon={<ArrowDownRight className="h-4 w-4" />}
            showChange={false}
          />
          <MetricsCard
            title="Pesanan"
            value={orders?.current.toString() || "0"}
            iconBg="bg-yellow-500"
            icon={<ShoppingCart className="h-4 w-4" />}
            change={orders?.change}
            showChange={true}
          />
          <MetricsCard
            title="Stok Rendah"
            value={lowStock?.toString() || "0"}
            iconBg="bg-red-500"
            icon={<Utensils className="h-4 w-4" />}
            showChange={false}
          />
          <MetricsCard
            title="Pesanan Belum Dibayar"
            value={unpaidOrders?.current.toString() || "0"}
            iconBg="bg-amber-600"
            icon={<WalletCards className="h-4 w-4" />}
            showChange={false}
          />
          <MetricsCard
            title="Pelanggan Baru"
            value={customers?.current.toString() || "0"}
            iconBg="bg-blue-500"
            icon={<Users className="h-4 w-4" />}
            change={customers?.change}
            showChange={true}
          />
          <MetricsCard
            title="Rata-rata Nilai Pesanan"
            value={`Rp${averageOrderValue?.current.toLocaleString("id-ID") || "0"}`}
            iconBg="bg-indigo-600"
            icon={<HandCoins className="h-4 w-4" />}
            showChange={false}
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
          <DishCard
            title="Produk Unggulan"
            dishesData={productData}
            ctaHref={`/dashboard/kasir/${id as string}/product`}
          />
          <DishCard
            title="Perlu Perhatian Stok"
            dishesData={lowStockProducts}
            ctaHref={`/dashboard/kasir/${id as string}/alert`}
          />
        </div>
      </div>
    </KasirDashboardLayout>
  );
};

export default MainDashboardPage;


