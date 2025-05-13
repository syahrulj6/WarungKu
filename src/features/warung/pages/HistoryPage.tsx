import { useState } from "react";
import { api } from "~/utils/api";
import { OrderList } from "../components/OrderList";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";
import { HistoryHeader } from "../components/HistoryHeader";

const HistoryPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: saleData, isLoading } = debouncedSearchTerm
    ? api.sale.searchSaleByReceiptNumber.useQuery(
        {
          receiptNumber: debouncedSearchTerm,
        },
        {
          enabled: !!debouncedSearchTerm && !!id,
        },
      )
    : selectedDate
      ? api.sale.getSaleByDate.useQuery(
          {
            date: selectedDate as Date,
          },
          {
            enabled: !!selectedDate && !!id,
          },
        )
      : api.sale.getByStatus.useQuery(
          {
            warungId: id as string,
            isPaid: true,
          },
          {
            enabled: !!id,
          },
        );

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSearchTerm("");
  };

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const formattedDate = selectedDate?.toLocaleDateString("id-ID", options);

  const textHeading = selectedDate
    ? `Riwayat Pesanan (${formattedDate})`
    : debouncedSearchTerm
      ? `Riwayat Pesanan (${debouncedSearchTerm})`
      : "Riwayat Pesanan (All time)";

  return (
    <WarungDashboardLayout
      headerContent={
        <HistoryHeader
          formattedDate={formattedDate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          date={selectedDate}
          onDateChange={handleDateChange}
        />
      }
    >
      <div className="flex flex-col gap-3 md:gap-6">
        <h1 className="font-bold md:text-2xl">{textHeading}</h1>
        <OrderList orders={saleData} isLoading={isLoading} />
      </div>
    </WarungDashboardLayout>
  );
};

export default HistoryPage;
