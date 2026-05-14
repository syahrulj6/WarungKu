import { Coffee, Pizza, Star, Cookie, Grip, Dot } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

export const CategoryList = ({
  onCategoryChange,
}: {
  onCategoryChange: (categoryId: string | null) => void;
}) => {
  const router = useRouter();
  const { id } = router.query;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: categories, isLoading } = api.category.getAllCategory.useQuery(
    { warungId: id as string },
    { enabled: !!id },
  );

  const defaultCategoryIcons: Record<string, React.ReactNode> = {
    Food: <Pizza className="h-4 w-4" />,
    Makanan: <Pizza className="h-4 w-4" />,
    Beverage: <Coffee className="h-4 w-4" />,
    Minuman: <Coffee className="h-4 w-4" />,
    Snack: <Cookie className="h-4 w-4" />,
    Camilan: <Cookie className="h-4 w-4" />,
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-28" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <div>Kategori belum tersedia</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={activeCategory === null ? "default" : "secondary"}
        onClick={() => handleCategoryClick(null)}
      >
        <Grip className="h-4 w-4" />
        <span className="ml-2">Semua Produk</span>
      </Button>

      <Button
        variant={activeCategory === "best-seller" ? "default" : "secondary"}
        onClick={() => handleCategoryClick("best-seller")}
      >
        <Star className="h-4 w-4" />
        <span className="ml-2">Terlaris</span>
      </Button>

      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "secondary"}
          onClick={() => handleCategoryClick(category.id)}
          className={cn(
            "transition-colors",
            activeCategory === category.id &&
              "bg-primary text-primary-foreground",
          )}
        >
          {defaultCategoryIcons[category.name] || (
            <span className="flex h-4 w-4 items-center justify-center">
              <Dot />
            </span>
          )}
          <span className="ml-2">{category.name}</span>
        </Button>
      ))}
    </div>
  );
};
