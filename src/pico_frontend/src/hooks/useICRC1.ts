import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKey } from "@/lib/query-client";
import { serviceFactory } from "@/services";
import type {
  Account,
  Tokens,
  TransferArg,
  ApproveArgs,
  AllowanceArgs,
} from "@/types";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";

// Query hooks
export function useTokenBalance(account: Account, enabled: boolean = true) {
  return useQuery({
    queryKey: [
      ...createQueryKey.all(),
      "icrc1",
      "balance",
      account.owner.toString(),
    ],
    queryFn: async () => {
      const service = serviceFactory.getICRC1Service();
      return service.getBalance(account);
    },
    enabled: enabled && !!account.owner,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useTokenInfo() {
  return useQuery({
    queryKey: [...createQueryKey.all(), "icrc1", "token-info"],
    queryFn: async () => {
      const service = serviceFactory.getICRC1Service();
      const [name, symbol, decimals, totalSupply, fee] = await Promise.all([
        service.getName(),
        service.getSymbol(),
        service.getDecimals(),
        service.getTotalSupply(),
        service.getFee(),
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply,
        fee,
        formattedTotalSupply: service.formatTokens(totalSupply, decimals),
        formattedFee: service.formatTokens(fee, decimals),
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - token info rarely changes
  });
}

export function useTokenMetadata() {
  return useQuery({
    queryKey: [...createQueryKey.all(), "icrc1", "metadata"],
    queryFn: async () => {
      const service = serviceFactory.getICRC1Service();
      return service.getMetadata();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useAllowance(args: AllowanceArgs, enabled: boolean = true) {
  return useQuery({
    queryKey: [
      ...createQueryKey.all(),
      "icrc1",
      "allowance",
      args.account.owner.toString(),
      args.spender.owner.toString(),
    ],
    queryFn: async () => {
      const service = serviceFactory.getICRC1Service();
      return service.getAllowance(args);
    },
    enabled: enabled && !!args.account.owner && !!args.spender.owner,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useMintingAccount() {
  return useQuery({
    queryKey: [...createQueryKey.all(), "icrc1", "minting-account"],
    queryFn: async () => {
      const service = serviceFactory.getICRC1Service();
      return service.getMintingAccount();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutation hooks
export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: TransferArg) => {
      const service = serviceFactory.getICRC1Service();
      return service.transfer(args);
    },
    onSuccess: (result) => {
      const service = serviceFactory.getICRC1Service();
      if (service.isTransferSuccess(result)) {
        toast.success("Transfer completed successfully!");

        // Invalidate balances for both sender and receiver
        queryClient.invalidateQueries({
          queryKey: [...createQueryKey.all(), "icrc1", "balance"],
        });

        // Invalidate token info (total supply might change)
        queryClient.invalidateQueries({
          queryKey: [...createQueryKey.all(), "icrc1", "token-info"],
        });
      } else {
        const error = service.getTransferError(result);
        toast.error(error || "Transfer failed");
      }
    },
    onError: (error) => {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed");
    },
  });
}

export function useApprove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: ApproveArgs) => {
      const service = serviceFactory.getICRC1Service();
      return service.approve(args);
    },
    onSuccess: (result) => {
      const service = serviceFactory.getICRC1Service();
      if (service.isApproveSuccess(result)) {
        toast.success("Approval completed successfully!");

        // Invalidate allowances
        queryClient.invalidateQueries({
          queryKey: [...createQueryKey.all(), "icrc1", "allowance"],
        });

        // Invalidate balance (fee was paid)
        queryClient.invalidateQueries({
          queryKey: [...createQueryKey.all(), "icrc1", "balance"],
        });
      } else {
        toast.error("Approval failed");
      }
    },
    onError: (error) => {
      console.error("Approval failed:", error);
      toast.error("Approval failed");
    },
  });
}

export function useTransferFrom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: any) => {
      const service = serviceFactory.getICRC1Service();
      return service.transferFrom(args);
    },
    onSuccess: () => {
      toast.success("Transfer from completed successfully!");

      // Invalidate all balance and allowance queries
      queryClient.invalidateQueries({
        queryKey: [...createQueryKey.all(), "icrc1", "balance"],
      });
      queryClient.invalidateQueries({
        queryKey: [...createQueryKey.all(), "icrc1", "allowance"],
      });
    },
    onError: (error) => {
      console.error("Transfer from failed:", error);
      toast.error("Transfer from failed");
    },
  });
}

// Utility hooks
export function useTokenOperations() {
  const transferMutation = useTransfer();
  const approveMutation = useApprove();
  const transferFromMutation = useTransferFrom();

  const isLoading =
    transferMutation.isPending ||
    approveMutation.isPending ||
    transferFromMutation.isPending;

  return {
    transfer: transferMutation.mutate,
    approve: approveMutation.mutate,
    transferFrom: transferFromMutation.mutate,
    isLoading,
    errors: {
      transfer: transferMutation.error,
      approve: approveMutation.error,
      transferFrom: transferFromMutation.error,
    },
  };
}

// Helper hook for creating accounts and transfer args
export function useTokenHelpers() {
  const service = serviceFactory.getICRC1Service();

  const createAccount = (
    principalText: string,
    subaccount?: Uint8Array,
  ): Account => {
    const principal = Principal.fromText(principalText);
    return service.createAccount(principal, subaccount);
  };

  const createTransferArgs = (
    toPrincipal: string,
    amount: string,
    decimals: number,
    memo?: string,
    fee?: string,
  ): TransferArg => {
    const to = createAccount(toPrincipal);
    const parsedAmount = service.parseTokens(amount, decimals);
    const parsedFee = fee ? service.parseTokens(fee, decimals) : undefined;
    const memoBytes = memo ? new TextEncoder().encode(memo) : undefined;

    return service.createTransferArgs(to, parsedAmount, memoBytes, parsedFee);
  };

  const createApproveArgs = (
    spenderPrincipal: string,
    amount: string,
    decimals: number,
    memo?: string,
    fee?: string,
    expiresAt?: bigint,
    expectedAllowance?: string,
  ): ApproveArgs => {
    const spender = createAccount(spenderPrincipal);
    const parsedAmount = service.parseTokens(amount, decimals);
    const parsedFee = fee ? service.parseTokens(fee, decimals) : undefined;
    const memoBytes = memo ? new TextEncoder().encode(memo) : undefined;
    const parsedExpectedAllowance = expectedAllowance
      ? service.parseTokens(expectedAllowance, decimals)
      : undefined;

    return service.createApproveArgs(
      spender,
      parsedAmount,
      parsedFee,
      memoBytes,
      expiresAt,
      parsedExpectedAllowance,
    );
  };

  const formatTokens = (amount: Tokens, decimals: number): string => {
    return service.formatTokens(amount, decimals);
  };

  const parseTokens = (amount: string, decimals: number): Tokens => {
    return service.parseTokens(amount, decimals);
  };

  return {
    createAccount,
    createTransferArgs,
    createApproveArgs,
    formatTokens,
    parseTokens,
  };
}

// Hook for user's token dashboard data
export function useUserTokenDashboard(principalText?: string) {
  const account = principalText
    ? {
        owner: Principal.fromText(principalText),
        subaccount: [] as [],
      }
    : undefined;

  const tokenInfo = useTokenInfo();
  const balance = useTokenBalance(account!, !!account);

  const data = {
    tokenInfo: tokenInfo.data,
    balance: balance.data,
    formattedBalance:
      tokenInfo.data && balance.data
        ? serviceFactory
            .getICRC1Service()
            .formatTokens(balance.data, tokenInfo.data.decimals)
        : undefined,
  };

  const isLoading = tokenInfo.isLoading || balance.isLoading;
  const error = tokenInfo.error || balance.error;

  return {
    ...data,
    isLoading,
    error,
    refetch: () => {
      tokenInfo.refetch();
      balance.refetch();
    },
  };
}
