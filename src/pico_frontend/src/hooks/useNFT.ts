import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@/context/auth-context";
import { createQueryKey, invalidateQueries } from "@/lib/query-client";
import { toast } from "sonner";
import type { NFTInfo, Trait, AIImageResult } from "@/types";
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
        queryFn: () => nftService?.getNFTsByTrait(traitType, traitValue) ?? Promise.resolve([]),
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
            );
        },
        onSuccess: (tokenId, variables) => {
            toast.success(`NFT #${tokenId} minted successfully!`);

            // Invalidate relevant queries
            invalidateQueries.nfts();

            // Invalidate specific queries based on the minted NFT
            if (variables.isAiGenerated) {
                queryClient.invalidateQueries({ queryKey: createQueryKey.aiNfts() });
            }

            // Invalidate stats
            queryClient.invalidateQueries({ queryKey: createQueryKey.nftStats() });
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
                        filters.trait.value,
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
