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
  createWarungFormSchema,
  type CreateWarungFormSchema,
} from "../forms/warung";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { Form } from "~/components/ui/form";
import { CreateWarungFormInner } from "./CreateWarungFormInner";
import { toast } from "sonner";
import { useSession } from "~/hooks/useSession";
import { useState } from "react";

type CreateWarungModalProps = {
  refetch: () => void;
};

export const CreateWarungModal = ({ refetch }: CreateWarungModalProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateWarungFormSchema>({
    resolver: zodResolver(createWarungFormSchema),
    defaultValues: {
      name: "",
      address: undefined,
      phone: undefined,
      logoUrl: undefined,
    },
  });

  const createWarung = api.warung.createWarung.useMutation();

  const handleCreateWarung = (data: CreateWarungFormSchema) => {
    console.log("Submitting:", data);
    createWarung.mutate(data, {
      onSuccess: () => {
        toast.success("Berhasil membuat warung");
        refetch();
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        console.error("Error:", error);
        toast.error(error.message || "Gagal membuat warung");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          Buat warung <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Warung</DialogTitle>
          <DialogDescription>
            Isi form dibawah untuk membuat warung.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleCreateWarung)(e);
            }}
            className="mt-2 grid grid-cols-2 space-y-2 gap-x-2"
          >
            <CreateWarungFormInner />
            <Button
              type="submit"
              className="col-span-2 w-full"
              disabled={createWarung.isPending}
            >
              {createWarung.isPending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                "Buat Warung"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
