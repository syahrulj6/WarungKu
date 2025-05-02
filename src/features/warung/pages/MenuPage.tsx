import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const MenuPage = () => {
  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
    >
      MenuPage
    </WarungDashboardLayout>
  );
};

export default MenuPage;
