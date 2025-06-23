import Map "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import OpenAI "openai";

actor class NFT() = {

    // Types
    public type Account = {
        owner : Principal;
        subaccount : ?Blob;
    };

    public type Value = {
        #Nat : Nat;
        #Int : Int; 
        #Text : Text;
        #Blob : Blob;
    };

    public type Metadata = [(Text, Value)];

    public type NFTInfo = {
        nft_id: Nat;
        principal_id: Principal;
        image_bytes: ?Blob;
        image_url: ?Text;
        name: Text;
        description: Text;
        token_price: Nat; // in tokens, not decimal for simplicity
        traits: Metadata; // dynamic label:value pairs
        created_by: CreatedBy;
        created_at: Int;
    };

    public type CreatedBy = {
        #GeneratedByAI;
        #SelfMade;
    };

    public type OpenAIRequest = {
        prompt: Text;
        size: Text; // "1024x1024", "1792x1024", "1024x1792"
        quality: Text; // "standard" or "hd"
        n: Nat; // number of images
    };

    public type MintNFTArgs = {
        to: Account;
        name: Text;
        description: Text;
        token_price: Nat;
        traits: Metadata;
        image_bytes: ?Blob;
        image_url: ?Text;
        created_by: CreatedBy;
    };

    public type MintError = {
        #Unauthorized;
        #InvalidRecipient;
        #GenericError: { error_code: Nat; message: Text };
    };

    public type TransferArgs = {
        from_subaccount: ?Blob;
        to: Account;
        token_id: Nat;
        memo: ?Blob;
        created_at_time: ?Nat64;
    };

    public type TransferError = {
        #Unauthorized;
        #NonExistentTokenId;
        #InvalidRecipient;
        #GenericError: { error_code: Nat; message: Text };
    };

    public type FilterArgs = {
        owner: ?Principal;
        name_contains: ?Text;
        created_by: ?CreatedBy;
        price_min: ?Nat;
        price_max: ?Nat;
        limit: ?Nat;
        offset: ?Nat;
    };

    // State variables
    private stable var nextTokenId: Nat = 1;
    private stable var nftEntries: [(Nat, NFTInfo)] = [];
    private stable var ownersEntries: [(Nat, Account)] = [];
    private stable var balanceEntries: [(Account, Nat)] = [];
    
    private var nfts = Map.HashMap<Nat, NFTInfo>(0, Nat.equal, Nat.hash);
    private var owners = Map.HashMap<Nat, Account>(0, Nat.equal, Nat.hash);
    private var balances = Map.HashMap<Account, Nat>(0, accountEqual, accountHash);

    // System functions for stable storage
    system func preupgrade() {
        nftEntries := Iter.toArray(nfts.entries());
        ownersEntries := Iter.toArray(owners.entries());
        balanceEntries := Iter.toArray(balances.entries());
    };

    system func postupgrade() {
        nfts := Map.fromIter<Nat, NFTInfo>(nftEntries.vals(), nftEntries.size(), Nat.equal, Nat.hash);
        owners := Map.fromIter<Nat, Account>(ownersEntries.vals(), ownersEntries.size(), Nat.equal, Nat.hash);
        balances := Map.fromIter<Account, Nat>(balanceEntries.vals(), balanceEntries.size(), accountEqual, accountHash);
        nftEntries := [];
        ownersEntries := [];
        balanceEntries := [];
    };

    // Helper functions
    private func accountEqual(a1: Account, a2: Account): Bool {
        Principal.equal(a1.owner, a2.owner) and a1.subaccount == a2.subaccount
    };

    private func accountHash(account: Account): Nat32 {
        Principal.hash(account.owner)
    };

    private func incrementBalance(account: Account) {
        let currentBalance = Option.get(balances.get(account), 0);
        balances.put(account, currentBalance + 1);
    };

    private func decrementBalance(account: Account) {
        let currentBalance = Option.get(balances.get(account), 0);
        if (currentBalance > 0) {
            balances.put(account, currentBalance - 1);
        };
    };

    // ICRC-7 Standard Methods

    // icrc7_collection_metadata
    public query func icrc7_collection_metadata(): async Metadata {
        [
            ("icrc7:name", #Text("Pico NFT Collection")),
            ("icrc7:symbol", #Text("PICO")),
            ("icrc7:description", #Text("AI-powered NFT collection with dynamic metadata")),
            ("icrc7:logo", #Text("https://example.com/logo.png")),
            ("icrc7:total_supply", #Nat(nextTokenId - 1)),
            ("icrc7:supply_cap", #Nat(1000000)),
        ]
    };

    // icrc7_name
    public query func icrc7_name(): async Text {
        "Pico NFT Collection"
    };

    // icrc7_symbol  
    public query func icrc7_symbol(): async Text {
        "PICO"
    };

    // icrc7_total_supply
    public query func icrc7_total_supply(): async Nat {
        nextTokenId - 1
    };

    // icrc7_supply_cap
    public query func icrc7_supply_cap(): async ?Nat {
        ?1000000
    };

    // icrc7_metadata
    public query func icrc7_metadata(token_ids: [Nat]): async [?Metadata] {
        Array.map<Nat, ?Metadata>(token_ids, func(token_id: Nat): ?Metadata {
            switch (nfts.get(token_id)) {
                case (?nft) {
                    let baseMetadata: Metadata = [
                        ("icrc7:name", #Text(nft.name)),
                        ("icrc7:description", #Text(nft.description)), 
                        ("icrc7:image", switch(nft.image_url) {
                            case (?url) #Text(url);
                            case null #Text("data:image/png;base64,");
                        }),
                        ("created_by", switch(nft.created_by) {
                            case (#GeneratedByAI) #Text("generated-by-ai");
                            case (#SelfMade) #Text("self-made");
                        }),
                        ("token_price", #Nat(nft.token_price)),
                        ("created_at", #Int(nft.created_at)),
                    ];
                    // Merge with dynamic traits
                    let fullMetadata = Array.append(baseMetadata, nft.traits);
                    ?fullMetadata
                };
                case null null;
            }
        })
    };

    // icrc7_owner_of
    public query func icrc7_owner_of(token_ids: [Nat]): async [?Account] {
        Array.map<Nat, ?Account>(token_ids, func(token_id: Nat): ?Account {
            owners.get(token_id)
        })
    };

    // icrc7_balance_of
    public query func icrc7_balance_of(accounts: [Account]): async [Nat] {
        Array.map<Account, Nat>(accounts, func(account: Account): Nat {
            Option.get(balances.get(account), 0)
        })
    };

    // icrc7_tokens
    public query func icrc7_tokens(prev: ?Nat, take: ?Nat): async [Nat] {
        let startId = Option.get(prev, 0) + 1;
        let limit = Option.get(take, 100);
        let endId = Nat.min(startId + limit - 1, nextTokenId - 1);
        
        var tokens: [Nat] = [];
        var i = startId;
        while (i <= endId) {
            tokens := Array.append(tokens, [i]);
            i += 1;
        };
        tokens
    };

    // icrc7_tokens_of
    public query func icrc7_tokens_of(account: Account, prev: ?Nat, take: ?Nat): async [Nat] {
        let limit = Option.get(take, 100);
        var tokens: [Nat] = [];
        var count = 0;
        var startFound = Option.isNull(prev);
        
        for ((tokenId, owner) in owners.entries()) {
            if (accountEqual(owner, account)) {
                if (startFound) {
                    if (count < limit) {
                        tokens := Array.append(tokens, [tokenId]);
                        count += 1;
                    } else {
                        break;
                    };
                } else if (Option.get(prev, 0) == tokenId) {
                    startFound := true;
                };
            };
        };
        tokens
    };

    // icrc7_transfer
    public func icrc7_transfer(args: [TransferArgs]): async [?TransferError] {
        let caller = msg.caller;
        
        Array.map<TransferArgs, ?TransferError>(args, func(arg: TransferArgs): ?TransferError {
            // Check if token exists and caller owns it
            switch (owners.get(arg.token_id)) {
                case (?currentOwner) {
                    if (not accountEqual(currentOwner, { owner = caller; subaccount = arg.from_subaccount })) {
                        return ?#Unauthorized;
                    };
                    
                    // Update ownership
                    owners.put(arg.token_id, arg.to);
                    decrementBalance(currentOwner);
                    incrementBalance(arg.to);
                    
                    null // Success
                };
                case null {
                    ?#NonExistentTokenId
                };
            }
        })
    };

    // Custom Methods for NFT Management

    // Mint NFT (both AI-generated and manual)
    public func mint_nft(args: MintNFTArgs): async Result.Result<Nat, MintError> {
        let caller = msg.caller;
        let tokenId = nextTokenId;
        nextTokenId += 1;

        let nft: NFTInfo = {
            nft_id = tokenId;
            principal_id = args.to.owner;
            image_bytes = args.image_bytes;
            image_url = args.image_url;
            name = args.name;
            description = args.description;
            token_price = args.token_price;
            traits = args.traits;
            created_by = args.created_by;
            created_at = Time.now();
        };

        nfts.put(tokenId, nft);
        owners.put(tokenId, args.to);
        incrementBalance(args.to);

        #ok(tokenId)
    };

    // Generate AI Image using OpenAI API
    public func generate_ai_image(request: OpenAIRequest): async Result.Result<Text, Text> {
        try {
            // Convert our request to OpenAI format
            let openaiRequest = OpenAI.createImageRequest(
                request.prompt,
                ?request.size,
                ?request.quality,
                null // using default model (dall-e-3)
            );
            
            // For production, you need to provide a real API key
            // This is a placeholder - in real implementation, store the API key securely
            let apiKey = "your-openai-api-key-here"; // Replace with actual API key
            
            // Use the real OpenAI API
            let result = await OpenAI.generateImage(apiKey, openaiRequest);
            switch (result) {
                case (#ok(imageUrl)) #ok(imageUrl);
                case (#err(error)) #err(error);
            }
        } catch (error) {
            #err("Failed to generate AI image: " # Error.message(error))
        }
    };

    // Generate AI Image with API Key (for production use)
    public func generate_ai_image_with_key(request: OpenAIRequest, apiKey: Text): async Result.Result<Text, Text> {
        try {
            let openaiRequest = OpenAI.createImageRequest(
                request.prompt,
                ?request.size,
                ?request.quality,
                null
            );
            
            let result = await OpenAI.generateImage(apiKey, openaiRequest);
            switch (result) {
                case (#ok(imageUrl)) #ok(imageUrl);
                case (#err(error)) #err(error);
            }
        } catch (error) {
            #err("Failed to generate AI image: " # Error.message(error))
        }
    };

    // List NFTs with filtering
    public query func list_nfts(filter: FilterArgs): async [NFTInfo] {
        let limit = Option.get(filter.limit, 100);
        let offset = Option.get(filter.offset, 0);
        
        var results: [NFTInfo] = [];
        var count = 0;
        var processed = 0;

        for ((tokenId, nft) in nfts.entries()) {
            // Apply filters
            var include = true;
            
            // Filter by owner
            if (Option.isSome(filter.owner)) {
                if (not Principal.equal(nft.principal_id, Option.get(filter.owner, Principal.fromText("aaaaa-aa")))) {
                    include := false;
                };
            };
            
            // Filter by name contains
            if (Option.isSome(filter.name_contains) and include) {
                let searchTerm = Option.get(filter.name_contains, "");
                if (not Text.contains(nft.name, #text searchTerm)) {
                    include := false;
                };
            };
            
            // Filter by created_by
            if (Option.isSome(filter.created_by) and include) {
                switch (filter.created_by, nft.created_by) {
                    case (?#GeneratedByAI, #GeneratedByAI) {};
                    case (?#SelfMade, #SelfMade) {};
                    case _ { include := false; };
                };
            };
            
            // Filter by price range
            if (Option.isSome(filter.price_min) and include) {
                if (nft.token_price < Option.get(filter.price_min, 0)) {
                    include := false;
                };
            };
            
            if (Option.isSome(filter.price_max) and include) {
                if (nft.token_price > Option.get(filter.price_max, 0)) {
                    include := false;
                };
            };
            
            if (include) {
                if (processed >= offset) {
                    if (count < limit) {
                        results := Array.append(results, [nft]);
                        count += 1;
                    } else {
                        break;
                    };
                };
                processed += 1;
            };
        };
        
        results
    };

    // Get NFT by ID
    public query func get_nft(token_id: Nat): async ?NFTInfo {
        nfts.get(token_id)
    };

    // Get NFTs by Principal (user's NFTs)
    public query func get_nfts_by_principal(principal_id: Principal): async [NFTInfo] {
        var results: [NFTInfo] = [];
        
        for ((tokenId, nft) in nfts.entries()) {
            if (Principal.equal(nft.principal_id, principal_id)) {
                results := Array.append(results, [nft]);
            };
        };
        
        results
    };

    // Update NFT metadata (only owner can update)
    public func update_nft_metadata(token_id: Nat, new_traits: Metadata, new_price: ?Nat): async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (nfts.get(token_id)) {
            case (?nft) {
                if (not Principal.equal(caller, nft.principal_id)) {
                    return #err("Unauthorized: Only owner can update NFT");
                };
                
                let updatedPrice = Option.get(new_price, nft.token_price);
                let updatedNft: NFTInfo = {
                    nft_id = nft.nft_id;
                    principal_id = nft.principal_id;
                    image_bytes = nft.image_bytes;
                    image_url = nft.image_url;
                    name = nft.name;
                    description = nft.description;
                    token_price = updatedPrice;
                    traits = new_traits;
                    created_by = nft.created_by;
                    created_at = nft.created_at;
                };
                
                nfts.put(token_id, updatedNft);
                #ok(())
            };
            case null {
                #err("NFT not found")
            };
        }
    };

    // Search NFTs by name
    public query func search_nfts(query: Text, limit: ?Nat): async [NFTInfo] {
        let searchLimit = Option.get(limit, 50);
        var results: [NFTInfo] = [];
        var count = 0;
        
        for ((tokenId, nft) in nfts.entries()) {
            if (count >= searchLimit) break;
            
            if (Text.contains(nft.name, #text query) or Text.contains(nft.description, #text query)) {
                results := Array.append(results, [nft]);
                count += 1;
            };
        };
        
        results
    };

    // Get collection statistics
    public query func get_collection_stats(): async {
        total_nfts: Nat;
        ai_generated: Nat;
        self_made: Nat;
        total_owners: Nat;
    } {
        var aiGenerated = 0;
        var selfMade = 0;
        var uniqueOwners = Map.HashMap<Principal, Bool>(0, Principal.equal, Principal.hash);
        
        for ((tokenId, nft) in nfts.entries()) {
            switch (nft.created_by) {
                case (#GeneratedByAI) { aiGenerated += 1; };
                case (#SelfMade) { selfMade += 1; };
            };
            uniqueOwners.put(nft.principal_id, true);
        };
        
        {
            total_nfts = nextTokenId - 1;
            ai_generated = aiGenerated;
            self_made = selfMade;
            total_owners = uniqueOwners.size();
        }
    };
} 