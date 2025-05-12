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

  const displayedOrders = debouncedSearchTerm ? searchedOrders : orders;

  return (
    <WarungDashboardLayout
      headerContent={
        <HistoryHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      }
    >
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Order History</h1>
        <OrderList
          orders={displayedOrders}
          isLoading={isLoading || isSearching}
        />
      </div>
    </WarungDashboardLayout>
  );
};

export default HistoryPage;
