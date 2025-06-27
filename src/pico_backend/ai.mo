import LLM "mo:llm";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Char "mo:base/Char";
import Config "config";

actor RecommendationSystem {
  // Types for inter-canister calls
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

  public type Trait = {
    trait_type: Text;
    value: Text;
    rarity: ?Text;
  };

  public type UserPreferences = {
    principal_id: Text;
    preferences: [Text];
    created_at: Int;
    updated_at: Int;
  };

  // NFT Contract interface
  public type NFTContract = actor {
    list_all_nfts: () -> async [NFTInfo];
  };

  // Preferences Contract interface  
  public type PreferencesContract = actor {
    getPreferences: (Text) -> async Result.Result<UserPreferences, Text>;
    hasPreferences: (Text) -> async Bool;
  };

  // Helper function to format NFT data for LLM context
  private func formatNFTsForLLM(nfts: [NFTInfo]): Text {
    var context = "Available NFTs:\n";
    for (nft in nfts.vals()) {
      let traitsText = Array.foldLeft<Trait, Text>(nft.traits, "", func(acc, trait) {
        acc # trait.trait_type # ":" # trait.value # 
        (switch (trait.rarity) { case (?r) " (" # r # ")"; case null "" }) # ", "
      });
      
      context #= "NFT ID: " # debug_show(nft.nft_id) # 
                 " | Name: " # nft.name # 
                 " | Description: " # nft.description # 
                 " | Price: " # debug_show(nft.price) # 
                 " | AI Generated: " # (if (nft.is_ai_generated) "Yes" else "No") #
                 " | Traits: " # traitsText # "\n";
    };
    context
  };

  // Helper function to format user preferences for LLM
  private func formatPreferencesForLLM(preferences: ?UserPreferences): Text {
    switch (preferences) {
      case (?prefs) {
        "User Preferences: " # Text.join(", ", Iter.fromArray(prefs.preferences))
      };
      case null {
        "No specific user preferences available"
      };
    }
  };

  // Main recommendation function - returns AI response directly
  public func getRecommendations(userPrincipal: Text, maxRecommendations: ?Nat): async Result.Result<Text, Text> {
    let limit = switch (maxRecommendations) {
      case (?max) max;
      case null 5; // Default to 5 recommendations
    };

    try {
      // Step 1: Fetch all NFT data from NFT contract with error handling
      let nftContract: NFTContract = actor(Config.NFT_CONTRACT_CANISTER); // NFT contract canister ID
      let allNFTs = try {
        await nftContract.list_all_nfts()
      } catch (error) {
        // If NFT contract fails, return empty array
        []
      };
      
      // Handle empty NFT collection
      if (allNFTs.size() == 0) {
        // Return a specific format for empty collection
        return #ok("[]");
      };

      // Step 2: Get user preferences from preferences contract
      let preferencesContract: PreferencesContract = actor(Config.PREFERENCES_CONTRACT_CANISTER); // Preferences contract canister ID
      let userPrefs = try {
        let hasPrefs = await preferencesContract.hasPreferences(userPrincipal);
        if (hasPrefs) {
          switch (await preferencesContract.getPreferences(userPrincipal)) {
            case (#ok(prefs)) ?prefs;
            case (#err(_)) null;
          }
        } else {
          null
        }
      } catch (error) {
        null // If preferences contract call fails, continue without preferences
      };

      // Step 3: Format context for LLM with null safety
      let nftContext = formatNFTsForLLM(allNFTs);
      let preferencesContext = formatPreferencesForLLM(userPrefs);
      
      let prompt = "You are an NFT recommendation system. Based on the available NFTs and user preferences below, recommend the best NFTs for this user.\n\n" #
                   nftContext # "\n" #
                   preferencesContext # "\n\n" #
                   "Instructions:\n" #
                   "- Consider user preferences when available, otherwise provide diverse recommendations\n" #
                   "- Consider NFT traits, rarity, price, and whether it's AI-generated\n" #
                   "- Provide exactly " # debug_show(limit) # " recommendations\n" #
                   "- Return ONLY a JSON array of NFT IDs, nothing else\n" #
                   "- Format: [1, 15, 4, 23, 7]\n" #
                   "- Do not include any explanation or additional text\n" #
                   "- Ensure all recommended NFT IDs exist in the provided list\n" #
                   "- If no suitable NFTs are available, return an empty array: []\n" #
                   "- CRITICAL: Your response must be ONLY the array, no other text";

      // Step 4: Get LLM recommendation
      let llmResponse = await LLM.prompt(#Llama3_1_8B, prompt);
      
      // Step 5: Use second AI to validate and fix format if needed
      let formatValidationPrompt = "You are a format validator. The following text should be a JSON array of numbers representing NFT IDs.\n\n" #
                                   "Input: " # llmResponse # "\n\n" #
                                   "Instructions:\n" #
                                   "- If the input is already a valid JSON array of numbers, return it exactly as is\n" #
                                   "- If the input contains extra text, extract only the JSON array part\n" #
                                   "- If the input is malformed, fix it to be a proper JSON array\n" #
                                   "- If no valid numbers can be found, return an empty array: []\n" #
                                   "- Return ONLY the JSON array, nothing else\n" #
                                   "- Example correct format: [1, 15, 4, 23, 7] or [] for empty\n" #
                                   "- Do not add any explanation or additional text";

      let validatedResponse = await LLM.prompt(#Llama3_1_8B, formatValidationPrompt);
      
      #ok(Text.trim(validatedResponse, #text " \n\t\r"))
      
    } catch (error) {
      // Ultimate fallback - return empty array format
      #ok("[]")
    }
  };

  // Helper function to parse NFT IDs from LLM response
  private func parseNFTIds(response: Text): Result.Result<[Nat], Text> {
    // Remove brackets and split by comma
    let cleaned = Text.replace(Text.replace(response, #text "[", ""), #text "]", "");
    let parts = Text.split(cleaned, #text ",");
    
    var ids: [Nat] = [];
    for (part in parts) {
      let trimmedPart = Text.trim(part, #text " \n\t\r");
      // Simple number parsing (basic implementation)
      switch (textToNat(trimmedPart)) {
        case (?id) {
          ids := Array.append(ids, [id]);
        };
        case null {
          // Skip invalid numbers
        };
      }
    };
    
    if (ids.size() > 0) {
      #ok(ids)
    } else {
      #err("Could not parse any valid NFT IDs from response: " # response)
    }
  };

  // Simple text to Nat conversion
  private func textToNat(text: Text): ?Nat {
    var result: Nat = 0;
    for (char in text.chars()) {
      if (char >= '0' and char <= '9') {
        let digit = Nat32.toNat(Char.toNat32(char) - Char.toNat32('0'));
        result := result * 10 + digit;
      } else {
        return null; // Invalid character
      }
    };
    ?result
  };

  // Get recommendations with detailed NFT info
  public func getDetailedRecommendations(userPrincipal: Text, maxRecommendations: ?Nat): async Result.Result<[NFTInfo], Text> {
    switch (await getRecommendations(userPrincipal, maxRecommendations)) {
      case (#ok(responseText)) {
        // Parse the response text to get NFT IDs
        switch (parseNFTIds(responseText)) {
          case (#ok(nftIds)) {
            try {
              let nftContract: NFTContract = actor(Config.NFT_CONTRACT_CANISTER); // NFT contract canister ID
              var detailedNFTs: [NFTInfo] = [];
              
              // Note: This would need a get_nft method in the NFTContract interface
              // For now, we'll return an error indicating this functionality needs implementation
              #err("Detailed NFT retrieval not yet implemented - NFT contract needs get_nft method")
            } catch (error) {
              #err("Failed to fetch detailed NFT information")
            }
          };
          case (#err(parseError)) {
            #err("Failed to parse NFT IDs: " # parseError)
          };
        }
      };
      case (#err(error)) {
        #err(error)
      };
    }
  };
};