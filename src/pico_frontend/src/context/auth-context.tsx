import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceFactory } from "@/services";
import { createQueryKey, invalidateQueries } from "@/lib/query-client";
import { toast } from "sonner";

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  principal?: string;
  isLoading: boolean;
  error?: Error | null;

  // Auth actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;

  // User data
  userBalance?: number;
  isLoadingBalance: boolean;
  refreshBalance: () => void;

  // Services access
  isServicesReady: boolean;

  // Profile utilities
  copyPrincipalToClipboard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  // Check authentication status
  const {
    data: authData,
    isLoading: isCheckingAuth,
    error: authError,
    refetch: refreshAuth,
  } = useQuery({
    queryKey: createQueryKey.auth(),
    queryFn: async () => {
      await serviceFactory.initialize();
      const isAuthenticated = await serviceFactory.isAuthenticated();
      const principal = serviceFactory.getPrincipal();

      return {
        isAuthenticated,
        principal,
        servicesReady: isAuthenticated,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  const isAuthenticated = authData?.isAuthenticated ?? false;
  const principal = authData?.principal;
  const isServicesReady = authData?.servicesReady ?? false;

  // Get user balance
  const {
    data: userBalance,
    isLoading: isLoadingBalance,
    refetch: refreshBalance,
  } = useQuery({
    queryKey: createQueryKey.balance(principal || ""),
    queryFn: async () => {
      if (!principal || !isServicesReady) return 0;

      try {
        const operationalService = serviceFactory.getOperationalService();
        return await operationalService.getUserBalance(principal);
      } catch (error) {
        console.warn("Failed to get user balance:", error);
        return 0;
      }
    },
    enabled: !!principal && isServicesReady,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      const result = await serviceFactory.login();
      return result;
    },
    onSuccess: (data) => {
      toast.success("Successfully logged in!");

      // Invalidate and refetch auth queries
      invalidateQueries.auth();

      // Fetch user balance after login
      if (data.principal) {
        queryClient.invalidateQueries({
          queryKey: createQueryKey.balance(data.principal)
        });
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error("Failed to login. Please try again.");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await serviceFactory.logout();
    },
    onSuccess: () => {
      toast.success("Successfully logged out!");

      // Clear all cached data
      queryClient.clear();

      // Refetch auth state
      refreshAuth();
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast.error("Failed to logout properly.");
    },
  });

  // Initialize services on mount and when auth state changes
  useEffect(() => {
    serviceFactory.initialize().catch(console.error);
  }, []);

  // Auto-refresh auth state periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const stillAuthenticated = await serviceFactory.isAuthenticated();
        if (!stillAuthenticated) {
          // User session expired
          toast.error("Your session has expired. Please log in again.");
          queryClient.clear();
          refreshAuth();
        }
      } catch (error) {
        console.warn("Failed to check auth status:", error);
      }
    }, 1000 * 60 * 5); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, queryClient, refreshAuth]);

  const contextValue: AuthContextType = {
    // Auth state
    isAuthenticated,
    principal,
    isLoading: isCheckingAuth || loginMutation.isPending || logoutMutation.isPending,
    error: authError || loginMutation.error || logoutMutation.error,

    // Auth actions
    login: async () => {
      await loginMutation.mutateAsync();
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refreshAuth: async () => {
      await refreshAuth();
    },

    // User data
    userBalance,
    isLoadingBalance,
    refreshBalance: () => {
      if (principal) {
        refreshBalance();
      }
    },

    // Services
    isServicesReady,

    // Profile utilities
    copyPrincipalToClipboard: () => {
      if (principal) {
        navigator.clipboard.writeText(principal);
        toast.success("Principal ID copied to clipboard!");
      }
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && !isLoading,
  };
}

// Helper hook to get services safely
export function useServices() {
  const { isServicesReady, isAuthenticated } = useAuth();

  if (!isAuthenticated || !isServicesReady) {
    throw new Error("Services not available. Please log in first.");
  }

  return {
    nftService: serviceFactory.getNFTService(),
    operationalService: serviceFactory.getOperationalService(),
    forumsService: serviceFactory.getForumsService(),
  };
}