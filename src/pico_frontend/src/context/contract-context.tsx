import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { invalidateQueries } from "@/lib/query-client";
import { useAuth } from "./auth-context";
import type {
  UserPreferences,
  PreferencesInput,
  Tokens,
  TransferArg,
  ApproveArgs,
} from "@/types";
import {
  usePreferences,
  usePreferencesStats,
  usePreferencesOperations,
  useTokenBalance,
  useTokenInfo,
  useTokenOperations,
  useTokenHelpers,
  useUserTokenDashboard,
} from "@/hooks";

interface ContractContextValue {
  // Preferences
  preferences: {
    data?: UserPreferences;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    operations: ReturnType<typeof usePreferencesOperations>;
    stats: {
      data?: any;
      isLoading: boolean;
      error: any;
    };
  };

  // Token/ICRC1
  token: {
    info: {
      data?: any;
      isLoading: boolean;
      error: any;
    };
    balance: {
      data?: Tokens;
      isLoading: boolean;
      error: any;
      formatted?: string;
    };
    operations: ReturnType<typeof useTokenOperations>;
    helpers: ReturnType<typeof useTokenHelpers>;
    dashboard: ReturnType<typeof useUserTokenDashboard>;
  };

  // Global operations
  refreshAll: () => void;
  isInitialized: boolean;
}

const ContractContext = createContext<ContractContextValue | undefined>(
  undefined,
);

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const { isAuthenticated, principal } = useAuth();

  // Preferences hooks
  const preferencesQuery = usePreferences(principal || "", isAuthenticated);
  const preferencesStats = usePreferencesStats();
  const preferencesOperations = usePreferencesOperations();

  // Token hooks
  const tokenInfo = useTokenInfo();
  const userAccount = useMemo(() => {
    if (!principal) return undefined;
    return {
      owner: { toString: () => principal } as any,
      subaccount: [] as [],
    };
  }, [principal]);

  const tokenBalance = useTokenBalance(
    userAccount!,
    isAuthenticated && !!userAccount,
  );
  const tokenOperations = useTokenOperations();
  const tokenHelpers = useTokenHelpers();
  const tokenDashboard = useUserTokenDashboard(principal);

  // Global refresh function
  const refreshAll = useCallback(() => {
    invalidateQueries.all();
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<ContractContextValue>(
    () => ({
      preferences: {
        data: preferencesQuery.data,
        isLoading: preferencesQuery.isLoading,
        error: preferencesQuery.error,
        refetch: preferencesQuery.refetch,
        operations: preferencesOperations,
        stats: {
          data: preferencesStats.data,
          isLoading: preferencesStats.isLoading,
          error: preferencesStats.error,
        },
      },
      token: {
        info: {
          data: tokenInfo.data,
          isLoading: tokenInfo.isLoading,
          error: tokenInfo.error,
        },
        balance: {
          data: tokenBalance.data,
          isLoading: tokenBalance.isLoading,
          error: tokenBalance.error,
          formatted:
            tokenInfo.data && tokenBalance.data
              ? tokenHelpers.formatTokens(
                  tokenBalance.data,
                  tokenInfo.data.decimals,
                )
              : undefined,
        },
        operations: tokenOperations,
        helpers: tokenHelpers,
        dashboard: tokenDashboard,
      },
      refreshAll,
      isInitialized: isAuthenticated,
    }),
    [
      preferencesQuery.data,
      preferencesQuery.isLoading,
      preferencesQuery.error,
      preferencesQuery.refetch,
      preferencesOperations,
      preferencesStats.data,
      preferencesStats.isLoading,
      preferencesStats.error,
      tokenInfo.data,
      tokenInfo.isLoading,
      tokenInfo.error,
      tokenBalance.data,
      tokenBalance.isLoading,
      tokenBalance.error,
      tokenOperations,
      tokenHelpers,
      tokenDashboard,
      refreshAll,
      isAuthenticated,
    ],
  );

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error(
      "useContractContext must be used within a ContractProvider",
    );
  }
  return context;
}

// Specialized hooks for easier usage
export function usePreferencesContext() {
  const { preferences } = useContractContext();
  return preferences;
}

export function useTokenContext() {
  const { token } = useContractContext();
  return token;
}

// High-level operation hooks with error handling
export function useCreatePreferencesWithErrorHandling() {
  const { preferences } = useContractContext();

  return useCallback(
    (input: PreferencesInput) => {
      try {
        preferences.operations.create(input);
        return { success: true };
      } catch (error) {
        console.error("Failed to create preferences:", error);
        return { success: false, error };
      }
    },
    [preferences.operations],
  );
}

export function useTransferTokenWithErrorHandling() {
  const { token } = useContractContext();

  return useCallback(
    (args: TransferArg) => {
      try {
        token.operations.transfer(args);
        return { success: true };
      } catch (error) {
        console.error("Failed to transfer tokens:", error);
        return { success: false, error };
      }
    },
    [token.operations],
  );
}

export function useApproveTokenWithErrorHandling() {
  const { token } = useContractContext();

  return useCallback(
    (args: ApproveArgs) => {
      try {
        token.operations.approve(args);
        return { success: true };
      } catch (error) {
        console.error("Failed to approve tokens:", error);
        return { success: false, error };
      }
    },
    [token.operations],
  );
}

// Utility hooks for common patterns
export function useUserPreferencesWithFallback(
  fallbackPreferences: string[] = [],
) {
  const { preferences } = useContractContext();

  return useMemo(() => {
    if (preferences.data) {
      return preferences.data.preferences;
    }
    return fallbackPreferences;
  }, [preferences.data, fallbackPreferences]);
}

export function useTokenBalanceFormatted() {
  const { token } = useContractContext();

  return useMemo(() => {
    if (token.balance.data && token.info.data) {
      return token.helpers.formatTokens(
        token.balance.data,
        token.info.data.decimals,
      );
    }
    return "0";
  }, [token.balance.data, token.info.data, token.helpers]);
}

export function useIsContractReady() {
  const { isInitialized, preferences, token } = useContractContext();

  return useMemo(() => {
    return (
      isInitialized &&
      !preferences.isLoading &&
      !token.info.isLoading &&
      !!token.info.data
    );
  }, [
    isInitialized,
    preferences.isLoading,
    token.info.isLoading,
    token.info.data,
  ]);
}
