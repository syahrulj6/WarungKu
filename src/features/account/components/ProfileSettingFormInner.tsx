import { useFormContext } from "react-hook-form";
import type { ProfileSettingFormSchema } from "../forms/profile";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

type SettingsFormInnerProps = {
  defaultValues: {
    username?: string;
  };
};

export const ProfileSettingFormInner = (props: SettingsFormInnerProps) => {
  const form = useFormContext<ProfileSettingFormSchema>();

  return (
    <>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-muted-foreground">Username</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
