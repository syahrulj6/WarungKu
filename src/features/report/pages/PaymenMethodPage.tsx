import { useRouter } from "next/router";
import React from "react";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const PaymenMethodPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <WarungDashboardLayout
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/report`}
    >
      {/* TODO: Report Sidebar */}
      <ReportLayout>
        <div className="">Payment Method Page</div>
      </ReportLayout>
    </WarungDashboardLayout>
  );
};

export default PaymenMethodPage;
