import React from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSession } from "~/hooks/useSession";
import { api } from "~/utils/api";
import InviteStaffForm from "../components/InviteStaffForm";
import StaffList from "../components/StaffList";

export default function StaffManagementPage() {
  const { session } = useSession();
  const { data: warungs, isLoading: warungsLoading } =
    api.kasir.getKasir.useQuery();
  const [selectedWarung, setSelectedWarung] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    const firstWarung = warungs?.[0];
    if (firstWarung && !selectedWarung) {
      setSelectedWarung(firstWarung.id);
    }
  }, [warungs, selectedWarung]);

  const { data: staff, refetch: refetchStaff } = api.staff.listStaff.useQuery(
    { warungId: selectedWarung },
    { enabled: !!selectedWarung },
  );

  const selectedWarungName =
    warungs?.find((w: any) => w.id === selectedWarung)?.name ?? "-";

  return (
    <DashboardLayout
      metaTitle="Manajemen Staf"
      metaDescription="Kelola anggota tim, peran, dan undangan untuk kasir Anda."
      pathname="/dashboard/staff"
    >
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Tim & Staf
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Kelola undangan, peran, dan akses staf per kasir.
            </p>
          </div>
          <Card className="bg-card/70 border-border/80">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs uppercase">
                Kasir Aktif
              </div>
              <div className="mt-1 text-lg font-semibold">{selectedWarungName}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-8">
            <StaffList
              staff={staff ?? []}
              currentUserId={session?.id}
              onUpdated={() => refetchStaff()}
            />
          </section>

          <aside className="xl:col-span-4">
            <Card className="bg-card/80 border-border/80 xl:sticky xl:top-6">
              <CardHeader className="pb-3">
                <CardTitle>Undang Staf</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Pilih Kasir
                  </label>
                  <Select
                    value={selectedWarung}
                    onValueChange={setSelectedWarung}
                    disabled={warungsLoading || !warungs?.length}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Pilih kasir" />
                    </SelectTrigger>
                    <SelectContent>
                      {warungs?.map((w: any) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Undangan baru akan ditautkan ke{" "}
                    <strong>{selectedWarungName}</strong>.
                  </p>
                </div>

                <InviteStaffForm
                  warungs={warungs ?? []}
                  defaultWarungId={selectedWarung}
                  onSuccess={() => refetchStaff()}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
