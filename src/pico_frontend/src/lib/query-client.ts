import { QueryClient, DefaultOptions } from "@tanstack/react-query";
import { ApiError } from "@/services";
import { toast } from "sonner";

const queryConfig: DefaultOptions = {
  queries: {
    // 5 minutes default stale time
    staleTime: 1000 * 60 * 5,
    // 10 minutes cache time
    gcTime: 1000 * 60 * 10,
    // Retry failed requests 2 times
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 408, 429
      if (error instanceof ApiError) {
        const shouldRetry =
          !error.code ||
          error.code === "408" ||
          error.code === "429" ||
          parseInt(error.code) >= 500;
        return shouldRetry && failureCount < 2;
      }
      return failureCount < 2;
    },
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus for important data
    refetchOnWindowFocus: false,
    // Error handling
    throwOnError: false,
  },
  mutations: {
    retry: false,
    // Global error handling for mutations
    onError: (error) => {
      console.error("Mutation error:", error);

      if (error instanceof ApiError) {
        toast.error(error.message || "An error occurred");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    },
    // Global success handling for mutations
    onSuccess: (data, variables, context) => {
      // Optional: Add global success handling here
      // toast.success("Operation completed successfully");
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query key factory for better key management
export const createQueryKey = {
  all: () => ["pico"] as const,

  // Auth keys
  auth: () => [...createQueryKey.all(), "auth"] as const,

  // NFT keys
  nfts: () => [...createQueryKey.all(), "nfts"] as const,
  nft: (id: number | string) =>
    [...createQueryKey.nfts(), "detail", id] as const,
  nftStats: () => [...createQueryKey.nfts(), "stats"] as const,
  aiNfts: () => [...createQueryKey.nfts(), "ai"] as const,
  traits: () => [...createQueryKey.nfts(), "traits"] as const,
  traitTypes: () => [...createQueryKey.traits(), "types"] as const,
  traitValues: (type: string) =>
    [...createQueryKey.traits(), "values", type] as const,
  nftsByTrait: (type: string, value: string) =>
    [...createQueryKey.nfts(), "trait", type, value] as const,
  nftsByRarity: (rarity: string) =>
    [...createQueryKey.nfts(), "rarity", rarity] as const,

  // Operational keys
  operational: () => [...createQueryKey.all(), "operational"] as const,
  balance: (principal: string) =>
    [...createQueryKey.operational(), "balance", principal] as const,
  allowance: (principal: string) =>
    [...createQueryKey.operational(), "allowance", principal] as const,
  transactions: () =>
    [...createQueryKey.operational(), "transactions"] as const,
  userTransactions: (principal: string) =>
    [...createQueryKey.transactions(), "user", principal] as const,
  nftTransactions: (nftId: number) =>
    [...createQueryKey.transactions(), "nft", nftId] as const,
  tokenInfo: () => [...createQueryKey.operational(), "token", "info"] as const,

  // Forums keys
  forums: () => [...createQueryKey.all(), "forums"] as const,
  forum: (id: number | string) =>
    [...createQueryKey.forums(), "detail", id] as const,
  forumStats: () => [...createQueryKey.forums(), "stats"] as const,
  userForums: (principal: string) =>
    [...createQueryKey.forums(), "user", principal] as const,
  nftForums: (nftId: number) =>
    [...createQueryKey.forums(), "nft", nftId] as const,
  trendingForums: () => [...createQueryKey.forums(), "trending"] as const,
  latestForums: () => [...createQueryKey.forums(), "latest"] as const,

  // Preferences keys
  preferences: () => [...createQueryKey.all(), "preferences"] as const,
  userPreferences: (principal: string) =>
    [...createQueryKey.preferences(), "user", principal] as const,
  preferencesStats: () => [...createQueryKey.preferences(), "stats"] as const,

  // AI keys
  ai: () => [...createQueryKey.all(), "ai"] as const,
  aiRecommendations: (principal: string, maxRecommendations?: number) =>
    [
      ...createQueryKey.ai(),
      "recommendations",
      principal,
      maxRecommendations,
    ] as const,
  aiDetailedRecommendations: (principal: string, maxRecommendations?: number) =>
    [
      ...createQueryKey.ai(),
      "detailed-recommendations",
      principal,
      maxRecommendations,
    ] as const,

  // User Profile keys
  userProfile: (principal: string) =>
    [...createQueryKey.all(), "userProfile", principal] as const,
  userProfileByUsername: (username: string) =>
    [...createQueryKey.all(), "userProfile", "username", username] as const,
  hasProfile: (principal: string) =>
    [...createQueryKey.all(), "userProfile", "hasProfile", principal] as const,
  usernameAvailable: (username: string) =>
    [
      ...createQueryKey.all(),
      "userProfile",
      "usernameAvailable",
      username,
    ] as const,
  listProfiles: (offset: number, limit: number) =>
    [...createQueryKey.all(), "userProfile", "list", offset, limit] as const,
  searchProfiles: (searchQuery: string) =>
    [...createQueryKey.all(), "userProfile", "search", searchQuery] as const,
  profileStats: () =>
    [...createQueryKey.all(), "userProfile", "stats"] as const,
} as const;

// Helper functions for invalidating related queries
export const invalidateQueries = {
  // Invalidate all auth-related queries
  auth: () =>
    queryClient.invalidateQueries({ queryKey: createQueryKey.auth() }),

  // Invalidate all NFT-related queries
  nfts: () =>
    queryClient.invalidateQueries({ queryKey: createQueryKey.nfts() }),
  nft: (id: number | string) =>
    queryClient.invalidateQueries({ queryKey: createQueryKey.nft(id) }),

  // Invalidate operational queries
  operational: () =>
    queryClient.invalidateQueries({ queryKey: createQueryKey.operational() }),
  balance: (principal: string) =>
    queryClient.invalidateQueries({
      queryKey: createQueryKey.balance(principal),
    }),
  transactions: () =>
    queryClient.invalidateQueries({ queryKey: createQueryKey.transactions() }),

  // Invalidate forum queries
  forums: () =>
    queryClient.invalidateQueries({ queryKey: createQueryKey.forums() }),
  forum: (id: number | string) =>
    queryClient.invalidateQueries({ queryKey: createQueryKey.forum(id) }),

  // Invalidate user profile queries
  userProfile: (principal: string) =>
    queryClient.invalidateQueries({
      queryKey: createQueryKey.userProfile(principal),
    }),
  userProfiles: () =>
    queryClient.invalidateQueries({
      queryKey: [...createQueryKey.all(), "userProfile"],
    }),

  // Invalidate all queries
  all: () => queryClient.invalidateQueries({ queryKey: createQueryKey.all() }),
} as const;
