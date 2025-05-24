import { useRouter } from "next/router";
import React from "react";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const DiscountsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <WarungDashboardLayout
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/report/discounts`}
    >
      {/* TODO: Report Sidebar */}
      <ReportLayout>
        <div className="">Discounts Page</div>
      </ReportLayout>
    </WarungDashboardLayout>
  );
};

export default DiscountsPage;
