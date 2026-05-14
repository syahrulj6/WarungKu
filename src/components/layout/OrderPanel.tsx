import { Button } from "~/components/ui/button";
import { formatRupiah } from "~/lib/format";
import { useOrderStore } from "~/stores/order-store";
import { Input } from "~/components/ui/input";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export const OrderPanel = () => {
  const { items, updateQuantity, removeItem, clearOrder } = useOrderStore();
  const router = useRouter();
  const { id } = router.query;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-w-0 overflow-x-hidden">
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center">Belum ada pesanan</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2"
              >
                {item.productImage && (
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      src={item.productImage}
                      alt={item.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="truncate font-medium">{item.name}</h4>
                  <p className="text-primary text-sm font-semibold">
                    {formatRupiah(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    className="h-9 w-14 px-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatRupiah(total)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearOrder}>
                Bersihkan
              </Button>
              <Button className="flex-1" asChild>
                <Link href={`/dashboard/kasir/${id}/order`}>Checkout</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


