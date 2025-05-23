import React, { useState } from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { MenuHeader } from "../components/MenuHeader";
import { CategoryList } from "../components/CategoryList";
import { api } from "~/utils/api";
import { MenuCard } from "../components/MenuCard";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";
import { Skeleton } from "~/components/ui/skeleton";

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
};

const MenuPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const {
    data: productData,
    isLoading: productIsLoading,
    refetch: refetchProductData,
  } = debouncedSearchTerm
    ? api.product.searchMenuByNames.useQuery({ name: debouncedSearchTerm })
    : selectedCategory
      ? api.product.getAllProductByCategory.useQuery({
          categoryId: selectedCategory,
        })
      : api.product.getAllProduct.useQuery();

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm("");
  };

  return (
    <WarungDashboardLayout
      withRightPanel={true}
      headerContent={
        <MenuHeader
          refetchProductData={refetchProductData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      }
      metaTitle="Daftar menu"
      metaDescription="Kelola Menu warung Anda"
      pathname={`/dashboard/warung/${id}/menu`}
    >
      <div className="flex flex-col gap-6">
        <CategoryList onCategoryChange={handleCategoryChange} />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {productIsLoading ? (
            [...Array(8)].map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))
          ) : productData?.length === 0 ? (
            <div className="text-muted-foreground col-span-full text-center">
              No products found
            </div>
          ) : (
            productData?.map((product) => (
              <MenuCard
                id={product.id}
                key={product.id}
                name={product.name}
                productImage={product.productPictureUrl ?? ""}
                price={product.price}
                stock={product.stock}
              />
            ))
          )}
        </div>
      </div>
    </WarungDashboardLayout>
  );
};

export default MenuPage;
