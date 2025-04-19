import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const MainDashboardPage = () => {
  return (
    <WarungDashboardLayout
      rightPanel={<RightPanel />}
      rightPanelTitle="Current Orders"
    >
      <div className="p-4">{/* Your main content here */}</div>
    </WarungDashboardLayout>
  );
};

const RightPanel = () => (
  <div>
    {/* Your right panel content */}
    <div className="space-y-2">
      <div className="rounded-lg border p-3">Order #1</div>
      <div className="rounded-lg border p-3">Order #2</div>
    </div>
  </div>
);

export default MainDashboardPage;
