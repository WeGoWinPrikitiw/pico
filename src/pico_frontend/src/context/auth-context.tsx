import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';

// Import the generated declarations
import { operational_contract, idlFactory as operationalIdlFactory } from 'declarations/operational_contract';
import { token_contract, idlFactory as tokenIdlFactory } from 'declarations/token_contract';

interface TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: bigint;
}

interface Transaction {
    transaction_id: number;
    from_principal_id: string;
    to_principal_id: string;
    status: any;
    price_token: number;
    created_at: number;
    nft_id?: number;
    forum_id?: number;
}

interface AuthContextType {
    // Authentication state
    isAuthenticated: boolean;
    authClient: AuthClient | null;
    identity: any;
    principal: string;
    agent: HttpAgent | null;

    // Contract actors
    operationalActor: any;
    tokenActor: any;
    ledgerActor: any;

    // UI state
    loading: boolean;
    message: string;
    setMessage: (message: string) => void;

    // Data state
    tokenInfo: TokenInfo | null;
    userBalance: number;
    allowance: number;
    transactions: Transaction[];
    tokenHolders: any[];

    // Authentication functions
    login: () => Promise<void>;
    logout: () => Promise<void>;

    // Data functions
    refreshData: () => Promise<void>;
    loadUserData: () => Promise<void>;

    // Contract functions
    mintTokens: (amount: string, recipient: string) => Promise<void>;
    approveContract: (amount: string) => Promise<void>;
    buyNFT: (buyer: string, seller: string, nftId: string, price: string) => Promise<void>;
    checkBalance: (principalId: string) => Promise<void>;
    selfTopUp: (amount: string) => Promise<void>;

    // Utility functions
    copyPrincipalToClipboard: () => Promise<void>;
    validatePrincipal: (principalStr: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authClient, setAuthClient] = useState<AuthClient | null>(null);
    const [identity, setIdentity] = useState<any>(null);
    const [principal, setPrincipal] = useState('');
    const [agent, setAgent] = useState<HttpAgent | null>(null);

    // Contract actors
    const [operationalActor, setOperationalActor] = useState<any>(null);
    const [tokenActor, setTokenActor] = useState<any>(null);
    const [ledgerActor, setLedgerActor] = useState<any>(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Data state
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [userBalance, setUserBalance] = useState(0);
    const [allowance, setAllowance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tokenHolders, setTokenHolders] = useState<any[]>([]);

    // Initialize authentication
    useEffect(() => {
        initAuth();
    }, []);

    const initAuth = async () => {
        setLoading(true);
        try {
            const client = await AuthClient.create();
            setAuthClient(client);

            if (await client.isAuthenticated()) {
                await handleAuthenticated(client);
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            setMessage('Authentication initialization failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthenticated = async (client: AuthClient) => {
        setLoading(true);
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();

        setIdentity(identity);
        setPrincipal(principal.toString());
        setIsAuthenticated(true);

        try {
            // Create authenticated agent
            const isLocal = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const host = isLocal ? 'http://localhost:4943' : 'https://ic0.app';

            console.log('Creating agent with host:', host, 'isLocal:', isLocal);

            const agent = new HttpAgent({
                identity,
                host
            });

            if (isLocal) {
                await agent.fetchRootKey();
                console.log('Root key fetched for local development');
            }

            setAgent(agent);

            // Create authenticated actors with fallback canister IDs
            const operationalCanisterId = (operational_contract as any)?.canisterId || 'u6s2n-gx777-77774-qaaba-cai';
            const tokenCanisterId = (token_contract as any)?.canisterId || 'umunu-kh777-77774-qaaca-cai';
            const ledgerCanisterId = 'uxrrr-q7777-77774-qaaaq-cai';

            console.log('Creating actors with canister IDs:');
            console.log('operational_contract:', operationalCanisterId);
            console.log('token_contract:', tokenCanisterId);
            console.log('ledger_canister:', ledgerCanisterId);

            // Use directly imported IDL factories as fallback
            const operationalIdl = (operational_contract as any)?.idlFactory || operationalIdlFactory;
            const tokenIdl = (token_contract as any)?.idlFactory || tokenIdlFactory;

            const operationalActor = Actor.createActor(operationalIdl, {
                agent,
                canisterId: operationalCanisterId
            });

            const tokenActor = Actor.createActor(tokenIdl, {
                agent,
                canisterId: tokenCanisterId
            });

            // Create ICRC ledger actor
            const ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: Principal.fromText(ledgerCanisterId)
            });

            console.log('Actors created successfully');

            setOperationalActor(operationalActor);
            setTokenActor(tokenActor);
            setLedgerActor(ledgerActor);

            // Load initial data
            await loadUserDataInternal(operationalActor, tokenActor, principal.toString());

            setMessage('✅ Successfully authenticated and connected to contracts!');
        } catch (error) {
            console.error('Error during authentication setup:', error);
            setMessage(`❌ Failed to connect to contracts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        if (!authClient) return;

        try {
            setLoading(true);
            const isLocal = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const identityProvider = isLocal
                ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`
                : 'https://identity.ic0.app';

            console.log('Logging in with identity provider:', identityProvider);

            await authClient.login({
                identityProvider,
                onSuccess: () => handleAuthenticated(authClient),
                onError: (error) => {
                    console.error('Login failed:', error);
                    setMessage('Login failed');
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Login error occurred');
            setLoading(false);
        }
    };

    const logout = async () => {
        if (!authClient) return;

        await authClient.logout();
        setIsAuthenticated(false);
        setIdentity(null);
        setPrincipal('');
        setAgent(null);
        setOperationalActor(null);
        setTokenActor(null);
        setLedgerActor(null);
        setMessage('Logged out successfully');
    };

    const loadUserDataInternal = async (opActor: any, tokActor: any, userPrincipal: string) => {
        console.log('Starting to load user data for:', userPrincipal);

        // Load token info
        try {
            let info: TokenInfo | null = null;

            // 1. Try dedicated token contract (if deployed)
            if (tokActor && typeof tokActor.get_token_info === 'function') {
                info = await tokActor.get_token_info();
            }

            // 2. Fallback: derive token info directly from the ICRC-1 ledger canister
            if (!info && ledgerActor) {
                const [name, symbol, decimals, totalSupply] = await Promise.all([
                    ledgerActor.icrc1_name(),
                    ledgerActor.icrc1_symbol(),
                    ledgerActor.icrc1_decimals(),
                    ledgerActor.icrc1_total_supply(),
                ]);

                info = {
                    name,
                    symbol,
                    decimals: Number(decimals),
                    totalSupply: totalSupply as bigint,
                } as TokenInfo;
            }

            if (info) {
                setTokenInfo(info);
                console.log('✅ Token info loaded');
            } else {
                console.warn('⚠️ Unable to load token info from any source');
            }
        } catch (error) {
            console.error('❌ Failed to load token info:', error);
        }

        // Load user balance
        try {
            let balance: number | null = null;

            // Query balance directly from ledger
            if (ledgerActor) {
                const account = {
                    owner: Principal.fromText(userPrincipal),
                    subaccount: [] as number[],
                };
                const rawBal: bigint = await ledgerActor.icrc1_balance_of(account);
                balance = Number(rawBal / BigInt(100000000)); // convert from 8-dec units
            }

            if (balance !== null) {
                setUserBalance(balance);
                console.log('✅ User balance loaded:', balance);
            } else {
                console.warn('⚠️ Unable to load user balance from any source');
            }
        } catch (error) {
            console.error('❌ Failed to load user balance:', error);
        }

        // User transactions from the operational canister are not available.
        // Clearing any existing transactions.
        setTransactions([]);
    };

    const loadUserData = async () => {
        if (operationalActor && tokenActor && principal) {
            await loadUserDataInternal(operationalActor, tokenActor, principal);
        }
    };

    const refreshData = async () => {
        if (operationalActor && tokenActor && principal) {
            setLoading(true);
            await loadUserDataInternal(operationalActor, tokenActor, principal);
            setLoading(false);
        }
    };

    const mintTokens = async (amount: string, recipient: string) => {
        if (!operationalActor || !validatePrincipal(recipient)) {
            setMessage('❌ Invalid recipient principal or no operational actor');
            return;
        }

        try {
            setLoading(true);
            const result = await operationalActor.top_up(recipient, parseInt(amount));

            if (result.ok) {
                setMessage(`✅ Successfully minted ${amount} PiCO tokens to ${recipient.substring(0, 10)}...`);
                await refreshData();
            } else {
                setMessage(`❌ Minting failed: ${result.err}`);
            }
        } catch (error) {
            console.error('Minting error:', error);
            setMessage(`❌ Minting error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const approveContract = async (amount: string) => {
        if (!ledgerActor || !operationalActor) {
            setMessage('❌ Ledger or operational actor not available');
            return;
        }

        try {
            setLoading(true);
            const spenderPrincipal = Principal.fromText(operationalActor.canisterId || 'u6s2n-gx777-77774-qaaba-cai');
            const amountNat = BigInt(parseInt(amount) * 100000000); // Convert to 8 decimals

            const approveArgs = {
                fee: [],
                memo: [],
                from_subaccount: [],
                created_at_time: [],
                amount: amountNat,
                expected_allowance: [],
                expires_at: [],
                spender: {
                    owner: spenderPrincipal,
                    subaccount: []
                }
            };

            const result = await ledgerActor.icrc2_approve(approveArgs);
            console.log('Approval result:', result);

            if (result.Ok !== undefined) {
                setMessage(`✅ Successfully approved ${amount} PiCO tokens for operational contract`);
                await refreshData();
            } else {
                setMessage(`❌ Approval failed: ${JSON.stringify(result.Err)}`);
            }
        } catch (error) {
            console.error('Approval error:', error);
            setMessage(`❌ Approval error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const buyNFT = async (buyer: string, seller: string, nftId: string, price: string) => {
        if (!operationalActor || !validatePrincipal(buyer)) {
            setMessage('❌ Invalid buyer principal or no operational actor');
            return;
        }

        try {
            setLoading(true);
            const result = await operationalActor.buy_nft(
                buyer,
                parseInt(nftId),
                parseInt(price),
                [] // No forum ID
            );

            if (result.ok) {
                setMessage(`✅ NFT purchase successful! Transaction ID: ${result.ok.transaction_id}`);
                await refreshData();
            } else {
                setMessage(`❌ NFT purchase failed: ${result.err}`);
            }
        } catch (error) {
            console.error('NFT purchase error:', error);
            setMessage(`❌ NFT purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const checkBalance = async (principalId: string) => {
        if (!operationalActor || !validatePrincipal(principalId)) {
            setMessage('❌ Invalid principal or no operational actor');
            return;
        }

        try {
            const result = await operationalActor.getUserBalance(principalId);
            if (result.ok !== undefined) {
                setMessage(`💰 Balance for ${principalId.substring(0, 10)}...: ${result.ok} PiCO`);
            } else {
                setMessage(`❌ Failed to get balance: ${result.err}`);
            }
        } catch (error) {
            setMessage(`❌ Error checking balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const selfTopUp = async (amount: string) => {
        if (!operationalActor || !principal) {
            setMessage('❌ Not authenticated or no operational actor');
            return;
        }

        try {
            setLoading(true);
            const result = await operationalActor.top_up(principal, parseInt(amount));

            if (result.ok) {
                setMessage(`✅ Successfully topped up ${amount} PiCO tokens to your account`);
                await refreshData();
            } else {
                setMessage(`❌ Top-up failed: ${result.err}`);
            }
        } catch (error) {
            console.error('Top-up error:', error);
            setMessage(`❌ Top-up error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const copyPrincipalToClipboard = async () => {
        if (principal) {
            try {
                await navigator.clipboard.writeText(principal);
                setMessage('📋 Principal ID copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy principal:', error);
                setMessage('❌ Failed to copy principal to clipboard');
            }
        }
    };

    const validatePrincipal = (principalStr: string): boolean => {
        try {
            Principal.fromText(principalStr);
            return true;
        } catch {
            return false;
        }
    };

    const contextValue: AuthContextType = {
        // Authentication state
        isAuthenticated,
        authClient,
        identity,
        principal,
        agent,

        // Contract actors
        operationalActor,
        tokenActor,
        ledgerActor,

        // UI state
        loading,
        message,
        setMessage,

        // Data state
        tokenInfo,
        userBalance,
        allowance,
        transactions,
        tokenHolders,

        // Authentication functions
        login,
        logout,

        // Data functions
        refreshData,
        loadUserData,

        // Contract functions
        mintTokens,
        approveContract,
        buyNFT,
        checkBalance,
        selfTopUp,

        // Utility functions
        copyPrincipalToClipboard,
        validatePrincipal,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}; 