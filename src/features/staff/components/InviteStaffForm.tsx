import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/utils/api";

const schema = z.object({
  warungId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["OWNER", "MANAGER", "STAFF", "CASHIER"]),
});

type FormData = z.infer<typeof schema>;

export function InviteStaffForm({
  warungs,
  defaultWarungId,
  onSuccess,
}: {
  warungs: any[];
  defaultWarungId?: string;
  onSuccess?: () => void;
}) {
  const { register, handleSubmit, setValue, resetField, formState, watch } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        role: "STAFF",
        warungId: defaultWarungId ?? warungs?.[0]?.id,
      },
    });

  React.useEffect(() => {
    if (defaultWarungId) setValue("warungId", defaultWarungId);
  }, [defaultWarungId, setValue]);

  const createInvitation = api.staff.createInvitation.useMutation();
  const selectedRole = watch("role");
  const selectedWarung = watch("warungId");
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function onSubmit(data: FormData) {
    setMessage(null);
    setCopied(false);

    try {
      const res = await createInvitation.mutateAsync(data);
      if (onSuccess) onSuccess();

      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_BASE_URL ?? "");

      if (res?.token) {
        setInviteLink(`${baseUrl}/invitations/accept?token=${res.token}`);
      }

      setMessage({
        type: "success",
        text: "Undangan berhasil dibuat.",
      });
      resetField("email");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message ?? "Gagal membuat undangan",
      });
    }
  }

  return (
    <div className="max-w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Undang via Email</h3>
          <p className="text-muted-foreground text-sm">
            Kirim undangan dan atur peran akses dalam satu langkah.
          </p>
        </div>

        <div className="space-y-3">
          <input type="hidden" {...register("warungId")} />
          <Select
            value={selectedWarung}
            onValueChange={(value) =>
              setValue("warungId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Pilih kasir" />
            </SelectTrigger>
            <SelectContent>
              {warungs?.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <Input
              placeholder="invitee@example.com"
              className="bg-background"
              {...register("email")}
            />
            {formState.errors.email?.message && (
              <p className="mt-1 text-xs text-red-600">
                {formState.errors.email.message}
              </p>
            )}
          </div>

          <input type="hidden" {...register("role")} />
          <Select
            value={selectedRole}
            onValueChange={(value) =>
              setValue("role", value as FormData["role"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Pilih peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANAGER">Manajer</SelectItem>
              <SelectItem value="STAFF">Staf</SelectItem>
              <SelectItem value="CASHIER">Kasir</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={createInvitation.isPending}
            className="w-full"
          >
            {createInvitation.isPending ? "Mengirim..." : "Kirim Undangan"}
          </Button>
        </div>

        <div className="text-muted-foreground text-sm">
          Undangan berlaku 7 hari. Pengguna yang diundang harus menerima
          undangan lewat link yang dikirim ke email.
        </div>

        {message && (
          <div
            className={`rounded border p-2 text-sm ${
              message.type === "success"
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {inviteLink && (
          <div className="bg-background mt-3 rounded-md border p-3">
            <div className="mb-2 text-sm">
              Link undangan (salin dan kirim ke penerima jika diperlukan):
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                className="border-input bg-background flex-1 rounded-md border px-2 py-1 text-sm"
              />
              <button
                type="button"
                className="bg-primary rounded-md px-3 py-1 text-white"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(inviteLink);
                    setCopied(true);
                  } catch (err: any) {
                    setMessage({
                      type: "error",
                      text: err?.message ?? "Gagal menyalin link",
                    });
                  }
                }}
              >
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              Link ini khusus untuk kasir yang dipilih dan hanya akan menambahkan
              pengguna yang menerima ke kasir tersebut. Jaga kerahasiaan link dan
              kirim hanya ke penerima yang dituju.
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default InviteStaffForm;
