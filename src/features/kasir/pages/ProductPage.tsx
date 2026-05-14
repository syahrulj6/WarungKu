import React, { useState } from "react";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { ProductHeader } from "../components/ProductHeader";
import { CategoryList } from "../components/CategoryList";
import { api } from "~/utils/api";
import { ProductCard } from "../components/ProductCard";
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

const ProductPage = () => {
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
    <KasirDashboardLayout
      withRightPanel={true}
      headerContent={
        <ProductHeader
          refetchProductData={refetchProductData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      }
      metaTitle="Daftar Produk"
      metaDescription="Kelola Produk Kasirium Anda"
      pathname={`/dashboard/kasir/${id}/product`}
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
              Produk tidak ditemukan
            </div>
          ) : (
            productData?.map((product) => (
              <ProductCard
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
    </KasirDashboardLayout>
  );
};

export default ProductPage;


