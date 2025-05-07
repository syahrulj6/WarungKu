import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { MenuHeader } from "../components/MenuHeader";
import { Button } from "~/components/ui/button";
import { Coffee, Pizza, Star } from "lucide-react";
import { CategoryList } from "../components/CategoryList";

const MenuPage = () => {
  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
      headerContent={<MenuHeader />}
    >
      <div className="flex flex-col gap-6">
        <CategoryList />
      </div>
    </WarungDashboardLayout>
  );
};

export default MenuPage;
