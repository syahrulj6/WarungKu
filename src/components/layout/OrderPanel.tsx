import { Button } from "~/components/ui/button";
import { formatRupiah } from "~/lib/format";
import { useOrderStore } from "~/stores/order-store";
import { Input } from "~/components/ui/input";
import { Trash2 } from "lucide-react";
import Image from "next/image";

export const OrderPanel = () => {
  const { items, updateQuantity, removeItem, clearOrder } = useOrderStore();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center">No items in order</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
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
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-primary text-sm font-semibold">
                    {formatRupiah(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    className="w-16"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
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
                Clear
              </Button>
              <Button className="flex-1">Checkout</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
