import { useRouter } from "next/router";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { useOrderStore } from "~/stores/order-store";
import { CheckoutForm } from "../components/CheckoutForm";

const OrderPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { items } = useOrderStore();

  return (
    <KasirDashboardLayout
      withRightPanel={true}
      metaTitle="Pesanan"
      metaDescription="Kelola pesanan Kasirium Anda"
      pathname={`/dashboard/kasir/${id}/order`}
    >
      <div className="flex flex-col gap-6">
        {items.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border p-8 text-center">
            No items in order. Please add items from the menu.
          </div>
        ) : (
          <CheckoutForm />
        )}
      </div>
    </KasirDashboardLayout>
  );
};

export default OrderPage;


