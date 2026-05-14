import { LoaderCircleIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import {
  createKasirFormSchema,
  type CreateKasirFormSchema,
} from "../forms/kasir";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { Form } from "~/components/ui/form";
import { CreateKasirFormInner } from "./CreateKasirFormInner";
import { toast } from "sonner";
import { useState } from "react";

type CreateKasirModalProps = {
  refetch: () => void;
};

export const CreateKasirModal = ({ refetch }: CreateKasirModalProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateKasirFormSchema>({
    resolver: zodResolver(createKasirFormSchema),
    defaultValues: {
      name: "",
      address: undefined,
      phone: undefined,
      logoUrl: undefined,
    },
  });

  const createKasir = api.kasir.createKasir.useMutation();

  const handleCreateKasir = (data: CreateKasirFormSchema) => {
    console.log("Submitting:", data);
    createKasir.mutate(data, {
      onSuccess: () => {
        toast.success("Berhasil membuat Kasir");
        refetch();
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        console.error("Error:", error);
        toast.error(error.message || "Gagal membuat Kasir");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          Buat Kasir <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Kasir</DialogTitle>
          <DialogDescription>
            Isi form dibawah untuk membuat Kasir.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleCreateKasir)(e);
            }}
            className="mt-2 grid grid-cols-2 space-y-2 gap-x-2"
          >
            <CreateKasirFormInner />
            <Button
              type="submit"
              className="col-span-2 w-full"
              disabled={createKasir.isPending}
            >
              {createKasir.isPending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                "Buat Kasir"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

