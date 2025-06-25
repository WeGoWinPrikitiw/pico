import { useAuth } from "@/context/auth-context";
import { useAsync } from "@/hooks/useAsync";

interface BackendState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  balance: number;
  transactions: any[];
  tokenInfo: any;
}

interface BackendActions {
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  mintTokens: (amount: string, recipient: string) => Promise<boolean>;
  buyNFT: (
    buyer: string,
    seller: string,
    nftId: string,
    price: string,
  ) => Promise<boolean>;
  checkBalance: (principalId: string) => Promise<void>;
  topUp: (amount: string) => Promise<boolean>;
  checkNFTApproval: (buyer: string, price: string) => Promise<any>;
  clearError: () => void;
  clearAllErrors: () => void;
}

export const useBackend = (): BackendState & BackendActions => {
  const auth = useAuth();

  // Extract async operation states
  const loginState = auth.login;
  const logoutState = auth.logout;
  const refreshDataState = auth.refreshData;
  const mintTokensState = auth.mintTokens;
  const buyNFTState = auth.buyNFT;
  const checkBalanceState = auth.checkBalance;
  const selfTopUpState = auth.selfTopUp;
  const checkNFTApprovalState = auth.checkNFTApproval;

  // Aggregate loading state
  const isLoading = auth.loading ||
    loginState.loading ||
    logoutState.loading ||
    refreshDataState.loading ||
    mintTokensState.loading ||
    buyNFTState.loading ||
    checkBalanceState.loading ||
    selfTopUpState.loading ||
    checkNFTApprovalState.loading;

  // Aggregate error state
  const error = loginState.error ||
    logoutState.error ||
    refreshDataState.error ||
    mintTokensState.error ||
    buyNFTState.error ||
    checkBalanceState.error ||
    selfTopUpState.error ||
    checkNFTApprovalState.error;

  const login = async (): Promise<boolean> => {
    try {
      await loginState.execute();
      return auth.isAuthenticated;
    } catch (err) {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutState.execute();
    } catch (err) {
      // Error is already handled by useAsync
      console.error("Logout failed:", err);
    }
  };

  const refreshData = async (): Promise<void> => {
    try {
      await refreshDataState.execute();
    } catch (err) {
      // Error is already handled by useAsync
      console.error("Refresh data failed:", err);
    }
  };

  const mintTokens = async (
    amount: string,
    recipient: string,
  ): Promise<boolean> => {
    try {
      await mintTokensState.execute(amount, recipient);
      return true;
    } catch (err) {
      return false;
    }
  };

  const buyNFT = async (
    buyer: string,
    seller: string,
    nftId: string,
    price: string,
  ): Promise<boolean> => {
    try {
      await buyNFTState.execute(buyer, seller, nftId, price);
      return true;
    } catch (err) {
      return false;
    }
  };

  const checkBalance = async (principalId: string): Promise<void> => {
    try {
      await checkBalanceState.execute(principalId);
    } catch (err) {
      // Error is already handled by useAsync
      console.error("Check balance failed:", err);
    }
  };

  const topUp = async (amount: string): Promise<boolean> => {
    try {
      await selfTopUpState.execute(amount);
      return true;
    } catch (err) {
      return false;
    }
  };

  const checkNFTApproval = async (buyer: string, price: string): Promise<any> => {
    try {
      return await checkNFTApprovalState.execute(buyer, price);
    } catch (err) {
      console.error("Check NFT approval failed:", err);
      throw err;
    }
  };

  const clearError = (): void => {
    // Clear the most recent error
    if (loginState.error) loginState.reset();
    else if (logoutState.error) logoutState.reset();
    else if (refreshDataState.error) refreshDataState.reset();
    else if (mintTokensState.error) mintTokensState.reset();
    else if (buyNFTState.error) buyNFTState.reset();
    else if (checkBalanceState.error) checkBalanceState.reset();
    else if (selfTopUpState.error) selfTopUpState.reset();
    else if (checkNFTApprovalState.error) checkNFTApprovalState.reset();

    auth.setMessage("");
  };

  const clearAllErrors = (): void => {
    loginState.reset();
    logoutState.reset();
    refreshDataState.reset();
    mintTokensState.reset();
    buyNFTState.reset();
    checkBalanceState.reset();
    selfTopUpState.reset();
    checkNFTApprovalState.reset();
    auth.setMessage("");
  };

  return {
    // State
    isConnected: auth.isAuthenticated,
    isLoading,
    error,
    balance: auth.userBalance,
    transactions: auth.transactions,
    tokenInfo: auth.tokenInfo,

    // Actions
    login,
    logout,
    refreshData,
    mintTokens,
    buyNFT,
    checkBalance,
    topUp,
    checkNFTApproval,
    clearError,
    clearAllErrors,
  };
};

// Enhanced hook for NFT-specific operations with better error handling
export const useNFTOperations = () => {
  const backend = useBackend();
  const auth = useAuth();

  const purchaseNFTAsync = useAsync(async (
    nftId: string,
    price: string,
    seller: string,
  ) => {
    if (!auth.isAuthenticated || !auth.principal) {
      throw new Error("Must be authenticated to purchase NFT");
    }

    const success = await backend.buyNFT(auth.principal, seller, nftId, price);
    if (!success) {
      throw new Error("NFT purchase failed");
    }

    return { nftId, price, seller, buyer: auth.principal };
  }, [auth.isAuthenticated, auth.principal]);

  const listNFTForSaleAsync = useAsync(async (
    nftId: string,
    price: string,
  ) => {
    if (!auth.isAuthenticated) {
      throw new Error("Must be authenticated to list NFT");
    }

    // This would implement listing NFT functionality
    // For now, this is a placeholder that simulates the operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Listing NFT ${nftId} for ${price} PICO`);

    return { nftId, price, seller: auth.principal };
  }, [auth.isAuthenticated, auth.principal]);

  return {
    ...backend,
    purchaseNFT: purchaseNFTAsync,
    listNFTForSale: listNFTForSaleAsync,
  };
};

// Hook for admin operations with role checking
export const useAdminOperations = () => {
  const backend = useBackend();
  const auth = useAuth();

  const checkAdminStatusAsync = useAsync(async () => {
    if (!auth.isAuthenticated || !auth.operationalActor) {
      throw new Error("Must be authenticated to check admin status");
    }

    // This would check if the current user is an admin
    // Implementation would depend on contract admin checking
    // For now, this is a placeholder
    return true;
  }, [auth.isAuthenticated, auth.operationalActor]);

  const mintToUserAsync = useAsync(async (
    userPrincipal: string,
    amount: string,
  ) => {
    if (!auth.isAuthenticated) {
      throw new Error("Must be authenticated to mint tokens");
    }

    // Check admin status first
    const isAdmin = await checkAdminStatusAsync.execute();
    if (!isAdmin) {
      throw new Error("Admin privileges required");
    }

    const success = await backend.mintTokens(amount, userPrincipal);
    if (!success) {
      throw new Error("Token minting failed");
    }

    return { amount, recipient: userPrincipal };
  }, [auth.isAuthenticated, backend.mintTokens]);

  const getSystemStatsAsync = useAsync(async () => {
    if (!auth.isAuthenticated || !auth.operationalActor) {
      throw new Error("Must be authenticated to get system stats");
    }

    // This would fetch system-wide statistics
    // For now, this returns mock data
    return {
      totalUsers: 1250,
      totalTransactions: 5400,
      totalTokensInCirculation: auth.tokenInfo?.totalSupply || 0,
      activeNFTs: 340,
      dailyActiveUsers: 89,
      networkHealth: "optimal",
    };
  }, [auth.isAuthenticated, auth.operationalActor, auth.tokenInfo]);

  return {
    ...backend,
    checkAdminStatus: checkAdminStatusAsync,
    mintToUser: mintToUserAsync,
    getSystemStats: getSystemStatsAsync,
    isAdmin: checkAdminStatusAsync.data === true,
  };
};
