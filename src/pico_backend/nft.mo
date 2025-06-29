import Principal "mo:base/Principal";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Hash "mo:base/Hash";
import Error "mo:base/Error";
import Blob "mo:base/Blob";
import OpenAI "openai";
import Config "config";

actor class NFT() = {

    // ICRC-7 Standard Types
    public type Account = {
        owner: Principal;
        subaccount: ?Blob;
    };

    public type Value = {
        #Nat: Nat;
        #Int: Int;
        #Text: Text;
        #Blob: Blob;
    };

    public type Metadata = [(Text, Value)];

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

    // NFT Specific Types
    public type Trait = {
        trait_type: Text;
        value: Text;
        rarity: ?Text; // Optional: "Common", "Rare", "Epic", "Legendary", "Special"
    };

    public type NFTInfo = {
        nft_id: Nat;
        owner: Principal;
        name: Text;
        description: Text;
        price: Nat;
        image_url: Text;
        is_ai_generated: Bool;
        is_for_sale: Bool; // Add sale status tracking
        traits: [Trait];
        created_at: Int;
    };

    public type AIImageResult = {
        image_url: Text;
        suggested_traits: [Trait];
    };

    public type MintError = {
        #Unauthorized;
        #InvalidRecipient;
        #GenericError: { error_code: Nat; message: Text };
    };

    public type SaleError = {
        #Unauthorized;
        #NonExistentTokenId;
        #NotForSale;
        #SelfPurchase;
        #AlreadyOwned;
        #GenericError: { error_code: Nat; message: Text };
    };

    // Hash functions
    private func natHash(n: Nat): Hash.Hash = Nat32.fromNat(n % (2**32 - 1));

    private func accountEqual(a1: Account, a2: Account): Bool {
        Principal.equal(a1.owner, a2.owner) and a1.subaccount == a2.subaccount
    };

    private func accountHash(account: Account): Hash.Hash {
        Principal.hash(account.owner)
    };

    private func principalToAccount(p: Principal): Account {
        { owner = p; subaccount = null }
    };

    // State variables
    private stable var nextTokenId: Nat = 1;
    private stable var nftEntries: [(Nat, NFTInfo)] = [];
    private stable var ownersEntries: [(Nat, Account)] = [];
    private stable var balanceEntries: [(Account, Nat)] = [];
    private stable var openaiApiKey: ?Text = null;
    
    private var nfts = HashMap.HashMap<Nat, NFTInfo>(10, Nat.equal, natHash);
    private var owners = HashMap.HashMap<Nat, Account>(10, Nat.equal, natHash);
    private var balances = HashMap.HashMap<Account, Nat>(10, accountEqual, accountHash);

    // System functions for stable storage
    system func preupgrade() {
        nftEntries := Iter.toArray(nfts.entries());
        ownersEntries := Iter.toArray(owners.entries());
        balanceEntries := Iter.toArray(balances.entries());
    };

    system func postupgrade() {
        nfts := HashMap.fromIter<Nat, NFTInfo>(nftEntries.vals(), nftEntries.size(), Nat.equal, natHash);
        owners := HashMap.fromIter<Nat, Account>(ownersEntries.vals(), ownersEntries.size(), Nat.equal, natHash);
        balances := HashMap.fromIter<Account, Nat>(balanceEntries.vals(), balanceEntries.size(), accountEqual, accountHash);
        nftEntries := [];
        ownersEntries := [];
        balanceEntries := [];
    };

    // Helper functions
    private func incrementBalance(account: Account) {
        let currentBalance = switch (balances.get(account)) {
            case (?balance) balance;
            case null 0;
        };
        balances.put(account, currentBalance + 1);
    };

    private func decrementBalance(account: Account) {
        let currentBalance = switch (balances.get(account)) {
            case (?balance) balance;
            case null 0;
        };
        if (currentBalance > 0) {
            balances.put(account, currentBalance - 1);
        };
    };

    // Helper function to convert traits to ICRC-7 metadata format
    private func traitsToMetadata(traits: [Trait]): Metadata {
        Array.map<Trait, (Text, Value)>(traits, func(trait: Trait): (Text, Value) {
            (trait.trait_type, #Text(trait.value))
        })
    };

    // AI Trait Generation Helper
    private func generateTraitsFromPrompt(prompt: Text): [Trait] {
        var traits: [Trait] = [];
        let lowercasePrompt = Text.toLowercase(prompt);

        // Style detection
        if (Text.contains(lowercasePrompt, #text "cyberpunk")) {
            traits := Array.append(traits, [{ trait_type = "Style"; value = "Cyberpunk"; rarity = ?"Rare" }]);
        } else if (Text.contains(lowercasePrompt, #text "fantasy")) {
            traits := Array.append(traits, [{ trait_type = "Style"; value = "Fantasy"; rarity = ?"Rare" }]);
        } else if (Text.contains(lowercasePrompt, #text "realistic")) {
            traits := Array.append(traits, [{ trait_type = "Style"; value = "Realistic"; rarity = ?"Common" }]);
        } else if (Text.contains(lowercasePrompt, #text "abstract")) {
            traits := Array.append(traits, [{ trait_type = "Style"; value = "Abstract"; rarity = ?"Epic" }]);
        } else if (Text.contains(lowercasePrompt, #text "anime") or Text.contains(lowercasePrompt, #text "manga")) {
            traits := Array.append(traits, [{ trait_type = "Style"; value = "Anime"; rarity = ?"Rare" }]);
        } else {
            traits := Array.append(traits, [{ trait_type = "Style"; value = "Digital Art"; rarity = ?"Common" }]);
        };

        // Color palette detection
        if (Text.contains(lowercasePrompt, #text "neon") or Text.contains(lowercasePrompt, #text "bright")) {
            traits := Array.append(traits, [{ trait_type = "Color Palette"; value = "Neon"; rarity = ?"Rare" }]);
        } else if (Text.contains(lowercasePrompt, #text "dark") or Text.contains(lowercasePrompt, #text "black")) {
            traits := Array.append(traits, [{ trait_type = "Color Palette"; value = "Dark"; rarity = ?"Common" }]);
        } else if (Text.contains(lowercasePrompt, #text "colorful") or Text.contains(lowercasePrompt, #text "rainbow")) {
            traits := Array.append(traits, [{ trait_type = "Color Palette"; value = "Rainbow"; rarity = ?"Epic" }]);
        } else if (Text.contains(lowercasePrompt, #text "blue")) {
            traits := Array.append(traits, [{ trait_type = "Color Palette"; value = "Blue Tones"; rarity = ?"Common" }]);
        } else if (Text.contains(lowercasePrompt, #text "red")) {
            traits := Array.append(traits, [{ trait_type = "Color Palette"; value = "Red Tones"; rarity = ?"Common" }]);
        } else if (Text.contains(lowercasePrompt, #text "gold") or Text.contains(lowercasePrompt, #text "golden")) {
            traits := Array.append(traits, [{ trait_type = "Color Palette"; value = "Golden"; rarity = ?"Legendary" }]);
        } else {
            traits := Array.append(traits, [{ trait_type = "Color Palette"; value = "Natural"; rarity = ?"Common" }]);
        };

        // Theme detection
        if (Text.contains(lowercasePrompt, #text "space") or Text.contains(lowercasePrompt, #text "cosmic") or Text.contains(lowercasePrompt, #text "galaxy")) {
            traits := Array.append(traits, [{ trait_type = "Theme"; value = "Space"; rarity = ?"Rare" }]);
        } else if (Text.contains(lowercasePrompt, #text "nature") or Text.contains(lowercasePrompt, #text "forest") or Text.contains(lowercasePrompt, #text "tree")) {
            traits := Array.append(traits, [{ trait_type = "Theme"; value = "Nature"; rarity = ?"Common" }]);
        } else if (Text.contains(lowercasePrompt, #text "city") or Text.contains(lowercasePrompt, #text "urban") or Text.contains(lowercasePrompt, #text "building")) {
            traits := Array.append(traits, [{ trait_type = "Theme"; value = "Urban"; rarity = ?"Common" }]);
        } else if (Text.contains(lowercasePrompt, #text "ocean") or Text.contains(lowercasePrompt, #text "sea") or Text.contains(lowercasePrompt, #text "water")) {
            traits := Array.append(traits, [{ trait_type = "Theme"; value = "Ocean"; rarity = ?"Rare" }]);
        } else if (Text.contains(lowercasePrompt, #text "dragon") or Text.contains(lowercasePrompt, #text "magic") or Text.contains(lowercasePrompt, #text "wizard")) {
            traits := Array.append(traits, [{ trait_type = "Theme"; value = "Mythical"; rarity = ?"Epic" }]);
        } else {
            traits := Array.append(traits, [{ trait_type = "Theme"; value = "Artistic"; rarity = ?"Common" }]);
        };

        // Complexity detection
        if (Text.contains(lowercasePrompt, #text "detailed") or Text.contains(lowercasePrompt, #text "intricate") or Text.contains(lowercasePrompt, #text "complex")) {
            traits := Array.append(traits, [{ trait_type = "Complexity"; value = "High Detail"; rarity = ?"Epic" }]);
        } else if (Text.contains(lowercasePrompt, #text "simple") or Text.contains(lowercasePrompt, #text "minimal")) {
            traits := Array.append(traits, [{ trait_type = "Complexity"; value = "Minimalist"; rarity = ?"Rare" }]);
        } else {
            traits := Array.append(traits, [{ trait_type = "Complexity"; value = "Balanced"; rarity = ?"Common" }]);
        };

        // AI Generation marker
        traits := Array.append(traits, [{ trait_type = "Generation"; value = "AI Created"; rarity = ?"Special" }]);

        traits
    };

    // ICRC-7 Standard Functions

    // icrc7_collection_metadata
    public query func icrc7_collection_metadata(): async Metadata {
        [
            ("icrc7:name", #Text("PiCO NFT Collection")),
            ("icrc7:symbol", #Text("PiCO")),
            ("icrc7:description", #Text("AI-powered NFT collection with dynamic traits")),
            ("icrc7:logo", #Text("https://example.com/logo.png")),
            ("icrc7:total_supply", #Nat(nextTokenId - 1)),
            ("icrc7:supply_cap", #Nat(Config.NFT_COLLECTION_SUPPLY_CAP)),
        ]
    };

    // icrc7_name
    public query func icrc7_name(): async Text {
        "PiCO NFT Collection"
    };

    // icrc7_symbol
    public query func icrc7_symbol(): async Text {
        "PiCO"
    };

    // icrc7_total_supply
    public query func icrc7_total_supply(): async Nat {
        nextTokenId - 1
    };

    // icrc7_supply_cap
    public query func icrc7_supply_cap(): async ?Nat {
        ?Config.NFT_COLLECTION_SUPPLY_CAP
    };

    // icrc7_metadata
    public query func icrc7_metadata(token_ids: [Nat]): async [?Metadata] {
        Array.map<Nat, ?Metadata>(token_ids, func(token_id: Nat): ?Metadata {
            switch (nfts.get(token_id)) {
                case (?nft) {
                    let baseMetadata: Metadata = [
                        ("icrc7:name", #Text(nft.name)),
                        ("icrc7:description", #Text(nft.description)),
                        ("icrc7:image", #Text(nft.image_url)),
                        ("price", #Nat(nft.price)),
                        ("is_ai_generated", #Text(if (nft.is_ai_generated) "true" else "false")),
                        ("created_at", #Int(nft.created_at)),
                    ];
                    let traitMetadata = traitsToMetadata(nft.traits);
                    let fullMetadata = Array.append(baseMetadata, traitMetadata);
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
            switch (balances.get(account)) {
                case (?balance) balance;
                case null 0;
            }
        })
    };

    // icrc7_tokens
    public query func icrc7_tokens(prev: ?Nat, take: ?Nat): async [Nat] {
        let startId = switch (prev) {
            case (?p) p + 1;
            case null 1;
        };
        let limit = switch (take) {
            case (?t) t;
            case null 100;
        };
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
        let limit = switch (take) {
            case (?t) t;
            case null 100;
        };
        var tokens: [Nat] = [];
        var count = 0;
        var startFound = switch (prev) {
            case null true;
            case (?_) false;
        };
        
        for ((tokenId, owner) in owners.entries()) {
            if (accountEqual(owner, account)) {
                if (startFound) {
                    if (count < limit) {
                        tokens := Array.append(tokens, [tokenId]);
                        count += 1;
                    } else {
                        return tokens;
                    };
                } else {
                    switch (prev) {
                        case (?p) {
                            if (p == tokenId) {
                                startFound := true;
                            };
                        };
                        case null {};
                    };
                };
            };
        };
        tokens
    };

    // icrc7_transfer
    public shared(msg) func icrc7_transfer(args: [TransferArgs]): async [?TransferError] {
        let caller = msg.caller;
        
        Array.map<TransferArgs, ?TransferError>(args, func(arg: TransferArgs): ?TransferError {
            // Check if token exists and caller owns it
            switch (owners.get(arg.token_id)) {
                case (?currentOwner) {
                    let callerAccount = { owner = caller; subaccount = arg.from_subaccount };
                    if (not accountEqual(currentOwner, callerAccount)) {
                        return ?#Unauthorized;
                    };
                    
                    // Update ownership
                    owners.put(arg.token_id, arg.to);
                    decrementBalance(currentOwner);
                    incrementBalance(arg.to);
                    
                    // Update NFT owner field for backward compatibility
                    switch (nfts.get(arg.token_id)) {
                        case (?nft) {
                            let updatedNft: NFTInfo = {
                                nft_id = nft.nft_id;
                                owner = arg.to.owner;
                                name = nft.name;
                                description = nft.description;
                                price = nft.price;
                                image_url = nft.image_url;
                                is_ai_generated = nft.is_ai_generated;
                                is_for_sale = nft.is_for_sale;
                                traits = nft.traits;
                                created_at = nft.created_at;
                            };
                            nfts.put(arg.token_id, updatedNft);
                        };
                        case null {};
                    };
                    
                    null // Success
                };
                case null {
                    ?#NonExistentTokenId
                };
            }
        })
    };

    // OpenAI Integration Functions

    // Initialize OpenAI API Key from environment (called during deployment)
    public func init_openai_api_key(apiKey: Text): async Result.Result<(), Text> {
        // Only allow initialization if key is not already set
        switch (openaiApiKey) {
            case (null) {
                openaiApiKey := ?apiKey;
                #ok(())
            };
            case (?_) {
                #err("OpenAI API key already initialized")
            };
        }
    };

    // Generate AI image with suggested traits
    public func generate_ai_image(prompt: Text): async Result.Result<AIImageResult, Text> {
        // Check if API key is set
        switch (openaiApiKey) {
            case (null) {
                #err("OpenAI API key not set. Please set the API key first.")
            };
            case (?apiKey) {
                try {
                    // Create OpenAI request with default settings
                    let openaiRequest = OpenAI.createImageRequest(
                        prompt,
                        ?"1024x1024", // size
                        ?"standard",  // quality
                        null         // use default model (dall-e-3)
                    );
                    
                    // Use the real OpenAI API
                    let result = await OpenAI.generateImage(apiKey, openaiRequest);
                    switch (result) {
                        case (#ok(imageUrl)) {
                            let suggestedTraits = generateTraitsFromPrompt(prompt);
                            #ok({
                                image_url = imageUrl;
                                suggested_traits = suggestedTraits;
                            })
                        };
                        case (#err(error)) #err(error);
                    }
                } catch (error) {
                    #err("Failed to generate AI image: " # Error.message(error))
                }
            };
        }
    };



    // NFT Management Functions

    // Mint NFT (enhanced version with ICRC-7 compliance)
    public func mint_nft(
        to: Principal,
        name: Text, 
        description: Text, 
        price: Nat, 
        image_url: Text, 
        is_ai_generated: Bool,
        traits: [Trait],
        for_sale: ?Bool
    ): async Result.Result<Nat, Text> {
        let tokenId = nextTokenId;
        nextTokenId += 1;
        let account = principalToAccount(to);

        // Default for_sale to true if not specified
        let isForSale = switch (for_sale) {
            case (?sale_status) sale_status;
            case null true; // Default to true (for sale)
        };

        let nft: NFTInfo = {
            nft_id = tokenId;
            owner = to;
            name = name;
            description = description;
            price = price;
            image_url = image_url;
            is_ai_generated = is_ai_generated;
            is_for_sale = isForSale;
            traits = traits;
            created_at = Time.now();
        };

        nfts.put(tokenId, nft);
        owners.put(tokenId, account);
        incrementBalance(account);
        #ok(tokenId)
    };

    // Query Functions

    public query func get_nft(token_id: Nat): async ?NFTInfo {
        nfts.get(token_id)
    };

    public query func list_all_nfts(): async [NFTInfo] {
        var results: [NFTInfo] = [];
        for ((tokenId, nft) in nfts.entries()) {
            results := Array.append(results, [nft]);
        };
        results
    };



    public query func get_ai_generated_nfts(): async [NFTInfo] {
        var results: [NFTInfo] = [];
        for ((tokenId, nft) in nfts.entries()) {
            if (nft.is_ai_generated) {
                results := Array.append(results, [nft]);
            };
        };
        results
    };





    public query func get_stats(): async {
        total_nfts: Nat;
        ai_generated: Nat;
        self_made: Nat;
    } {
        var total = 0;
        var aiGenerated = 0;
        var selfMade = 0;
        
        for ((tokenId, nft) in nfts.entries()) {
            total += 1;
            if (nft.is_ai_generated) {
                aiGenerated += 1;
            } else {
                selfMade += 1;
            };
        };
        
        {
            total_nfts = total;
            ai_generated = aiGenerated;
            self_made = selfMade;
        }
    };

    // Trait-based Query Functions

    public query func get_nfts_by_trait(traitType: Text, traitValue: Text): async [NFTInfo] {
        var results: [NFTInfo] = [];
        for ((tokenId, nft) in nfts.entries()) {
            for (trait in nft.traits.vals()) {
                if (trait.trait_type == traitType and trait.value == traitValue) {
                    results := Array.append(results, [nft]);
                };
            };
        };
        results
    };

    public query func get_nfts_by_rarity(rarity: Text): async [NFTInfo] {
        var results: [NFTInfo] = [];
        for ((tokenId, nft) in nfts.entries()) {
            for (trait in nft.traits.vals()) {
                switch (trait.rarity) {
                    case (?r) {
                        if (r == rarity) {
                            results := Array.append(results, [nft]);
                        };
                    };
                    case null {};
                };
            };
        };
        results
    };

    public query func get_all_trait_types(): async [Text] {
        var traitTypes: [Text] = [];
        for ((tokenId, nft) in nfts.entries()) {
            for (trait in nft.traits.vals()) {
                var exists = false;
                for (existingType in traitTypes.vals()) {
                    if (existingType == trait.trait_type) {
                        exists := true;
                    };
                };
                if (not exists) {
                    traitTypes := Array.append(traitTypes, [trait.trait_type]);
                };
            };
        };
        traitTypes
    };

    public query func get_trait_values(traitType: Text): async [Text] {
        var traitValues: [Text] = [];
        for ((tokenId, nft) in nfts.entries()) {
            for (trait in nft.traits.vals()) {
                if (trait.trait_type == traitType) {
                    var exists = false;
                    for (existingValue in traitValues.vals()) {
                        if (existingValue == trait.value) {
                            exists := true;
                        };
                    };
                    if (not exists) {
                        traitValues := Array.append(traitValues, [trait.value]);
                    };
                };
            };
        };
        traitValues
    };

    // AI-related functions
    
    // Set OpenAI API key (admin only)
    public func set_openai_api_key(key: Text): async Result.Result<(), Text> {
        // TODO: Add proper admin check here
        openaiApiKey := ?key;
        #ok(())
    };

    // Detect if an image is AI-generated using OpenAI Vision API
    public func detect_ai_generated(imageUrl: Text): async Result.Result<OpenAI.AIDetectionResponse, Text> {
        switch (openaiApiKey) {
            case (?key) {
                // Use real OpenAI API
                await OpenAI.detectAIGenerated(key, imageUrl);
            };
            case null {
                // Fall back to mock detection for testing
                let mockResult = await OpenAI.detectAIGeneratedMock(imageUrl);
                #ok(mockResult);
            };
        };
    };

    // Enhanced mint function that automatically detects AI generation
    public func mint_nft_with_ai_detection(
        to: Principal,
        name: Text, 
        description: Text, 
        price: Nat, 
        image_url: Text, 
        traits: [Trait]
    ): async Result.Result<{nft_id: Nat; ai_detection: OpenAI.AIDetectionResponse}, Text> {
        
        // First, detect if the image is AI-generated
        let aiDetectionResult = switch (openaiApiKey) {
            case (?key) {
                await OpenAI.detectAIGenerated(key, image_url);
            };
            case null {
                let mockResult = await OpenAI.detectAIGeneratedMock(image_url);
                #ok(mockResult);
            };
        };

        switch (aiDetectionResult) {
            case (#ok(aiDetection)) {
                // Mint the NFT with the detected AI status
                let mintResult = await mint_nft(
                    to, 
                    name, 
                    description, 
                    price, 
                    image_url, 
                    aiDetection.is_ai_generated, 
                    traits,
                    ?true
                );
                
                switch (mintResult) {
                    case (#ok(nftId)) {
                        #ok({
                            nft_id = nftId;
                            ai_detection = aiDetection;
                        });
                    };
                    case (#err(error)) {
                        #err("Minting failed: " # error);
                    };
                };
            };
            case (#err(error)) {
                // If AI detection fails, mint anyway but mark as unknown
                let mintResult = await mint_nft(
                    to, 
                    name, 
                    description, 
                    price, 
                    image_url, 
                    false, // Default to false if detection fails
                    traits,
                    ?true
                );
                
                switch (mintResult) {
                    case (#ok(nftId)) {
                        #ok({
                            nft_id = nftId;
                            ai_detection = {
                                is_ai_generated = false;
                                confidence = 0.0;
                                reasoning = "AI detection failed: " # error;
                            };
                        });
                    };
                    case (#err(mintError)) {
                        #err("Both AI detection and minting failed. AI error: " # error # ". Mint error: " # mintError);
                    };
                };
            };
        };
    };

    // NEW OWNERSHIP AND SALE STATUS METHODS

    // Check if a principal owns a specific NFT
    public query func check_ownership(token_id: Nat, principal_id: Principal): async Bool {
        switch (owners.get(token_id)) {
            case (?owner) {
                Principal.equal(owner.owner, principal_id)
            };
            case null false;
        }
    };

    // Get all NFTs owned by a specific principal
    public query func get_nfts_by_owner(owner_principal: Principal): async [NFTInfo] {
        var results: [NFTInfo] = [];
        for ((tokenId, nft) in nfts.entries()) {
            if (Principal.equal(nft.owner, owner_principal)) {
                results := Array.append(results, [nft]);
            };
        };
        results
    };

    // Get only NFTs that are for sale
    public query func get_nfts_for_sale(): async [NFTInfo] {
        var results: [NFTInfo] = [];
        for ((tokenId, nft) in nfts.entries()) {
            if (nft.is_for_sale) {
                results := Array.append(results, [nft]);
            };
        };
        results
    };

    // Toggle sale status of an NFT (only owner can call this)
    public shared(msg) func set_nft_for_sale(token_id: Nat, for_sale: Bool, new_price: ?Nat): async Result.Result<NFTInfo, Text> {
        let caller = msg.caller;
        
        switch (nfts.get(token_id)) {
            case (?nft) {
                // Check if caller owns the NFT
                if (not Principal.equal(nft.owner, caller)) {
                    return #err("❌ Unauthorized: Only the owner can change sale status");
                };

                let updatedPrice = switch (new_price) {
                    case (?price) price;
                    case null nft.price;
                };

                let updatedNft: NFTInfo = {
                    nft_id = nft.nft_id;
                    owner = nft.owner;
                    name = nft.name;
                    description = nft.description;
                    price = updatedPrice;
                    image_url = nft.image_url;
                    is_ai_generated = nft.is_ai_generated;
                    is_for_sale = for_sale;
                    traits = nft.traits;
                    created_at = nft.created_at;
                };

                nfts.put(token_id, updatedNft);
                #ok(updatedNft)
            };
            case null {
                #err("❌ NFT not found with ID: " # Nat.toText(token_id))
            };
        }
    };

    // Validate if a purchase is allowed
    public query func validate_purchase(token_id: Nat, buyer_principal: Principal): async Result.Result<{price: Nat; seller: Principal}, SaleError> {
        switch (nfts.get(token_id)) {
            case (?nft) {
                // Check if NFT is for sale
                if (not nft.is_for_sale) {
                    return #err(#NotForSale);
                };

                // Check if buyer is trying to buy their own NFT
                if (Principal.equal(nft.owner, buyer_principal)) {
                    return #err(#SelfPurchase);
                };

                #ok({
                    price = nft.price;
                    seller = nft.owner;
                })
            };
            case null {
                #err(#NonExistentTokenId)
            };
        }
    };

    // Complete NFT purchase (to be called by operational contract)
    public func complete_nft_purchase(token_id: Nat, new_owner: Principal): async Result.Result<NFTInfo, SaleError> {
        switch (nfts.get(token_id)) {
            case (?nft) {
                // Validate the purchase first
                switch (await validate_purchase(token_id, new_owner)) {
                    case (#ok(_)) {
                        // Transfer ownership using ICRC-7 standard
                        let newOwnerAccount = principalToAccount(new_owner);
                        let currentOwnerAccount = principalToAccount(nft.owner);
                        
                        // Update ownership maps
                        owners.put(token_id, newOwnerAccount);
                        decrementBalance(currentOwnerAccount);
                        incrementBalance(newOwnerAccount);

                        // Update NFT record
                        let updatedNft: NFTInfo = {
                            nft_id = nft.nft_id;
                            owner = new_owner;
                            name = nft.name;
                            description = nft.description;
                            price = nft.price;
                            image_url = nft.image_url;
                            is_ai_generated = nft.is_ai_generated;
                            is_for_sale = false; // Remove from sale after purchase
                            traits = nft.traits;
                            created_at = nft.created_at;
                        };

                        nfts.put(token_id, updatedNft);
                        #ok(updatedNft)
                    };
                    case (#err(error)) {
                        #err(error)
                    };
                }
            };
            case null {
                #err(#NonExistentTokenId)
            };
        }
    };

    // Legacy greeting function for testing
    public query func greet(name : Text) : async Text {
        return "Hello My Name is: " # name # "!";
    };
}; 