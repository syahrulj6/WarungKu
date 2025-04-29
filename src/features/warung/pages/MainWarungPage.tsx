import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const MainDashboardPage = () => {
  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
    >
      <div className="">
        <h1 className="text-2xl font-bold">Dashboard Content</h1>
        {/* Your main content here */}
      </div>
    </WarungDashboardLayout>
  );
};

export default MainDashboardPage;
