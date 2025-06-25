import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Import all the declaration interfaces
import {
    createActor as createOperationalV3Actor,
    canisterId as operationalV3CanisterId,
} from 'declarations/operational_v3';

import {
    createActor as createOperationalV2Actor,
    canisterId as operationalV2CanisterId,
} from 'declarations/operational_v2';

import {
    createActor as createOperationalActor,
    canisterId as operationalCanisterId,
} from 'declarations/operational_contract';

import {
    createActor as createTokenActor,
    canisterId as tokenCanisterId,
} from 'declarations/token_contract';

import {
    createActor as createIcrc1Actor,
    canisterId as icrc1CanisterId,
} from 'declarations/icrc1_ledger_canister';

import {
    createActor as createInternetIdentityActor,
    canisterId as internetIdentityCanisterId,
} from 'declarations/internet_identity';

// Types from the declarations
import type { _SERVICE as OperationalV3Service } from 'declarations/operational_v3/operational_v3.did';
import type { _SERVICE as OperationalV2Service } from 'declarations/operational_v2/operational_v2.did';
import type { _SERVICE as OperationalService } from 'declarations/operational_contract/operational_contract.did';
import type { _SERVICE as TokenService } from 'declarations/token_contract/token_contract.did';
import type { _SERVICE as Icrc1Service } from 'declarations/icrc1_ledger_canister/icrc1_ledger_canister.did';

export interface NFT {
    id: bigint;
    title: string;
    description: string;
    image: string;
    creator: string;
    owner: string;
    price: bigint;
    isForSale: boolean;
    created_at: bigint;
    metadata?: Record<string, any>;
}

export interface Transaction {
    transaction_id: bigint;
    nft_id?: bigint;
    status: 'Failed' | 'Cancelled' | 'Completed' | 'Pending';
    forum_id?: bigint;
    price_token: bigint;
    transaction_type: string;
    created_at: bigint;
    to_principal_id: string;
    from_principal_id: string;
}

export interface UserBalance {
    wallet_balance_pico: bigint;
    escrow_balance_pico: bigint;
    total_balance_pico: bigint;
}

export interface TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    fee?: bigint;
    total_supply?: bigint;
}

class BackendService {
    private authClient: AuthClient | null = null;
    private agent: HttpAgent | null = null;
    private operationalV3Actor: OperationalV3Service | null = null;
    private operationalV2Actor: OperationalV2Service | null = null;
    private operationalActor: OperationalService | null = null;
    private tokenActor: TokenService | null = null;
    private icrc1Actor: Icrc1Service | null = null;

    constructor() {
        this.initializeActors();
    }

    private async initializeActors() {
        try {
            this.authClient = await AuthClient.create();

            // Check if user is authenticated
            const isAuthenticated = await this.authClient.isAuthenticated();

            if (isAuthenticated) {
                const identity = this.authClient.getIdentity();
                this.agent = new HttpAgent({ identity });

                // In development, we need to fetch root key
                if (import.meta.env.MODE !== 'production') {
                    await this.agent.fetchRootKey();
                }
            } else {
                // Create anonymous agent for public operations
                this.agent = new HttpAgent();
                if (import.meta.env.MODE !== 'production') {
                    await this.agent.fetchRootKey();
                }
            }

            // Initialize all actors
            this.operationalV3Actor = createOperationalV3Actor(operationalV3CanisterId, {
                agent: this.agent,
            });

            this.operationalV2Actor = createOperationalV2Actor(operationalV2CanisterId, {
                agent: this.agent,
            });

            this.operationalActor = createOperationalActor(operationalCanisterId, {
                agent: this.agent,
            });

            this.tokenActor = createTokenActor(tokenCanisterId, {
                agent: this.agent,
            });

            this.icrc1Actor = createIcrc1Actor(icrc1CanisterId, {
                agent: this.agent,
            });

        } catch (error) {
            console.error('Failed to initialize backend service:', error);
        }
    }

    // Authentication methods
    async login(): Promise<boolean> {
        try {
            if (!this.authClient) {
                this.authClient = await AuthClient.create();
            }

            return new Promise((resolve) => {
                this.authClient!.login({
                    identityProvider: import.meta.env.MODE === 'production'
                        ? 'https://identity.ic0.app'
                        : `http://localhost:4943/?canisterId=${internetIdentityCanisterId}`,
                    onSuccess: async () => {
                        await this.initializeActors();
                        resolve(true);
                    },
                    onError: (error) => {
                        console.error('Login failed:', error);
                        resolve(false);
                    },
                });
            });
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    async logout(): Promise<void> {
        try {
            if (this.authClient) {
                await this.authClient.logout();
                await this.initializeActors(); // Reinitialize with anonymous agent
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            if (!this.authClient) {
                this.authClient = await AuthClient.create();
            }
            return await this.authClient.isAuthenticated();
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    async getPrincipal(): Promise<string | null> {
        try {
            if (!this.authClient || !(await this.authClient.isAuthenticated())) {
                return null;
            }
            const identity = this.authClient.getIdentity();
            return identity.getPrincipal().toString();
        } catch (error) {
            console.error('Get principal error:', error);
            return null;
        }
    }

    // Token and Balance operations
    async getTokenInfo(): Promise<TokenInfo | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const result = await this.operationalV3Actor.getTokenInfo();
            if ('ok' in result) {
                return result.ok;
            } else {
                console.error('Get token info error:', result.err);
                return null;
            }
        } catch (error) {
            console.error('Get token info error:', error);
            return null;
        }
    }

    async getUserBalance(principalId?: string): Promise<UserBalance | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const principal = principalId || await this.getPrincipal();
            if (!principal) return null;

            const result = await this.operationalV3Actor.getUserCompleteBalance(principal);
            if ('ok' in result) {
                return result.ok;
            } else {
                console.error('Get user balance error:', result.err);
                return null;
            }
        } catch (error) {
            console.error('Get user balance error:', error);
            return null;
        }
    }

    async getWalletBalance(principalId?: string): Promise<bigint | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const principal = principalId || await this.getPrincipal();
            if (!principal) return null;

            const result = await this.operationalV3Actor.getWalletBalance(principal);
            if ('ok' in result) {
                return result.ok;
            } else {
                console.error('Get wallet balance error:', result.err);
                return null;
            }
        } catch (error) {
            console.error('Get wallet balance error:', error);
            return null;
        }
    }

    async getEscrowBalance(principalId?: string): Promise<bigint | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const principal = principalId || await this.getPrincipal();
            if (!principal) return null;

            return await this.operationalV3Actor.getEscrowBalance(principal);
        } catch (error) {
            console.error('Get escrow balance error:', error);
            return null;
        }
    }

    // Transaction operations
    async buyNft(
        fromPrincipal: string,
        toPrincipal: string,
        nftId: bigint,
        priceToken: bigint,
        forumId?: bigint
    ): Promise<{ transaction_id: bigint; message: string } | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const result = await this.operationalV3Actor.buy_nft(
                fromPrincipal,
                toPrincipal,
                nftId,
                priceToken,
                forumId ? [forumId] : []
            );

            if ('ok' in result) {
                return result.ok;
            } else {
                console.error('Buy NFT error:', result.err);
                return null;
            }
        } catch (error) {
            console.error('Buy NFT error:', error);
            return null;
        }
    }

    async depositToEscrow(principalId: string, amount: bigint): Promise<{ transaction_id: bigint; message: string } | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const result = await this.operationalV3Actor.deposit_to_escrow(principalId, amount);
            if ('ok' in result) {
                return result.ok;
            } else {
                console.error('Deposit to escrow error:', result.err);
                return null;
            }
        } catch (error) {
            console.error('Deposit to escrow error:', error);
            return null;
        }
    }

    async withdrawFromEscrow(principalId: string, amount: bigint): Promise<{ transaction_id: bigint; message: string } | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const result = await this.operationalV3Actor.withdraw_from_escrow(principalId, amount);
            if ('ok' in result) {
                return result.ok;
            } else {
                console.error('Withdraw from escrow error:', result.err);
                return null;
            }
        } catch (error) {
            console.error('Withdraw from escrow error:', error);
            return null;
        }
    }

    async mintTokens(toPrincipal: string, amount: bigint): Promise<{ transaction_id: bigint; block_index: bigint; message: string } | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const result = await this.operationalV3Actor.mint_tokens(toPrincipal, amount);
            if ('ok' in result) {
                return result.ok;
            } else {
                console.error('Mint tokens error:', result.err);
                return null;
            }
        } catch (error) {
            console.error('Mint tokens error:', error);
            return null;
        }
    }

    // Transaction history
    async getUserTransactions(principalId?: string): Promise<Transaction[]> {
        try {
            if (!this.operationalV3Actor) return [];

            const principal = principalId || await this.getPrincipal();
            if (!principal) return [];

            const transactions = await this.operationalV3Actor.getUserTransactions(principal);
            return transactions.map(tx => tx ? ({
                transaction_id: tx.transaction_id,
                nft_id: tx.nft_id && tx.nft_id.length > 0 ? tx.nft_id[0] : undefined,
                status: tx.status ? (Object.keys(tx.status)[0] as any) : 'Pending',
                forum_id: tx.forum_id && tx.forum_id.length > 0 ? tx.forum_id[0] : undefined,
                price_token: tx.price_token ?? BigInt(0),
                transaction_type: tx.transaction_type ?? '',
                created_at: tx.created_at ?? BigInt(0),
                to_principal_id: tx.to_principal_id ?? '',
                from_principal_id: tx.from_principal_id ?? '',
            }) : null).filter(Boolean) as Transaction[];
        } catch (error) {
            console.error('Get user transactions error:', error);
            return [];
        }
    }

    async getTransaction(transactionId: bigint): Promise<Transaction | null> {
        try {
            if (!this.operationalV3Actor) return null;

            const result = await this.operationalV3Actor.getTransaction(transactionId);
            if (result.length > 0) {
                const tx = result[0];
                return tx ? {
                    transaction_id: tx.transaction_id,
                    nft_id: tx.nft_id && tx.nft_id.length > 0 ? tx.nft_id[0] : undefined,
                    status: tx.status ? (Object.keys(tx.status)[0] as any) : 'Pending',
                    forum_id: tx.forum_id && tx.forum_id.length > 0 ? tx.forum_id[0] : undefined,
                    price_token: tx.price_token ?? BigInt(0),
                    transaction_type: tx.transaction_type ?? '',
                    created_at: tx.created_at ?? BigInt(0),
                    to_principal_id: tx.to_principal_id ?? '',
                    from_principal_id: tx.from_principal_id ?? '',
                } : null;
            }
            return null;
        } catch (error) {
            console.error('Get transaction error:', error);
            return null;
        }
    }

    // Health check
    async isContractHealthy(): Promise<boolean> {
        try {
            if (!this.operationalV3Actor) return false;

            const result = await this.operationalV3Actor.is_contract_healthy();
            return result === 'healthy';
        } catch (error) {
            console.error('Health check error:', error);
            return false;
        }
    }

    // Legacy contract methods (for compatibility)
    async getAllNFTTransactions(): Promise<Transaction[]> {
        try {
            if (!this.operationalActor) return [];

            const transactions = await this.operationalActor.getAllNFTTransactions();
            return transactions.map(tx => tx ? ({
                ...tx,
                status: tx.status ? (Object.keys(tx.status)[0] as any) : 'Pending',
                nft_id: tx.nft_id && tx.nft_id.length > 0 ? tx.nft_id[0] : undefined,
                forum_id: tx.forum_id && tx.forum_id.length > 0 ? tx.forum_id[0] : undefined,
            }) : null).filter(Boolean) as Transaction[];
        } catch (error) {
            console.error('Get all NFT transactions error:', error);
            return [];
        }
    }

    async isUserAdmin(principalId?: string): Promise<boolean> {
        try {
            if (!this.operationalActor) return false;

            const principal = principalId || await this.getPrincipal();
            if (!principal) return false;

            return await this.operationalActor.isUserAdmin(principal);
        } catch (error) {
            console.error('Check admin status error:', error);
            return false;
        }
    }

    // Mock NFT data (since we don't have actual NFT storage contract yet)
    async getNFTs(): Promise<NFT[]> {
        // This is mock data - in a real implementation, this would come from an NFT storage contract
        const mockNFTs: NFT[] = [
            {
                id: BigInt(1),
                title: "Digital Sunset",
                description: "A beautiful digital sunset over a cyberpunk city",
                image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500",
                creator: "artist1.principal",
                owner: "collector1.principal",
                price: BigInt(1000000), // 1 PICO token
                isForSale: true,
                created_at: BigInt(Date.now()),
                metadata: { style: "cyberpunk", rarity: "rare" }
            },
            {
                id: BigInt(2),
                title: "Abstract Dreams",
                description: "An abstract representation of dreams in digital form",
                image: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=500",
                creator: "artist2.principal",
                owner: "artist2.principal",
                price: BigInt(2500000), // 2.5 PICO tokens
                isForSale: true,
                created_at: BigInt(Date.now() - 86400000),
                metadata: { style: "abstract", rarity: "epic" }
            }
        ];

        return mockNFTs;
    }

    async getNFTById(id: bigint): Promise<NFT | null> {
        const nfts = await this.getNFTs();
        return nfts.find(nft => nft.id === id) || null;
    }

    // Utility method to format amounts
    formatTokenAmount(amount: bigint, decimals: number = 8): string {
        const divisor = BigInt(10 ** decimals);
        const whole = amount / divisor;
        const remainder = amount % divisor;

        if (remainder === BigInt(0)) {
            return whole.toString();
        }

        const remainderStr = remainder.toString().padStart(decimals, '0');
        const trimmedRemainder = remainderStr.replace(/0+$/, '');

        return `${whole}.${trimmedRemainder}`;
    }

    // Parse token amount from string to bigint
    parseTokenAmount(amount: string, decimals: number = 8): bigint {
        const [whole, fractional = ''] = amount.split('.');
        const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);
        return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFractional);
    }
}

// Export singleton instance
export const backendService = new BackendService(); 