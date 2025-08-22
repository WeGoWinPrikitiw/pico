/**
 * Centralized Configuration for PiCO Backend
 *
 * This module provides a single source of truth for all canister IDs
 * and configuration values used across the backend contracts.
 *
 * NOTE: Canister IDs are automatically updated by the `npm run sync:canisters` script.
 * Do not edit them manually.
 */
import Nat32 "mo:base/Nat32";

module {
  // Network detection (auto-updated by script)
  public let IS_LOCAL = false;

  // Canister IDs (auto-updated by script)
  public let INTERNET_IDENTITY_CANISTER = "rdmx6-jaaaa-aaaaa-aaadq-cai";
  public let NFT_CONTRACT_CANISTER = "e2gvc-pyaaa-aaaap-qp4ka-cai";
  public let OPERATIONAL_CONTRACT_CANISTER = "e5htw-caaaa-aaaap-qp4kq-cai";
  public let TOKEN_CONTRACT_CANISTER = "f6l2q-wyaaa-aaaap-qp4ma-cai";
  public let PREFERENCES_CONTRACT_CANISTER = "etf66-zqaaa-aaaap-qp4lq-cai";
  public let FORUMS_CONTRACT_CANISTER = "eiac3-diaaa-aaaap-qp4ja-cai";
  public let ICRC1_LEDGER_CANISTER = "epbep-oqaaa-aaaap-qp4jq-cai";
  public let PICO_FRONTEND_CANISTER = "eueyk-uiaaa-aaaap-qp4la-cai";
  public let AI_CONTRACT_CANISTER = "ebdjh-vaaaa-aaaap-qp4iq-cai";

  // Admin and system principals
  public let ADMIN_PRINCIPAL = "igjqa-zhtmo-qhppn-eh7lt-5viq5-4e5qj-lhl7n-qd2fz-2yzx2-oczyc-tqe";
  // The operational contract is the minter for the ICRC-1 ledger.
  public let MINTER_PRINCIPAL = OPERATIONAL_CONTRACT_CANISTER;

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

  // NFT configuration
  public let NFT_COLLECTION_SUPPLY_CAP = 10000;

  // HTTP outcall configuration (for OpenAI integration)
  public let HTTP_OUTCALL_CYCLES : Nat = 3_000_000_000; // 400M cycles
  public let HTTP_MAX_RESPONSE_BYTES : Nat = 20480; // 20KB

  // Conversion utilities
  public func picoToUnits(pico : Nat) : Nat {
    pico * (10 ** TOKEN_DECIMALS)
  };

  public func unitsToPico(units : Nat) : Nat {
    units / (10 ** TOKEN_DECIMALS)
  };

  // HashMap utilities
  public let HASH_MAP_MODULO = 4294967295; // 2^32 - 1
  public let DEFAULT_HASH_MAP_SIZE = 10;
  public func natHash(n: Nat) : Nat32 {
    Nat32.fromNat(n % HASH_MAP_MODULO)
  };
}