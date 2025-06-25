/*
 * PiCO Preferences Contract
 * 
 * This contract handles user preferences with CRUD operations.
 * Each user can have their own preferences stored by their principal ID.
 */

import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor Preferences {
  
  // User preferences type
  public type UserPreferences = {
    principal_id : Text;
    preferences : [Text];
    created_at : Int;
    updated_at : Int;
  };
  
  // Create/Update preferences input type
  public type PreferencesInput = {
    principal_id : Text;
    preferences : [Text];
  };
  
  // Storage for user preferences
  private var userPreferences = HashMap.HashMap<Text, UserPreferences>(10, Text.equal, Text.hash);
  
  // Helper function to get current timestamp
  private func getCurrentTime() : Int {
    Time.now()
  };
  
  // CREATE - Add new user preferences
  public func createPreferences(input : PreferencesInput) : async Result.Result<UserPreferences, Text> {
    // Check if preferences already exist for this user
    switch (userPreferences.get(input.principal_id)) {
      case (?_) {
        #err("❌ Preferences already exist for user: " # input.principal_id # ". Use updatePreferences instead.")
      };
      case null {
        let currentTime = getCurrentTime();
        let newPreferences : UserPreferences = {
          principal_id = input.principal_id;
          preferences = input.preferences;
          created_at = currentTime;
          updated_at = currentTime;
        };
        
        userPreferences.put(input.principal_id, newPreferences);
        #ok(newPreferences)
      };
    }
  };
  
  // READ - Get user preferences by principal ID
  public query func getPreferences(principal_id : Text) : async Result.Result<UserPreferences, Text> {
    switch (userPreferences.get(principal_id)) {
      case (?preferences) {
        #ok(preferences)
      };
      case null {
        #err("❌ No preferences found for user: " # principal_id)
      };
    }
  };
  
  // READ - Get all user preferences (admin function)
  public query func getAllPreferences() : async [UserPreferences] {
    Iter.toArray(userPreferences.vals())
  };
  
  // READ - Check if user has preferences
  public query func hasPreferences(principal_id : Text) : async Bool {
    switch (userPreferences.get(principal_id)) {
      case (?_) { true };
      case null { false };
    }
  };
  
  // UPDATE - Update existing user preferences
  public func updatePreferences(input : PreferencesInput) : async Result.Result<UserPreferences, Text> {
    switch (userPreferences.get(input.principal_id)) {
      case (?existing) {
        let updatedPreferences : UserPreferences = {
          principal_id = input.principal_id;
          preferences = input.preferences;
          created_at = existing.created_at; // Keep original creation time
          updated_at = getCurrentTime(); // Update the timestamp
        };
        
        userPreferences.put(input.principal_id, updatedPreferences);
        #ok(updatedPreferences)
      };
      case null {
        #err("❌ No preferences found for user: " # input.principal_id # ". Use createPreferences instead.")
      };
    }
  };
  
  // UPDATE - Add preference to existing list
  public func addPreference(principal_id : Text, newPreference : Text) : async Result.Result<UserPreferences, Text> {
    switch (userPreferences.get(principal_id)) {
      case (?existing) {
        // Check if preference already exists
        let existingPrefs = existing.preferences;
        let prefExists = Array.find<Text>(existingPrefs, func(pref) { pref == newPreference });
        
        switch (prefExists) {
          case (?_) {
            #err("❌ Preference '" # newPreference # "' already exists for user: " # principal_id)
          };
          case null {
            let updatedPrefs = Array.append<Text>(existingPrefs, [newPreference]);
            let updatedPreferences : UserPreferences = {
              existing with
              preferences = updatedPrefs;
              updated_at = getCurrentTime();
            };
            
            userPreferences.put(principal_id, updatedPreferences);
            #ok(updatedPreferences)
          };
        }
      };
      case null {
        #err("❌ No preferences found for user: " # principal_id # ". Create preferences first.")
      };
    }
  };
  
  // UPDATE - Remove preference from existing list
  public func removePreference(principal_id : Text, preferenceToRemove : Text) : async Result.Result<UserPreferences, Text> {
    switch (userPreferences.get(principal_id)) {
      case (?existing) {
        let filteredPrefs = Array.filter<Text>(existing.preferences, func(pref) { pref != preferenceToRemove });
        
        // Check if anything was actually removed
        if (filteredPrefs.size() == existing.preferences.size()) {
          #err("❌ Preference '" # preferenceToRemove # "' not found for user: " # principal_id)
        } else {
          let updatedPreferences : UserPreferences = {
            existing with
            preferences = filteredPrefs;
            updated_at = getCurrentTime();
          };
          
          userPreferences.put(principal_id, updatedPreferences);
          #ok(updatedPreferences)
        }
      };
      case null {
        #err("❌ No preferences found for user: " # principal_id)
      };
    }
  };
  

  
  // DELETE - Remove user preferences completely
  public func deletePreferences(principal_id : Text) : async Result.Result<Text, Text> {
    switch (userPreferences.get(principal_id)) {
      case (?_) {
        userPreferences.delete(principal_id);
        #ok("✅ Preferences deleted successfully for user: " # principal_id)
      };
      case null {
        #err("❌ No preferences found for user: " # principal_id)
      };
    }
  };
  
  // UTILITY FUNCTIONS
  
  // Get total number of users with preferences
  public query func getPreferencesCount() : async Nat {
    userPreferences.size()
  };
  
  // Get all users who have preferences (just the principal IDs)
  public query func getAllUserIds() : async [Text] {
    Iter.toArray(userPreferences.keys())
  };
  
  // Search preferences by keyword
  public query func searchPreferences(keyword : Text) : async [UserPreferences] {
    let allPrefs = Iter.toArray(userPreferences.vals());
    Array.filter<UserPreferences>(allPrefs, func(userPref) {
      // Search in preferences array
      let prefsMatch = Array.find<Text>(userPref.preferences, func(pref) {
        Text.contains(pref, #text keyword)
      });
      
      prefsMatch != null
    })
  };
  
  // Get preferences by specific preference value
  public query func getUsersByPreference(preference : Text) : async [UserPreferences] {
    let allPrefs = Iter.toArray(userPreferences.vals());
    Array.filter<UserPreferences>(allPrefs, func(userPref) {
      Array.find<Text>(userPref.preferences, func(pref) { pref == preference }) != null
    })
  };
  
  // Health check
  public query func healthCheck() : async Text {
    "✅ Preferences contract is healthy! Total users: " # Nat.toText(userPreferences.size())
  };
  
  // Get preferences statistics
  public query func getStats() : async {
    total_users: Nat;
    total_preferences: Nat;
    average_preferences_per_user: Nat;
  } {
    let totalUsers = userPreferences.size();
    var totalPreferences = 0;
    
    for (userPref in userPreferences.vals()) {
      totalPreferences += userPref.preferences.size();
    };
    
    let averagePrefs = if (totalUsers > 0) { totalPreferences / totalUsers } else { 0 };
    
    {
      total_users = totalUsers;
      total_preferences = totalPreferences;
      average_preferences_per_user = averagePrefs;
    }
  };
}
