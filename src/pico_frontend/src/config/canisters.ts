/**
 * Centralized Canister Configuration
 * 
 * This file serves as the single source of truth for all canister IDs in the PiCO project.
 * Update canister IDs here to change them across the entire application.
 */

// Main application canister IDs
export const CANISTER_IDS = {
    // ICRC-1 Ledger - handles token storage and transfers
    ICRC1_LEDGER: "u6s2n-gx777-77774-qaaba-cai",

    // Operational Contract - main business logic and minting
    OPERATIONAL_CONTRACT: "uxrrr-q7777-77774-qaaaq-cai",

    // Token Contract - enhanced token information and analytics
    TOKEN_CONTRACT: "ucwa4-rx777-77774-qaada-cai",

    // NFT Contract - handles NFT operations
    NFT_CONTRACT: "v56tl-sp777-77774-qaahq-cai",

    // Preferences Contract - user preferences management
    PREFERENCES_CONTRACT: "vu5yx-eh777-77774-qaaga-cai",

    // Forums Contract - forum functionality (auto-generated)
    FORUMS_CONTRACT: undefined, // Will use auto-generated canister ID

    // Internet Identity - authentication
    INTERNET_IDENTITY: "rdmx6-jaaaa-aaaaa-aaadq-cai",
} as const;

// Principal IDs for admin and system accounts
export const PRINCIPAL_IDS = {
    // Admin principal for initial supply and management
    ADMIN: "2sl3b-tf63d-g5z2g-44tut-vfgiw-af5tm-j65bi-37h3o-uce26-wvs2v-qqe",

    // Minter principal (operational contract for v1, token contract for v3)
    MINTER_V1: "uxrrr-q7777-77774-qaaaq-cai", // operational contract
    MINTER_V3: "ucwa4-rx777-77774-qaada-cai", // token contract
} as const;

// Environment-specific configurations
export const getCanisterId = (canisterName: keyof typeof CANISTER_IDS): string => {
    // Check for environment variable override first
    const envKey = `CANISTER_ID_${canisterName.toUpperCase().replace(/_/g, '_')}`;
    const envValue = import.meta.env[envKey];

    if (envValue) {
        return envValue;
    }

    // Fall back to hardcoded value
    const hardcodedValue = CANISTER_IDS[canisterName];
    if (!hardcodedValue) {
        throw new Error(`Canister ID for ${canisterName} not found. Please set ${envKey} environment variable or update CANISTER_IDS.`);
    }

    return hardcodedValue;
};

// Helper function to get Internet Identity URL based on environment
export const getInternetIdentityUrl = (): string => {
    if (import.meta.env.DFX_NETWORK === "ic") {
        return "https://identity.ic0.app";
    }
    return `http://${CANISTER_IDS.INTERNET_IDENTITY}.localhost:4943`;
};

// Helper function to get IC host URL based on environment
export const getICHostUrl = (): string => {
    if (import.meta.env.DFX_NETWORK === "ic") {
        return "https://ic0.app";
    }
    return "http://localhost:4943";
};

// Export individual canister getters for convenience
export const getOperationalCanisterId = () => getCanisterId('OPERATIONAL_CONTRACT');
export const getICRC1CanisterId = () => getCanisterId('ICRC1_LEDGER');
export const getNFTCanisterId = () => getCanisterId('NFT_CONTRACT');
export const getPreferencesCanisterId = () => getCanisterId('PREFERENCES_CONTRACT');
export const getTokenCanisterId = () => getCanisterId('TOKEN_CONTRACT');

// Development helpers
export const DEVELOPMENT_CONFIG = {
    DEFAULT_HOST: "http://localhost:4943",
    IC_HOST: "https://ic0.app",
    LOCAL_II_URL: `http://${CANISTER_IDS.INTERNET_IDENTITY}.localhost:4943`,
    IC_II_URL: "https://identity.ic0.app",
} as const; 