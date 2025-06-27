/**
 * Centralized Configuration for PiCO Backend
 * 
 * This module provides a single source of truth for all canister IDs
 * and configuration values used across the backend contracts.
 */

import Nat32 "mo:base/Nat32";

module {
  // Network detection
  public let IS_LOCAL = true; // This will be updated during deployment

  // Canister IDs - these will be automatically updated by deployment scripts
  public let INTERNET_IDENTITY_CANISTER = "rdmx6-jaaaa-aaaaa-aaadq-cai";
  public let NFT_CONTRACT_CANISTER = "xobql-2x777-77774-qaaja-cai";
  public let OPERATIONAL_CONTRACT_CANISTER = "x4hhs-wh777-77774-qaaka-cai";
  public let TOKEN_CONTRACT_CANISTER = "xjaw7-xp777-77774-qaajq-cai";
  public let PREFERENCES_CONTRACT_CANISTER = "x3gbg-37777-77774-qaakq-cai";
  public let FORUMS_CONTRACT_CANISTER = "xad5d-bh777-77774-qaaia-cai";
  public let ICRC1_LEDGER_CANISTER = "xhc3x-m7777-77774-qaaiq-cai";
  public let PICO_FRONTEND_CANISTER = "ulvla-h7777-77774-qaacq-cai";

  // Admin and system principals
  public let ADMIN_PRINCIPAL = "2sl3b-tf63d-g5z2g-44tut-vfgiw-af5tm-j65bi-37h3o-uce26-wvs2v-qqe";
  public let MINTER_PRINCIPAL = OPERATIONAL_CONTRACT_CANISTER; // Operational contract is the minter

  // Network-specific configurations
  public func getHost() : Text {
    if (IS_LOCAL) "http://localhost:4943" else "https://ic0.app"
  };
  
  public func getIdentityProvider() : Text {
    if (IS_LOCAL) 
      "http://" # INTERNET_IDENTITY_CANISTER # ".localhost:4943" 
    else 
      "https://identity.ic0.app"
  };

  // Token configuration
  public let TOKEN_NAME = "PiCO";
  public let TOKEN_SYMBOL = "PiCO";
  public let TOKEN_DECIMALS = 8;
  public let TOKEN_FEE = 10_000; // 0.0001 PiCO
  
  // Additional token economics configuration
  public let INITIAL_ADMIN_SUPPLY = 1_000_000; // 1M PiCO initial supply for admin
  public let MAX_SUPPLY = 1_000_000_000; // 1B PiCO maximum supply
  public let NFT_COLLECTION_SUPPLY_CAP = 1_000_000; // 1M NFTs maximum

  // HTTP outcall configuration (for OpenAI integration)
  public let HTTP_OUTCALL_CYCLES = 400_000_000; // 400M cycles for external HTTP calls
  public let HTTP_MAX_RESPONSE_BYTES = 20480; // 20KB max response size

  // HashMap configuration
  public let HASH_MAP_MODULO = 4294967295; // 2^32 - 1 for hash map distribution
  public let DEFAULT_HASH_MAP_SIZE = 10; // Default initial size for HashMaps

  // Conversion utilities
  public func picoToUnits(pico : Nat) : Nat {
    pico * 100_000_000 // 8 decimals
  };

  public func unitsToPico(units : Nat) : Nat {
    units / 100_000_000 // 8 decimals
  };

  // HashMap utilities
  public func natHash(n: Nat) : Nat32 {
    Nat32.fromNat(n % HASH_MAP_MODULO)
  };

  // Helper function to get canister ID by name
  public func getCanisterId(name: Text) : Text {
    switch (name) {
      case ("internet_identity") INTERNET_IDENTITY_CANISTER;
      case ("nft_contract") NFT_CONTRACT_CANISTER;
      case ("operational_contract") OPERATIONAL_CONTRACT_CANISTER;
      case ("token_contract") TOKEN_CONTRACT_CANISTER;
      case ("preferences_contract") PREFERENCES_CONTRACT_CANISTER;
      case ("forums_contract") FORUMS_CONTRACT_CANISTER;
      case ("icrc1_ledger_canister") ICRC1_LEDGER_CANISTER;
      case ("pico_frontend") PICO_FRONTEND_CANISTER;
      case (_) "unknown-canister";
    }
  };

  // Validation helpers
  public func isValidCanisterId(canisterId: Text) : Bool {
    // Basic validation - check if it's not empty and has reasonable length
    canisterId.size() > 0 and canisterId.size() < 100
  };

  // Environment helpers
  public func getEnvironmentInfo() : {
    is_local: Bool;
    host: Text;
    identity_provider: Text;
    minter: Text;
    admin: Text;
  } {
    {
      is_local = IS_LOCAL;
      host = getHost();
      identity_provider = getIdentityProvider();
      minter = MINTER_PRINCIPAL;
      admin = ADMIN_PRINCIPAL;
    }
  };
  
  // Token economics helpers
  public func getTokenEconomics() : {
    name: Text;
    symbol: Text;
    decimals: Nat;
    fee: Nat;
    initial_admin_supply: Nat;
    max_supply: Nat;
    nft_supply_cap: Nat;
  } {
    {
      name = TOKEN_NAME;
      symbol = TOKEN_SYMBOL;
      decimals = TOKEN_DECIMALS;
      fee = TOKEN_FEE;
      initial_admin_supply = INITIAL_ADMIN_SUPPLY;
      max_supply = MAX_SUPPLY;
      nft_supply_cap = NFT_COLLECTION_SUPPLY_CAP;
    }
  };
} 