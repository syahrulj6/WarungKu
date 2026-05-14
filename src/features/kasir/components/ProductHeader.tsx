import { Plus, Search } from "lucide-react";
import { useId } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ProductFormModal } from "./ProductFormModal";

interface ProductHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateSuccess?: () => Promise<void> | void;
}

export const ProductHeader = ({
  searchTerm,
  onSearchChange,
  onCreateSuccess,
}: ProductHeaderProps) => {
  const searchId = useId();

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
      <div className="relative w-full">
        <Input
          id={searchId}
          placeholder="Cari produk"
          className="w-full pl-10 text-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Label htmlFor={searchId}>
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        </Label>
      </div>

      <ProductFormModal mode="create" onSuccess={onCreateSuccess}>
        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4" />
          <span className="ml-2">Tambah Produk</span>
        </Button>
      </ProductFormModal>
    </div>
  );
};
