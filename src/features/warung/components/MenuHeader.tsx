import { Plus, Search } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CreateProductModal } from "./CreateProductModal";

export const MenuHeader = ({
  refetchProductData,
}: {
  refetchProductData: () => void;
}) => {
  const [searchMenu, setSearchMenu] = useState("");
  const searchId = useId();

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
      <div className="relative w-full">
        <Input
          id={searchId}
          placeholder="Search menu"
          className="w-full pl-10 text-sm"
          value={searchMenu}
          onChange={(e) => setSearchMenu(e.target.value)}
        />
        <Label htmlFor={searchId}>
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        </Label>
      </div>

      <CreateProductModal refetch={refetchProductData}>
        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4" />
          <span className="ml-2">Add product</span>
        </Button>
      </CreateProductModal>
    </div>
  );
};
