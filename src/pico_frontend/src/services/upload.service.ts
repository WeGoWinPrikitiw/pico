import { BaseService, ApiError } from "./base.service";

export interface UploadResponse {
  success: boolean;
  url: string;
  error?: string;
}

export class UploadService extends BaseService {
  // Compress and resize image to reduce payload size
  private async compressImage(
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to data URL with compression
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(img.src);

        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new ApiError("Failed to load image for compression", "500"));
      };

      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  }

  async uploadImage(file: File): Promise<string> {
    try {
      // For images, compress them to reduce payload size
      if (file.type.startsWith("image/")) {
        console.log(
          `Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );

        // Start with moderate compression
        let compressedDataUrl = await this.compressImage(file, 800, 0.7);

        // If still too large (>1MB as data URL), compress more aggressively
        if (compressedDataUrl.length > 1024 * 1024) {
          console.log("First compression still too large, compressing more...");
          compressedDataUrl = await this.compressImage(file, 600, 0.5);
        }

        // If STILL too large, compress even more
        if (compressedDataUrl.length > 1024 * 1024) {
          console.log(
            "Second compression still too large, final compression..."
          );
          compressedDataUrl = await this.compressImage(file, 400, 0.3);
        }

        console.log(
          `Final compressed data URL length: ${(
            compressedDataUrl.length / 1024
          ).toFixed(2)}KB`
        );

        // If it's still over 1.5MB as data URL, warn about potential issues
        if (compressedDataUrl.length > 1.5 * 1024 * 1024) {
          console.warn(
            "Compressed image is still quite large and may cause upload issues"
          );
        }

        return compressedDataUrl;
      }

      // For non-images, convert directly to data URL (might still be too large for video/audio)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (result.length > 2 * 1024 * 1024) {
            reject(
              new ApiError(
                "File too large after conversion. Please use a smaller file.",
                "413"
              )
            );
          } else {
            resolve(result);
          }
        };
        reader.onerror = () => {
          reject(new ApiError("Failed to read file", "500"));
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new ApiError("Failed to upload image", "500");
    }
  }

  async uploadImageToR2(file: File): Promise<string> {
    try {
      // This would be the implementation for uploading to Cloudflare R2
      // For now, we're using data URLs as a fallback

      // Generate a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileExtension = file.name.split(".").pop();
      const fileName = `nft-images/${timestamp}-${randomString}.${fileExtension}`;

      // TODO: Implement actual R2 upload here
      // This would require either:
      // 1. A backend endpoint that generates presigned URLs
      // 2. Direct R2 API access (not recommended for frontend)
      // 3. A backend upload proxy

      console.warn("R2 upload not fully implemented, using data URL fallback");
      return this.uploadImage(file);
    } catch (error) {
      console.error("R2 upload failed:", error);
      throw new ApiError("Failed to upload image to R2", "500");
    }
  }
}
