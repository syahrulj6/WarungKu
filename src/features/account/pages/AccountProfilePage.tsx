import React, { useEffect, useState } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import {
  changePasswordFormSchema,
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
import { Edit, Loader } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

import { MdOutlineEmail } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { PasswordFormInner } from "../components/PasswordFormInner";

const AccountProfilePage = () => {
  const { data: getProfileData, isLoading } = api.profile.getProfile.useQuery();

  const profileForm = useForm<ProfileSettingFormSchema>({
    resolver: zodResolver(profileSettingFormSchema),
    defaultValues: {
      username: "",
    },
  });

  const passwordForm = useForm<changePasswordFormSchema>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (getProfileData) {
      profileForm.reset({
        username: getProfileData.username ?? "",
      });
    }
  }, [getProfileData, profileForm]);

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: ({ username }) => {
      profileForm.reset({ username });
      toast.success("Berhasil update profile");
    },
    onError: (err) => {
      if (err instanceof TRPCClientError && err.message === "USERNAME_USED") {
        profileForm.setError("username", {
          message: "Username sudah digunakan",
        });
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

  const changePasswordMutation = api.auth.changePassword.useMutation();

  const handleChangePassword = async (values: changePasswordFormSchema) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Password berhasil diubah!");
      passwordForm.reset();
    } catch (error) {
      toast.error("Gagal mengubah password");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-xl font-semibold md:text-2xl">Preferensi Akun</h1>
          <p className="text-muted-foreground text-sm">
            Kelola profil, pengaturan akun, dan preferensi Anda untuk pengalaman
            Warung Anda
          </p>
        </div>

        <Card>
          <CardHeader className="-mt-2 -mb-3">
            <CardTitle className="font-normal">Informasi Profile</CardTitle>
          </CardHeader>
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
              <Form {...profileForm}>
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
              disabled={
                !profileForm.formState.isDirty || updateProfile.isPending
              }
              onClick={() => profileForm.reset()}
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={
                !profileForm.formState.isDirty || updateProfile.isPending
              }
              onClick={profileForm.handleSubmit(handleUpdateProfileSubmit)}
            >
              {updateProfile.isPending ? (
                <Loader className="animate-spin" />
              ) : (
                "Simpan"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="-mt-2 -mb-3">
            <CardTitle className="font-normal">Identitas Akun</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="bg-muted-foreground/20 rounded-full p-2">
                  <MdOutlineEmail className="text-2xl" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p>Email</p>
                  <div className="text-muted-foreground flex flex-col text-sm sm:flex-row sm:items-center md:gap-1">
                    <span className="flex items-center sm:gap-1">
                      {getProfileData?.username} <GoDotFill className="" />
                    </span>
                    <span className="break-all">{getProfileData?.email}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="flex-shrink-0">
                <Edit />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="-mt-2 -mb-3">
            <CardTitle className="font-normal">Ganti Password</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <Form {...passwordForm}>
              <PasswordFormInner />
            </Form>
          </CardContent>
          <Separator />
          <CardFooter className="-my-2 flex justify-end gap-2">
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  passwordForm.reset();
                }}
                disabled={
                  changePasswordMutation.isPending ||
                  !passwordForm.formState.isDirty ||
                  changePasswordMutation.isPending
                }
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={
                  !passwordForm.formState.isDirty ||
                  changePasswordMutation.isPending
                }
                onClick={passwordForm.handleSubmit(handleChangePassword)}
              >
                {changePasswordMutation.isPending ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountProfilePage;
