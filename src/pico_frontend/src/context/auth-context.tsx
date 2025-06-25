import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { useAsync } from "@/hooks/useAsync";

// Import the generated declarations
import {
  operational_contract,
  idlFactory as operationalIdlFactory,
} from "declarations/operational_contract";
import {
  token_contract,
  idlFactory as tokenIdlFactory,
} from "declarations/token_contract";
import {
  pico_backend as nft_canister,
  idlFactory as nftIdlFactory,
  _SERVICE as NftService,
  NFTInfo,
  Trait,
  AIImageResult,
} from "declarations/pico_backend";
import { ActorSubclass } from "@dfinity/agent";

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

// Frontend-specific types
export interface Post {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  creatorPrincipal: string;
  price: string;
  image: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
}

export interface PostDetail extends Post {
  views: number;
  isBookmarked: boolean;
  tokenId: string;
  contractAddress: string;
  blockchain: string;
  royalty: number;
  category: string;
  properties: {
    trait_type: string;
    value: string;
  }[];
  history: any[]; // Define history type if needed
  isForSale: boolean;
  saleEnds: string;
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
  nftActor: ActorSubclass<NftService> | null;

  // UI state - now using useAsync
  loading: boolean;
  message: string;
  setMessage: (message: string) => void;

  // Data state
  tokenInfo: TokenInfo | null;
  userBalance: number;
  allowance: number;
  transactions: Transaction[];
  tokenHolders: any[];

  // Authentication functions with async states
  login: {
    execute: () => Promise<void>;
    loading: boolean;
    error: string | null;
    reset: () => void;
  };
  logout: {
    execute: () => Promise<void>;
    loading: boolean;
    error: string | null;
    reset: () => void;
  };

  // Data functions with async states
  refreshData: {
    execute: () => Promise<void>;
    loading: boolean;
    error: string | null;
    reset: () => void;
  };
  loadUserData: {
    execute: () => Promise<void>;
    loading: boolean;
    error: string | null;
    reset: () => void;
  };

  // Contract functions with async states
  mintTokens: {
    execute: (amount: string, recipient: string) => Promise<string>;
    loading: boolean;
    error: string | null;
    data: string | null;
    reset: () => void;
  };
  approveContract: {
    execute: (amount: string) => Promise<string>;
    loading: boolean;
    error: string | null;
    data: string | null;
    reset: () => void;
  };
  buyNFT: {
    execute: (buyer: string, seller: string, nftId: string, price: string) => Promise<string>;
    loading: boolean;
    error: string | null;
    data: string | null;
    reset: () => void;
  };
  checkBalance: {
    execute: (principalId: string) => Promise<string>;
    loading: boolean;
    error: string | null;
    data: string | null;
    reset: () => void;
  };
  selfTopUp: {
    execute: (amount: string) => Promise<string>;
    loading: boolean;
    error: string | null;
    data: string | null;
    reset: () => void;
  };
  checkNFTApproval: {
    execute: (buyer: string, price: string) => Promise<any>;
    loading: boolean;
    error: string | null;
    data: any | null;
    reset: () => void;
  };
  generateAiImage: {
    execute: (prompt: string) => Promise<AIImageResult>;
    loading: boolean;
    error: string | null;
    data: AIImageResult | null;
    reset: () => void;
  };
  mintNft: {
    execute: (nftData: {
      to: string;
      name: string;
      description: string;
      price: bigint;
      image_url: string;
      is_ai_generated: boolean;
      traits: Trait[];
    }) => Promise<bigint>;
    loading: boolean;
    error: string | null;
    data: bigint | null;
    reset: () => void;
  };
  listAllNfts: {
    execute: () => Promise<Post[]>;
    loading: boolean;
    error: string | null;
    data: Post[] | null;
    reset: () => void;
  };
  getNftsForUser: {
    execute: (principal: string) => Promise<Post[]>;
    loading: boolean;
    error: string | null;
    data: Post[] | null;
    reset: () => void;
  };
  getNft: {
    execute: (id: string) => Promise<PostDetail | null>;
    loading: boolean;
    error: string | null;
    data: PostDetail | null;
    reset: () => void;
  };

  // Utility functions
  copyPrincipalToClipboard: () => Promise<void>;
  validatePrincipal: (principalStr: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
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
  const [principal, setPrincipal] = useState("");
  const [agent, setAgent] = useState<HttpAgent | null>(null);

  // Contract actors
  const [operationalActor, setOperationalActor] = useState<any>(null);
  const [tokenActor, setTokenActor] = useState<any>(null);
  const [ledgerActor, setLedgerActor] = useState<any>(null);
  const [nftActor, setNftActor] = useState<ActorSubclass<NftService> | null>(
    null,
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Data state
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenHolders, setTokenHolders] = useState<any[]>([]);

  const mapNftToPost = (nft: NFTInfo): Post => ({
    id: nft.nft_id.toString(),
    title: nft.name,
    description: nft.description,
    creator: {
      name: `${nft.owner.toText().slice(0, 8)}...`,
      avatar: `https://avatar.vercel.sh/${nft.owner.toText()}.png`,
      verified: Math.random() > 0.5,
    },
    creatorPrincipal: nft.owner.toText(),
    price: (Number(nft.price) / 100000000).toFixed(2),
    image: nft.image_url,
    likes: Math.floor(Math.random() * 400) + 50,
    comments: Math.floor(Math.random() * 30) + 5,
    shares: Math.floor(Math.random() * 20) + 2,
    isLiked: Math.random() > 0.7,
    createdAt: new Date(
      Number(nft.created_at / 1000000n)
    ).toLocaleDateString(),
    tags: nft.traits.map((trait: Trait) => trait.value),
  });

  const mapNftToPostDetail = (nft: NFTInfo): PostDetail => ({
    ...mapNftToPost(nft),
    views: 0,
    isBookmarked: false,
    tokenId: nft.nft_id.toString(),
    contractAddress: (nft_canister as any)?.canisterId || "vizcg-th777-77774-qaaea-cai",
    blockchain: "Internet Computer",
    royalty: 0,
    category: "NFT",
    properties: nft.traits.map((trait: Trait) => ({
      trait_type: trait.trait_type,
      value: trait.value,
    })),
    history: [],
    isForSale: true,
    saleEnds: "",
  });

  // Helper function to create authenticated agent and actors
  const createAuthenticatedActors = async (client: AuthClient) => {
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();

    setIdentity(identity);
    setPrincipal(principal.toString());
    setIsAuthenticated(true);

    // Create authenticated agent
    const isLocal =
      import.meta.env.DEV ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const host = isLocal ? "http://localhost:4943" : "https://ic0.app";

    console.log("Creating agent with host:", host, "isLocal:", isLocal);

    const agent = new HttpAgent({
      identity,
      host,
    });

    if (isLocal) {
      await agent.fetchRootKey();
      console.log("Root key fetched for local development");
    }

    setAgent(agent);

    // Create authenticated actors with fallback canister IDs
    const operationalCanisterId =
      (operational_contract as any)?.canisterId ||
      "uxrrr-q7777-77774-qaaaq-cai";
    const tokenCanisterId =
      (token_contract as any)?.canisterId || "ucwa4-rx777-77774-qaada-cai";
    const ledgerCanisterId = "u6s2n-gx777-77774-qaaba-cai";
    const nftCanisterId =
      (nft_canister as any)?.canisterId || "vizcg-th777-77774-qaaea-cai";

    console.log("Creating actors with canister IDs:");
    console.log("operational_contract:", operationalCanisterId);
    console.log("token_contract:", tokenCanisterId);
    console.log("ledger_canister:", ledgerCanisterId);
    console.log("nft_canister:", nftCanisterId);

    // Use directly imported IDL factories as fallback
    const operationalIdl =
      (operational_contract as any)?.idlFactory || operationalIdlFactory;
    const tokenIdl = (token_contract as any)?.idlFactory || tokenIdlFactory;
    const nftIdl = (nft_canister as any)?.idlFactory || nftIdlFactory;

    const operationalActor = Actor.createActor(operationalIdl, {
      agent,
      canisterId: operationalCanisterId,
    });

    const tokenActor = Actor.createActor(tokenIdl, {
      agent,
      canisterId: tokenCanisterId,
    });

    const nftActor = Actor.createActor(nftIdl, {
      agent,
      canisterId: nftCanisterId,
    }) as ActorSubclass<NftService>;

    // Create ICRC ledger actor
    const ledgerActor = IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(ledgerCanisterId),
    });

    console.log("Actors created successfully");

    setOperationalActor(operationalActor);
    setTokenActor(tokenActor);
    setLedgerActor(ledgerActor);
    setNftActor(nftActor);

    return {
      operationalActor,
      tokenActor,
      ledgerActor,
      nftActor,
      principalStr: principal.toString(),
    };
  };

  // Load user data helper function
  const loadUserDataInternal = async (
    opActor: any,
    tokActor: any,
    userPrincipal: string,
  ) => {
    console.log("Starting to load user data for:", userPrincipal);

    // Load token info
    try {
      let info: TokenInfo | null = null;

      // 1. Try dedicated token contract (if deployed)
      if (tokActor && typeof tokActor.get_token_info === "function") {
        info = await tokActor.get_token_info();
      }

      // 2. Fallback: derive token info directly from the ICRC-1 ledger canister
      if (!info && ledgerActor) {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
          ledgerActor.name(),
          ledgerActor.symbol(),
          ledgerActor.decimals(),
          ledgerActor.totalSupply(),
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
        console.log("✅ Token info loaded");
      } else {
        console.warn("⚠️ Unable to load token info from any source");
      }
    } catch (error) {
      console.error("❌ Failed to load token info:", error);
      throw new Error(`Failed to load token info: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Load user balance
    try {
      let balance: number | null = null;

      if (ledgerActor) {
        const account = {
          owner: Principal.fromText(userPrincipal),
          subaccount: undefined, // Use undefined instead of empty array for IcrcLedgerCanister
        };
        const rawBal: bigint = await ledgerActor.balance(account);
        balance = Number(rawBal / BigInt(100000000)); // convert from 8-dec units
      }

      if (balance !== null) {
        setUserBalance(balance);
        console.log("✅ User balance loaded:", balance);
      } else {
        console.warn("⚠️ Unable to load user balance from any source");
      }
    } catch (error) {
      console.error("❌ Failed to load user balance:", error);
      throw new Error(`Failed to load user balance: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // User transactions from the operational canister are not available.
    // Clearing any existing transactions.
    setTransactions([]);
  };

  // Initialize authentication
  const initAuth = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);

    if (await client.isAuthenticated()) {
      const actors = await createAuthenticatedActors(client);
      await loadUserDataInternal(
        actors.operationalActor,
        actors.tokenActor,
        actors.principalStr,
      );
      setMessage("✅ Successfully authenticated and connected to contracts!");
    }
  };

  // Utility functions
  const validatePrincipal = (principalStr: string): boolean => {
    try {
      Principal.fromText(principalStr);
      return true;
    } catch {
      return false;
    }
  };

  // Initialize on mount
  useEffect(() => {
    setLoading(true);
    initAuth()
      .catch((error) => {
        console.error("Auth initialization failed:", error);
        setMessage("Authentication initialization failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Create async hooks for all operations
  const loginAsync = useAsync(async () => {
    if (!authClient) throw new Error("Auth client not initialized");

    const isLocal =
      import.meta.env.DEV ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const identityProvider = isLocal
      ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`
      : "https://identity.ic0.app";

    console.log("Logging in with identity provider:", identityProvider);

    return new Promise<void>((resolve, reject) => {
      authClient.login({
        identityProvider,
        onSuccess: async () => {
          try {
            const actors = await createAuthenticatedActors(authClient);
            await loadUserDataInternal(
              actors.operationalActor,
              actors.tokenActor,
              actors.principalStr,
            );
            setMessage("✅ Successfully authenticated and connected to contracts!");
            resolve();
          } catch (error) {
            console.error("Error during authentication setup:", error);
            const errorMsg = `❌ Failed to connect to contracts: ${error instanceof Error ? error.message : "Unknown error"}`;
            setMessage(errorMsg);
            reject(new Error(errorMsg));
          }
        },
        onError: (error) => {
          console.error("Login failed:", error);
          const errorMsg = "Login failed";
          setMessage(errorMsg);
          reject(new Error(errorMsg));
        },
      });
    });
  }, [authClient]);

  const logoutAsync = useAsync(async () => {
    if (!authClient) return;

    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setPrincipal("");
    setAgent(null);
    setOperationalActor(null);
    setTokenActor(null);
    setLedgerActor(null);
    setNftActor(null);
    setMessage("Logged out successfully");
  }, [authClient]);

  const refreshDataAsync = useAsync(async () => {
    if (!operationalActor || !tokenActor || !principal) {
      throw new Error("Not authenticated or actors not available");
    }
    await loadUserDataInternal(operationalActor, tokenActor, principal);
  }, [operationalActor, tokenActor, principal]);

  const loadUserDataAsync = useAsync(async () => {
    if (!operationalActor || !tokenActor || !principal) {
      throw new Error("Not authenticated or actors not available");
    }
    await loadUserDataInternal(operationalActor, tokenActor, principal);
  }, [operationalActor, tokenActor, principal]);

  const mintTokensAsync = useAsync(async (amount: string, recipient: string) => {
    if (!operationalActor || !validatePrincipal(recipient)) {
      throw new Error("Invalid recipient principal or no operational actor");
    }

    const result = await operationalActor.top_up(recipient, parseInt(amount));

    if (result.ok) {
      const successMsg = `✅ Successfully minted ${amount} PiCO tokens to ${recipient.substring(0, 10)}...`;
      setMessage(successMsg);
      await refreshDataAsync.execute();
      return successMsg;
    } else {
      const errorMsg = `❌ Minting failed: ${result.err}`;
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }
  }, [operationalActor, validatePrincipal]);

  const approveContractAsync = useAsync(async (amount: string) => {
    if (!ledgerActor || !operationalActor) {
      throw new Error("Ledger or operational actor not available");
    }

    const spenderPrincipal = Principal.fromText(
      operationalActor.canisterId || "uxrrr-q7777-77774-qaaaq-cai",
    );
    const amountNat = BigInt(parseInt(amount) * 100000000); // Convert to 8 decimals

    // Build arguments without explicitly passing `null` for optional fields.
    // In Candid, omitting an optional field is equivalent to `null` (None).
    const approveArgs = {
      amount: amountNat,
      // Optional fields are omitted unless we need to set them.
      // fee, memo, expected_allowance, expires_at, created_at_time, from_subaccount are all optional.
      spender: {
        owner: spenderPrincipal,
        subaccount: [], // Empty array represents None for optional subaccount
      },
    };

    const result = await ledgerActor.approve(approveArgs);
    console.log("Approval result:", result);

    if (typeof result === 'bigint') {
      const successMsg = `✅ Successfully approved ${amount} PiCO tokens for operational contract`;
      setMessage(successMsg);
      await refreshDataAsync.execute();
      return successMsg;
    } else {
      const errorMsg = `❌ Approval failed: ${JSON.stringify(result)}`;
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }
  }, [ledgerActor, operationalActor]);

  const buyNFTAsync = useAsync(async (buyer: string, seller: string, nftId: string, price: string) => {
    if (!operationalActor || !validatePrincipal(buyer) || !validatePrincipal(seller)) {
      throw new Error("Invalid buyer/seller principal or no operational actor");
    }

    const result = await operationalActor.buy_nft(
      buyer,
      seller,
      parseInt(nftId),
      parseInt(price)
    );

    if (result.ok) {
      const successMsg = `✅ NFT purchase successful! Transaction ID: ${result.ok.transaction_id}`;
      setMessage(successMsg);
      await refreshDataAsync.execute();
      return successMsg;
    } else {
      const errorMsg = `❌ NFT purchase failed: ${result.err}`;
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }
  }, [operationalActor, validatePrincipal]);

  const checkBalanceAsync = useAsync(async (principalId: string) => {
    if (!operationalActor || !validatePrincipal(principalId)) {
      throw new Error("Invalid principal or no operational actor");
    }

    const result = await operationalActor.getUserBalance(principalId);
    if (result.ok !== undefined) {
      const successMsg = `💰 Balance for ${principalId.substring(0, 10)}...: ${result.ok} PiCO`;
      setMessage(successMsg);
      return successMsg;
    } else {
      const errorMsg = `❌ Failed to get balance: ${result.err}`;
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }
  }, [operationalActor, validatePrincipal]);

  const selfTopUpAsync = useAsync(async (amount: string) => {
    if (!operationalActor || !principal) {
      throw new Error("Not authenticated or no operational actor");
    }

    const result = await operationalActor.top_up(principal, parseInt(amount));

    if (result.ok) {
      const successMsg = `✅ Successfully topped up ${amount} PiCO tokens to your account`;
      setMessage(successMsg);
      await refreshDataAsync.execute();
      return successMsg;
    } else {
      const errorMsg = `❌ Top-up failed: ${result.err}`;
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }
  }, [operationalActor, principal]);

  const checkNFTApprovalAsync = useAsync(async (buyer: string, price: string) => {
    if (!operationalActor || !validatePrincipal(buyer)) {
      throw new Error("Invalid buyer principal or no operational actor");
    }

    try {
      // Use the existing check_allowance function
      const allowanceResult = await operationalActor.check_allowance(buyer);
      if (allowanceResult.ok !== undefined) {
        // Convert BigInt to number safely
        const currentAllowancePico = typeof allowanceResult.ok === 'bigint'
          ? Number(allowanceResult.ok)
          : allowanceResult.ok;
        const requiredAmountPico = parseInt(price);
        const hasSufficientApproval = currentAllowancePico >= requiredAmountPico;

        const shortfallAmount = hasSufficientApproval ? 0 : requiredAmountPico - currentAllowancePico;

        const approvalMessage = hasSufficientApproval
          ? "✅ Sufficient approval! You can purchase this NFT."
          : `❌ Need to approve ${shortfallAmount} more PiCO tokens before purchase.`;

        return {
          has_sufficient_approval: hasSufficientApproval,
          current_allowance_pico: currentAllowancePico,
          required_amount_pico: requiredAmountPico,
          approval_message: approvalMessage,
        };
      } else {
        throw new Error(allowanceResult.err || "Failed to check allowance");
      }
    } catch (error) {
      const errorMsg = `❌ Failed to check approval: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }
  }, [operationalActor, validatePrincipal]);

  const generateAiImageAsync = useAsync(async (prompt: string) => {
    if (!nftActor) {
      throw new Error("NFT actor not available");
    }
    const res = await nftActor.generate_ai_image(prompt);
    if ("err" in res) {
      throw new Error(res.err);
    }
    return res.ok;
  }, [nftActor]);

  const mintNftAsync = useAsync(
    async (nftData: {
      to: string;
      name: string;
      description: string;
      price: bigint;
      image_url: string;
      is_ai_generated: boolean;
      traits: Trait[];
    }) => {
      if (!nftActor) {
        throw new Error("NFT actor not available");
      }
      const toPrincipal = Principal.fromText(nftData.to);
      const res = await nftActor.mint_nft(
        toPrincipal,
        nftData.name,
        nftData.description,
        nftData.price,
        nftData.image_url,
        nftData.is_ai_generated,
        nftData.traits,
      );
      if ("err" in res) {
        throw new Error(res.err);
      }
      return res.ok;
    },
    [nftActor],
  );

  const listAllNftsAsync = useAsync(async () => {
    if (!nftActor) {
      throw new Error("NFT actor not available");
    }
    const res = await nftActor.list_all_nfts();
    return res.map(mapNftToPost);
  }, [nftActor]);

  const getNftsForUserAsync = useAsync(async (principal: string) => {
    if (!nftActor) {
      throw new Error("NFT actor not available");
    }
    const userPrincipal = Principal.fromText(principal);
    const account = { owner: userPrincipal, subaccount: [] as [] | [Uint8Array] };
    const tokenIds = await nftActor.icrc7_tokens_of(account, [] as [], [] as []);
    const nftsPromises = tokenIds.map(async (id: bigint) => {
      const nftResult = await nftActor.get_nft(id);
      if (nftResult.length > 0) {
        return nftResult[0];
      }
      return null;
    });

    const nfts = await Promise.all(nftsPromises);

    return nfts.filter((nft): nft is NFTInfo => nft !== null).map(mapNftToPost);
  }, [nftActor]);

  const getNftAsync = useAsync(async (id: string) => {
    if (!nftActor) {
      throw new Error("NFT actor not available");
    }
    const nftResult = await nftActor.get_nft(BigInt(id));
    if (nftResult.length > 0 && nftResult[0]) {
      return mapNftToPostDetail(nftResult[0]);
    }
    return null;
  }, [nftActor]);

  const copyPrincipalToClipboard = async () => {
    if (principal) {
      try {
        await navigator.clipboard.writeText(principal);
        setMessage("📋 Principal ID copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy principal:", error);
        setMessage("❌ Failed to copy principal to clipboard");
      }
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
    nftActor,

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
    login: loginAsync,
    logout: logoutAsync,

    // Data functions
    refreshData: refreshDataAsync,
    loadUserData: loadUserDataAsync,

    // Contract functions
    mintTokens: mintTokensAsync,
    approveContract: approveContractAsync,
    buyNFT: buyNFTAsync,
    checkBalance: checkBalanceAsync,
    selfTopUp: selfTopUpAsync,
    checkNFTApproval: checkNFTApprovalAsync,
    generateAiImage: generateAiImageAsync,
    mintNft: mintNftAsync,
    listAllNfts: listAllNftsAsync,
    getNftsForUser: getNftsForUserAsync,
    getNft: getNftAsync,

    // Utility functions
    copyPrincipalToClipboard,
    validatePrincipal,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
