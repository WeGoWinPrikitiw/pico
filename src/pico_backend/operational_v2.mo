/*
 * PiCO Operational Contract v2 - Internal Balance System
 * 
 * This contract holds ALL tokens and tracks user balances internally.
 * This allows the contract to transfer tokens between users without approval.
 * 
 * Architecture:
 * - This contract (operational) holds ALL PiCO tokens
 * - User balances are tracked internally
 * - Contract can freely move tokens between users
 * - No need for user approval for transfers
 */

import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Config "config";

actor OperationalV2 {
  
  // Admin principal (for management)
  private let ADMIN_PRINCIPAL = Config.ADMIN_PRINCIPAL;
  
  // Transaction counter for unique IDs
  private stable var transactionCounter : Nat = 0;
  
  // Transaction status types
  public type TransactionStatus = {
    #Pending;
    #Completed;
    #Failed;
    #Cancelled;
  };
  
  // Operational transaction record
  public type OperationalTransaction = {
    transaction_id : Nat;
    from_principal_id : Text;
    to_principal_id : Text;
    status : TransactionStatus;
    price_token : Nat; // Amount in PiCO tokens
    created_at : Int;
    nft_id : ?Nat; // Optional NFT ID
    forum_id : ?Nat; // Optional Forum ID
  };
  
  // Internal user balances - contract holds all tokens, tracks user ownership
  private var userBalances = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);
  
  // Registry of all users who have received tokens
  private var tokenHolders = HashMap.HashMap<Text, Bool>(10, Text.equal, Text.hash);
  
  // Storage for operational transactions
  private var transactions = HashMap.HashMap<Nat, OperationalTransaction>(10, Nat.equal, func(n: Nat) : Nat32 { 
    let hash = Nat32.fromNat(n % 4294967295); // 2^32 - 1
    hash
  });
  
  // Initialize admin with initial balance
  private func initializeAdmin() {
    userBalances.put(ADMIN_PRINCIPAL, 1_000_000); // 1M PiCO initial supply
    tokenHolders.put(ADMIN_PRINCIPAL, true);
  };
  
  // Call initialization
  initializeAdmin();
  
  // Helper functions
  private func generateTransactionId() : Nat {
    transactionCounter += 1;
    transactionCounter
  };
  
  // Healthy check function
  public query func is_contract_healthy() : async Text {
    return "Healthy! Internal balance system active.";
  };
  
  // TOKEN FUNCTIONS
  
  // Give PiCO tokens to user (Internal Balance System)
  public func top_up(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = "SYSTEM";
      to_principal_id = userPrincipal;
      status = #Pending;
      price_token = amount;
      created_at = currentTime;
      nft_id = null;
      forum_id = null;
    };
    
    transactions.put(transactionId, transaction);
    
    try {
      // Get current user balance
      let currentBalance = switch (userBalances.get(userPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      
      // Update user's internal balance
      userBalances.put(userPrincipal, currentBalance + amount);
      
      // Update transaction status to completed
      let updatedTransaction = {
        transaction with
        status = #Completed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      // Add user to token holders registry
      tokenHolders.put(userPrincipal, true);
      
      #ok({
        transaction_id = transactionId;
        message = "✅ Added " # Nat.toText(amount) # " PiCO tokens to " # userPrincipal # "'s balance. New balance: " # Nat.toText(currentBalance + amount) # " PiCO";
      })
    } catch (e) {
      let updatedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #err("❌ Error processing top-up: " # Error.message(e))
    }
  };
  
  // Get user's internal balance
  public query func getUserBalance(userPrincipal : Text) : async Nat {
    switch (userBalances.get(userPrincipal)) {
      case (?balance) { balance };
      case null { 0 };
    }
  };
  
  // Transfer tokens between users (internal system - NO APPROVAL NEEDED!)
  public func transfer_internal(fromPrincipal : Text, toPrincipal : Text, amount : Nat) : async Result.Result<{message: Text}, Text> {
    // Get sender balance
    let fromBalance = switch (userBalances.get(fromPrincipal)) {
      case (?balance) { balance };
      case null { 0 };
    };
    
    if (fromBalance < amount) {
      return #err("❌ Insufficient balance. Required: " # Nat.toText(amount) # " PiCO, Available: " # Nat.toText(fromBalance) # " PiCO");
    };
    
    // Get receiver balance
    let toBalance = switch (userBalances.get(toPrincipal)) {
      case (?balance) { balance };
      case null { 0 };
    };
    
    // Update balances - CONTRACT CAN DO THIS WITHOUT APPROVAL!
    userBalances.put(fromPrincipal, fromBalance - amount);
    userBalances.put(toPrincipal, toBalance + amount);
    
    // Add receiver to token holders
    tokenHolders.put(toPrincipal, true);
    
    #ok({
      message = "✅ Transferred " # Nat.toText(amount) # " PiCO from " # fromPrincipal # " to " # toPrincipal;
    })
  };
  
  // Buy NFT action - transfers tokens from buyer to seller (NO APPROVAL NEEDED!)
  public func buy_nft(buyerPrincipal : Text, sellerPrincipal : Text, nftId : Nat, price : Nat, forumId : ?Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = buyerPrincipal;
      to_principal_id = sellerPrincipal;
      status = #Pending;
      price_token = price;
      created_at = currentTime;
      nft_id = ?nftId;
      forum_id = forumId;
    };
    
    transactions.put(transactionId, transaction);
    
    try {
      // Check if buyer has enough balance
      let buyerBalance = switch (userBalances.get(buyerPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      
      if (buyerBalance < price) {
        let updatedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, updatedTransaction);
        return #err("❌ Insufficient balance. Required: " # Nat.toText(price) # " PiCO, Available: " # Nat.toText(buyerBalance) # " PiCO");
      };
      
      // Get seller balance
      let sellerBalance = switch (userBalances.get(sellerPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      
      // Transfer tokens from buyer to seller - CONTRACT CAN DO THIS!
      userBalances.put(buyerPrincipal, buyerBalance - price);
      userBalances.put(sellerPrincipal, sellerBalance + price);
      
      // Add seller to token holders
      tokenHolders.put(sellerPrincipal, true);
      
      let updatedTransaction = {
        transaction with
        status = #Completed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #ok({
        transaction_id = transactionId;
        message = "✅ NFT purchase completed! Transferred " # Nat.toText(price) # " PiCO from " # buyerPrincipal # " to " # sellerPrincipal # " for NFT #" # Nat.toText(nftId);
      })
    } catch (e) {
      let updatedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, updatedTransaction);
      #err("❌ Error processing NFT purchase: " # Error.message(e))
    }
  };
  
  // QUERY FUNCTIONS
  
  // Get transaction by ID
  public query func getTransaction(transactionId : Nat) : async ?OperationalTransaction {
    transactions.get(transactionId)
  };
  
  // Get all transactions for a user
  public query func getUserTransactions(userPrincipal : Text) : async [OperationalTransaction] {
    let userTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        tx.from_principal_id == userPrincipal or tx.to_principal_id == userPrincipal
      }
    );
    userTxs
  };
  
  // Get all NFT transactions
  public query func getAllNFTTransactions() : async [OperationalTransaction] {
    let nftTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        switch (tx.nft_id) {
          case (?_) { true };
          case null { false };
        }
      }
    );
    nftTxs
  };
  
  // Get all registered token holders
  public query func getAllTokenHolders() : async [Text] {
    Iter.toArray(tokenHolders.keys())
  };
  
  // Get all user balances
  public query func getAllBalances() : async [(Text, Nat)] {
    Iter.toArray(userBalances.entries())
  };
  
  // Admin functions
  public query func isUserAdmin(userPrincipal : Text) : async Bool {
    userPrincipal == ADMIN_PRINCIPAL
  };
  
  public query func getTransactionCount() : async Nat {
    transactionCounter
  };
} 