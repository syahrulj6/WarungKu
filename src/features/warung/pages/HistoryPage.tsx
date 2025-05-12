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

  const { data: orders, isLoading } = api.sale.getByStatus.useQuery(
    {
      warungId: id as string,
      isPaid: true,
    },
    {
      enabled: !!id,
    },
  );

  const { data: searchedOrders, isLoading: isSearching } =
    api.sale.searchSaleByReceiptNumber.useQuery(
      {
        receiptNumber: debouncedSearchTerm,
      },
      {
        enabled: !!debouncedSearchTerm && !!id,
      },
    );

  const { data: dateFilteredOrders, isLoading: isDateLoading } =
    api.sale.getSaleByDate.useQuery(
      {
        date: selectedDate as Date,
      },
      {
        enabled: !!selectedDate && !!id,
      },
    );

  const displayedOrders = debouncedSearchTerm
    ? searchedOrders
    : selectedDate
      ? dateFilteredOrders
      : orders;

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
    : searchTerm
      ? `Riwayat Pesanan (${searchTerm})`
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
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">{textHeading}</h1>
        <OrderList
          orders={displayedOrders}
          isLoading={isLoading || isSearching || isDateLoading}
        />
      </div>
    </WarungDashboardLayout>
  );
};

export default HistoryPage;
