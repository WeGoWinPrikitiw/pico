import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@/context/auth-context";
import { createQueryKey, invalidateQueries } from "@/lib/query-client";
import { toast } from "sonner";
import type {
    Forum,
    CreateForumInput,
    UpdateForumInput,
    ForumResult,
    ForumStats
} from "@/types";

// Helper function to handle forum results
const handleForumResult = (result: ForumResult): Forum => {
    if ('ok' in result) {
        return result.ok;
    }
    throw new Error(result.err);
};

// Query hooks for Forums data
export function useForums() {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: createQueryKey.forums(),
        queryFn: async () => {
            return await forumsService.getAllForums();
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useForum(forumId: number | bigint) {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: createQueryKey.forum(Number(forumId)),
        queryFn: async () => {
            const result = await forumsService.getForum(BigInt(forumId));
            return handleForumResult(result);
        },
        enabled: !!forumId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUserForums(principalId?: string) {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: createQueryKey.userForums(principalId || ""),
        queryFn: async () => {
            return await forumsService.getForumsByUser(principalId!);
        },
        enabled: !!principalId,
        staleTime: 1000 * 60 * 3, // 3 minutes
    });
}

export function useForumsStats() {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: createQueryKey.forumStats(),
        queryFn: async () => {
            return await forumsService.getForumStats();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useTrendingForums(limit?: number) {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: createQueryKey.trendingForums(),
        queryFn: async () => {
            return await forumsService.getTrendingForums(limit ? BigInt(limit) : undefined);
        },
        staleTime: 1000 * 60 * 3, // 3 minutes
    });
}

export function useLatestForums(limit?: number) {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: createQueryKey.latestForums(),
        queryFn: async () => {
            return await forumsService.getLatestForums(limit ? BigInt(limit) : undefined);
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useNFTForums(nftId: number | bigint) {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: createQueryKey.nftForums(Number(nftId)),
        queryFn: async () => {
            return await forumsService.getForumsByNFT(BigInt(nftId));
        },
        enabled: !!nftId,
        staleTime: 1000 * 60 * 3, // 3 minutes
    });
}

export function useForumsHealthCheck() {
    const { forumsService } = useServices();

    return useQuery({
        queryKey: [...createQueryKey.forums(), "health"],
        queryFn: async () => {
            return await forumsService.healthCheck();
        },
        staleTime: 1000 * 60, // 1 minute
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    });
}

// Mutation hooks for Forums operations
export function useCreateForum() {
    const { forumsService } = useServices();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            title: string;
            description: string;
            nftId: number;
            nftName: string;
            principalId: string;
        }) => {
            const input: CreateForumInput = {
                title: params.title,
                description: params.description,
                nft_id: BigInt(params.nftId),
                nft_name: params.nftName,
                principal_id: params.principalId,
            };

            const result = await forumsService.createForum(input);
            return handleForumResult(result);
        },
        onSuccess: (newForum, variables) => {
            toast.success("Forum created successfully!");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: createQueryKey.forums() });
            queryClient.invalidateQueries({ queryKey: createQueryKey.userForums(variables.principalId) });
            queryClient.invalidateQueries({ queryKey: createQueryKey.nftForums(variables.nftId) });
            queryClient.invalidateQueries({ queryKey: createQueryKey.forumStats() });
        },
        onError: (error: Error) => {
            console.error("Failed to create forum:", error);
            toast.error("Failed to create forum. Please try again.");
        },
    });
}

export function useLikeForum() {
    const { forumsService } = useServices();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { forumId: number | bigint; userId: string }) => {
            const result = await forumsService.toggleLikeForum(
                BigInt(params.forumId),
                params.userId
            );
            if ('ok' in result) {
                return result.ok;
            }
            throw new Error(result.err);
        },
        onSuccess: (result, variables) => {
            const action = result.action;
            toast.success(action === "liked" ? "Forum liked!" : "Forum unliked!");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: createQueryKey.forum(Number(variables.forumId)) });
            queryClient.invalidateQueries({ queryKey: createQueryKey.forums() });
            queryClient.invalidateQueries({ queryKey: createQueryKey.trendingForums() });
        },
        onError: (error: Error) => {
            console.error("Failed to toggle like forum:", error);
            toast.error("Failed to update like. Please try again.");
        },
    });
}

export function useToggleLikeForum() {
    const { forumsService } = useServices();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { forumId: number | bigint; userId: string }) => {
            const result = await forumsService.toggleLikeForum(
                BigInt(params.forumId),
                params.userId
            );
            if ('ok' in result) {
                return result.ok;
            }
            throw new Error(result.err);
        },
        onSuccess: (result, variables) => {
            const action = result.action;
            toast.success(action === "liked" ? "Forum liked!" : "Forum unliked!");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: createQueryKey.forum(Number(variables.forumId)) });
            queryClient.invalidateQueries({ queryKey: createQueryKey.forums() });
            queryClient.invalidateQueries({ queryKey: createQueryKey.trendingForums() });
        },
        onError: (error: Error) => {
            console.error("Failed to toggle like forum:", error);
            toast.error("Failed to update like. Please try again.");
        },
    });
}

export function useCommentForum() {
    const { forumsService } = useServices();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            forumId: number | bigint;
            comment: string;
            userId: string;
        }) => {
            const result = await forumsService.commentForum(
                BigInt(params.forumId),
                params.userId,
                params.comment
            );
            return handleForumResult(result);
        },
        onSuccess: (updatedForum, variables) => {
            toast.success("Comment added!");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: createQueryKey.forum(Number(variables.forumId)) });
            queryClient.invalidateQueries({ queryKey: createQueryKey.forums() });
        },
        onError: (error: Error) => {
            console.error("Failed to add comment:", error);
            toast.error("Failed to add comment. Please try again.");
        },
    });
}

export function useUpdateForum() {
    const { forumsService } = useServices();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            forumId: number | bigint;
            title?: string;
            description?: string;
            nftName?: string;
            isSold?: boolean;
        }) => {
            const input: UpdateForumInput = {
                forum_id: BigInt(params.forumId),
                title: params.title ? [params.title] : [],
                description: params.description ? [params.description] : [],
                nft_name: params.nftName ? [params.nftName] : [],
                is_sold: params.isSold !== undefined ? [params.isSold] : [],
            };

            const result = await forumsService.updateForum(input);
            return handleForumResult(result);
        },
        onSuccess: (updatedForum, variables) => {
            toast.success("Forum updated successfully!");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: createQueryKey.forum(Number(variables.forumId)) });
            queryClient.invalidateQueries({ queryKey: createQueryKey.forums() });
        },
        onError: (error: Error) => {
            console.error("Failed to update forum:", error);
            toast.error("Failed to update forum. Please try again.");
        },
    });
}

export function useDeleteForum() {
    const { forumsService } = useServices();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (forumId: number | bigint) => {
            const result = await forumsService.deleteForum(BigInt(forumId));
            if ('ok' in result) {
                return result.ok;
            }
            throw new Error(result.err);
        },
        onSuccess: (_, forumId) => {
            toast.success("Forum deleted successfully!");

            // Remove from cache and invalidate related queries
            queryClient.removeQueries({ queryKey: createQueryKey.forum(Number(forumId)) });
            queryClient.invalidateQueries({ queryKey: createQueryKey.forums() });
        },
        onError: (error: Error) => {
            console.error("Failed to delete forum:", error);
            toast.error("Failed to delete forum. Please try again.");
        },
    });
}

// Helper hook for forum filtering and searching
export function useForumFilters() {
    return {
        filterForums: (
            forums: Forum[],
            filters: {
                category?: string;
                searchQuery?: string;
                nftId?: number;
                sortBy?: "newest" | "popular" | "mostComments";
            }
        ) => {
            let filtered = [...forums];

            if (filters.searchQuery?.trim()) {
                const query = filters.searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (forum) =>
                        forum.title.toLowerCase().includes(query) ||
                        forum.description.toLowerCase().includes(query) ||
                        forum.nft_name.toLowerCase().includes(query)
                );
            }

            if (filters.nftId) {
                filtered = filtered.filter(
                    (forum) => Number(forum.nft_id) === filters.nftId
                );
            }

            switch (filters.sortBy) {
                case "newest":
                    filtered.sort((a, b) => Number(b.created_at - a.created_at));
                    break;
                case "popular":
                    filtered.sort((a, b) => Number(b.likes - a.likes));
                    break;
                case "mostComments":
                    filtered.sort((a, b) => b.comments.length - a.comments.length);
                    break;
                default:
                    break;
            }

            return filtered;
        },
    };
}

// Utility hooks
export function useForumOperations() {
    const createMutation = useCreateForum();
    const likeMutation = useLikeForum();
    const commentMutation = useCommentForum();
    const updateMutation = useUpdateForum();
    const deleteMutation = useDeleteForum();

    const isLoading =
        createMutation.isPending ||
        likeMutation.isPending ||
        commentMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    return {
        create: createMutation.mutate,
        like: likeMutation.mutate,
        comment: commentMutation.mutate,
        update: updateMutation.mutate,
        delete: deleteMutation.mutate,
        isLoading,
        errors: {
            create: createMutation.error,
            like: likeMutation.error,
            comment: commentMutation.error,
            update: updateMutation.error,
            delete: deleteMutation.error,
        },
    };
}