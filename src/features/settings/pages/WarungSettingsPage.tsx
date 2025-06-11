import { useRouter } from "next/router";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";

const WarungSettingsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <WarungDashboardLayout
      metaTitle="Settings"
      metaDescription="Atur Semua mengenai warung Anda"
      pathname={`/dashboard/warung/${id}/settings/`}
    >
      <div className="">Warung Setting</div>
    </WarungDashboardLayout>
  );
};

export default WarungSettingsPage;
