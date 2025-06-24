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
import OpenAI "openai";

actor PicoBackend {

    // Types
    public type Trait = {
        trait_type: Text;
        value: Text;
        rarity: ?Text; // Optional: "Common", "Rare", "Epic", "Legendary"
    };

    public type NFTInfo = {
        nft_id: Nat;
        owner: Principal;
        name: Text;
        description: Text;
        price: Nat;
        image_url: Text;
        is_ai_generated: Bool;
        traits: [Trait];
        created_at: Int;
    };

    public type AIImageResult = {
        image_url: Text;
        suggested_traits: [Trait];
    };

    // Hash function for Nat
    private func natHash(n: Nat): Hash.Hash = Nat32.fromNat(n % (2**32 - 1));

    // State
    private stable var nextTokenId: Nat = 1;
    private stable var nftEntries: [(Nat, NFTInfo)] = [];
    
    // OpenAI API Key - will be set during deployment automatically
    private stable var openaiApiKey: ?Text = null;
    
    private var nfts = HashMap.HashMap<Nat, NFTInfo>(10, Nat.equal, natHash);

    // System functions
    system func preupgrade() {
        nftEntries := Iter.toArray(nfts.entries());
    };

    system func postupgrade() {
        nfts := HashMap.fromIter<Nat, NFTInfo>(nftEntries.vals(), nftEntries.size(), Nat.equal, natHash);
        nftEntries := [];
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

    // NFT Functions
    public func mint_nft(
        to: Principal,
        name: Text, 
        description: Text, 
        price: Nat, 
        image_url: Text, 
        is_ai_generated: Bool,
        traits: [Trait]
    ): async Result.Result<Nat, Text> {
        let tokenId = nextTokenId;
        nextTokenId += 1;

        let nft: NFTInfo = {
            nft_id = tokenId;
            owner = to;
            name = name;
            description = description;
            price = price;
            image_url = image_url;
            is_ai_generated = is_ai_generated;
            traits = traits;
            created_at = Time.now();
        };

        nfts.put(tokenId, nft);
        #ok(tokenId)
    };

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

    public func generate_ai_image_with_traits(prompt: Text): async Result.Result<AIImageResult, Text> {
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

    // Legacy function for backward compatibility
    public func generate_ai_image(prompt: Text): async Result.Result<Text, Text> {
        let result = await generate_ai_image_with_traits(prompt);
        switch (result) {
            case (#ok(aiResult)) #ok(aiResult.image_url);
            case (#err(error)) #err(error);
        }
    };

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

    public query func get_nfts_by_owner(owner: Principal): async [NFTInfo] {
        var results: [NFTInfo] = [];
        for ((tokenId, nft) in nfts.entries()) {
            if (Principal.equal(nft.owner, owner)) {
                results := Array.append(results, [nft]);
            };
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

    public query func total_supply(): async Nat {
        nextTokenId - 1
    };

    public query func collection_name(): async Text {
        "Pico NFT Collection"
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

    // Original greeting function (for testing)
  public query func greet(name : Text) : async Text {
    return "Hello My Name is: " # name # "!";
  };

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
};

