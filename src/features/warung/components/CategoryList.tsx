import { Coffee, Pizza, Star, Cookie } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { cn } from "~/lib/utils";
import { useState } from "react";

export const CategoryList = ({
  onCategoryChange,
}: {
  onCategoryChange: (categoryId: string | null) => void;
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: categories, isLoading } =
    api.category.getAllCategory.useQuery();

  const defaultCategoryIcons: Record<string, React.ReactNode> = {
    Food: <Pizza className="h-4 w-4" />,
    Beverage: <Coffee className="h-4 w-4" />,
    Snack: <Cookie className="h-4 w-4" />,
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  if (isLoading) {
    return <div className="flex gap-2">Loading categories...</div>;
  }

  if (!categories || categories.length === 0) {
    return <div>No categories found</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={activeCategory === null ? "default" : "secondary"}
        onClick={() => handleCategoryClick(null)}
      >
        <span className="ml-2">All Products</span>
      </Button>

      {/* Best Seller (special case) */}
      <Button
        variant={activeCategory === "best-seller" ? "default" : "secondary"}
        onClick={() => handleCategoryClick("best-seller")}
      >
        <Star className="h-4 w-4" />
        <span className="ml-2">Best Seller</span>
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
            <span className="flex h-4 w-4 items-center justify-center">•</span>
          )}
          <span className="ml-2">{category.name}</span>
        </Button>
      ))}
    </div>
  );
};
