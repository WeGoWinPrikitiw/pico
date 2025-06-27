/*
 * PiCO Operational Contract
 * 
 * This contract serves as the MINTER for the PiCO ICRC-1 token.
 * It can mint tokens directly to users and handles operational transactions.
 * 
 * Architecture:
 * - This contract is the MINTER for PiCO tokens
 * - ICRC-1 Ledger handles token storage/transfers
 * - Admin receives initial supply via deployment
 * - ICRC-2 Ledger handles approval for transfers
 */

import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Config "config";

actor Operational {
  
  // Admin principal (for initial supply and management)
  private let ADMIN_PRINCIPAL = Config.ADMIN_PRINCIPAL;
  
  // This contract is now the minter, it's use operational contract
  private let MINTER_PRINCIPAL = Config.MINTER_PRINCIPAL;
  
  // ICRC-1 Ledger canister
  private let LEDGER_CANISTER_ID = Config.ICRC1_LEDGER_CANISTER;
  
  // Transaction counter for unique IDs
  private stable var transactionCounter : Nat = 0;
  
  public type TransactionStatus = {
    #Pending;
    #Completed;
    #Failed;
    #Cancelled;
  };
  
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
  private var transactions = HashMap.HashMap<Nat, OperationalTransaction>(Config.DEFAULT_HASH_MAP_SIZE, Nat.equal, Config.natHash);
  
  private var tokenHolders = HashMap.HashMap<Text, Bool>(Config.DEFAULT_HASH_MAP_SIZE, Text.equal, Text.hash);
  
  private func initializeAdmin() {
    tokenHolders.put(ADMIN_PRINCIPAL, true);
    tokenHolders.put(MINTER_PRINCIPAL, true);
  };
  
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

  // ICRC-2 allowance query arguments
  public type AllowanceArgs = {
    account : Account;
    spender : Account;
  };

  // ICRC-2 allowance response
  public type AllowanceResponse = {
    allowance : Nat;
    expires_at : ?Nat64;
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
    icrc2_allowance : (AllowanceArgs) -> async AllowanceResponse;
  };
  
  private func picoToUnits(pico : Nat) : Nat {
    Config.picoToUnits(pico)
  };
  
  private func unitsToPico(units : Nat) : Nat {
    Config.unitsToPico(units)
  };
  
  private func generateTransactionId() : Nat {
    transactionCounter += 1;
    transactionCounter
  };
  
  // Healthy check function
  public query func is_contract_healthy() : async Text {
    return "Healthy bray! don't worry about it.";
  };
  
  public func top_up(userPrincipal : Text, amount : Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
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
      // Use EXACT same pattern as buy_nft
      let userPrincipalObj = Principal.fromText(userPrincipal);
      let contractPrincipalObj = Principal.fromText(MINTER_PRINCIPAL);
      
      // Create accounts exactly like buy_nft
      let userAccount = { owner = userPrincipalObj; subaccount = null : ?[Nat8] };
      let contractAccount = { owner = contractPrincipalObj; subaccount = null : ?[Nat8] };
      
      // Try direct ledger call
      let allowanceArgs = {
        account = userAccount;
        spender = contractAccount;
      };
      
      let allowanceResponse = await ledger.icrc2_allowance(allowanceArgs);
      #ok(unitsToPico(allowanceResponse.allowance))
    } catch (e) {
      #err("❌ Error checking allowance: " # Error.message(e))
    }
  };
  
  // OPERATIONAL Functions
  
  // Buy NFT action - uses ICRC-2 approval to transfer tokens from buyer to seller
  public func buy_nft(buyerPrincipal : Text, sellerPrincipal : Text, nftId : Nat, price : Nat, forumId : ?Nat) : async Result.Result<{transaction_id: Nat; message: Text}, Text> {
    // Generate transaction ID first
    let transactionId = transactionCounter + 1;
    transactionCounter := transactionId;
    
    // Create transaction record
    let currentTime = Time.now();
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
    
    // Store transaction as pending
    transactions.put(transactionId, transaction);
    
    try {
      // Convert text to principals
      let buyerPrincipalObj = Principal.fromText(buyerPrincipal);
      let sellerPrincipalObj = Principal.fromText(sellerPrincipal);
      let contractPrincipalObj = Principal.fromText(MINTER_PRINCIPAL);
      
      // Create accounts
      let buyerAccount = { owner = buyerPrincipalObj; subaccount = null : ?[Nat8] };
      let sellerAccount = { owner = sellerPrincipalObj; subaccount = null : ?[Nat8] };
      let contractAccount = { owner = contractPrincipalObj; subaccount = null : ?[Nat8] };
      
      // Convert price to units using centralized function
      let amountInUnits = picoToUnits(price);
      
      // STEP 1: Check if buyer has approved this contract to spend the required amount
      let allowanceArgs = {
        account = buyerAccount;
        spender = contractAccount;
      };
      
      let allowanceResponse = await ledger.icrc2_allowance(allowanceArgs);
      let currentAllowance = allowanceResponse.allowance;
      
      if (currentAllowance < amountInUnits) {
        let failedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, failedTransaction);
        
        return #err("❌ Insufficient approval! Please approve the contract to spend " # Nat.toText(price) # " PiCO tokens first. Current allowance: " # Nat.toText(unitsToPico(currentAllowance)) # " PiCO. Use the 'Approve Contract' function in the Admin tab.");
      };
      
      // STEP 2: Check if buyer has sufficient balance
      let buyerBalance = await ledger.icrc1_balance_of(buyerAccount);
      if (buyerBalance < amountInUnits) {
        let failedTransaction = {
          transaction with
          status = #Failed;
        };
        transactions.put(transactionId, failedTransaction);
        
        return #err("❌ Insufficient balance! Required: " # Nat.toText(price) # " PiCO, Available: " # Nat.toText(unitsToPico(buyerBalance)) # " PiCO");
      };
      
      // STEP 3: Perform ICRC-2 transfer_from (now safe to do)
      let transferArgs = {
        spender_subaccount = null : ?[Nat8];
        from = buyerAccount;
        to = sellerAccount;
        amount = amountInUnits;
        fee = null : ?Nat;
        memo = null : ?[Nat8];
        created_at_time = null : ?Nat64;
      };
      
      let transferResult = await ledger.icrc2_transfer_from(transferArgs);
      
      switch (transferResult) {
        case (#Ok(blockIndex)) {
          // Update transaction to completed
          let completedTransaction = {
            transaction with
            status = #Completed;
          };
          transactions.put(transactionId, completedTransaction);
          
          // Add both buyer and seller to token holders
          tokenHolders.put(buyerPrincipal, true);
          tokenHolders.put(sellerPrincipal, true);
          
          #ok({
            transaction_id = transactionId;
            message = "🎉 NFT #" # Nat.toText(nftId) # " purchased successfully! " # Nat.toText(price) # " PiCO transferred from " # buyerPrincipal # " to " # sellerPrincipal # ". Block: " # Nat.toText(blockIndex);
          })
        };
        case (#Err(error)) {
          // Update transaction to failed
          let failedTransaction = {
            transaction with
            status = #Failed;
          };
          transactions.put(transactionId, failedTransaction);
          
          let errorMsg = switch (error) {
            case (#InsufficientFunds({ balance })) { "❌ Insufficient funds. Balance: " # Nat.toText(unitsToPico(balance)) # " PiCO" };
            case (#InsufficientAllowance({ allowance })) { "❌ Insufficient allowance. Approved: " # Nat.toText(unitsToPico(allowance)) # " PiCO. Please approve more tokens." };
            case (#BadFee({ expected_fee })) { "❌ Bad fee. Expected: " # Nat.toText(expected_fee) };
            case (#GenericError({ error_code; message })) { "❌ Error " # Nat.toText(error_code) # ": " # message };
            case (_) { "❌ Transfer failed" };
          };
          #err(errorMsg)
        };
      }
    } catch (e) {
      // Update transaction to failed
      let failedTransaction = {
        transaction with
        status = #Failed;
      };
      transactions.put(transactionId, failedTransaction);
      
      #err("❌ Purchase failed: " # Error.message(e))
    }
  };
  
  // Helper function to check if user has enough approval for a specific amount
  public func check_nft_purchase_approval(buyerPrincipal : Text, price : Nat) : async Result.Result<{
    has_sufficient_approval: Bool;
    current_allowance_pico: Nat;
    required_amount_pico: Nat;
    approval_message: Text;
  }, Text> {
    try {
      let buyerPrincipalObj = Principal.fromText(buyerPrincipal);
      let contractPrincipalObj = Principal.fromText(MINTER_PRINCIPAL);
      
      let buyerAccount = { owner = buyerPrincipalObj; subaccount = null : ?[Nat8] };
      let contractAccount = { owner = contractPrincipalObj; subaccount = null : ?[Nat8] };
      
      let allowanceArgs = {
        account = buyerAccount;
        spender = contractAccount;
      };
      
      let allowanceResponse = await ledger.icrc2_allowance(allowanceArgs);
      let currentAllowancePico = unitsToPico(allowanceResponse.allowance);
      let requiredAmountPico = price;
      
      let hasSufficientApproval = currentAllowancePico >= requiredAmountPico;
      
      let approvalMessage = if (hasSufficientApproval) {
        "✅ Sufficient approval! You can purchase this NFT."
      } else {
        "❌ Need to approve " # Nat.toText(requiredAmountPico - currentAllowancePico) # " more PiCO tokens before purchase."
      };
      
      #ok({
        has_sufficient_approval = hasSufficientApproval;
        current_allowance_pico = currentAllowancePico;
        required_amount_pico = requiredAmountPico;
        approval_message = approvalMessage;
      })
    } catch (e) {
      #err("❌ Error checking approval: " # Error.message(e))
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
  
  // Get forum transaction history
  public query func getForumTransactionHistory(forumId : Nat) : async [OperationalTransaction] {
    let forumTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        switch (tx.forum_id) {
          case (?id) { id == forumId };
          case null { false };
        }
      }
    );
    forumTxs
  };
  
  // Get all forum-related transactions
  public query func getAllForumTransactions() : async [OperationalTransaction] {
    let forumTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        switch (tx.forum_id) {
          case (?_) { true };
          case null { false };
        }
      }
    );
    forumTxs
  };
  
  // Get NFT transactions by forum ID
  public query func getNFTTransactionsByForum(forumId : Nat) : async [OperationalTransaction] {
    let forumNFTTxs = Array.filter<OperationalTransaction>(
      Iter.toArray(transactions.vals()),
      func(tx : OperationalTransaction) : Bool {
        let hasNFT = switch (tx.nft_id) {
          case (?_) { true };
          case null { false };
        };
        let hasForumId = switch (tx.forum_id) {
          case (?id) { id == forumId };
          case null { false };
        };
        hasNFT and hasForumId
      }
    );
    forumNFTTxs
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
  
  // ADMIN FUNCTIONS
  
  // Check if user is admin (you can modify this logic)
  public query func isUserAdmin(userPrincipal : Text) : async Bool {
    // For now, the minter principal is admin
    userPrincipal == MINTER_PRINCIPAL
  };
  
  // Get all token holders with their balances (admin only)
  public func getAllTokenHoldersWithBalances() : async Result.Result<[(Text, Nat)], Text> {
    try {
      let holders = Iter.toArray(tokenHolders.keys());
      var holdersWithBalances : [(Text, Nat)] = [];
      
      for (holder in holders.vals()) {
        let holderPrincipalObj = Principal.fromText(holder);
        let holderAccount = { owner = holderPrincipalObj; subaccount = null : ?[Nat8] };
        let balance = await ledger.icrc1_balance_of(holderAccount);
        let balanceInPico = unitsToPico(balance); // Use centralized conversion
        holdersWithBalances := Array.append(holdersWithBalances, [(holder, balanceInPico)]);
      };
      
      #ok(holdersWithBalances)
    } catch (e) {
      #err("❌ Error getting balances: " # Error.message(e))
    }
  };
  
  // Get total supply info
  public func getTotalSupplyInfo() : async Result.Result<{holders_count: Nat; minter_balance: Nat}, Text> {
    try {
      let holdersCount = tokenHolders.size();
      
      // Get minter balance as a proxy for total distributed tokens
      let minterPrincipalObj = Principal.fromText(MINTER_PRINCIPAL);
      let minterAccount = { owner = minterPrincipalObj; subaccount = null : ?[Nat8] };
      let minterBalance = await ledger.icrc1_balance_of(minterAccount);
      
      #ok({
        holders_count = holdersCount;
        minter_balance = unitsToPico(minterBalance); // Use centralized conversion
      })
    } catch (e) {
      #err("❌ Error getting supply info: " # Error.message(e))
    }
  };
  
  // UTILITY FUNCTIONS (restored)
  
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
      admin_principal = MINTER_PRINCIPAL; // Using minter as admin for now
      ledger_canister = LEDGER_CANISTER_ID;
    }
  };
  
  // Get all registered token holders
  public query func getAllTokenHolders() : async [Text] {
    Iter.toArray(tokenHolders.keys())
  };
  
  // Add a user to token holders registry
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
