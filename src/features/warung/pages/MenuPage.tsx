import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { MenuHeader } from "../components/MenuHeader";
import { CategoryList } from "../components/CategoryList";
import { api } from "~/utils/api";
import { MenuCard } from "../components/MenuCard";

const MenuPage = () => {
  const { data: productData, isLoading: productIsLoading } =
    api.product.getAllProduct.useQuery();

  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
      headerContent={<MenuHeader />}
    >
      <div className="flex flex-col gap-6">
        <CategoryList />

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          {productIsLoading && <div>Loading..</div>}
          {productData?.map((product) => (
            <MenuCard
              key={product.id}
              name={product.name}
              productImage={product.productPictureUrl ?? ""}
              price={product.price}
              stock={product.stock}
              category={product.category?.name}
            />
          ))}
        </div>
      </div>
    </WarungDashboardLayout>
  );
};

export default MenuPage;
