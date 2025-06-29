import { FrontendNFTInfo } from "@/types";

export const RARITY_OPTIONS = ["Common", "Rare", "Epic", "Legendary", "Special"] as const;
export const SORT_OPTIONS = ["trending", "newest", "price-high", "price-low"] as const;
export const STATUS_OPTIONS = ["", "buy-now", "new"] as const;

export type RarityType = typeof RARITY_OPTIONS[number];
export type SortType = typeof SORT_OPTIONS[number];
export type StatusType = typeof STATUS_OPTIONS[number];
export type ViewMode = "grid" | "list";

export interface NFTFilters {
    minPrice: string;
    maxPrice: string;
    category: string;
    status: StatusType;
    rarity: string;
}

export interface NFTTrait {
    trait_type: string;
    value: string;
    rarity?: string | string[];
}

/**
 * Get category from NFT traits
 */
export const getCategoryFromTraits = (traits: NFTTrait[]): string => {
    const categoryTrait = traits.find(
        (trait) =>
            trait.trait_type.toLowerCase() === "category" ||
            trait.trait_type.toLowerCase() === "type"
    );
    return categoryTrait ? categoryTrait.value.toLowerCase() : "";
};

/**
 * Get rarity from NFT traits with improved logic
 */
export const getRarityFromTraits = (traits: NFTTrait[]): string => {
    // First check if any trait has a rarity field
    for (const trait of traits) {
        if (trait.rarity) {
            if (Array.isArray(trait.rarity) && trait.rarity.length > 0) {
                return trait.rarity[0];
            } else if (typeof trait.rarity === "string") {
                return trait.rarity;
            }
        }
    }

    // Check if there's a trait_type specifically for rarity
    const rarityTrait = traits.find(
        (trait) =>
            trait.trait_type.toLowerCase() === "rarity" ||
            trait.trait_type.toLowerCase() === "tier"
    );

    return rarityTrait ? rarityTrait.value : "Common";
};

/**
 * Check if NFT is new (created within last 7 days)
 */
export const isNewNFT = (createdAt: number): boolean => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return createdAt * 1000 > sevenDaysAgo;
};

/**
 * Filter NFTs based on search query and filters
 */
export const filterNFTs = (
    nfts: FrontendNFTInfo[],
    searchQuery: string,
    filters: NFTFilters
): FrontendNFTInfo[] => {
    let filtered = [...nfts];

    // Apply search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (nft) =>
                nft.name.toLowerCase().includes(query) ||
                nft.description.toLowerCase().includes(query) ||
                nft.traits.some(
                    (trait) =>
                        trait.trait_type.toLowerCase().includes(query) ||
                        trait.value.toLowerCase().includes(query)
                )
        );
    }

    // Apply price filters
    if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
        filtered = filtered.filter((nft) => nft.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
        filtered = filtered.filter((nft) => nft.price <= Number(filters.maxPrice));
    }

    // Apply category filter (fix: empty string means no filter)
    if (filters.category && filters.category !== "all") {
        filtered = filtered.filter((nft) => {
            const nftCategory = getCategoryFromTraits(nft.traits);
            return nftCategory === filters.category.toLowerCase();
        });
    }

    // Apply status filter
    if (filters.status === "new") {
        filtered = filtered.filter((nft) => isNewNFT(nft.created_at));
    }
    // Add more status filters as needed

    // Apply rarity filter
    if (filters.rarity) {
        filtered = filtered.filter((nft) => {
            const nftRarity = getRarityFromTraits(nft.traits);
            return nftRarity.toLowerCase() === filters.rarity.toLowerCase();
        });
    }

    return filtered;
};

/**
 * Sort NFTs based on sort type
 */
export const sortNFTs = (nfts: FrontendNFTInfo[], sortBy: SortType): FrontendNFTInfo[] => {
    const sorted = [...nfts];

    switch (sortBy) {
        case "newest":
            return sorted.sort((a, b) => b.created_at - a.created_at);
        case "price-high":
            return sorted.sort((a, b) => b.price - a.price);
        case "price-low":
            return sorted.sort((a, b) => a.price - b.price);
        case "trending":
        default:
            return sorted; // Keep original order for trending
    }
};

/**
 * Get available categories from NFTs
 */
export const getAvailableCategories = (nfts: FrontendNFTInfo[]): string[] => {
    const categories = new Set<string>();
    nfts.forEach((nft) => {
        const category = getCategoryFromTraits(nft.traits);
        if (category) categories.add(category);
    });
    return Array.from(categories).sort();
};

/**
 * Format owner address for display
 */
export const formatOwnerAddress = (owner: string): string => {
    return `${owner.slice(0, 6)}...${owner.slice(-4)}`;
};