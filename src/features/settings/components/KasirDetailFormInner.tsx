import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { UpdateKasirFormSchema } from "../forms/kasir-detail";

export const CreateKasirFormInner = () => {
  const form = useFormContext<UpdateKasirFormSchema>();

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="col-span-1">
            <FormLabel>Nama Kasirium</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nama Kasirium" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem className="col-span-1">
            <FormLabel>No Telp {"(Optional)"}</FormLabel>
            <FormControl>
              <Input {...field} placeholder="No telp" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Alamat {"(Optional)"}</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Alamat" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};


