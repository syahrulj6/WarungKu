import Image from "next/image";
import { Card } from "~/components/ui/card";
import { formatRupiah } from "~/lib/format";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useOrderStore } from "~/stores/order-store";

interface ProductCardProps {
  name: string;
  productImage?: string;
  price: number;
  stock: number;
  id: string;
  onEdit?: () => void;
  onDelete?: () => void;
  canManageProducts?: boolean;
}

export const ProductCard = ({
  name,
  productImage,
  price,
  stock,
  id,
  onEdit,
  onDelete,
  canManageProducts = false,
}: ProductCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useOrderStore();

  const handleAddToOrder = () => {
    addItem({
      id,
      name,
      price,
      productImage,
      quantity,
    });
    setQuantity(1);
    setIsOpen(false);
  };

  return (
    <>
      <Card
        className="md relative flex flex-col items-center gap-2 pt-0 pb-2 hover:cursor-pointer md:pb-3"
        onClick={() => setIsOpen(true)}
      >
        {canManageProducts && (
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit produk</span>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Hapus produk</span>
            </Button>
          </div>
        )}

        <div className="relative aspect-square h-32 w-full md:h-52">
          <Image
            src={productImage || "/assets/image1.jpg"}
            alt="product image"
            fill
            className="rounded-md object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <h1 className="text-lg font-semibold md:text-xl">{name}</h1>
        <p className="text-primary text-sm font-semibold md:text-base">
          {formatRupiah(price)}
        </p>
        <p className="text-xs md:text-sm">
          {stock} <span className="text-muted-foreground">Tersedia</span>
        </p>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah ke Pesanan</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <Image
                  src={productImage || "/assets/image1.jpg"}
                  alt="product image"
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-primary text-sm font-semibold">
                  {formatRupiah(price)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {stock} tersedia
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="quantity" className="text-sm font-medium">
                Jumlah
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20"
              />
            </div>

            <div className="flex justify-between">
              <p className="text-sm font-medium">Total</p>
              <p className="text-primary font-semibold">
                {formatRupiah(price * quantity)}
              </p>
            </div>

            <Button onClick={handleAddToOrder} className="mt-2">
              Tambah ke Pesanan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
