import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth, useServices } from "@/context/auth-context";
import { createQueryKey } from "@/lib/query-client";
import { toast } from "sonner";

// Get AI recommendations for user
export function useAIRecommendations(maxRecommendations?: number) {
    const { principal, isAuthenticated, isServicesReady } = useAuth();
    const services = isAuthenticated && isServicesReady ? useServices() : null;

    return useQuery({
        queryKey: createQueryKey.aiRecommendations(principal || "", maxRecommendations),
        queryFn: async () => {
            if (!services || !principal) {
                throw new Error("AI service not available");
            }

            const recommendationsString = await services.aiService.getRecommendations(
                principal,
                maxRecommendations
            );

            // Parse the recommendations string to get NFT IDs
            return services.aiService.parseRecommendations(recommendationsString);
        },
        enabled: !!services && !!principal,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Get detailed AI recommendations with NFT info
export function useDetailedAIRecommendations(maxRecommendations?: number) {
    const { principal, isAuthenticated, isServicesReady } = useAuth();
    const services = isAuthenticated && isServicesReady ? useServices() : null;

    return useQuery({
        queryKey: createQueryKey.aiDetailedRecommendations(principal || "", maxRecommendations),
        queryFn: async () => {
            if (!services || !principal) {
                throw new Error("AI service not available");
            }

            return await services.aiService.getDetailedRecommendations(
                principal,
                maxRecommendations
            );
        },
        enabled: !!services && !!principal,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Refresh recommendations mutation
export function useRefreshRecommendations() {
    const { principal, isAuthenticated, isServicesReady } = useAuth();
    const services = isAuthenticated && isServicesReady ? useServices() : null;

    return useMutation({
        mutationFn: async (maxRecommendations?: number) => {
            if (!services || !principal) {
                throw new Error("AI service not available");
            }

            const recommendationsString = await services.aiService.getRecommendations(
                principal,
                maxRecommendations
            );

            return services.aiService.parseRecommendations(recommendationsString);
        },
        onSuccess: () => {
            toast.success("AI recommendations refreshed!");
        },
        onError: (error: Error) => {
            console.error("Failed to refresh recommendations:", error);
            toast.error("Failed to refresh recommendations: " + error.message);
        },
    });
} 