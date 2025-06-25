/*
 * PiCO Token Information Contract
 * 
 * This contract provides enhanced token information and balance checking.
 * It integrates with the ICRC-1 ledger and operational contract.
 * 
 * Architecture:
 * - ICRC-1 Ledger (uxrrr-q7777-77774-qaaaq-cai) handles token storage/transfers
 * - Operational Contract (u6s2n-gx777-77774-qaaba-cai) is the MINTER
 * - This contract provides enhanced querying and analytics
 */

import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor Token {
  // Reference to the ICRC-1 ledger canister
  let ledger = actor("u6s2n-gx777-77774-qaaba-cai") : actor {
    icrc1_name : () -> async Text;
    icrc1_symbol : () -> async Text;
    icrc1_decimals : () -> async Nat8;
    icrc1_total_supply : () -> async Nat;
    icrc1_fee : () -> async Nat;
    icrc1_metadata : () -> async [(Text, Value)];
    icrc1_balance_of : (Account) -> async Nat;
  };
  
  // Reference to the operational contract
  let operational = actor("uxrrr-q7777-77774-qaaaq-cai") : actor {
    getAllTokenHolders : () -> async [Text];
    getTokenHoldersCount : () -> async Nat;
    isTokenHolder : (Text) -> async Bool;
  };

  public type Account = {
    owner : Principal;
    subaccount : ?[Nat8];
  };

  public type Value = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : [Nat8];
  };

  public type TokenInfo = {
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Nat;
    fee : Nat;
  };

  public type BalanceInfo = {
    principal_id : Text;
    balance : Nat;
    balance_pico : Nat; // Balance in PiCO units (divided by 10^8)
  };


  // Convert smallest units to PiCO (8 decimals)
  private func unitsToPico(units : Nat) : Nat {
    units / 100_000_000 // 8 decimals
  };

  // Check all registered token holders from operational contract
  private func check_all_registered_balances() : async [BalanceInfo] {
    let registered_holders = await operational.getAllTokenHolders();
    await check_multiple_balances(registered_holders)
  };

  public func get_token_info() : async TokenInfo {
    let name = await ledger.icrc1_name();
    let symbol = await ledger.icrc1_symbol();
    let decimals = await ledger.icrc1_decimals();
    let total_supply = await ledger.icrc1_total_supply();
    let fee = await ledger.icrc1_fee();

    {
      name = name;
      symbol = symbol;
      decimals = decimals;
      total_supply = total_supply;
      fee = fee;
    }
  };

  // Check balance of a specific principal
  public func check_balance(principal_id : Text) : async BalanceInfo {
    try {
      let principal_obj = Principal.fromText(principal_id);
      let account : Account = {
        owner = principal_obj;
        subaccount = null;
      };
      
      let balance = await ledger.icrc1_balance_of(account);
      
      {
        principal_id = principal_id;
        balance = balance;
        balance_pico = unitsToPico(balance);
      }
    } catch (_) {
      // Return zero balance for invalid principals
      {
        principal_id = principal_id;
        balance = 0;
        balance_pico = 0;
      }
    }
  };

  // Get multiple balances at once
  public func check_multiple_balances(principals : [Text]) : async [BalanceInfo] {
    var results : [BalanceInfo] = [];
    
    for (principal_id in principals.vals()) {
      let balance_info = await check_balance(principal_id);
      results := Array.append(results, [balance_info]);
    };
    
    results
  };

  // Filter out accounts with zero balance (only registered holders with tokens)
  public func check_active_token_holders() : async [BalanceInfo] {
    let registered_balances = await check_all_registered_balances();
    Array.filter<BalanceInfo>(registered_balances, func(info : BalanceInfo) : Bool {
      info.balance > 0
    })
  };

  // Get summary of token distribution
  public func get_token_summary() : async {
    total_supply : Nat;
    total_supply_pico : Nat;
    registered_holders : Nat;
    active_holders : Nat;
    largest_holder : ?BalanceInfo;
  } {
    let active_holders = await check_active_token_holders();
    let registered_count = await operational.getTokenHoldersCount();
    let total_supply = await ledger.icrc1_total_supply();
    
    // Find largest holder
    var largest_holder : ?BalanceInfo = null;
    var max_balance : Nat = 0;
    
    for (holder in active_holders.vals()) {
      if (holder.balance > max_balance) {
        max_balance := holder.balance;
        largest_holder := ?holder;
      };
    };
    
    {
      total_supply = total_supply;
      total_supply_pico = unitsToPico(total_supply);
      registered_holders = registered_count;
      active_holders = active_holders.size();
      largest_holder = largest_holder;
    }
  };
  
  // Get list of all registered token holders
  public func get_all_token_holders() : async [Text] {
    await operational.getAllTokenHolders()
  };
}