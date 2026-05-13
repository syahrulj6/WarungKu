import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const PRODUCT_PICTURE_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "product-pictures",
);

async function ensureUploadDirectory() {
  await fs.mkdir(PRODUCT_PICTURE_DIR, { recursive: true });
}

export async function saveProductPicture(imageBase64: string, userId: string) {
  await ensureUploadDirectory();

  const fileName = `product-${userId}-${Date.now()}-${crypto.randomUUID()}.jpeg`;
  const filePath = path.join(PRODUCT_PICTURE_DIR, fileName);

  await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));

  return `/uploads/product-pictures/${fileName}`;
}

export async function deleteProductPicture(imageUrl: string) {
  try {
    const url = new URL(imageUrl, "http://localhost");
    const fileName = path.basename(url.pathname);

    if (!fileName) return;

    await fs.unlink(path.join(PRODUCT_PICTURE_DIR, fileName));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return;
    }

    console.error("Failed to delete local product image:", error);
  }
}
