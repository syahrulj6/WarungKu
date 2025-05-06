import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { MenuHeader } from "../components/MenuHeader";
import { Button } from "~/components/ui/button";
import { Coffee, Pizza, Star } from "lucide-react";

const MenuPage = () => {
  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
      headerContent={<MenuHeader />}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button>
            <Star className="h-4 w-4" />{" "}
            <span className="ml-2">Best Seller</span>
          </Button>
          <Button variant="secondary">
            <Pizza className="h-4 w-4" /> <span className="ml-2">Food</span>
          </Button>
          <Button variant="secondary">
            <Coffee className="h-4 w-4" />{" "}
            <span className="ml-2">Beverage</span>
          </Button>
        </div>
      </div>
    </WarungDashboardLayout>
  );
};

export default MenuPage;
