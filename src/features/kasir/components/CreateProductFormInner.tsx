import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { CreateProductFormSchema } from "../forms/product";
import { api } from "~/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { formatRupiah, parseRupiah } from "~/lib/format";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export const CreateProductFormInner = () => {
  const router = useRouter();
  const { id } = router.query;
  const form = useFormContext<CreateProductFormSchema>();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [justCreatedCategory, setJustCreatedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { data: categories, isLoading, refetch: refetchCategories } =
    api.category.getAllCategory.useQuery(
      { warungId: id as string },
      { enabled: !!id },
    );
  const { mutateAsync: createCategory, isPending: isCreatingCategory } =
    api.category.createCategory.useMutation();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }

    try {
      const category = await createCategory({
        warungId: id as string,
        name: newCategoryName.trim(),
      });
      form.setValue("categoryId", category.id);
      setJustCreatedCategory({ id: category.id, name: category.name });
      await refetchCategories();
      setNewCategoryName("");
      toast.success("Kategori berhasil ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan kategori");
    }
  };

  return (
    <>
      {/* Product Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Nama Produk*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Contoh: Nasi Goreng Special" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="col-span-2 grid grid-cols-2 gap-4">
        {/* Selling Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Jual*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Rp25.000"
                  value={field.value ? formatRupiah(field.value) : ""}
                  onChange={(e) => {
                    const value = parseRupiah(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cost Price */}
        <FormField
          control={form.control}
          name="costPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Modal</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Rp15.000"
                  value={field.value ? formatRupiah(field.value) : ""}
                  onChange={(e) => {
                    const value = parseRupiah(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2 grid grid-cols-2 gap-4">
        {/* Current Stock */}
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stok Awal*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="10"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Minimum Stock */}
        <FormField
          control={form.control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stok Minimum</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="5"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Category Selection */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Kategori</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoading ? "Memuat..." : "Pilih kategori"}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {justCreatedCategory &&
                  !categories?.some((c) => c.id === justCreatedCategory.id) && (
                    <SelectItem
                      key={justCreatedCategory.id}
                      value={justCreatedCategory.id}
                    >
                      {justCreatedCategory.name}
                    </SelectItem>
                  )}
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem className="col-span-2">
        <FormLabel>Tambah Kategori Kustom</FormLabel>
        <div className="flex gap-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Contoh: Minuman Dingin"
            disabled={isCreatingCategory}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleCreateCategory()}
            disabled={isCreatingCategory}
          >
            {isCreatingCategory ? "Menyimpan..." : "Tambah"}
          </Button>
        </div>
      </FormItem>
    </>
  );
};
