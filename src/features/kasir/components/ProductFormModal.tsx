import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, LoaderCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import {
  createProductFormSchema,
  type CreateProductFormSchema,
} from "../forms/product";
import { CreateProductFormInner } from "./CreateProductFormInner";
import { api } from "~/utils/api";
import { toast } from "sonner";

type ProductFormProduct = {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number | null;
  categoryId: string | null;
  productPictureUrl: string | null;
};

type ProductFormModalProps = {
  mode: "create" | "edit";
  product?: ProductFormProduct;
  children?: ReactNode;
  onSuccess?: () => Promise<void> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export const ProductFormModal = ({
  mode,
  product,
  children,
  onSuccess,
  open,
  onOpenChange,
}: ProductFormModalProps) => {
  const isEdit = mode === "edit";
  const router = useRouter();
  const { id } = router.query;

  const isControlled = typeof open === "boolean";
  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = isControlled ? (open ?? false) : internalOpen;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    product?.productPictureUrl ?? null,
  );
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateProductFormSchema>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ?? 0,
      costPrice: product?.costPrice ?? 0,
      stock: product?.stock ?? 0,
      minStock: product?.minStock ?? 0,
      categoryId: product?.categoryId ?? "",
    },
  });

  const createProduct = api.product.createProduct.useMutation();
  const updateProduct = api.product.updateProduct.useMutation();

  const setModalOpen = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
  };

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    form.reset({
      name: product?.name ?? "",
      price: product?.price ?? 0,
      costPrice: product?.costPrice ?? 0,
      stock: product?.stock ?? 0,
      minStock: product?.minStock ?? 0,
      categoryId: product?.categoryId ?? "",
    });
    setSelectedImage(null);
    setPreviewImage(product?.productPictureUrl ?? null);
    setRemoveExistingImage(false);
  }, [modalOpen, product, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB");
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

  const handleRemoveImage = () => {
    if (selectedImage) {
      setSelectedImage(null);
      setPreviewImage(product?.productPictureUrl ?? null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (previewImage) {
      setPreviewImage(null);
      setRemoveExistingImage(true);
    }
  };

  const handleSubmit = async (data: CreateProductFormSchema) => {
    try {
      const productPictureBase64 = selectedImage
        ? await convertFileToBase64(selectedImage)
        : undefined;

      if (isEdit && product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          name: data.name,
          price: data.price,
          costPrice: data.costPrice,
          stock: data.stock,
          minStock: data.minStock,
          categoryId: data.categoryId,
          productPictureBase64,
          removeProductPicture: removeExistingImage && !selectedImage,
        });

        toast.success("Produk berhasil diperbarui");
      } else {
        await createProduct.mutateAsync({
          ...data,
          productPictureBase64,
        });

        toast.success("Produk berhasil dibuat");
      }

      await onSuccess?.();
      setModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Gagal memperbarui produk"
            : "Gagal membuat produk",
      );
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Ubah Produk" : "Buat Produk Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui detail produk agar data tetap akurat."
              : "Isi form berikut untuk menambahkan produk baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex flex-col items-center gap-4">
          <Avatar className="size-28 rounded-md">
            {previewImage ? (
              <AvatarImage src={previewImage} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-gray-100">
                <ImageIcon className="size-8 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? "Ganti Foto" : "Tambah Foto"}
            </Button>
            {previewImage && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
              >
                Hapus Foto
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
              void form.handleSubmit(handleSubmit)(e);
            }}
            className="grid grid-cols-2 gap-x-2 gap-y-4"
          >
            <CreateProductFormInner />
            <Button
              type="submit"
              className="col-span-2 w-full"
              disabled={isPending || !id}
            >
              {isPending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : isEdit ? (
                "Simpan Perubahan"
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
