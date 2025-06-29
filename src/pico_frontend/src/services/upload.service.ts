import { BaseService, ApiError } from "./base.service";

export interface UploadResponse {
  success: boolean;
  url: string;
  error?: string;
}

export class UploadService extends BaseService {
  async uploadImage(file: File): Promise<string> {
    try {
      // Convert the image to a data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
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
      // Generate a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileExtension = file.name.split(".").pop();
      const fileName = `nft-images/${timestamp}-${randomString}.${fileExtension}`;

      console.warn("R2 upload not fully implemented, using data URL fallback");
      return this.uploadImage(file);
    } catch (error) {
      console.error("R2 upload failed:", error);
      throw new ApiError("Failed to upload image to R2", "500");
    }
  }
}
