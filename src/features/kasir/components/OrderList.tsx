import { Button } from "~/components/ui/button";
import { Check, X } from "lucide-react";
import type { PaymentType } from "@prisma/client";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import PaymentMethodBadge from "./PaymentMethodBadge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useRouter } from "next/router";
import { InvoiceCard } from "./InvoiceCard";

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
  discount: number;
  tax: number;
  paymentType: PaymentType;
  isPaid: boolean;
  notes: string | null;
  items: OrderItem[];
}

interface OrderListProps {
  orders?: Order[];
  isLoading: boolean;
}

export const OrderList = ({ orders, isLoading }: OrderListProps) => {
  const router = useRouter();
  const { id } = router.query;
  const utils = api.useUtils();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data: Kasir } = api.kasir.getKasirById.useQuery(
    { warungId: id as string },
    { enabled: !!id },
  );

  const { mutate: markAsPaid } = api.sale.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Pesanan ditandai sudah dibayar");
      void utils.sale.getByStatus.invalidate();
    },
    onError: () => {
      toast.error("Gagal memperbarui status pesanan");
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
        <p className="text-muted-foreground">Tidak ada pesanan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-printable,
          .invoice-printable * {
            visibility: visible;
          }
          .invoice-printable {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b text-left text-sm">
              <th className="px-4 py-3">No. Struk</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pembayaran</th>
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
                  {order.customer?.name || "Umum"}
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

      {/* Mobile Table (shown on mobile) */}
      <div className="overflow-x-auto md:hidden">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b text-left text-xs">
              <th className="px-3 py-2">Struk</th>
              <th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Pelanggan</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-muted/50 border-b text-xs"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="max-w-[80px] truncate px-3 py-2">
                  {order.receiptNo}
                </td>
                <td className="min-w-[80px] px-3 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="max-w-[120px] truncate px-3 py-2">
                  {order.customer?.name || "Umum"}
                </td>
                <td className="min-w-[80px] px-3 py-2">
                  Rp{order.totalAmount.toLocaleString("id-ID")}
                </td>
                <td className="min-w-[80px] px-3 py-2">
                  {order.isPaid ? (
                    <span className="flex items-center text-green-600">
                      <Check className="mr-1 h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <X className="mr-1 h-4 w-4" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Order</DialogTitle>
                <DialogDescription>
                  Informasi detail tentang pesanan
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Nomer Struk</h3>
                    <p>{selectedOrder.receiptNo}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Tanggal</h3>
                    <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Pelanggan</h3>
                  <p>{selectedOrder.customer?.name || "Umum"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Metode Pembayaran</h3>
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
                  <h3 className="font-medium">Item</h3>
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product.name}</span>
                      <span>Rp{item.price.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                {Kasir && (
                  <div className="invoice-printable rounded-lg border p-4">
                    <InvoiceCard invoice={selectedOrder} Kasir={Kasir} />
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.print()}
                  >
                    Cetak Invoice
                  </Button>
                  {!selectedOrder.isPaid && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        markAsPaid({ id: selectedOrder.id });
                        setSelectedOrder(null);
                      }}
                    >
                      Tandai Sudah Dibayar
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

