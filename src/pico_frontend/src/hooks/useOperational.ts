import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@/context/auth-context";
import { createQueryKey, invalidateQueries } from "@/lib/query-client";
import { toast } from "sonner";

// Query hooks for operational contract data
export function useUserBalance(principal?: string) {
  const { operationalService } = useServices();

  return useQuery({
    queryKey: createQueryKey.balance(principal || ""),
    queryFn: () => operationalService.getUserBalance(principal!),
    enabled: !!principal,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useTokenInfo() {
  const { operationalService } = useServices();

  return useQuery({
    queryKey: createQueryKey.tokenInfo(),
    queryFn: () => operationalService.getTokenInfo(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useUserTransactions(principal?: string) {
  const { operationalService } = useServices();

  return useQuery({
    queryKey: createQueryKey.userTransactions(principal || ""),
    queryFn: () => operationalService.getUserTransactions(principal!),
    enabled: !!principal,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAllowance(principal?: string) {
  const { operationalService } = useServices();

  return useQuery({
    queryKey: createQueryKey.allowance(principal || ""),
    queryFn: () => operationalService.checkAllowance(principal!),
    enabled: !!principal,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Check NFT purchase approval status
export function useNFTPurchaseApproval(principal?: string, price?: number) {
  const { operationalService } = useServices();

  return useQuery({
    queryKey: ["nft-purchase-approval", principal, price],
    queryFn: async () => {
      if (!principal || price === undefined) return null;
      return await operationalService.checkNFTPurchaseApproval(principal, price);
    },
    enabled: !!principal && price !== undefined,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Mutation hooks for operational actions
export function useTopUp() {
  const { operationalService } = useServices();

  return useMutation({
    mutationFn: async (params: { userPrincipal: string; amount: number }) => {
      return await operationalService.topUp(
        params.userPrincipal,
        params.amount,
      );
    },
    onSuccess: (_, variables) => {
      toast.success(`Successfully topped up ${variables.amount} tokens!`);
      invalidateQueries.operational();
    },
    onError: (error: Error) => {
      console.error("Top up failed:", error);
      toast.error("Failed to top up. Please try again.");
    },
  });
}

export function useBuyNFT() {
  const { operationalService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      buyer: string;
      seller: string;
      nftId: number;
      price: number;
      forumId?: number;
    }) => {
      return await operationalService.buyNFT(
        params.buyer,
        params.seller,
        params.nftId,
        params.price,
        params.forumId,
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
    },
    onError: (error: Error) => {
      console.error("NFT purchase failed:", error);
      toast.error("Failed to purchase NFT. Please try again.");
    },
  });
}

export function useApproveNFTPurchase() {
  const { operationalService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userPrincipal: string;
      amount: number;
      buffer?: number;
    }) => {
      const totalAmount = params.amount + (params.buffer || 1); // Add 1 PICO buffer by default
      const approvalInfo = await operationalService.getApprovalInfo(totalAmount);
      return { approvalInfo, totalAmount };
    },
    onSuccess: (result, variables) => {
      // Invalidate approval-related queries
      queryClient.invalidateQueries({
        queryKey: ["nft-purchase-approval"],
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.allowance(variables.userPrincipal),
      });
    },
    onError: (error: Error) => {
      console.error("Failed to get approval info:", error);
      toast.error("Failed to prepare approval. Please try again.");
    },
  });
}

// Note: Approval operations should be handled through the ledger canister directly
// For now, we'll create a placeholder that explains this requirement
export function useApproveContract() {
  return useMutation({
    mutationFn: async () => {
      throw new Error(
        "Approval must be done through the ledger canister directly. Use the getApprovalInfo method to get the correct parameters.",
      );
    },
    onError: (error: Error) => {
      console.error("Contract approval failed:", error);
      toast.error(
        "Contract approval requires direct ledger interaction. Check documentation for details.",
      );
    },
  });
}
