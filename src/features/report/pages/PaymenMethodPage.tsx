import { useRouter } from "next/router";
import { format, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { ReportHeader } from "../components/ReportHeader";
import { api } from "~/utils/api";
import type { DateRange } from "react-day-picker";
import { Card } from "~/components/ui/card";
import PaymentMethodBadge from "~/features/kasir/components/PaymentMethodBadge";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

const PaymenMethodPage = () => {
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

  const { data, isLoading } = api.sale.getPaymentMethodSummary.useQuery(
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
      toast.info("Export untuk laporan metode pembayaran segera hadir.");
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
      pathname={`/dashboard/kasir/${id}/report/payment-method`}
    >
      <ReportLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold md:text-2xl">
            Laporan Metode Pembayaran ({periodLabel})
          </h1>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Total Transaksi</p>
              <p className="text-2xl font-bold">
                {isLoading ? "-" : (data?.totalOrders ?? 0).toLocaleString("id-ID")}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Total Nominal</p>
              <p className="text-2xl font-bold">
                {isLoading
                  ? "-"
                  : `Rp${(data?.totalAmount ?? 0).toLocaleString("id-ID")}`}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Jumlah Metode Aktif</p>
              <p className="text-2xl font-bold">
                {isLoading ? "-" : (data?.summary.length ?? 0).toLocaleString("id-ID")}
              </p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="mb-4 text-lg font-semibold">
              Rincian Metode Pembayaran
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !data?.summary.length ? (
              <div className="text-muted-foreground rounded-lg border p-8 text-center">
                Belum ada data pembayaran pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b text-left text-sm">
                      <th className="px-4 py-3">Metode</th>
                      <th className="px-4 py-3">Total Transaksi</th>
                      <th className="px-4 py-3">Transaksi Dibayar</th>
                      <th className="px-4 py-3">Total Nominal</th>
                      <th className="px-4 py-3">Kontribusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.summary.map((item) => {
                      const contribution =
                        data.totalAmount > 0
                          ? (item.totalAmount / data.totalAmount) * 100
                          : 0;
                      return (
                        <tr key={item.paymentType} className="border-b">
                          <td className="px-4 py-2">
                            <PaymentMethodBadge method={item.paymentType} />
                          </td>
                          <td className="px-4 py-2">
                            {item.orders.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-2">
                            {item.paidOrders.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-2">
                            Rp{item.totalAmount.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-2">
                            {contribution.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
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

export default PaymenMethodPage;



