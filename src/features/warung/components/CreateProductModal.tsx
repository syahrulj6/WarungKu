import { LoaderCircleIcon, Image } from "lucide-react";
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
import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type CreateProductModalProps = {
  children: ReactNode;
  refetch?: () => void;
};

export const CreateProductModal = ({
  children,
  refetch,
}: CreateProductModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateProductFormSchema>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      costPrice: 0,
      minStock: 0,
      categoryId: undefined,
      stock: 0,
    },
  });

  const createProduct = api.product.createProduct.useMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error("Ukuran gambar maksimal 2MB");
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateProduct = async (data: CreateProductFormSchema) => {
    try {
      let productPictureBase64: string | undefined = undefined;

      if (selectedImage) {
        productPictureBase64 = await convertFileToBase64(selectedImage);
      }

      await createProduct.mutateAsync({
        ...data,
        productPictureBase64,
      });

      toast.success("Produk berhasil dibuat");
      refetch?.();
      form.reset();
      setSelectedImage(null);
      setPreviewImage(null);
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat produk",
      );
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert image to base64"));
        }
      };
      reader.onerror = reject;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Produk Baru</DialogTitle>
          <DialogDescription>
            Isi form dibawah ini untuk menambahkan produk baru
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 flex flex-col items-center gap-4">
          <Avatar className="size-32 rounded-md">
            {previewImage ? (
              <AvatarImage src={previewImage} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-gray-100">
                <Image className="size-8 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? "Ganti Foto" : "Tambah Foto"}
            </Button>
            {previewImage && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
              >
                Hapus
              </Button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleCreateProduct)(e);
            }}
            className="grid grid-cols-2 gap-x-2 gap-y-4"
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
                "Simpan Produk"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
