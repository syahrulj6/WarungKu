import React, { useState } from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { MenuHeader } from "../components/MenuHeader";
import { CategoryList } from "../components/CategoryList";
import { api } from "~/utils/api";
import { MenuCard } from "../components/MenuCard";

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: productData,
    isLoading: productIsLoading,
    refetch: refetchProductData,
  } = selectedCategory
    ? api.product.getAllProductByCategory.useQuery({
        categoryId: selectedCategory,
      })
    : api.product.getAllProduct.useQuery();

  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
      headerContent={<MenuHeader refetchProductData={refetchProductData} />}
    >
      <div className="flex flex-col gap-6">
        <CategoryList onCategoryChange={setSelectedCategory} />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {productIsLoading && <div>Loading..</div>}
          {!productIsLoading && productData?.length === 0 && (
            <div>No products found</div>
          )}
          {productData?.map((product) => (
            <MenuCard
              key={product.id}
              name={product.name}
              productImage={product.productPictureUrl ?? ""}
              price={product.price}
              stock={product.stock}
            />
          ))}
        </div>
      </div>
    </WarungDashboardLayout>
  );
};

export default MenuPage;
