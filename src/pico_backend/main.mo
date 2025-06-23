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

actor PicoBackend {

    // Types
    public type NFTInfo = {
        nft_id: Nat;
        owner: Principal;
        name: Text;
        description: Text;
        price: Nat;
        image_url: Text;
        is_ai_generated: Bool;
        created_at: Int;
    };

    // Hash function for Nat
    private func natHash(n: Nat): Hash.Hash = Nat32.fromNat(n % (2**32 - 1));

    // State
    private stable var nextTokenId: Nat = 1;
    private stable var nftEntries: [(Nat, NFTInfo)] = [];
    
    private var nfts = HashMap.HashMap<Nat, NFTInfo>(10, Nat.equal, natHash);

    // System functions
    system func preupgrade() {
        nftEntries := Iter.toArray(nfts.entries());
    };

    system func postupgrade() {
        nfts := HashMap.fromIter<Nat, NFTInfo>(nftEntries.vals(), nftEntries.size(), Nat.equal, natHash);
        nftEntries := [];
    };

    // NFT Functions
    public func mint_nft(
        to: Principal,
        name: Text, 
        description: Text, 
        price: Nat, 
        image_url: Text, 
        is_ai_generated: Bool
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
            created_at = Time.now();
        };

        nfts.put(tokenId, nft);
        #ok(tokenId)
    };

    public func generate_ai_image(prompt: Text): async Result.Result<Text, Text> {
        let mockImageUrl = "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1024&h=1024&fit=crop&q=80&prompt=" # prompt;
        #ok(mockImageUrl)
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
};

