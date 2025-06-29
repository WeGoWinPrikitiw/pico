import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@/context/auth-context";
import { createQueryKey, invalidateQueries } from "@/lib/query-client";
import { toast } from "sonner";
import type {
  NFTInfo,
  Trait,
  AIImageResult,
  AIDetectionResponse,
} from "@/types";
import type { TransferArgs } from "../../../declarations/nft_contract/nft_contract.did";

// Query hooks for NFT data
export function useNFTs() {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.nfts(),
    queryFn: () => nftService?.getAllNFTs() ?? Promise.resolve([]),
    enabled: !!nftService,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useNFT(tokenId: number) {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.nft(tokenId),
    queryFn: () => nftService?.getNFT(tokenId) ?? Promise.resolve(null),
    enabled: !!tokenId && !!nftService,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAIGeneratedNFTs() {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.aiNfts(),
    queryFn: () => nftService?.getAIGeneratedNFTs() ?? Promise.resolve([]),
    enabled: !!nftService,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useNFTStats() {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.nftStats(),
    queryFn: async () => {
      if (!nftService) {
        return { total_nfts: 0, ai_generated: 0, self_made: 0 };
      }
      return await nftService.getNFTStats();
    },
    enabled: !!nftService,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTraitTypes() {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.traitTypes(),
    queryFn: () => nftService?.getAllTraitTypes() ?? Promise.resolve([]),
    enabled: !!nftService,
    staleTime: 1000 * 60 * 10, // 10 minutes - trait types don't change often
  });
}

export function useTraitValues(traitType: string) {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.traitValues(traitType),
    queryFn: () => nftService?.getTraitValues(traitType) ?? Promise.resolve([]),
    enabled: !!traitType && !!nftService,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useNFTsByTrait(traitType: string, traitValue: string) {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.nftsByTrait(traitType, traitValue),
    queryFn: () =>
      nftService?.getNFTsByTrait(traitType, traitValue) ?? Promise.resolve([]),
    enabled: !!traitType && !!traitValue && !!nftService,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useNFTsByRarity(rarity: string) {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.nftsByRarity(rarity),
    queryFn: () => nftService?.getNFTsByRarity(rarity) ?? Promise.resolve([]),
    enabled: !!rarity && !!nftService,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Mutation hooks for NFT operations
export function useMintNFT() {
  const { nftService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      to: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      isAiGenerated: boolean;
      traits: Trait[];
      forSale?: boolean;
    }) => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      return await nftService.mintNFT(
        params.to,
        params.name,
        params.description,
        params.price,
        params.imageUrl,
        params.isAiGenerated,
        params.traits,
        params.forSale
      );
    },
    onSuccess: (tokenId, variables) => {
      // Query invalidation is handled in the component for better control
      console.log(`NFT ${tokenId} minted successfully`);
    },
    onError: (error: Error) => {
      console.error("Failed to mint NFT:", error);
      toast.error("Failed to mint NFT. Please try again.");
    },
  });
}

export function useGenerateAIImage() {
  const { nftService } = useServices();

  return useMutation({
    mutationFn: async (prompt: string): Promise<AIImageResult> => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      return await nftService.generateAIImage(prompt);
    },
    onSuccess: () => {
      toast.success("AI image generated successfully!");
    },
    onError: (error: Error) => {
      console.error("Failed to generate AI image:", error);
      toast.error("Failed to generate AI image. Please try again.");
    },
  });
}

export function useTransferNFT() {
  const { nftService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      tokenId: number;
      to: string;
      from?: string;
      memo?: string;
    }) => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      const transferArgs: TransferArgs[] = [
        {
          token_id: BigInt(params.tokenId),
          to: nftService.createAccount(params.to),
          from_subaccount: [] as [] | [Uint8Array | number[]],
          memo: params.memo
            ? [new TextEncoder().encode(params.memo)]
            : ([] as [] | [Uint8Array | number[]]),
          created_at_time: [] as [] | [bigint],
        },
      ];

      return await nftService.transferNFT(transferArgs);
    },
    onSuccess: (result, variables) => {
      const hasError = result.some((error) => error !== null);

      if (!hasError) {
        toast.success(`NFT #${variables.tokenId} transferred successfully!`);

        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: createQueryKey.nft(variables.tokenId),
        });
        invalidateQueries.nfts();
      } else {
        toast.error("Transfer failed with errors.");
      }
    },
    onError: (error: Error) => {
      console.error("Failed to transfer NFT:", error);
      toast.error("Failed to transfer NFT. Please try again.");
    },
  });
}

// Helper hook for NFT filtering and searching
export function useNFTFilters() {
  const { data: traitTypes } = useTraitTypes();

  return {
    traitTypes: traitTypes || [],

    // Helper function to build filter queries
    buildFilterQueries: (filters: {
      trait?: { type: string; value: string };
      rarity?: string;
      aiGenerated?: boolean;
    }) => {
      const queries = [];

      if (filters.trait?.type && filters.trait?.value) {
        queries.push({
          key: createQueryKey.nftsByTrait(
            filters.trait.type,
            filters.trait.value
          ),
          queryFn: useNFTsByTrait(filters.trait.type, filters.trait.value),
        });
      }

      if (filters.rarity) {
        queries.push({
          key: createQueryKey.nftsByRarity(filters.rarity),
          queryFn: useNFTsByRarity(filters.rarity),
        });
      }

      if (filters.aiGenerated !== undefined) {
        if (filters.aiGenerated) {
          queries.push({
            key: createQueryKey.aiNfts(),
            queryFn: useAIGeneratedNFTs(),
          });
        }
      }

      return queries;
    },
  };
}

// AI Detection hooks
export function useDetectAIGenerated() {
  const { nftService } = useServices();

  return useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      return nftService.detectAIGenerated(imageUrl);
    },
    onError: (error: Error) => {
      console.error("Failed to detect AI generation:", error);
      toast.error(
        "Failed to detect if image is AI-generated. Please try again."
      );
    },
  });
}

export function useMintNFTWithAIDetection() {
  const { nftService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      to: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      traits: Trait[];
    }) => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      return nftService.mintNFTWithAIDetection(
        params.to,
        params.name,
        params.description,
        params.price,
        params.imageUrl,
        params.traits
      );
    },
    onSuccess: (result) => {
      console.log("NFT minted with AI detection:", result);
      toast.success(
        `NFT #${result.nft_id} minted successfully! AI detected: ${result.ai_detection.is_ai_generated ? "Yes" : "No"
        } (${Math.round(result.ai_detection.confidence * 100)}% confidence)`
      );

      // Invalidate and refetch all NFT-related queries
      invalidateQueries.nfts();
    },
    onError: (error: Error) => {
      console.error("Failed to mint NFT with AI detection:", error);
      toast.error("Failed to mint NFT with AI detection. Please try again.");
    },
  });
}

export function useSetOpenAIAPIKey() {
  const { nftService } = useServices();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      return nftService.setOpenAIAPIKey(apiKey);
    },
    onSuccess: () => {
      toast.success("OpenAI API key set successfully!");
    },
    onError: (error: Error) => {
      console.error("Failed to set OpenAI API key:", error);
      toast.error("Failed to set OpenAI API key. Please try again.");
    },
  });
}

// NEW HOOKS FOR ENHANCED NFT FUNCTIONALITY

// Hook to check if a principal owns a specific NFT
export function useNFTOwnership(tokenId: number, principalId?: string) {
  const { nftService } = useServices();

  return useQuery({
    queryKey: ["nft-ownership", tokenId, principalId],
    queryFn: async () => {
      if (!principalId) return false;
      return await nftService.checkOwnership(tokenId, principalId);
    },
    enabled: !!tokenId && !!principalId && !!nftService,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to get all NFTs owned by a specific principal
export function useNFTsByOwner(ownerPrincipal?: string) {
  const { nftService } = useServices();

  return useQuery({
    queryKey: createQueryKey.nftsByOwner(ownerPrincipal || ""),
    queryFn: async () => {
      if (!ownerPrincipal) return [];
      return await nftService.getNFTsByOwner(ownerPrincipal);
    },
    enabled: !!ownerPrincipal && !!nftService,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Hook to get only NFTs that are for sale
export function useNFTsForSale() {
  const { nftService } = useServices();

  return useQuery({
    queryKey: ["nfts-for-sale"],
    queryFn: () => nftService?.getNFTsForSale() ?? Promise.resolve([]),
    enabled: !!nftService,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to set NFT for sale status
export function useSetNFTForSale() {
  const { nftService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      tokenId: number;
      forSale: boolean;
      newPrice?: number;
    }) => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      // Convert PiCO units to minimal units (1 PiCO = 1e8 minimal units)
      const minimalPrice = params.newPrice !== undefined
        ? Math.round(params.newPrice * 100000000)
        : undefined;
      return await nftService.setNFTForSale(
        params.tokenId,
        params.forSale,
        minimalPrice
      );
    },
    onSuccess: (updatedNft, variables) => {
      toast.success(
        variables.forSale
          ? `NFT #${variables.tokenId} is now for sale!`
          : `NFT #${variables.tokenId} removed from sale`
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: createQueryKey.nft(variables.tokenId),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.nfts(),
      });
      queryClient.invalidateQueries({
        queryKey: ["nfts-for-sale"],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to update NFT sale status:", error);
      toast.error("Failed to update sale status. Please try again.");
    },
  });
}

// Hook to validate NFT purchase before attempting
export function useValidateNFTPurchase() {
  const { nftService } = useServices();

  return useMutation({
    mutationFn: async (params: {
      tokenId: number;
      buyerPrincipal: string;
    }) => {
      if (!nftService) {
        throw new Error("NFT service not available");
      }
      return await nftService.validatePurchase(
        params.tokenId,
        params.buyerPrincipal
      );
    },
    onError: (error: Error) => {
      console.error("Failed to validate NFT purchase:", error);
    },
  });
}

// Enhanced buy NFT hook with validation
export function useBuyNFTWithValidation() {
  const { operationalService } = useServices();
  const validatePurchase = useValidateNFTPurchase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      buyer: string;
      seller: string;
      nftId: number;
      price: number;
      forumId?: number;
    }) => {
      if (!operationalService) {
        throw new Error("Operational service not available");
      }

      // First validate the purchase
      const validation = await validatePurchase.mutateAsync({
        tokenId: params.nftId,
        buyerPrincipal: params.buyer,
      });

      if (!validation.isValid) {
        throw new Error(validation.error || "Purchase validation failed");
      }

      // Proceed with the purchase
      return await operationalService.buyNFT(
        params.buyer,
        params.seller,
        params.nftId,
        params.price,
        params.forumId
      );
    },
    onSuccess: (_, variables) => {
      toast.success(`Successfully purchased NFT #${variables.nftId}!`);

      // Invalidate relevant queries
      invalidateQueries.operational();
      invalidateQueries.nfts();
      queryClient.invalidateQueries({
        queryKey: createQueryKey.nft(variables.nftId),
      });
      queryClient.invalidateQueries({
        queryKey: ["nft-ownership", variables.nftId],
      });
      queryClient.invalidateQueries({
        queryKey: ["nfts-for-sale"],
      });
    },
    onError: (error: Error) => {
      console.error("NFT purchase failed:", error);
      toast.error(`Purchase failed: ${error.message}`);
    },
  });
}
