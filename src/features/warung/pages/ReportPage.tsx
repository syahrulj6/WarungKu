import { useRouter } from "next/router";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <WarungDashboardLayout
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/report`}
    >
      {/* TODO: Report Sidebar */}
      <div className="">Report Page</div>
    </WarungDashboardLayout>
  );
};

export default ReportPage;
