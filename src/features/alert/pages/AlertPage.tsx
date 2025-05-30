import { useRouter } from "next/router";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const AlertPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <WarungDashboardLayout
      metaTitle="Warung Alert"
      metaDescription="Lihat semua peringatan dalam warung anda"
      pathname={`/dashboard/warung/${id}/alert`}
    >
      <div className="flex flex-col gap-4"></div>
    </WarungDashboardLayout>
  );
};

export default AlertPage;
