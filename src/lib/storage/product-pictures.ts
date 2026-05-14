import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const PRODUCT_PICTURE_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "product-pictures",
);

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  return { cloudName, apiKey, apiSecret };
}

function configureCloudinary() {
  const config = getCloudinaryConfig();
  if (!config) return false;

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return true;
}

async function ensureUploadDirectory() {
  await fs.mkdir(PRODUCT_PICTURE_DIR, { recursive: true });
}

export async function saveProductPicture(imageBase64: string, userId: string) {
  if (configureCloudinary()) {
    const publicId = `warungku/product-pictures/product-${userId}-${Date.now()}-${crypto.randomUUID()}`;
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      {
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
      },
    );

    return uploadResult.secure_url;
  }

  await ensureUploadDirectory();

  const fileName = `product-${userId}-${Date.now()}-${crypto.randomUUID()}.jpeg`;
  const filePath = path.join(PRODUCT_PICTURE_DIR, fileName);

  await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));

  return `/uploads/product-pictures/${fileName}`;
}

export async function deleteProductPicture(imageUrl: string) {
  if (!imageUrl) return;

  if (configureCloudinary()) {
    try {
      const url = new URL(imageUrl);
      const uploadMarker = "/upload/";
      const uploadIndex = url.pathname.indexOf(uploadMarker);

      if (uploadIndex >= 0) {
        const afterUpload = url.pathname.slice(uploadIndex + uploadMarker.length);
        const withoutVersion = afterUpload.replace(/^v\d+\//, "");
        const publicId = withoutVersion.replace(/\.[^.]+$/, "");

        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
          return;
        }
      }
    } catch (error) {
      console.error("Failed to delete Cloudinary product image:", error);
      return;
    }
  }

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
