// Re-export types from declarations for easier access

// Preferences Contract types
export type {
  UserPreferences,
  PreferencesInput,
  Result,
  Result_1,
  _SERVICE as PreferencesService,
} from "../../../declarations/preferences_contract/preferences_contract.did";

// NFT Contract types
export type {
  NFT,
  NFTInfo,
  Trait,
  AIImageResult,
  AIDetectionResponse,
  TransferArgs as NFTTransferArgs,
  TransferError as NFTTransferError,
  Metadata,
  Value,
  _SERVICE as NFTService,
} from "../../../declarations/nft_contract/nft_contract.did";

// Operational Contract types
export type {
  OperationalTransaction,
  TransactionStatus,
  _SERVICE as OperationalService,
} from "../../../declarations/operational_contract/operational_contract.did";

// Forums Contract types
export type {
  Forum,
  Comment,
  CreateForumInput,
  UpdateForumInput,
  SearchCriteria,
  Result as ForumResult,
  Result_1 as ForumResult_1,
  Result_2 as ForumResult_2,
  Result_3 as ForumResult_3,
  _SERVICE as ForumsService,
} from "../../../declarations/forums_contract/forums_contract.did";

// ICRC1 Ledger types
export type {
  Account,
  Tokens,
  TransferArg,
  TransferError,
  TransferResult,
  ApproveArgs,
  ApproveResult,
  ApproveError,
  Allowance,
  AllowanceArgs,
  MetadataValue,
  _SERVICE as ICRC1Service,
} from "../../../declarations/icrc1_ledger_canister/icrc1_ledger_canister.did";

// Generic Result type for contract interactions
export type ContractResult<T> =
  | {
      ok: T;
    }
  | {
      err: string;
    };

// Core domain types
export interface User {
  id: string;
  principal: string;
  username: string;
  email?: string;
  created_at: bigint;
  updated_at: bigint;
  is_active: boolean;
}

export interface UserProfile {
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  social_links: Record<string, string>;
  preferences?: Array<string>;
  created_at: bigint;
  updated_at: bigint;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  content_type: "text" | "image" | "video" | "link";
  tags: string[];
  likes_count: number;
  comments_count: number;
  is_public: boolean;
  created_at: bigint;
  updated_at: bigint;
}

export interface ContentData {
  id: string;
  owner_id: string;
  content_type: string;
  file_name: string;
  file_size: number;
  content_hash: string;
  metadata: Record<string, string>;
  is_shared: boolean;
  shared_with: string[];
  created_at: bigint;
  updated_at: bigint;
}

// Service interfaces for all contracts
export interface PicoBackendService {
  greet: (name: string) => Promise<string>;
  getUserProfile: (userId: string) => Promise<UserProfile>;
  updateUserProfile: (profile: UserProfile) => Promise<ContractResult<string>>;
  createPost: (content: string) => Promise<ContractResult<Post>>;
  getPosts: (limit?: number) => Promise<Array<Post>>;
  likePost: (postId: string) => Promise<ContractResult<string>>;
  deletePost: (postId: string) => Promise<ContractResult<string>>;
}

export interface UserManagementService {
  registerUser: (username: string) => Promise<ContractResult<User>>;
  loginUser: (principal: string) => Promise<ContractResult<User>>;
  getUserByPrincipal: (principal: string) => Promise<ContractResult<User>>;
  updateUsername: (newUsername: string) => Promise<ContractResult<string>>;
  deactivateUser: () => Promise<ContractResult<string>>;
}

export interface ContentService {
  uploadContent: (
    data: Uint8Array,
    contentType: string
  ) => Promise<ContractResult<string>>;
  getContent: (contentId: string) => Promise<ContractResult<ContentData>>;
  deleteContent: (contentId: string) => Promise<ContractResult<string>>;
  listUserContent: () => Promise<Array<ContentData>>;
  shareContent: (
    contentId: string,
    targetUser: string
  ) => Promise<ContractResult<string>>;
}

// Additional UI/Frontend specific types
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  principal?: string;
  identity?: any;
  agent?: any;
}

// UI state types
export interface UIState {
  loading: boolean;
  error?: ApiError;
  lastUpdated?: Date;
}

// Update the createQueryKey object in types.ts
export const createQueryKey = {
  // Auth
  auth: () => ["auth"] as const,
  userBalance: (principal: string) => ["user", "balance", principal] as const,

  // NFT
  nfts: () => ["nfts"] as const,
  nft: (id: string | number | bigint) => ["nft", id.toString()] as const,
  nftStats: () => ["nft", "stats"] as const,
  aiNfts: () => ["nfts", "ai"] as const,
  traitTypes: () => ["nfts", "traits", "types"] as const,
  traitValues: (type: string) => ["nfts", "traits", "values", type] as const,
  nftsByTrait: (type: string, value: string) =>
    ["nfts", "trait", type, value] as const,
  nftsByRarity: (rarity: string) => ["nfts", "rarity", rarity] as const,

  // Operational
  transactions: () => ["transactions"] as const,
  userTransactions: (principal: string) =>
    ["transactions", "user", principal] as const,
  nftTransactions: (nftId: number | bigint) =>
    ["transactions", "nft", nftId.toString()] as const,
  tokenInfo: () => ["token", "info"] as const,
  allowance: (principal: string) => ["allowance", principal] as const,
  balance: (principal: string) => ["balance", principal] as const,

  // Forums - Fixed to handle bigint IDs
  forums: () => ["forums"] as const,
  forum: (id: string | number | bigint) => ["forum", id.toString()] as const,
  forumStats: () => ["forums", "stats"] as const,
  userForums: (principal: string) => ["forums", "user", principal] as const,
  nftForums: (nftId: number | bigint) =>
    ["forums", "nft", nftId.toString()] as const,
  trendingForums: () => ["forums", "trending"] as const,
  latestForums: () => ["forums", "latest"] as const,

  // Preferences
  preferences: () => ["preferences"] as const,
  userPreferences: (principal: string) =>
    ["preferences", "user", principal] as const,
  preferencesStats: () => ["preferences", "stats"] as const,

  // Token
  tokenHolders: () => ["token", "holders"] as const,
  tokenSummary: () => ["token", "summary"] as const,
  balanceInfo: (principal: string) => ["balance", "info", principal] as const,
} as const;

// Legacy QueryKeys for backward compatibility
export const QueryKeys = {
  // Auth
  AUTH: ["auth"] as const,
  USER_BALANCE: (principal: string) => ["user", "balance", principal] as const,

  // NFT
  NFTS: ["nfts"] as const,
  NFT: (id: string | number) => ["nft", id] as const,
  NFT_STATS: ["nft", "stats"] as const,
  AI_NFTS: ["nfts", "ai"] as const,
  TRAIT_TYPES: ["nfts", "traits", "types"] as const,
  TRAIT_VALUES: (type: string) => ["nfts", "traits", "values", type] as const,
  NFTS_BY_TRAIT: (type: string, value: string) =>
    ["nfts", "trait", type, value] as const,
  NFTS_BY_RARITY: (rarity: string) => ["nfts", "rarity", rarity] as const,

  // Operational
  TRANSACTIONS: ["transactions"] as const,
  USER_TRANSACTIONS: (principal: string) =>
    ["transactions", "user", principal] as const,
  NFT_TRANSACTIONS: (nftId: number) => ["transactions", "nft", nftId] as const,
  TOKEN_INFO: ["token", "info"] as const,
  ALLOWANCE: (principal: string) => ["allowance", principal] as const,

  // Forums
  FORUMS: ["forums"] as const,
  FORUM: (id: string | number) => ["forum", id] as const,
  FORUM_STATS: ["forums", "stats"] as const,
  USER_FORUMS: (principal: string) => ["forums", "user", principal] as const,
  NFT_FORUMS: (nftId: number) => ["forums", "nft", nftId] as const,
  TRENDING_FORUMS: ["forums", "trending"] as const,

  // Preferences
  PREFERENCES: ["preferences"] as const,
  USER_PREFERENCES: (principal: string) =>
    ["preferences", "user", principal] as const,
  PREFERENCES_STATS: ["preferences", "stats"] as const,

  // Token
  TOKEN_HOLDERS: ["token", "holders"] as const,
  TOKEN_SUMMARY: ["token", "summary"] as const,
  BALANCE_INFO: (principal: string) => ["balance", "info", principal] as const,
} as const;

// Query client helper to invalidate queries
export const invalidateQueries = {
  forums: () => ({ queryKey: createQueryKey.forums() }),
  forum: (id: string | number | bigint) => ({
    queryKey: createQueryKey.forum(id),
  }),
  userForums: (principal: string) => ({
    queryKey: createQueryKey.userForums(principal),
  }),
  nftForums: (nftId: number | bigint) => ({
    queryKey: createQueryKey.nftForums(nftId),
  }),
  forumStats: () => ({ queryKey: createQueryKey.forumStats() }),
  trendingForums: () => ({ queryKey: createQueryKey.trendingForums() }),
  latestForums: () => ({ queryKey: createQueryKey.latestForums() }),
  auth: () => ({ queryKey: createQueryKey.auth() }),
  all: () => ({ queryKey: ["all"] }),
};

// Mutation keys
export const MutationKeys = {
  // Auth
  LOGIN: "login",
  LOGOUT: "logout",

  // NFT
  MINT_NFT: "mint_nft",
  TRANSFER_NFT: "transfer_nft",
  GENERATE_AI_IMAGE: "generate_ai_image",

  // Operational
  TOP_UP: "top_up",
  BUY_NFT: "buy_nft",
  APPROVE_CONTRACT: "approve_contract",

  // Forums
  CREATE_FORUM: "create_forum",
  UPDATE_FORUM: "update_forum",
  DELETE_FORUM: "delete_forum",
  LIKE_FORUM: "like_forum",
  COMMENT_FORUM: "comment_forum",

  // Preferences
  CREATE_PREFERENCES: "create_preferences",
  UPDATE_PREFERENCES: "update_preferences",
  ADD_PREFERENCE: "add_preference",
  REMOVE_PREFERENCE: "remove_preference",
} as const;

// Frontend-specific types for easier frontend usage
export interface FrontendUser extends Omit<User, "created_at" | "updated_at"> {
  created_at: number;
  updated_at: number;
}

export interface FrontendPost extends Omit<Post, "created_at" | "updated_at"> {
  created_at: number;
  updated_at: number;
}

export interface FrontendContentData
  extends Omit<ContentData, "created_at" | "updated_at"> {
  created_at: number;
  updated_at: number;
}

export interface FrontendNFTInfo {
  nft_id: number;
  price: number;
  created_at: number;
  is_ai_generated: boolean;
  is_for_sale: boolean;
  image_url: string;
  owner: string;
  traits: Array<{ trait_type: string; value: string; rarity?: string }>;
  name: string;
  description: string;
}

export interface FrontendOperationalTransaction {
  transaction_id: number;
  price_token: number;
  created_at: number;
  nft_id?: number;
  status: "Failed" | "Cancelled" | "Completed" | "Pending";
  forum_id?: number;
  to_principal_id: string;
  from_principal_id: string;
}

// Forum stats interface to match candid
export interface ForumStats {
  total_likes: bigint;
  sold_forums: bigint;
  total_comments: bigint;
  total_forums: bigint;
  active_forums: bigint;
}
