/**
 * Canister Configuration
 *
 * This file manages canister IDs for your application.
 * It prioritizes IDs in the following order:
 * 1. Environment variables (e.g., CANISTER_ID_MY_CANISTER)
 * 2. Auto-generated IDs from `generated-canister-ids.json` (created by `npm run sync:canisters`)
 * 3. Default values (for initial setup)
 *
 * Do not edit the generated file manually.
 */
import generatedCanisterIds from "./generated-canister-ids.json";

export interface CanisterConfig {
    nft_contract: string;
    operational_contract: string;
    token_contract: string;
    preferences_contract: string;
    forums_contract: string;
    icrc1_ledger_canister: string;
    internet_identity: string;
    pico_frontend: string;
}

// Default configuration (placeholders, should be overridden)
const defaultConfig: CanisterConfig = {
    nft_contract: "v56tl-sp777-77774-qaahq-cai",
    operational_contract: "uxrrr-q7777-77774-qaaaq-cai",
    token_contract: "ucwa4-rx777-77774-qaada-cai",
    preferences_contract: "vu5yx-eh777-77774-qaaga-cai",
    forums_contract: "vpyes-67777-77774-qaaeq-cai",
    icrc1_ledger_canister: "u6s2n-gx777-77774-qaaba-cai",
    internet_identity: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    pico_frontend: "ulvla-h7777-77774-qaacq-cai",
};
// The `canisterIds` object is constructed by merging `defaultConfig` and `generatedCanisterIds.canister_ids`. This ensures that any IDs generated during deployment will override the default placeholders. 
const canisterIds: CanisterConfig = {
    ...defaultConfig,
    ...generatedCanisterIds.canister_ids,
};

// The `getCanisterId` function retrieves the canister ID based on the provided `canisterName`. It first checks for an environment variable override (`CANISTER_ID_MY_CANISTER`) before falling back to the `canisterIds` object. 
export const getCanisterId = (canisterName: keyof CanisterConfig): string => {
    const envKey = `CANISTER_ID_${canisterName.toUpperCase()}`;
    const envValue = import.meta.env[envKey];

    if (envValue) {
        return envValue;
    }

    return canisterIds[canisterName];
};

// Network detection
export const isMainnet = import.meta.env.DFX_NETWORK === "ic";
export const isLocal = !isMainnet;

// Host configuration
export const getHost = () => {
    return isMainnet ?
        "https://ic0.app" : "http://localhost:4943";
};

// Identity provider configuration
export const getIdentityProvider = () => {
    return isMainnet
        ?
        "https://identity.ic0.app"
        : `http://${getCanisterId("internet_identity")}.localhost:4943`;
};