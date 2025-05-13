import { Button } from "~/components/ui/button";
import { Check, X } from "lucide-react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import PaymentMethodBadge from "./PaymentMethodBadge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface Order {
  id: string;
  receiptNo: string;
  createdAt: Date;
  customer: { name: string } | null;
  totalAmount: number;
  paymentType: string;
  isPaid: boolean;
}

interface OrderListProps {
  orders?: Order[];
  isLoading: boolean;
}

export const OrderList = ({ orders, isLoading }: OrderListProps) => {
  const utils = api.useUtils();
  const { mutate: markAsPaid } = api.sale.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Order marked as paid");
      void utils.sale.getByStatus.invalidate();
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b text-left text-sm">
              <th className="px-4 py-3">Receipt No</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/50 border-b">
                <td className="max-w-[100px] truncate px-4 py-2">
                  {order.receiptNo}
                </td>
                <td className="min-w-[120px] px-4 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="max-w-[180px] truncate px-4 py-2">
                  {order.customer?.name || "Walk-in"}
                </td>
                <td className="min-w-[100px] px-4 py-2">
                  Rp{order.totalAmount.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-2">
                  <PaymentMethodBadge method={order.paymentType} />
                </td>
                <td className="min-w-[80px] px-4 py-2">
                  {order.isPaid ? (
                    <span className="flex items-center text-green-600">
                      <Check className="mr-1 h-4 w-4" />
                      <span>Paid</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <X className="mr-1 h-4 w-4" />
                      <span>Unpaid</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (shown on mobile) */}
      <div className="space-y-2 md:hidden">
        {orders.map((order) => (
          <Card key={order.id} className="hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm font-medium">
                {order.receiptNo}
              </CardTitle>
              <div className="text-muted-foreground text-xs">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p>{order.customer?.name || "Walk-in"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p>Rp{order.totalAmount.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <PaymentMethodBadge method={order.paymentType} />
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {order.isPaid ? (
                    <span className="flex items-center text-green-600">
                      <Check className="mr-1 h-4 w-4" />
                      <span>Paid</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <X className="mr-1 h-4 w-4" />
                      <span>Unpaid</span>
                    </span>
                  )}
                </div>
              </div>
              {!order.isPaid && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => markAsPaid({ id: order.id })}
                  >
                    Mark as Paid
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
