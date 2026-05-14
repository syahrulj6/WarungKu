import { useState } from "react";
import { api } from "~/utils/api";
import { OrderList } from "../components/OrderList";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";
import { HistoryHeader, type HistoryPeriod } from "../components/HistoryHeader";
import { endOfDay, startOfDay, subDays, subMonths, subYears } from "date-fns";

const HistoryPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [period, setPeriod] = useState<HistoryPeriod>("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const buildDateRange = () => {
    const now = new Date();

    if (selectedDate) {
      return {
        startDate: startOfDay(selectedDate),
        endDate: endOfDay(selectedDate),
      };
    }

    if (period === "all-time") {
      return {
        startDate: undefined,
        endDate: undefined,
      };
    }

    if (period === "7-days") {
      return {
        startDate: startOfDay(subDays(now, 6)),
        endDate: endOfDay(now),
      };
    }

    if (period === "1-month") {
      return {
        startDate: startOfDay(subMonths(now, 1)),
        endDate: endOfDay(now),
      };
    }

    if (period === "1-year") {
      return {
        startDate: startOfDay(subYears(now, 1)),
        endDate: endOfDay(now),
      };
    }

    return {
      startDate: startOfDay(now),
      endDate: endOfDay(now),
    };
  };

  const { startDate, endDate } = buildDateRange();

  const { data: saleData, isLoading } = api.sale.getHistory.useQuery(
    {
      warungId: id as string,
      isPaid: true,
      searchTerm: debouncedSearchTerm || undefined,
      startDate,
      endDate,
    },
    {
      enabled: !!id,
    },
  );

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handlePeriodChange = (value: HistoryPeriod) => {
    setPeriod(value);
    if (value === "all-time") {
      setSelectedDate(undefined);
      return;
    }
    if (value === "today") {
      setSelectedDate(new Date());
      return;
    }
    setSelectedDate(undefined);
  };

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("id-ID", options)
    : undefined;

  const periodLabelMap: Record<HistoryPeriod, string> = {
    today: "Hari Ini",
    "7-days": "7 Hari Terakhir",
    "1-month": "1 Bulan Terakhir",
    "1-year": "1 Tahun Terakhir",
    "all-time": "Semua Waktu",
  };

  const textHeading = selectedDate
    ? `Riwayat Pesanan (${formattedDate})`
    : debouncedSearchTerm
      ? `Riwayat Pesanan (${debouncedSearchTerm})`
      : `Riwayat Pesanan (${periodLabelMap[period]})`;

  return (
    <KasirDashboardLayout
      headerContent={
        <HistoryHeader
          formattedDate={formattedDate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          date={selectedDate}
          onDateChange={handleDateChange}
          period={period}
          onPeriodChange={handlePeriodChange}
        />
      }
      metaTitle="Riwayat Pesanan"
      metaDescription="Riwayat pesanan Kasirium Anda"
      pathname={`/dashboard/kasir/${id}/history`}
    >
      <div className="flex flex-col gap-3 md:gap-6">
        <h1 className="font-bold md:text-2xl">{textHeading}</h1>
        <OrderList orders={saleData} isLoading={isLoading} />
      </div>
    </KasirDashboardLayout>
  );
};

export default HistoryPage;


