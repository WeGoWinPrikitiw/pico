import { useMutation } from "@tanstack/react-query";
import { serviceFactory } from "@/services";

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      // Ensure services are initialized
      await serviceFactory.initialize();
      const uploadService = serviceFactory.getUploadService();

      if (!uploadService) {
        throw new Error("Upload service not available");
      }

      return uploadService.uploadImage(file);
    },
  });
}
