import React, { useEffect } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import {
  type ProfileSettingFormSchema,
  profileSettingFormSchema,
} from "../forms/profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "~/components/ui/form";
import { ProfileSettingFormInner } from "../components/ProfileSettingFormInner";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { Loader } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

const AccountProfilePage = () => {
  const { data: getProfileData, isLoading } = api.profile.getProfile.useQuery();

  const form = useForm<ProfileSettingFormSchema>({
    resolver: zodResolver(profileSettingFormSchema),
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    if (getProfileData) {
      form.reset({
        username: getProfileData.username ?? "",
      });
    }
  }, [getProfileData, form]);

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: ({ username }) => {
      form.reset({ username });
      toast.success("Berhasil update profile");
    },
    onError: (err) => {
      if (err instanceof TRPCClientError && err.message === "USERNAME_USED") {
        form.setError("username", { message: "Username sudah digunakan" });
      }
      toast.error("Gagal update profile");
    },
  });

  const handleUpdateProfileSubmit = (values: ProfileSettingFormSchema) => {
    updateProfile.mutate({
      username:
        values.username !== getProfileData?.username ? values.username : "",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-xl font-semibold md:text-2xl">Preferensi Akun</h1>
          <p className="text-muted-foreground text-sm">
            Kelola profil, pengaturan akun, dan preferensi Anda untuk pengalaman
            Warung Anda
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Card>
            <CardHeader className="-my-2">Informasi Profil</CardHeader>
            <Separator />
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : getProfileData ? (
                <Form {...form}>
                  <ProfileSettingFormInner
                    defaultValues={{
                      username: getProfileData?.username,
                    }}
                  />
                </Form>
              ) : null}
            </CardContent>
            <Separator />
            <CardFooter className="-my-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!form.formState.isDirty || updateProfile.isPending}
                onClick={() => form.reset()}
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={!form.formState.isDirty || updateProfile.isPending}
                onClick={form.handleSubmit(handleUpdateProfileSubmit)}
              >
                {updateProfile.isPending ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountProfilePage;
