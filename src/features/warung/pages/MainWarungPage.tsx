import { useRouter } from "next/router";
import React from "react";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { api } from "~/utils/api";

const MainDashboardPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: warung } = api.warung.getWarungById.useQuery(
    {
      warungId: id as string,
    },
    {
      enabled: !!id,
    },
  );

  return (
    <WarungDashboardLayout
      withRightPanel={true}
      rightPanelTitle="Current Order"
      headerContent={
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">
            {warung?.name || "Warung Dashboard"}
          </h1>
        </div>
      }
    >
      <div className="">
        <h1 className="text-2xl font-bold">Dashboard Content</h1>
        {/* Your main content here */}
      </div>
    </WarungDashboardLayout>
  );
};

export default MainDashboardPage;
