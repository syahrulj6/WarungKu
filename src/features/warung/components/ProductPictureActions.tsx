// components/ProductActions.tsx
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Image } from "lucide-react";

type ProductActionsProps = {
  selectedImage: File | null;
  productPictureUrl: string | null;
  productId: string;
  handleOpenFileExplorer: () => void;
  handleRemoveSelectedImage: () => void;
  handleUpdateProductPicture: (productId: string) => Promise<void>;
  handleDeleteProductPicture: (productId: string) => Promise<void>;
  inputFileRef: React.RefObject<HTMLInputElement>;
  onPickProductPicture: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ProductActions = ({
  selectedImage,
  productPictureUrl,
  productId,
  handleOpenFileExplorer,
  handleRemoveSelectedImage,
  handleUpdateProductPicture,
  handleDeleteProductPicture,
  inputFileRef,
  onPickProductPicture,
}: ProductActionsProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="size-32 rounded-md">
          {productPictureUrl ? (
            <AvatarImage src={productPictureUrl} className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-gray-100">
              <Image className="size-8 text-gray-400" />
            </div>
          )}
          <AvatarFallback>PR</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={handleOpenFileExplorer} size="sm">
          {productPictureUrl ? "Ganti Foto" : "Tambah Foto"}
        </Button>

        {!selectedImage ? (
          productPictureUrl && (
            <Button
              variant="destructive"
              onClick={() => handleDeleteProductPicture(productId)}
              size="sm"
            >
              Hapus Foto
            </Button>
          )
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleRemoveSelectedImage}
              variant="outline"
              size="sm"
            >
              Batal
            </Button>
            <Button
              onClick={() => handleUpdateProductPicture(productId)}
              size="sm"
            >
              Simpan
            </Button>
          </div>
        )}

        <input
          accept="image/*"
          onChange={onPickProductPicture}
          className="hidden"
          type="file"
          ref={inputFileRef}
        />
      </div>
    </div>
  );
};
