import { useRouter } from "next/router";
import { format, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { Card } from "~/components/ui/card";
import { ReportHeader } from "../components/ReportHeader";
import type { DateRange } from "react-day-picker";
import { api } from "~/utils/api";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import PaymentMethodBadge from "~/features/kasir/components/PaymentMethodBadge";

const DiscountsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [timePeriod, setTimePeriod] = useState("30-hari");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { startDate, endDate } = useMemo(() => {
    if (dateRange?.from) {
      return {
        startDate: dateRange.from,
        endDate: dateRange.to ?? dateRange.from,
      };
    }

    const now = new Date();
    if (timePeriod === "7-hari") {
      return { startDate: subDays(now, 7), endDate: now };
    }
    if (timePeriod === "1-tahun") {
      return { startDate: subDays(now, 365), endDate: now };
    }
    return { startDate: subDays(now, 30), endDate: now };
  }, [dateRange, timePeriod]);

  const { data, isLoading } = api.sale.getDiscountSummary.useQuery(
    {
      warungId: id as string,
      startDate,
      endDate,
    },
    {
      enabled: !!id,
    },
  );

  const periodLabel = dateRange?.from
    ? `Dari ${format(dateRange.from, "dd MMM yyyy")} sampai ${format(
        dateRange.to ?? dateRange.from,
        "dd MMM yyyy",
      )}`
    : timePeriod === "7-hari"
      ? "7 Hari Terakhir"
      : timePeriod === "1-tahun"
        ? "1 Tahun Terakhir"
        : "30 Hari Terakhir";

  const handleExportFormatChange = (value: string) => {
    if (value === "pdf" || value === "excel") {
      toast.info("Export untuk laporan diskon segera hadir.");
    }
  };

  return (
    <KasirDashboardLayout
      headerContent={
        <ReportHeader
          onTimePeriodChange={(value) => {
            setDateRange(undefined);
            setTimePeriod(value);
          }}
          onExportFormatChange={handleExportFormatChange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      }
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai Kasirium Anda"
      pathname={`/dashboard/kasir/${id}/report/discounts`}
    >
      <ReportLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold md:text-2xl">
            Laporan Diskon ({periodLabel})
          </h1>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Total Transaksi</p>
              <p className="text-2xl font-bold">
                {isLoading ? "-" : (data?.totalOrders ?? 0).toLocaleString("id-ID")}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Transaksi Diskon</p>
              <p className="text-2xl font-bold">
                {isLoading
                  ? "-"
                  : (data?.discountedOrders ?? 0).toLocaleString("id-ID")}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Total Diskon</p>
              <p className="text-2xl font-bold">
                {isLoading
                  ? "-"
                  : `Rp${(data?.totalDiscountAmount ?? 0).toLocaleString("id-ID")}`}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Rata-rata Rate Diskon</p>
              <p className="text-2xl font-bold">
                {isLoading ? "-" : `${(data?.overallDiscountRate ?? 0).toFixed(2)}%`}
              </p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="mb-4 text-lg font-semibold">Rincian Diskon per Metode</h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !data?.summary.length ? (
              <div className="text-muted-foreground rounded-lg border p-8 text-center">
                Belum ada data diskon pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b text-left text-sm">
                      <th className="px-4 py-3">Metode</th>
                      <th className="px-4 py-3">Transaksi</th>
                      <th className="px-4 py-3">Penjualan Sebelum Diskon</th>
                      <th className="px-4 py-3">Nominal Diskon</th>
                      <th className="px-4 py-3">Penjualan Setelah Diskon</th>
                      <th className="px-4 py-3">Rate Diskon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.summary.map((item) => (
                      <tr key={item.paymentType} className="border-b">
                        <td className="px-4 py-2">
                          <PaymentMethodBadge method={item.paymentType} />
                        </td>
                        <td className="px-4 py-2">
                          {item.orders.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2">
                          Rp{item.grossBeforeDiscount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2">
                          Rp{item.discountAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2">
                          Rp{item.netBeforeTax.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2">
                          {item.discountRate.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </ReportLayout>
    </KasirDashboardLayout>
  );
};

export default DiscountsPage;



