import { Coffee, Pizza, Star, Cookie } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { cn } from "~/lib/utils";
import { useState } from "react";

export const CategoryList = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: categories, isLoading } =
    api.category.getAllCategory.useQuery();

  const defaultCategoryIcons: Record<string, React.ReactNode> = {
    Food: <Pizza className="h-4 w-4" />,
    Beverage: <Coffee className="h-4 w-4" />,
    Snack: <Cookie className="h-4 w-4" />,
  };

  if (isLoading) {
    return <div className="flex gap-2">Loading categories...</div>;
  }

  console.log(categories);

  if (!categories || categories.length === 0) {
    return <div>No categories found</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Best Seller (special case) */}
      <Button
        variant={activeCategory === "best-seller" ? "default" : "secondary"}
        onClick={() => setActiveCategory("best-seller")}
      >
        <Star className="h-4 w-4" />
        <span className="ml-2">Best Seller</span>
      </Button>

      {/* Mapped categories */}
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "secondary"}
          onClick={() => setActiveCategory(category.id)}
          className={cn(
            "transition-colors",
            activeCategory === category.id &&
              "bg-primary text-primary-foreground",
          )}
        >
          {/* Show icon if it's a default category */}
          {defaultCategoryIcons[category.name] || (
            <span className="flex h-4 w-4 items-center justify-center">•</span>
          )}
          <span className="ml-2">{category.name}</span>
        </Button>
      ))}
    </div>
  );
};
