import React from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/utils/api";

export default function ShiftManagementPage() {
  const { data: warungs, isLoading: warungsLoading } =
    api.kasir.getKasir.useQuery();
  const [selectedWarung, setSelectedWarung] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    if (warungs?.length && !selectedWarung) {
      setSelectedWarung(warungs[0]?.id);
    }
  }, [warungs, selectedWarung]);

  const openShift = api.shift.openShift.useMutation();
  const closeShift = api.shift.closeShift.useMutation();
  const { data: shifts, refetch } = api.shift.listShifts.useQuery(
    { warungId: selectedWarung },
    { enabled: !!selectedWarung },
  );

  const selectedWarungName =
    warungs?.find((w: any) => w.id === selectedWarung)?.name ?? "-";

  async function handleOpen() {
    if (!selectedWarung) return;
    try {
      await openShift.mutateAsync({ warungId: selectedWarung, startCash: 0 });
      await refetch();
      alert("Shift opened");
    } catch (err: any) {
      alert(err?.message ?? "Failed to open shift");
    }
  }

  async function handleClose(shiftId: string) {
    try {
      await closeShift.mutateAsync({ shiftId, endCash: 0 });
      await refetch();
      alert("Shift closed");
    } catch (err: any) {
      alert(err?.message ?? "Failed to close shift");
    }
  }

  return (
    <DashboardLayout
      metaTitle="Shifts"
      metaDescription="Open and close shifts for your kasir."
      pathname="/dashboard/shift"
    >
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Shift Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Open and close shifts for your kasir. Cashiers and staff can open
              shifts, managers can monitor all recent shifts.
            </p>
          </div>
          <Card className="bg-card/70 border-border/80">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs uppercase">
                Active Kasir
              </div>
              <div className="mt-1 text-lg font-semibold">
                {selectedWarungName}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-8">
            <Card className="bg-card/80 border-border/80">
              <CardHeader>
                <CardTitle>Recent Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shifts?.length === 0 && (
                    <div className="text-muted-foreground text-sm">
                      No recent shifts
                    </div>
                  )}
                  {shifts?.map((s: any) => (
                    <div
                      key={s.id}
                      className="bg-background/60 border-border/70 flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="font-medium">User: {s.userId}</div>
                        <div className="text-muted-foreground text-sm">
                          Start: {new Date(s.startTime).toLocaleString()}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          End:{" "}
                          {s.endTime
                            ? new Date(s.endTime).toLocaleString()
                            : "Open"}
                        </div>
                      </div>
                      {!s.endTime && (
                        <Button onClick={() => handleClose(s.id)}>Close</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="xl:col-span-4">
            <Card className="bg-card/80 border-border/80 xl:sticky xl:top-6">
              <CardHeader>
                <CardTitle>Manage Shift</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Select Kasir
                  </label>
                  <Select
                    value={selectedWarung}
                    onValueChange={setSelectedWarung}
                    disabled={warungsLoading || !warungs?.length}
                  >
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select kasir" />
                    </SelectTrigger>
                    <SelectContent>
                      {warungs?.map((w: any) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleOpen}
                  disabled={!selectedWarung || openShift.isPending}
                  className="w-full"
                >
                  {openShift.isPending ? "Opening..." : "Open Shift"}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
