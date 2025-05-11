import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { useOrderStore } from "~/stores/order-store";
import { CheckoutForm } from "../components/CheckoutForm";

const OrderPage = () => {
  const { items } = useOrderStore();

  return (
    <WarungDashboardLayout withRightPanel={true}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        {items.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border p-8 text-center">
            No items in order. Please add items from the menu.
          </div>
        ) : (
          <CheckoutForm />
        )}
      </div>
    </WarungDashboardLayout>
  );
};

export default OrderPage;
