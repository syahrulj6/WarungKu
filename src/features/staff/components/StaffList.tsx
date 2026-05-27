import React from "react";
import type { WarungStaffRole } from "@prisma/client";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
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

const roleLabel: Record<WarungStaffRole, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
  CASHIER: "Kasir",
};

export function StaffList({
  staff,
  currentUserId: _currentUserId,
  onUpdated,
}: {
  staff: any[];
  currentUserId?: string;
  onUpdated?: () => void;
}) {
  const updateRole = api.staff.updateRole.useMutation();
  const removeStaff = api.staff.removeStaff.useMutation();

  async function handleUpdate(staffId: string, role: WarungStaffRole) {
    try {
      await updateRole.mutateAsync({ staffId, role });
      if (onUpdated) onUpdated();
      alert("Peran berhasil diperbarui");
    } catch (err: any) {
      alert(err?.message ?? "Gagal memperbarui peran");
    }
  }

  async function handleRemove(staffId: string) {
    if (!confirm("Hapus staf ini?")) return;
    try {
      await removeStaff.mutateAsync({ staffId });
      if (onUpdated) onUpdated();
      alert("Staf berhasil dihapus");
    } catch (err: any) {
      alert(err?.message ?? "Gagal menghapus staf");
    }
  }

  return (
    <Card className="bg-card/80 border-border/80">
      <CardHeader>
        <CardTitle>Tim</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {staff?.length === 0 && (
            <div className="text-muted-foreground text-sm">
              Belum ada staf pada kasir ini.
            </div>
          )}
          {staff?.map((s) => (
            <div
              key={s.id}
              className="bg-background/60 border-border/70 flex flex-col gap-3 rounded-lg border px-3 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {s.user?.email?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{s.user?.email ?? s.userId}</div>
                  <div className="text-muted-foreground text-sm">
                    {roleLabel[s.role as WarungStaffRole] ?? s.role}
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 md:w-auto">
                <Select
                  defaultValue={s.role}
                  onValueChange={(value) =>
                    handleUpdate(s.id, value as WarungStaffRole)
                  }
                >
                  <SelectTrigger className="w-full bg-background md:w-40">
                    <SelectValue placeholder="Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNER">Pemilik</SelectItem>
                    <SelectItem value="MANAGER">Manajer</SelectItem>
                    <SelectItem value="STAFF">Staf</SelectItem>
                    <SelectItem value="CASHIER">Kasir</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  className="shrink-0"
                  onClick={() => handleRemove(s.id)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default StaffList;
