import { Loader } from "lucide-react";
import { useRouter } from "next/router";
import { ReportLayout } from "~/components/layout/ReportLayout";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!router.isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex h-screen items-center justify-center">
        Invalid warung ID
      </div>
    );
  }
  return (
    <WarungDashboardLayout
      metaTitle="Laporan"
      metaDescription="Lihat laporan mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/report/`}
    >
      {/* TODO: Report Sidebar */}
      <ReportLayout>
        <div className="">Report Page</div>
      </ReportLayout>
    </WarungDashboardLayout>
  );
};

export default ReportPage;
