// import { useFormContext } from "react-hook-form";
// import { Button } from "~/components/ui/button";
// import { Checkbox } from "~/components/ui/checkbox";
// import {
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/components/ui/form";
// import { Input } from "~/components/ui/input";
// import { Label } from "~/components/ui/label";
// import { type ResetPasswordSchema } from "../forms/auth";
// import { useState } from "react";

// type UpdatePasswordFormInnerProps = {
//   onUpdatePasswordSubmit: (values: ResetPasswordSchema) => void;
//   isLoading?: boolean;
//   buttonText?: string;
//   showPassword?: boolean;
// };

// export const UpdatePasswordFormInner = (
//   props: UpdatePasswordFormInnerProps,
// ) => {
//   const form = useFormContext<ResetPasswordSchema>();
//   const [showPassword, setShowPassword] = useState<boolean>(false);

//   return (
//     <form
//       onSubmit={form.handleSubmit(props.onUpdatePasswordSubmit)}
//       className="flex flex-col gap-y-1"
//     >
//       <FormField
//         control={form.control}
//         name="password"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Password</FormLabel>
//             <FormControl>
//               <Input type={showPassword ? "text" : "password"} {...field} />
//             </FormControl>
//             <FormDescription />
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <FormField
//         control={form.control}
//         name="confirmPassword"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Confirm Password</FormLabel>
//             <FormControl>
//               <Input type={showPassword ? "text" : "password"} {...field} />
//             </FormControl>
//             <FormDescription />
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       {props.showPassword && (
//         <Label className="mt-4 flex items-center gap-2">
//           <Checkbox
//             checked={showPassword}
//             onCheckedChange={(checked) => setShowPassword(!!checked)}
//           />
//           Show Password
//         </Label>
//       )}

//       <Button disabled={props.isLoading} size="lg" className="mt-4 w-full">
//         {props.buttonText ?? "Ganti Password"}
//       </Button>
//     </form>
//   );
// };
