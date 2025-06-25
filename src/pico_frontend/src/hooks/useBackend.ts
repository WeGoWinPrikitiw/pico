import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';

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
    buyNFT: (buyer: string, seller: string, nftId: string, price: string) => Promise<boolean>;
    checkBalance: (principalId: string) => Promise<void>;
    topUp: (amount: string) => Promise<boolean>;
    clearError: () => void;
}

export const useBackend = (): BackendState & BackendActions => {
    const {
        isAuthenticated,
        principal,
        loading,
        message,
        setMessage,
        tokenInfo,
        userBalance,
        transactions,
        login: authLogin,
        logout: authLogout,
        refreshData: authRefreshData,
        mintTokens: authMintTokens,
        buyNFT: authBuyNFT,
        checkBalance: authCheckBalance,
        selfTopUp: authSelfTopUp,
    } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Update error when message changes
    useEffect(() => {
        if (message && message.includes('❌')) {
            setError(message);
        } else if (message && message.includes('✅')) {
            setError(null);
        }
    }, [message]);

    const login = async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await authLogin();
            return isAuthenticated;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            await authLogout();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Logout failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshData = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            await authRefreshData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const mintTokens = async (amount: string, recipient: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await authMintTokens(amount, recipient);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to mint tokens';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const buyNFT = async (buyer: string, seller: string, nftId: string, price: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await authBuyNFT(buyer, seller, nftId, price);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to buy NFT';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const checkBalance = async (principalId: string): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            await authCheckBalance(principalId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to check balance';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const topUp = async (amount: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await authSelfTopUp(amount);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to top up';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = (): void => {
        setError(null);
        setMessage('');
    };

    return {
        // State
        isConnected: isAuthenticated,
        isLoading: loading || isLoading,
        error,
        balance: userBalance,
        transactions,
        tokenInfo,

        // Actions
        login,
        logout,
        refreshData,
        mintTokens,
        buyNFT,
        checkBalance,
        topUp,
        clearError,
    };
};

// Additional hook for NFT-specific operations
export const useNFTOperations = () => {
    const backend = useBackend();

    const purchaseNFT = async (nftId: string, price: string, seller: string): Promise<boolean> => {
        const currentUser = 'current-user-principal'; // This would get actual principal
        return await backend.buyNFT(currentUser, seller, nftId, price);
    };

    const listNFTForSale = async (nftId: string, price: string): Promise<boolean> => {
        // This would implement listing NFT functionality
        // For now, this is a placeholder
        console.log(`Listing NFT ${nftId} for ${price} PICO`);
        return true;
    };

    return {
        ...backend,
        purchaseNFT,
        listNFTForSale,
    };
};

// Hook for admin operations
export const useAdminOperations = () => {
    const backend = useBackend();

    const isAdmin = (): boolean => {
        // This would check if the current user is an admin
        // Implementation would depend on contract admin checking
        return true; // Placeholder
    };

    const mintToUser = async (userPrincipal: string, amount: string): Promise<boolean> => {
        if (!isAdmin()) {
            backend.clearError();
            throw new Error('Admin privileges required');
        }
        return await backend.mintTokens(amount, userPrincipal);
    };

    const getSystemStats = async (): Promise<any> => {
        // This would fetch system-wide statistics
        return {
            totalUsers: backend.transactions.length,
            totalTransactions: backend.transactions.length,
            totalVolume: backend.transactions.reduce((sum, tx) => sum + (tx.price_token || 0), 0),
        };
    };

    return {
        ...backend,
        isAdmin: isAdmin(),
        mintToUser,
        getSystemStats,
    };
}; 