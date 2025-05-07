import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { CreateWarungFormSchema } from "../forms/warung";

export const CreateWarungFormInner = () => {
  const form = useFormContext<CreateWarungFormSchema>();

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Nama Warung</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nama warung" />
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

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>No Telp {"(Optional)"}</FormLabel>
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
