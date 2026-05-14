import { useRouter } from "next/router";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { api } from "~/utils/api";
import { LowStockAlertCard } from "../components/LowStockAlertCard";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

const AlertPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: lowStockProducts, isLoading } =
    api.product.getLowStockProduct.useQuery(
      {
        warungId: id as string,
        limit: 50,
      },
      {
        enabled: !!id,
      },
    );

  return (
    <KasirDashboardLayout
      metaTitle="Kasirium Alert"
      metaDescription="Lihat semua peringatan dalam Kasirium Anda"
      pathname={`/dashboard/kasir/${id}/alert`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Peringatan Stok Rendah</h1>
          <p className="text-muted-foreground text-sm">
            Total: {lowStockProducts?.length ?? 0} produk
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="p-4">
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        ) : lowStockProducts && lowStockProducts.length > 0 ? (
          <div className="grid gap-3">
            {lowStockProducts.map((product) => (
              <LowStockAlertCard
                key={product.id}
                warungId={id as string}
                product={product}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Tidak ada produk dengan stok rendah saat ini.
            </p>
          </Card>
        )}
      </div>
    </KasirDashboardLayout>
  );
};

export default AlertPage;


