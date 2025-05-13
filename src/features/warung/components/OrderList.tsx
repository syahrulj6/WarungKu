import { Button } from "~/components/ui/button";
import { Check, X } from "lucide-react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import PaymentMethodBadge from "./PaymentMethodBadge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { Product } from "@prisma/client";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  receiptNo: string;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  totalAmount: number;
  paymentType: string;
  isPaid: boolean;
  items: OrderItem[];
}

interface OrderListProps {
  orders?: Order[];
  isLoading: boolean;
}

export const OrderList = ({ orders, isLoading }: OrderListProps) => {
  const utils = api.useUtils();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-muted/50 border-b"
                onClick={() => setSelectedOrder(order)}
              >
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
                      <span>Dibayar</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <X className="mr-1 h-4 w-4" />
                      <span>Belum dibayar</span>
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
          <Card
            key={order.id}
            className="hover:bg-muted/50"
            onClick={() => setSelectedOrder(order)}
          >
            <CardHeader className="flex flex-row justify-between space-y-0 p-4 pb-2">
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
                  <p className="text-muted-foreground">Pelanggan</p>
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
                      <span>Dibayar</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <X className="mr-1 h-4 w-4" />
                      <span>Belum dibayar</span>
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
                    Tandai telah dibayar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Nomer Receipt</h3>
                    <p>{selectedOrder.receiptNo}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Tanggal</h3>
                    <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Pelanggan</h3>
                  <p>{selectedOrder.customer?.name || "Walk-in"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Payment Method</h3>
                    <PaymentMethodBadge method={selectedOrder.paymentType} />
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    {selectedOrder.isPaid ? (
                      <span className="flex items-center text-green-600">
                        <Check className="mr-1 h-4 w-4" />
                        <span>Dibayar</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <X className="mr-1 h-4 w-4" />
                        <span>Belum dibayar</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Total Harga</h3>
                  <p className="text-lg font-semibold">
                    Rp{selectedOrder.totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Items</h3>
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product.name}</span>
                      <span>Rp{item.price.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                {!selectedOrder.isPaid && (
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      markAsPaid({ id: selectedOrder.id });
                      setSelectedOrder(null);
                    }}
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
