import { LoaderCircleIcon } from "lucide-react";
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
  createProductFormSchema,
  type CreateProductFormSchema,
} from "../forms/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { Form } from "~/components/ui/form";
import { CreateProductFormInner } from "./CreateProductFormInner";
import { toast } from "sonner";
import { useState } from "react";
import type { ReactNode } from "react";

type CreateProductModalProps = {
  children: ReactNode;
  refetch?: () => void;
};

export const CreateProductModal = ({
  children,
  refetch,
}: CreateProductModalProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateProductFormSchema>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      costPrice: 0,
      minStock: 0,
      categoryId: "",
      stock: 0,
    },
  });

  const createProduct = api.product.createProduct.useMutation();

  const handleCreateProduct = (data: CreateProductFormSchema) => {
    console.log("Submitting:", data);
    createProduct.mutate(data, {
      onSuccess: () => {
        toast.success("Product created successfully");
        refetch?.();
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        console.error("Error:", error);
        toast.error(error.message || "Failed to create product");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Product</DialogTitle>
          <DialogDescription>
            Isi form dibawah ini untuk membuat product.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleCreateProduct)(e);
            }}
            className="mt-2 grid grid-cols-2 space-y-2 gap-x-2"
          >
            <CreateProductFormInner />
            <Button
              type="submit"
              className="col-span-2 w-full"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                "Create Product"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
