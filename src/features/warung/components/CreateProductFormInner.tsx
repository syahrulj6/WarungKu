import { useFormContext } from "react-hook-form";
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

export const CreateProductFormInner = () => {
  const form = useFormContext<CreateProductFormSchema>();
  const { data: categories, isLoading } =
    api.category.getAllCategory.useQuery();

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
                  type="number"
                  placeholder="25000"
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                  type="number"
                  placeholder="15000"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value ?? ""}
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
    </>
  );
};
