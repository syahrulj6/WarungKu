import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KasirDashboardLayout } from "~/components/layout/KasirDashboardLayout";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import {
  updateKasirFormSchema,
  type UpdateKasirFormSchema,
} from "../forms/kasir-detail";

type SettingsSection = "profil" | "operasional" | "keamanan";

const sectionMenus: { key: SettingsSection; label: string }[] = [
  { key: "profil", label: "Profil Kasir" },
  { key: "operasional", label: "Operasional" },
  { key: "keamanan", label: "Keamanan Akun" },
];

const KasirSettingsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeSection, setActiveSection] = useState<SettingsSection>("profil");

  const utils = api.useUtils();
  const { data: kasirData, isLoading } = api.kasir.getKasirById.useQuery(
    { warungId: id as string },
    { enabled: !!id },
  );

  const form = useForm<UpdateKasirFormSchema>({
    resolver: zodResolver(updateKasirFormSchema),
    defaultValues: {
      warungId: id as string,
      name: "",
      address: "",
      phone: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!kasirData || !id) return;
    form.reset({
      warungId: id as string,
      name: kasirData.name,
      address: kasirData.address ?? "",
      phone: kasirData.phone ?? "",
      isActive: kasirData.isActive,
    });
  }, [kasirData, form, id]);

  const updateKasir = api.kasir.updateKasir.useMutation({
    onSuccess: async () => {
      toast.success("Pengaturan kasir berhasil diperbarui");
      await utils.kasir.getKasirById.invalidate({ warungId: id as string });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui pengaturan kasir");
    },
  });

  const onSubmitProfile = (values: UpdateKasirFormSchema) => {
    updateKasir.mutate({
      warungId: values.warungId,
      name: values.name,
      address: values.address || undefined,
      phone: values.phone || undefined,
    });
  };

  const onSubmitOperational = () => {
    updateKasir.mutate({
      warungId: id as string,
      isActive: !!form.getValues("isActive"),
    });
  };

  return (
    <KasirDashboardLayout
      metaTitle="Pengaturan Kasir"
      metaDescription="Atur profil dan operasional kasir Anda"
      pathname={`/dashboard/kasir/${id}/settings`}
    >
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold md:text-2xl">Pengaturan Kasir</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Pengaturan ini berlaku khusus untuk kasir yang sedang dipilih.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sectionMenus.map((menu) => (
            <Button
              key={menu.key}
              type="button"
              className="rounded-full"
              variant={activeSection === menu.key ? "default" : "outline"}
              onClick={() => setActiveSection(menu.key)}
            >
              {menu.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ) : activeSection === "profil" ? (
          <Card className="space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold">Profil Kasir</h3>
              <p className="text-muted-foreground text-sm">
                Ubah informasi dasar kasir seperti nama, alamat, dan kontak.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmitProfile)}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kasir</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input id="phone" {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" {...form.register("address")} />
                {form.formState.errors.address && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={updateKasir.isPending}>
                {updateKasir.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </Card>
        ) : activeSection === "operasional" ? (
          <Card className="space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold">Status Operasional</h3>
              <p className="text-muted-foreground text-sm">
                Nonaktifkan kasir jika sedang tidak digunakan agar tidak muncul
                dalam daftar kasir aktif.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Kasir Aktif</p>
                <p className="text-muted-foreground text-sm">
                  {form.watch("isActive")
                    ? "Kasir dapat digunakan untuk transaksi."
                    : "Kasir dinonaktifkan sementara."}
                </p>
              </div>
              <Input
                type="checkbox"
                className="h-4 w-4"
                checked={!!form.watch("isActive")}
                onChange={(e) => form.setValue("isActive", e.target.checked)}
              />
            </div>

            <Button type="button" onClick={onSubmitOperational} disabled={updateKasir.isPending}>
              {updateKasir.isPending ? "Menyimpan..." : "Simpan Status Operasional"}
            </Button>
          </Card>
        ) : (
          <Card className="space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold">Keamanan Akun</h3>
              <p className="text-muted-foreground text-sm">
                Pengaturan keamanan akun berlaku di level pengguna (bukan per
                kasir). Silakan atur keamanan di halaman akun.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void router.push("/dashboard/account")}
            >
              Buka Pengaturan Akun
            </Button>
          </Card>
        )}
      </div>
    </KasirDashboardLayout>
  );
};

export default KasirSettingsPage;

