import Image from "next/image";
import { Card } from "~/components/ui/card";
import { formatRupiah } from "~/lib/format";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface MenuCardProps {
  name: string;
  productImage?: string;
  price: number;
  stock: number;
  id: string;
}

export const MenuCard = ({
  name,
  productImage,
  price,
  stock,
  id,
}: MenuCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToOrder = () => {
    console.log(`Added ${quantity} ${name} to order`);
    setIsOpen(false);
  };

  return (
    <>
      <Card
        className="md flex flex-col items-center gap-2 pt-0 pb-2 hover:cursor-pointer md:pb-3"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative aspect-square h-32 w-full md:h-52">
          <Image
            src={productImage ?? ""}
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
            <DialogTitle>Add to Order</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <Image
                  src={productImage ?? ""}
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
                  {stock} available
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
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
              Add to Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
