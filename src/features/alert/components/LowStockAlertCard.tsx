import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, PackageX } from "lucide-react";
import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { formatRupiah } from "~/lib/format";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface LowStockAlertCardProps {
  warungId: string;
  product: {
    id: string;
    name: string;
    stock: number;
    minStock: number | null;
    price: number;
    productPictureUrl: string | null;
    category: {
      name: string;
    } | null;
    threshold: number;
    status: "OUT_OF_STOCK" | "LOW_STOCK";
    stockGap: number;
  };
}

export const LowStockAlertCard = ({ warungId, product }: LowStockAlertCardProps) => {
  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const [open, setOpen] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(
    Math.max(product.stockGap, 1),
  );
  const [reason, setReason] = useState("Restok stok rendah");
  const utils = api.useUtils();

  const { mutateAsync: adjustStock, isPending } =
    api.product.adjustProductStock.useMutation();

  const handleRestock = async () => {
    if (quantityToAdd < 1) {
      toast.error("Jumlah restok minimal 1");
      return;
    }

    try {
      await adjustStock({
        warungId,
        productId: product.id,
        quantityToAdd,
        reason,
      });

      await Promise.all([
        utils.product.getLowStockProduct.invalidate(),
        utils.sale.getMetrics.invalidate(),
      ]);

      toast.success("Stok berhasil diperbarui");
      setOpen(false);
    } catch {
      toast.error("Gagal memperbarui stok");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border">
          <Image
            src={product.productPictureUrl ?? "/placeholder-product.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <PackageX className="h-4 w-4 text-red-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <p
              className={`text-xs font-semibold ${isOutOfStock ? "text-red-500" : "text-amber-500"}`}
            >
              {isOutOfStock ? "Stok Habis" : "Stok Rendah"}
            </p>
          </div>
          <h3 className="truncate font-semibold">{product.name}</h3>
          <p className="text-muted-foreground text-xs">
            {product.category?.name ?? "Tanpa Kategori"}
          </p>
          <p className="text-primary text-sm font-semibold">
            {formatRupiah(product.price)}
          </p>
          <p className="mt-1 text-xs">
            Stok saat ini: <span className="font-semibold">{product.stock}</span> /
            Minimum: <span className="font-semibold">{product.threshold}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          Kurang {Math.max(product.stockGap, 0)} untuk capai minimum
        </p>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Tambah Stok</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restok Produk</DialogTitle>
                <DialogDescription>
                  Tambahkan stok untuk produk {product.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor={`qty-${product.id}`}>Jumlah Ditambahkan</Label>
                  <Input
                    id={`qty-${product.id}`}
                    type="number"
                    min={1}
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(Number(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`reason-${product.id}`}>Catatan</Label>
                  <Input
                    id={`reason-${product.id}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Contoh: Restok supplier pagi"
                  />
                </div>
                <Button className="w-full" onClick={() => void handleRestock()} disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan Restok"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/warung/${warungId}/product`}>Kelola Produk</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
