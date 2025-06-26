/*
 * PiCO Operational Contract v3 - HYBRID SYSTEM
 * 
 * This contract combines:
 * 1. Real ICRC-1 token operations (minting, wallet balances)
 * 2. Escrow system for instant NFT purchases without approval
 * 
 * Architecture:
 * - This contract is the MINTER for PiCO ICRC-1 tokens
 * - Users have real wallet balances (ICRC-1)
 * - Users can deposit tokens to escrow for instant purchases
 * - Contract can instantly transfer escrowed tokens for NFT purchases
 */

import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor OperationalV3 {
  
  // Admin principal (for initial supply and management)
  private let ADMIN_PRINCIPAL = "2sl3b-tf63d-g5z2g-44tut-vfgiw-af5tm-j65bi-37h3o-uce26-wvs2v-qqe";
  
  // This contract is the minter
  private let MINTER_PRINCIPAL = "ucwa4-rx777-77774-qaada-cai"; // This operational_v3 contract
  
  // ICRC-1 Ledger canister
  private let LEDGER_CANISTER_ID = "uxrrr-q7777-77774-qaaaq-cai";
  
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
    transaction_type : Text; // "mint", "escrow_deposit", "escrow_withdraw", "nft_purchase"
  };
  
  // ICRC-1 types
  public type Account = {
    owner : Principal;
    subaccount : ?[Nat8];
  };
  
  public type TransferArgs = {
    from_subaccount : ?[Nat8];
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?[Nat8];
    created_at_time : ?Nat64;
  };
  
  public type TransferResult = {
    #Ok : Nat;
    #Err : TransferError;
  };
  
  public type TransferError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #CreatedInFuture : { ledger_time : Nat64 };
    #TooOld;
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };
  
  // Storage for operational transactions
  private var transactions = HashMap.HashMap<Nat, OperationalTransaction>(10, Nat.equal, func(n: Nat) : Nat32 { 
    let hash = Nat32.fromNat(n % 4294967295); // 2^32 - 1
    hash
  });
  
  // Registry of all users who have received tokens
  private var tokenHolders = HashMap.HashMap<Text, Bool>(10, Text.equal, Text.hash);
  
  // Escrow balances - tokens deposited by users for instant purchases
  private var escrowBalances = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);
  
  // Initialize admin as a token holder
  private func initializeAdmin() {
    tokenHolders.put(ADMIN_PRINCIPAL, true);
    tokenHolders.put(MINTER_PRINCIPAL, true);
  };
  
  // Call initialization
  initializeAdmin();
  
  // ICRC-1 Ledger interface
  let ledger = actor(LEDGER_CANISTER_ID) : actor {
    icrc1_transfer : (TransferArgs) -> async TransferResult;
    icrc1_balance_of : (Account) -> async Nat;
    icrc1_name : () -> async Text;
    icrc1_symbol : () -> async Text;
    icrc1_decimals : () -> async Nat8;
  };
  
  // Helper functions
  private func picoToUnits(pico : Nat) : Nat {
    pico * 100_000_000 // 8 decimals
  };
  
  private func unitsToPico(units : Nat) : Nat {
    units / 100_000_000 // 8 decimals
  };
  
  private func generateTransactionId() : Nat {
    transactionCounter += 1;
    transactionCounter
  };
  
  // Health check function
  public query func is_contract_healthy() : async Text {
    return "Healthy! HYBRID SYSTEM: Real ICRC-1 + Escrow for instant NFT purchases";
  };
  
  // ===========================================
  // PART 1: REAL ICRC-1 TOKEN OPERATIONS
  // ===========================================
  
  // Mint real PiCO tokens to user's wallet
  public func mint_tokens(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; message: Text; block_index: Nat}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create pending transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = MINTER_PRINCIPAL;
      to_principal_id = userPrincipal;
      status = #Pending;
      price_token = amount;
      created_at = currentTime;
      nft_id = null;
      forum_id = null;
      transaction_type = "mint";
    };
    
    transactions.put(transactionId, transaction);
    
    try {
      let userPrincipalObj = Principal.fromText(userPrincipal);
      let transferArgs : TransferArgs = {
        from_subaccount = null;
        to = {
          owner = userPrincipalObj;
          subaccount = null;
        };
        amount = picoToUnits(amount);
        fee = null;
        memo = null;
        created_at_time = null;
      };
      
      let result = await ledger.icrc1_transfer(transferArgs);
      
      switch (result) {
        case (#Ok(blockIndex)) {
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
            message = "✅ Successfully minted " # Nat.toText(amount) # " PiCO tokens to " # userPrincipal # "'s wallet";
            block_index = blockIndex;
          })
        };
        case (#Err(error)) {
          // Update transaction status to failed
          let updatedTransaction = {
            transaction with
            status = #Failed;
          };
          transactions.put(transactionId, updatedTransaction);
          
          let errorMsg = switch (error) {
            case (#InsufficientFunds({ balance })) {
              "❌ Insufficient minter funds. Available: " # Nat.toText(unitsToPico(balance)) # " PiCO"
            };
            case (#BadFee({ expected_fee })) {
              "❌ Bad fee. Expected: " # Nat.toText(expected_fee)
            };
            case (#GenericError({ error_code; message })) {
              "❌ Error " # Nat.toText(error_code) # ": " # message
            };
            case (_) {
              "❌ Minting failed"
            };
          };
          #err(errorMsg)
        };
      }
    } catch (e) {
      let updatedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #err("❌ Error minting tokens: " # Error.message(e))
    }
  };
  
  // Get user's real wallet balance (ICRC-1)
  public func getWalletBalance(userPrincipal : Text) : async Result.Result<Nat, Text> {
    try {
      let userPrincipalObj = Principal.fromText(userPrincipal);
      let userAccount : Account = {
        owner = userPrincipalObj;
        subaccount = null;
      };
      
      let balanceUnits = await ledger.icrc1_balance_of(userAccount);
      let balancePico = unitsToPico(balanceUnits);
      
      #ok(balancePico)
    } catch (e) {
      #err("Error getting wallet balance: " # Error.message(e))
    }
  };
  
  // ===========================================
  // PART 2: ESCROW SYSTEM FOR INSTANT PURCHASES
  // ===========================================
  
  // Deposit tokens from wallet to escrow (requires user to have tokens in wallet)
  public func deposit_to_escrow(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create pending transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = userPrincipal;
      to_principal_id = MINTER_PRINCIPAL; // Contract receives the tokens
      status = #Pending;
      price_token = amount;
      created_at = currentTime;
      nft_id = null;
      forum_id = null;
      transaction_type = "escrow_deposit";
    };
    
    transactions.put(transactionId, transaction);
    
    try {
      // First check if user has enough in wallet
      let userPrincipalObj = Principal.fromText(userPrincipal);
      let userAccount : Account = {
        owner = userPrincipalObj;
        subaccount = null;
      };
      
      let walletBalanceUnits = await ledger.icrc1_balance_of(userAccount);
      let walletBalancePico = unitsToPico(walletBalanceUnits);
      
      if (walletBalancePico < amount) {
        let updatedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, updatedTransaction);
        
        return #err("❌ Insufficient wallet balance. Required: " # Nat.toText(amount) # " PiCO, Available: " # Nat.toText(walletBalancePico) # " PiCO");
      };
      
      // Transfer tokens from user to this contract
      let _ : TransferArgs = {
        from_subaccount = null;
        to = {
          owner = Principal.fromText(MINTER_PRINCIPAL);
          subaccount = null;
        };
        amount = picoToUnits(amount);
        fee = null;
        memo = null;
        created_at_time = null;
      };
      
      // Note: This would require user approval in real implementation
      // For hackathon, we'll simulate the deposit
      
      // Get current escrow balance
      let currentEscrow = switch (escrowBalances.get(userPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      
      // Update escrow balance
      escrowBalances.put(userPrincipal, currentEscrow + amount);
      
      // Update transaction status to completed
      let updatedTransaction = {
        transaction with
        status = #Completed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #ok({
        transaction_id = transactionId;
        message = "✅ Deposited " # Nat.toText(amount) # " PiCO to escrow. Total escrow: " # Nat.toText(currentEscrow + amount) # " PiCO";
      })
    } catch (e) {
      let updatedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #err("❌ Error depositing to escrow: " # Error.message(e))
    }
  };
  
  // Get user's escrow balance
  public query func getEscrowBalance(userPrincipal : Text) : async Nat {
    switch (escrowBalances.get(userPrincipal)) {
      case (?balance) { balance };
      case null { 0 };
    }
  };
  
  // Withdraw tokens from escrow back to wallet
  public func withdraw_from_escrow(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create pending transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = MINTER_PRINCIPAL;
      to_principal_id = userPrincipal;
      status = #Pending;
      price_token = amount;
      created_at = currentTime;
      nft_id = null;
      forum_id = null;
      transaction_type = "escrow_withdraw";
    };
    
    transactions.put(transactionId, transaction);
    
    try {
      // Check escrow balance
      let currentEscrow = switch (escrowBalances.get(userPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      
      if (currentEscrow < amount) {
        let updatedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, updatedTransaction);
        
        return #err("❌ Insufficient escrow balance. Required: " # Nat.toText(amount) # " PiCO, Available: " # Nat.toText(currentEscrow) # " PiCO");
      };
      
      // Update escrow balance
      escrowBalances.put(userPrincipal, currentEscrow - amount);
      
      // Transfer tokens back to user's wallet
      let userPrincipalObj = Principal.fromText(userPrincipal);
      let transferArgs : TransferArgs = {
        from_subaccount = null;
        to = {
          owner = userPrincipalObj;
          subaccount = null;
        };
        amount = picoToUnits(amount);
        fee = null;
        memo = null;
        created_at_time = null;
      };
      
      let result = await ledger.icrc1_transfer(transferArgs);
      
      switch (result) {
        case (#Ok(_)) {
          // Update transaction status to completed
          let updatedTransaction = {
            transaction with
            status = #Completed;
          };
          transactions.put(transactionId, updatedTransaction);
          
          #ok({
            transaction_id = transactionId;
            message = "✅ Withdrew " # Nat.toText(amount) # " PiCO from escrow to wallet. Remaining escrow: " # Nat.toText(currentEscrow - amount) # " PiCO";
          })
        };
        case (#Err(_)) {
          // Revert escrow balance change
          escrowBalances.put(userPrincipal, currentEscrow);
          
          let updatedTransaction = {
            transaction with
            status = #Failed;
          };
          transactions.put(transactionId, updatedTransaction);
          
          #err("❌ Failed to transfer tokens to wallet")
        };
      }
    } catch (e) {
      let updatedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #err("❌ Error withdrawing from escrow: " # Error.message(e))
    }
  };
  
  // ===========================================
  // PART 3: INSTANT NFT PURCHASES (NO APPROVAL NEEDED!)
  // ===========================================
  
  // Buy NFT using escrowed tokens - INSTANT TRANSFER!
  public func buy_nft(buyerPrincipal : Text, sellerPrincipal : Text, nftId : Nat, price : Nat, forumId : ?Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create pending transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = buyerPrincipal;
      to_principal_id = sellerPrincipal;
      status = #Pending;
      price_token = price;
      created_at = currentTime;
      nft_id = ?nftId;
      forum_id = forumId;
      transaction_type = "nft_purchase";
    };
    
    transactions.put(transactionId, transaction);
    
    try {
      // Check buyer's escrow balance
      let buyerEscrow = switch (escrowBalances.get(buyerPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      
      if (buyerEscrow < price) {
        let updatedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, updatedTransaction);
        
        return #err("❌ Insufficient escrow balance for NFT purchase. Required: " # Nat.toText(price) # " PiCO, Available: " # Nat.toText(buyerEscrow) # " PiCO");
      };
      
      // INSTANT TRANSFER - NO APPROVAL NEEDED!
      // Deduct from buyer's escrow
      escrowBalances.put(buyerPrincipal, buyerEscrow - price);
      
      // Add to seller's escrow (they can withdraw to wallet later)
      let sellerEscrow = switch (escrowBalances.get(sellerPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      escrowBalances.put(sellerPrincipal, sellerEscrow + price);
      
      // Add seller to token holders if not already
      tokenHolders.put(sellerPrincipal, true);
      
      // Update transaction status to completed
      let updatedTransaction = {
        transaction with
        status = #Completed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #ok({
        transaction_id = transactionId;
        message = "🎉 NFT #" # Nat.toText(nftId) # " purchased! " # Nat.toText(price) # " PiCO transferred from " # buyerPrincipal # " to " # sellerPrincipal # " (in escrow)";
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
  
  // ===========================================
  // PART 4: UTILITY AND QUERY FUNCTIONS
  // ===========================================
  
  // Get complete user financial state
  public func getUserCompleteBalance(userPrincipal : Text) : async Result.Result<{
    wallet_balance_pico: Nat;
    escrow_balance_pico: Nat;
    total_balance_pico: Nat;
  }, Text> {
    try {
      let walletResult = await getWalletBalance(userPrincipal);
      let walletBalance = switch (walletResult) {
        case (#ok(balance)) { balance };
        case (#err(_)) { 0 };
      };
      
      let escrowBalance = switch (escrowBalances.get(userPrincipal)) {
        case (?balance) { balance };
        case null { 0 };
      };
      
      #ok({
        wallet_balance_pico = walletBalance;
        escrow_balance_pico = escrowBalance;
        total_balance_pico = walletBalance + escrowBalance;
      })
    } catch (e) {
      #err("Error getting complete balance: " # Error.message(e))
    }
  };
  
  // Get all escrow balances (for admin/debugging)
  public query func getAllEscrowBalances() : async [(Text, Nat)] {
    Iter.toArray(escrowBalances.entries())
  };
  
  // Get transaction by ID
  public query func getTransaction(transactionId : Nat) : async ?OperationalTransaction {
    transactions.get(transactionId)
  };
  
  // Get all transactions for a user
  public query func getUserTransactions(userPrincipal : Text) : async [OperationalTransaction] {
    let allTransactions = Iter.toArray(transactions.vals());
    Array.filter(allTransactions, func (tx : OperationalTransaction) : Bool {
      tx.from_principal_id == userPrincipal or tx.to_principal_id == userPrincipal
    })
  };
  
  // Get token info from ICRC-1 ledger
  public func getTokenInfo() : async Result.Result<{name: Text; symbol: Text; decimals: Nat8}, Text> {
    try {
      let name = await ledger.icrc1_name();
      let symbol = await ledger.icrc1_symbol();
      let decimals = await ledger.icrc1_decimals();
      
      #ok({
        name = name;
        symbol = symbol;
        decimals = decimals;
      })
    } catch (e) {
      #err("Error getting token info: " # Error.message(e))
    }
  };
} 