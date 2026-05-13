import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { WarungDashboardLayout } from "~/components/layout/WarungDashboardLayout";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import {
  updateWarungFormSchema,
  type UpdateWarungFormSchema,
} from "../forms/warung-detail";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const settingsMenu = [
  {
    name: "Profil",
    href: "/dashboard/warung/[id]/settings",
  },
  {
    name: "Produk",
    href: "/dashboard/warung/[id]/settings/notifications",
  },
  {
    name: "Keamanan",
    href: "/dashboard/warung/[id]/settings/security",
  },
];

const WarungSettingsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const form = useForm<UpdateWarungFormSchema>({
    resolver: zodResolver(updateWarungFormSchema),
    defaultValues: {
      warungId: id as string,
      name: "",
      address: undefined,
      phone: undefined,
      logoUrl: undefined,
    },
  });

  const updateWarung = api.warung.updateWarung.useMutation();

  const handleUpdateWarung = (data: UpdateWarungFormSchema) => {
    console.log("Submitting:", data);
    updateWarung.mutate(data, {
      onSuccess: () => {
        toast.success("Berhasil update Kasirium");
        form.reset();
      },
      onError: (error) => {
        console.error("Error:", error);
        toast.error(error.message || "Gagal update Kasirium");
      },
    });
  };

  const { data: warungData, isLoading: warungDataIsLoading } =
    api.warung.getWarungById.useQuery({ warungId: id as string });

  const isActive = (href: string) => {
    const currentPath = router.asPath;
    const menuPath = href.replace("[id]", id as string);
    return currentPath === menuPath;
  };

  return (
    <WarungDashboardLayout
      metaTitle="Pengaturan"
      metaDescription="Atur Semua mengenai Kasirium Anda"
      pathname={`/dashboard/warung/${id}/settings/`}
    >
      <div className="flex flex-col">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold md:text-2xl">Pengaturan</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Atur semua mengenai Kasirium Anda
          </p>
        </div>
        <div className="flex gap-2 md:mt-4">
          {settingsMenu.map((menu) => (
            <Button
              asChild
              key={menu.name}
              className="rounded-full"
              variant={isActive(menu.href) ? "default" : "outline"}
            >
              <Link href={menu.href.replace("[id]", id as string)}>
                {menu.name}
              </Link>
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 md:mt-10">
          <div className="col-span-1">
            <h3 className="text-lg">Profil</h3>
            <p className="text-muted-foreground text-xs md:text-sm">
              Atur detail informasi profil Kasirium Anda
            </p>
          </div>
        </div>
        <div className="col-span-2"></div>
      </div>
    </WarungDashboardLayout>
  );
};

export default WarungSettingsPage;

