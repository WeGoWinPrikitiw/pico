/**
 * Centralized Configuration for PiCO Backend
 * 
 * This module provides a single source of truth for all canister IDs
 * and configuration values used across the backend contracts.
 */

module {
  // Network detection
  public let IS_LOCAL = true; // This will be updated during deployment

  // Canister IDs - these will be automatically updated by deployment scripts
  public let INTERNET_IDENTITY_CANISTER = "rdmx6-jaaaa-aaaaa-aaadq-cai";
  public let NFT_CONTRACT_CANISTER = "v56tl-sp777-77774-qaahq-cai";
  public let OPERATIONAL_CONTRACT_CANISTER = "uxrrr-q7777-77774-qaaaq-cai";
  public let TOKEN_CONTRACT_CANISTER = "ucwa4-rx777-77774-qaada-cai";
  public let PREFERENCES_CONTRACT_CANISTER = "vu5yx-eh777-77774-qaaga-cai";
  public let FORUMS_CONTRACT_CANISTER = "vpyes-67777-77774-qaaeq-cai";
  public let ICRC1_LEDGER_CANISTER = "u6s2n-gx777-77774-qaaba-cai";
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

  // Conversion utilities
  public func picoToUnits(pico : Nat) : Nat {
    pico * 100_000_000 // 8 decimals
  };

  public func unitsToPico(units : Nat) : Nat {
    units / 100_000_000 // 8 decimals
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
} 