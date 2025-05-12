import { useState } from "react";
import { api } from "~/utils/api";
import { OrderList } from "../components/OrderList";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { useRouter } from "next/router";

const HistoryPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: orders, isLoading } = api.sale.getByStatus.useQuery(
    {
      warungId: id as string,
      isPaid: true,
    },
    {
      enabled: !!id,
    },
  );

  return (
    <WarungDashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Order History</h1>
        <OrderList orders={orders} isLoading={isLoading} />
      </div>
    </WarungDashboardLayout>
  );
};

export default HistoryPage;
