import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { createQueryKey, FrontendNFTInfo } from "@/types";
import { serviceFactory } from "@/services";
import {
    NFTFilters,
    SortType,
    ViewMode,
    filterNFTs,
    sortNFTs,
    getAvailableCategories,
} from "@/lib/nft-utils";

export interface UseExploreReturn {
    // Data
    allNFTs: FrontendNFTInfo[];
    filteredNFTs: FrontendNFTInfo[];
    aiRecommendations: FrontendNFTInfo[];
    availableCategories: string[];

    // Loading states
    isLoadingNFTs: boolean;
    isLoadingRecommendations: boolean;

    // Error states
    nftError: Error | null;

    // UI State
    viewMode: ViewMode;
    sortBy: SortType;
    searchQuery: string;
    filters: NFTFilters;
    hasActiveFilters: boolean;

    // Actions
    setViewMode: (mode: ViewMode) => void;
    setSortBy: (sort: SortType) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: NFTFilters | ((prev: NFTFilters) => NFTFilters)) => void;
    clearFilters: () => void;
    refetchNFTs: () => void;
}

export function useExplore(): UseExploreReturn {
    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortType>("trending");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<NFTFilters>({
        minPrice: "",
        maxPrice: "",
        category: "",
        status: "",
        rarity: "",
    });

    // AI Recommendations - temporarily disabled due to type mismatch
    // TODO: Fix type transformation for AI recommendations
    const aiRecommendations: FrontendNFTInfo[] = [];
    const isLoadingRecommendations = false;

    // NFT Data - service already returns transformed FrontendNFTInfo[]
    const {
        data: allNFTs = [],
        isLoading: isLoadingNFTs,
        error: nftError,
        refetch: refetchNFTs,
    } = useQuery({
        queryKey: createQueryKey.nfts(),
        queryFn: async (): Promise<FrontendNFTInfo[]> => {
            console.log("Fetching NFTs from service...");
            await serviceFactory.initialize();
            const nftService = serviceFactory.getNFTService();
            if (!nftService) {
                console.warn("NFT service not available");
                return [];
            }
            const nfts = await nftService.getAllNFTs();
            console.log(`Fetched ${nfts.length} NFTs`);
            return nfts; // Service already returns transformed data
        },
        enabled: true,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchInterval: 30000,
    });

    // Computed Values
    const filteredNFTs = useMemo(() => {
        const filtered = filterNFTs(allNFTs, searchQuery, filters);
        return sortNFTs(filtered, sortBy);
    }, [allNFTs, searchQuery, filters, sortBy]);

    const availableCategories = useMemo(() => {
        return getAvailableCategories(allNFTs);
    }, [allNFTs]);

    const hasActiveFilters = useMemo(() => {
        return searchQuery.trim() !== "" || Object.values(filters).some((value) => value !== "");
    }, [searchQuery, filters]);

    // Actions
    const clearFilters = useCallback(() => {
        setFilters({
            minPrice: "",
            maxPrice: "",
            category: "",
            status: "",
            rarity: "",
        });
        setSearchQuery("");
    }, []);

    return {
        // Data
        allNFTs,
        filteredNFTs,
        aiRecommendations,
        availableCategories,

        // Loading states
        isLoadingNFTs,
        isLoadingRecommendations,

        // Error states
        nftError,

        // UI State
        viewMode,
        sortBy,
        searchQuery,
        filters,
        hasActiveFilters,

        // Actions
        setViewMode,
        setSortBy,
        setSearchQuery,
        setFilters,
        clearFilters,
        refetchNFTs,
    };
}   