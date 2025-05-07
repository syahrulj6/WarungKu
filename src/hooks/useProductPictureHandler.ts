import { useRef, useState } from "react";
import { api } from "~/utils/api";
import { toast } from "sonner";

export const useProductPictureHandler = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedProductPicturePreview, setSelectedProductPicturePreview] =
    useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: updateProductPicture } =
    api.product.updateProductPicture.useMutation();
  const { mutateAsync: deleteProductPicture } =
    api.product.deleteProductPicture.useMutation();

  const handleOpenFileExplorer = () => {
    inputFileRef.current?.click();
  };

  const onPickProductPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setSelectedProductPicturePreview(URL.createObjectURL(file));
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);
    setSelectedProductPicturePreview(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const handleUpdateProductPicture = async (productId: string) => {
    if (!selectedImage) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);

      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      // Extract just the base64 data part
      const base64Data = base64Image.split(",")[1];

      await updateProductPicture({
        productId,
        productPictureBase64: base64Data ?? "",
      });

      toast.success("Foto produk berhasil diupdate");
      handleRemoveSelectedImage();
    } catch (error) {
      toast.error("Gagal mengupdate foto produk");
    }
  };

  const handleDeleteProductPicture = async (productId: string) => {
    try {
      await deleteProductPicture({ productId });
      toast.success("Foto produk berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus foto produk");
    }
  };

  return {
    selectedImage,
    selectedProductPicturePreview,
    handleOpenFileExplorer,
    handleRemoveSelectedImage,
    handleUpdateProductPicture,
    handleDeleteProductPicture,
    onPickProductPicture,
    inputFileRef,
  };
};
