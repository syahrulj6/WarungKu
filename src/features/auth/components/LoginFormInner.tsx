import { useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type AuthFormSchema } from "../forms/auth";
import Link from "next/link";

type LoginFormInnerProps = {
  onLoginSubmit: (values: AuthFormSchema) => void;
  isLoading?: boolean;
  buttonText?: string;
  showPassword?: boolean;
};

export const LoginFormInner = (props: LoginFormInnerProps) => {
  const form = useFormContext<AuthFormSchema>();

  return (
    <form
      onSubmit={form.handleSubmit(props.onLoginSubmit)}
      className="flex flex-col gap-y-1"
    >
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormDescription />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type={"password"} {...field} />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-end">
        <Link href={"/reset"} className="p-0">
          Lupa Password?
        </Link>
      </div>

      <Button size="lg" className="mt-4 w-full">
        Masuk
      </Button>
    </form>
  );
};
