import { useRouter } from "next/router";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { api } from "~/utils/api";
import { AlertCard } from "../components/AlertCard";

const AlertPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: sales } = api.sale.getAllCompletedSale.useQuery({
    warungId: id as string,
  });

  return (
    <WarungDashboardLayout
      metaTitle="Warung Alert"
      metaDescription="Lihat semua peringatan dalam warung anda"
      pathname={`/dashboard/warung/${id}/alert`}
    >
      <div className="flex flex-col gap-4">
        {sales?.map((sale) => (
          <AlertCard
            key={sale.id}
            receiptNo={sale.receiptNo}
            isPaid={sale.isPaid}
            totalAmount={sale.totalAmount}
            paymentMethod={sale.paymentType}
            items={sale.items}
            createdAt={sale.createdAt}
          />
        ))}
      </div>
    </WarungDashboardLayout>
  );
};

export default AlertPage;
