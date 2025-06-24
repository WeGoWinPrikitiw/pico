/*
 * PiCO Operational Contract
 * 
 * This contract serves as the MINTER for the PiCO ICRC-1 token.
 * It can mint tokens directly to users and handles operational transactions.
 * 
 * Architecture:
 * - This contract (u6s2n-gx777-77774-qaaba-cai) is the MINTER
 * - ICRC-1 Ledger (uxrrr-q7777-77774-qaaaq-cai) handles token storage/transfers
 * - Admin (igjqa-zhtmo-qhppn-eh7lt-5viq5-4e5qj-lhl7n-qd2fz-2yzx2-oczyc-tqe) receives initial supply
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

actor Operational {
  
  // Admin principal (for initial supply and management)
  private let ADMIN_PRINCIPAL = "igjqa-zhtmo-qhppn-eh7lt-5viq5-4e5qj-lhl7n-qd2fz-2yzx2-oczyc-tqe";
  
  // This contract is now the minter
  private let MINTER_PRINCIPAL = "u6s2n-gx777-77774-qaaba-cai"; // This operational contract
  
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
    // Custom hash function for Nat values - use wrapping arithmetic to avoid trap
    let hash = Nat32.fromNat(n % 4294967295); // 2^32 - 1
    hash
  });
  
  // Registry of all users who have received tokens
  private var tokenHolders = HashMap.HashMap<Text, Bool>(10, Text.equal, Text.hash);
  
  // Initialize admin as a token holder (since they have initial supply)
  // Note: This contract is the minter, but admin gets the initial supply
  private func initializeAdmin() {
    tokenHolders.put(ADMIN_PRINCIPAL, true);
    tokenHolders.put(MINTER_PRINCIPAL, true); // Also register this contract
  };
  
  // Call initialization
  initializeAdmin();
  
  // ICRC-2 types for approval system
  public type ApproveArgs = {
    from_subaccount : ?[Nat8];
    spender : Account;
    amount : Nat;
    expected_allowance : ?Nat;
    expires_at : ?Nat64;
    fee : ?Nat;
    memo : ?[Nat8];
    created_at_time : ?Nat64;
  };
  
  public type ApproveResult = {
    #Ok : Nat;
    #Err : ApproveError;
  };
  
  public type ApproveError = {
    #BadFee : { expected_fee : Nat };
    #InsufficientFunds : { balance : Nat };
    #AllowanceChanged : { current_allowance : Nat };
    #Expired : { ledger_time : Nat64 };
    #TooOld;
    #CreatedInFuture : { ledger_time : Nat64 };
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };
  
  public type TransferFromArgs = {
    spender_subaccount : ?[Nat8];
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?[Nat8];
    created_at_time : ?Nat64;
  };
  
  public type TransferFromResult = {
    #Ok : Nat;
    #Err : TransferFromError;
  };
  
  public type TransferFromError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #InsufficientAllowance : { allowance : Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time : Nat64 };
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };

  // ICRC-1 + ICRC-2 Ledger interface
  let ledger = actor(LEDGER_CANISTER_ID) : actor {
    icrc1_transfer : (TransferArgs) -> async TransferResult;
    icrc1_balance_of : (Account) -> async Nat;
    icrc1_name : () -> async Text;
    icrc1_symbol : () -> async Text;
    icrc1_decimals : () -> async Nat8;
    icrc2_approve : (ApproveArgs) -> async ApproveResult;
    icrc2_transfer_from : (TransferFromArgs) -> async TransferFromResult;
    icrc2_allowance : (Account, Account) -> async Nat;
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
  
  // Healthy check function
  public query func is_contract_healthy() : async Text {
    return "Healthy bray! don't worry about it.";
  };
  
  // Operational Token -> ICRC1 Functions
  
  // Mint PiCO tokens to user (HACKATHON VERSION - NO AUTH REQUIRED)
  // Since this contract is now the minter, it can mint tokens directly
  public func top_up(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create pending transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = MINTER_PRINCIPAL; // This contract is now the minter
      to_principal_id = userPrincipal;
      status = #Pending;
      price_token = amount;
      created_at = currentTime;
      nft_id = null;
      forum_id = null;
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
            message = "✅ Successfully minted " # Nat.toText(amount) # " PiCO tokens to " # userPrincipal # ". Block: " # Nat.toText(blockIndex);
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
              "❌ Insufficient funds. Available: " # Nat.toText(unitsToPico(balance)) # " PiCO"
            };
            case (#BadFee({ expected_fee })) {
              "❌ Bad fee. Expected: " # Nat.toText(expected_fee)
            };
            case (#GenericError({ error_code; message })) {
              "❌ Error " # Nat.toText(error_code) # ": " # message
            };
            case (_) {
              "❌ Transfer failed"
            };
          };
          #err(errorMsg)
        };
      }
    } catch (e) {
      // Update transaction status to failed
      let updatedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #err("❌ Error processing top-up: " # Error.message(e))
    }
  };
  
  // Function to be called by frontend - provides instructions for minting
  public func mint_to_user(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; mint_command: Text}, Text> {
    let topUpResult = await top_up(userPrincipal, amount);
    
    switch (topUpResult) {
      case (#ok(result)) {
        let amountInUnits = picoToUnits(amount);
        let mintCommand = "dfx canister call icrc1_ledger_canister icrc1_transfer '(record { to = record { owner = principal \"" # userPrincipal # "\" }; amount = " # Nat.toText(amountInUnits) # " })'";
        
        #ok({
          transaction_id = result.transaction_id;
          mint_command = mintCommand;
        })
      };
      case (#err(error)) {
        #err(error)
      };
    }
  };
  
  // APPROVAL Functions (ICRC-2)
  
  // IMPORTANT: This function will NOT work as expected!
  // ICRC-2 approve must be called by the token OWNER, not through a proxy contract
  // The caller's identity gets lost when our contract calls the ledger
  // 
  // RECOMMENDED: Use @dfinity/ledger-icrc library in frontend instead
  public func approve_contract_BROKEN(_ : Nat) : async Result.Result<Text, Text> {
    #err("❌ This function doesn't work! Use frontend to call ledger directly. Call get_approval_info() for details.")
  };
  
  // Get info for frontend to approve ledger directly (CORRECT WAY)
  public query func get_approval_info(amount : Nat) : async {
    ledger_canister_id: Text;
    spender_principal: Text;
    amount_in_units: Nat;
    javascript_example: Text;
  } {
    let amountInUnits = picoToUnits(amount);
    {
      ledger_canister_id = LEDGER_CANISTER_ID;
      spender_principal = MINTER_PRINCIPAL;
      amount_in_units = amountInUnits;
      javascript_example = "
// Use @dfinity/ledger-icrc library:
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';

const ledger = IcrcLedgerCanister.create({
  agent: authenticatedAgent,
  canisterId: '" # LEDGER_CANISTER_ID # "'
});

const result = await ledger.approve({
  spender: {
    owner: Principal.fromText('" # MINTER_PRINCIPAL # "'),
    subaccount: []
  },
  amount: " # Nat.toText(amountInUnits) # "n
});";
    }
  };
  
  // Get approval command for CLI users (alternative method)
  public query func get_approval_command(amount : Nat) : async Text {
    let amountInUnits = picoToUnits(amount);
    "dfx canister call icrc1_ledger_canister icrc2_approve '(record { spender = record { owner = principal \"" # MINTER_PRINCIPAL # "\" }; amount = " # Nat.toText(amountInUnits) # " })'"
  };
  
  // Check how much a user has approved this contract to spend
  public func check_allowance(userPrincipal : Text) : async Result.Result<Nat, Text> {
    try {
      let userPrincipalObj = Principal.fromText(userPrincipal);
      let contractPrincipalObj = Principal.fromText(MINTER_PRINCIPAL);
      
      let userAccount : Account = {
        owner = userPrincipalObj;
        subaccount = null;
      };
      
      let contractAccount : Account = {
        owner = contractPrincipalObj;
        subaccount = null;
      };
      
      let allowance = await ledger.icrc2_allowance(userAccount, contractAccount);
      #ok(unitsToPico(allowance))
    } catch (e) {
      #err("Error checking allowance: " # Error.message(e))
    }
  };
  
  // Check current user's allowance (for frontend - uses caller's principal)
  public func check_my_allowance(caller : Principal) : async Result.Result<Nat, Text> {
    try {
      let callerText = Principal.toText(caller);
      await check_allowance(callerText)
    } catch (e) {
      #err("Error checking your allowance: " # Error.message(e))
    }
  };

  // OPERATIONAL Functions
  
  // Buy NFT action - uses ICRC-2 approval to transfer tokens from buyer to seller
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
      let buyerPrincipalObj = Principal.fromText(buyerPrincipal);
      let sellerPrincipalObj = Principal.fromText(sellerPrincipal);
      let contractPrincipalObj = Principal.fromText(MINTER_PRINCIPAL);
      
      let buyerAccount : Account = {
        owner = buyerPrincipalObj;
        subaccount = null;
      };
      
      let sellerAccount : Account = {
        owner = sellerPrincipalObj;
        subaccount = null;
      };
      
      let contractAccount : Account = {
        owner = contractPrincipalObj;
        subaccount = null;
      };
      
      let requiredAmount = picoToUnits(price);
      
      // Check if buyer has enough balance
      let buyerBalance = await ledger.icrc1_balance_of(buyerAccount);
      if (buyerBalance < requiredAmount) {
        let updatedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, updatedTransaction);
        return #err("❌ Insufficient funds. Required: " # Nat.toText(price) # " PiCO, Available: " # Nat.toText(unitsToPico(buyerBalance)) # " PiCO");
      };
      
      // Check if buyer has approved this contract to spend their tokens
      let allowance = await ledger.icrc2_allowance(buyerAccount, contractAccount);
      if (allowance < requiredAmount) {
        let updatedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, updatedTransaction);
        return #err("❌ Insufficient allowance. Required: " # Nat.toText(price) # " PiCO, Approved: " # Nat.toText(unitsToPico(allowance)) # " PiCO. Please approve the contract first.");
      };
      
      // Use ICRC-2 transfer_from to move tokens from buyer to seller
      let transferFromArgs : TransferFromArgs = {
        spender_subaccount = null;
        from = buyerAccount;
        to = sellerAccount;
        amount = requiredAmount;
        fee = null;
        memo = null;
        created_at_time = null;
      };
      
      let result = await ledger.icrc2_transfer_from(transferFromArgs);
      
      switch (result) {
        case (#Ok(blockIndex)) {
          let updatedTransaction = {
            transaction with
            status = #Completed;
          };
          transactions.put(transactionId, updatedTransaction);
          
          // Add seller to token holders if not already
          tokenHolders.put(sellerPrincipal, true);
          
          #ok({
            transaction_id = transactionId;
            message = "🎉 NFT #" # Nat.toText(nftId) # " purchased! Transferred " # Nat.toText(price) # " PiCO from " # buyerPrincipal # " to " # sellerPrincipal # ". Block: " # Nat.toText(blockIndex);
          })
        };
        case (#Err(error)) {
          let updatedTransaction = {
            transaction with
            status = #Failed;
          };
          transactions.put(transactionId, updatedTransaction);
          
          let errorMsg = switch (error) {
            case (#InsufficientFunds({ balance })) {
              "❌ Buyer insufficient funds. Available: " # Nat.toText(unitsToPico(balance)) # " PiCO"
            };
            case (#InsufficientAllowance({ allowance })) {
              "❌ Insufficient allowance. Approved: " # Nat.toText(unitsToPico(allowance)) # " PiCO"
            };
            case (#BadFee({ expected_fee })) {
              "❌ Bad fee. Expected: " # Nat.toText(expected_fee)
            };
            case (#GenericError({ error_code; message })) {
              "❌ Transfer error " # Nat.toText(error_code) # ": " # message
            };
            case (_) {
              "❌ NFT purchase failed during token transfer"
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
      #err("❌ Error processing NFT purchase: " # Error.message(e))
    }
  };
  
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
  
  // Get all transactions (admin only)
  public query func getAllTransactions() : async [OperationalTransaction] {
    Iter.toArray(transactions.vals())
  };
  
  // Get NFT purchase history
  public query func getNFTTransactionHistory(nftId : Nat) : async [OperationalTransaction] {
    let nftTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        switch (tx.nft_id) {
          case (?id) { id == nftId };
          case null { false };
        }
      }
    );
    nftTxs
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
  
  // Get NFT transactions by buyer
  public query func getNFTTransactionsByBuyer(buyerPrincipal : Text) : async [OperationalTransaction] {
    let buyerNFTTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        let hasNFT = switch (tx.nft_id) {
          case (?_) { true };
          case null { false };
        };
        tx.from_principal_id == buyerPrincipal and hasNFT
      }
    );
    buyerNFTTxs
  };
  
  // Get NFT transactions by seller
  public query func getNFTTransactionsBySeller(sellerPrincipal : Text) : async [OperationalTransaction] {
    let sellerNFTTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        let hasNFT = switch (tx.nft_id) {
          case (?_) { true };
          case null { false };
        };
        tx.to_principal_id == sellerPrincipal and hasNFT
      }
    );
    sellerNFTTxs
  };
  
  // Utility functions
  public func getUserBalance(userPrincipal : Text) : async Result.Result<Nat, Text> {
    try {
      let userPrincipalObj = Principal.fromText(userPrincipal);
      let account : Account = {
        owner = userPrincipalObj;
        subaccount = null;
      };
      
      let balance = await ledger.icrc1_balance_of(account);
      #ok(unitsToPico(balance))
    } catch (e) {
      #err("Error getting balance: " # Error.message(e))
    }
  };
  
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
  
  public query func isUserAdmin(userPrincipal : Text) : async Bool {
    userPrincipal == ADMIN_PRINCIPAL
  };
  
  public query func getLedgerCanisterId() : async Text {
    LEDGER_CANISTER_ID
  };
  
  public query func getTransactionCount() : async Nat {
    transactionCounter
  };
  
  // Get minter information
  public query func getMinterInfo() : async {minter_principal: Text; admin_principal: Text; ledger_canister: Text} {
    {
      minter_principal = MINTER_PRINCIPAL;
      admin_principal = ADMIN_PRINCIPAL;
      ledger_canister = LEDGER_CANISTER_ID;
    }
  };
  
  // Get all registered token holders
  public query func getAllTokenHolders() : async [Text] {
    Iter.toArray(tokenHolders.keys())
  };
  
  // Add a user to token holders registry (for manual additions)
  public func addTokenHolder(principalId : Text) : async Bool {
    tokenHolders.put(principalId, true);
    true
  };
  
  // Check if user is registered as token holder
  public query func isTokenHolder(principalId : Text) : async Bool {
    switch (tokenHolders.get(principalId)) {
      case (?exists) { exists };
      case null { false };
    }
  };
  
  // Get count of registered token holders
  public query func getTokenHoldersCount() : async Nat {
    tokenHolders.size()
  };
}
