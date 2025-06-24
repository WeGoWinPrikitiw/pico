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
  
  // Admin principal (your minter account)
  private let ADMIN_PRINCIPAL = "igjqa-zhtmo-qhppn-eh7lt-5viq5-4e5qj-lhl7n-qd2fz-2yzx2-oczyc-tqe";
  
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
  
  // Original greeting function
  public query func greet(name : Text) : async Text {
    return "Hello My Name is: " # name # "!";
  };
  
  // TOKEN -> ICRC1 Functions
  
  // Top up user with PiCO tokens
  public func top_up(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create pending transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = ADMIN_PRINCIPAL;
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
          
          #ok({
            transaction_id = transactionId;
            message = "Successfully topped up " # Nat.toText(amount) # " PiCO tokens. Block: " # Nat.toText(blockIndex);
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
              "Insufficient funds. Available: " # Nat.toText(unitsToPico(balance)) # " PiCO"
            };
            case (#BadFee({ expected_fee })) {
              "Bad fee. Expected: " # Nat.toText(expected_fee)
            };
            case (#GenericError({ error_code; message })) {
              "Error " # Nat.toText(error_code) # ": " # message
            };
            case (_) {
              "Transfer failed"
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
      
      #err("Error processing top-up: " # Error.message(e))
    }
  };
  
  // OPERATIONAL Functions
  
  // Buy NFT action
  public func buy_nft(buyerPrincipal : Text, nftId : Nat, price : Nat, forumId : ?Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    let transactionId = generateTransactionId();
    let currentTime = Time.now();
    
    // Create transaction record
    let transaction : OperationalTransaction = {
      transaction_id = transactionId;
      from_principal_id = buyerPrincipal;
      to_principal_id = ADMIN_PRINCIPAL; // NFT sales go to admin
      status = #Pending;
      price_token = price;
      created_at = currentTime;
      nft_id = ?nftId;
      forum_id = forumId;
    };
    
    transactions.put(transactionId, transaction);
    
         try {
       // Note: In a real implementation, need to handle the caller authentication
       // and perform the actual token transfer. For now, this is a placeholder for the NFT purchase logic
       // let _buyerPrincipalObj = Principal.fromText(buyerPrincipal);
       // let _adminPrincipalObj = Principal.fromText(ADMIN_PRINCIPAL);
       
       let updatedTransaction = {
         transaction with
         status = #Completed;
       };
       transactions.put(transactionId, updatedTransaction);
       
       #ok({
         transaction_id = transactionId;
         message = "NFT purchase initiated. NFT ID: " # Nat.toText(nftId) # ", Price: " # Nat.toText(price) # " PiCO";
       })
      
    } catch (e) {
      let updatedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, updatedTransaction);
      
      #err("Error processing NFT purchase: " # Error.message(e))
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
}
