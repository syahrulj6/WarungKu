import { useState } from "react";
import { useRouter } from "next/router";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { useOrderStore } from "~/stores/order-store";
import { api } from "~/utils/api";
import { OrderHeader } from "../components/OrderHeader";
import { OrderList } from "../components/OrderList";
import { CheckoutForm } from "../components/CheckoutForm";

const OrderPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { items } = useOrderStore();
  const [activeTab, setActiveTab] = useState<"on-process" | "completed">(
    "on-process",
  );

  const { data: orders, isLoading } = api.sale.getByStatus.useQuery(
    {
      warungId: id as string,
      isPaid: activeTab === "completed",
    },
    {
      enabled: !!id,
    },
  );

  return (
    <WarungDashboardLayout
      withRightPanel={true}
      headerContent={
        <OrderHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      }
      metaTitle="Pesanan"
      metaDescription="Kelola pesanan warung Anda"
      pathname={`/dashboard/warung/${id}/order`}
    >
      <div className="flex flex-col gap-6">
        {activeTab === "on-process" ? (
          items.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border p-8 text-center">
              No items in order. Please add items from the menu.
            </div>
          ) : (
            <CheckoutForm />
          )
        ) : (
          <OrderList orders={orders} isLoading={isLoading} />
        )}
      </div>
    </WarungDashboardLayout>
  );
};

export default OrderPage;
