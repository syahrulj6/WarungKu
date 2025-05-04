import type { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface DishCardProps {
  title: string;
  dishesData: Product[] | undefined;
  isLoading?: boolean;
}

export const DishCard = ({
  title,
  dishesData,
  isLoading = false,
}: DishCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div className="flex items-center gap-2" key={i}>
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!dishesData || dishesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">
            Tidak ada menu tersedia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <Button variant="ghost">
          Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dishesData.map((dish) => (
          <div className="flex items-center gap-2" key={dish.id}>
            <Image
              alt={dish.name}
              src={dish.productPictureUrl ?? "/placeholder-product.png"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <h4 className="font-semibold">{dish.name}</h4>
              <p className="text-muted-foreground text-sm">
                Pesanan: <span className="text-primary">{dish.stock}</span>
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
