import Image from "next/image";
import { Card } from "~/components/ui/card";
import { formatRupiah } from "~/lib/format";

interface MenuCardProps {
  name: string;
  productImage?: string;
  price: number;
  stock: number;
}

export const MenuCard = ({
  name,
  productImage,
  price,
  stock,
}: MenuCardProps) => {
  return (
    <Card className="md flex flex-col items-center gap-2 pt-0 pb-2 hover:cursor-pointer md:pb-3">
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
  );
};
