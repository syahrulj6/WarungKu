import React, { useState } from "react";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { ProductHeader } from "../components/ProductHeader";
import { CategoryList } from "../components/CategoryList";
import { api } from "~/utils/api";
import { ProductCard } from "../components/ProductCard";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";
import { Skeleton } from "~/components/ui/skeleton";
import { ProductFormModal } from "../components/ProductFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
};

const ProductPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const kasirId = typeof id === "string" ? id : null;
  const utils = api.useUtils();
  const { data: myRole } = api.kasir.getMyRoleInKasir.useQuery(
    { warungId: kasirId! },
    { enabled: !!kasirId },
  );
  const canManageProducts =
    myRole?.role === "OWNER" || myRole?.role === "MANAGER";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    name: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number | null;
    categoryId: string | null;
    productPictureUrl: string | null;
  } | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const isSearchActive = debouncedSearchTerm.trim().length > 0;
  const isBestSellerCategory = selectedCategory === "best-seller";

  const searchProductQuery = api.product.searchMenuByNames.useQuery(
    { name: debouncedSearchTerm },
    { enabled: isSearchActive },
  );

  const categoryProductQuery = api.product.getAllProductByCategory.useQuery(
    { categoryId: selectedCategory ?? "" },
    {
      enabled: !isSearchActive && !!selectedCategory && !isBestSellerCategory,
    },
  );

  const trendingProductQuery = api.product.getTrendingProduct.useQuery(
    undefined,
    {
      enabled: !isSearchActive && isBestSellerCategory,
    },
  );

  const allProductQuery = api.product.getAllProduct.useQuery(undefined, {
    enabled: !isSearchActive && !selectedCategory,
  });

  const deleteProduct = api.product.deleteProduct.useMutation();

  const activeQuery = isSearchActive
    ? searchProductQuery
    : isBestSellerCategory
      ? trendingProductQuery
      : selectedCategory
        ? categoryProductQuery
        : allProductQuery;

  const productData = activeQuery.data;
  const productIsLoading = activeQuery.isLoading;

  const refreshProductData = async () => {
    await Promise.all([
      utils.product.getAllProduct.invalidate(),
      utils.product.getAllProductByCategory.invalidate(),
      utils.product.searchMenuByNames.invalidate(),
      utils.product.getTrendingProduct.invalidate(),
      utils.product.getLowStockProduct.invalidate(),
      utils.sale.getMetrics.invalidate(),
    ]);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) {
      return;
    }

    try {
      await deleteProduct.mutateAsync({ productId: deletingProduct.id });
      toast.success("Produk berhasil dihapus");
      setDeletingProduct(null);
      await refreshProductData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus produk",
      );
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm("");
  };

  return (
    <KasirDashboardLayout
      withRightPanel={true}
      headerContent={
        <ProductHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateSuccess={refreshProductData}
          canManageProducts={canManageProducts}
        />
      }
      metaTitle="Daftar Produk"
      metaDescription="Kelola Produk Kasirium Anda"
      pathname={`/dashboard/kasir/${id}/product`}
    >
      <div className="flex flex-col gap-6">
        <CategoryList onCategoryChange={handleCategoryChange} />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {productIsLoading ? (
            [...Array(8)].map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))
          ) : productData?.length === 0 ? (
            <div className="text-muted-foreground col-span-full text-center">
              Produk tidak ditemukan
            </div>
          ) : (
            productData?.map((product) => (
              <ProductCard
                id={product.id}
                key={product.id}
                name={product.name}
                productImage={product.productPictureUrl ?? ""}
                price={product.price}
                stock={product.stock}
                onEdit={
                  canManageProducts ? () => setEditingProduct(product) : undefined
                }
                onDelete={
                  canManageProducts
                    ? () =>
                        setDeletingProduct({ id: product.id, name: product.name })
                    : undefined
                }
                canManageProducts={canManageProducts}
              />
            ))
          )}
        </div>
      </div>

      {canManageProducts && (
        <ProductFormModal
          mode="edit"
          product={editingProduct ?? undefined}
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProduct(null);
            }
          }}
          onSuccess={async () => {
            setEditingProduct(null);
            await refreshProductData();
          }}
        />
      )}

      {canManageProducts && (
        <AlertDialog
          open={!!deletingProduct}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingProduct(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
              <AlertDialogDescription>
                Produk {deletingProduct?.name} akan disembunyikan dari daftar dan
                tidak bisa dipilih lagi di kasir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  void handleDeleteProduct();
                }}
                disabled={deleteProduct.isPending}
              >
                {deleteProduct.isPending ? "Menghapus..." : "Ya, Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </KasirDashboardLayout>
  );
};

export default ProductPage;
