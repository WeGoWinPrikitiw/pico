/*
 * PiCO Preferences & User Profile Contract
 * 
 * This contract handles user preferences with CRUD operations and user profile data
 * including avatar, name, about, username, social links, and account creation information.
 * Each user can have their own preferences and profile stored by their principal ID.
 */

import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Char "mo:base/Char";

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

  // User profile type
  public type UserProfileData = {
    principal_id : Text;
    username : Text;
    name : Text;
    about : Text;
    avatar_url : ?Text;
    social : SocialLinks;
    created_at : Int;
    updated_at : Int;
    is_profile_complete : Bool;
  };
  
  // Social links type
  public type SocialLinks = {
    website : ?Text;
    twitter : ?Text;
    instagram : ?Text;
  };
  
  // Create/Update profile input type
  public type ProfileInput = {
    username : Text;
    name : Text;
    about : Text;
    avatar_url : ?Text;
    social : SocialLinks;
  };
  
  // Profile statistics type
  public type ProfileStats = {
    total_profiles : Nat;
    complete_profiles : Nat;
    incomplete_profiles : Nat;
  };
  
  // Storage for user preferences
  private var userPreferences = HashMap.HashMap<Text, UserPreferences>(10, Text.equal, Text.hash);

  // Storage for user profiles
  private var userProfiles = HashMap.HashMap<Text, UserProfileData>(10, Text.equal, Text.hash);
  
  // Storage for username to principal mapping (for unique usernames)
  private var usernameMapping = HashMap.HashMap<Text, Text>(10, Text.equal, Text.hash);
  
  // Helper function to get current timestamp
  private func getCurrentTime() : Int {
    Time.now()
  };

  // Helper function to validate username (alphanumeric and underscore only, 3-20 chars)
  private func isValidUsername(username : Text) : Bool {
    let length = Text.size(username);
    if (length < 3 or length > 20) {
      return false;
    };
    
    // Check if username contains only valid characters
    for (char in username.chars()) {
      let c = Char.toNat32(char);
      if (not ((c >= 48 and c <= 57) or  // 0-9
               (c >= 65 and c <= 90) or  // A-Z
               (c >= 97 and c <= 122) or // a-z
               c == 95)) {               // underscore
        return false;
      };
    };
    true
  };

  // ========== USER PROFILE FUNCTIONS ==========

  // Check if username is available
  public query func isUsernameAvailable(username : Text) : async Bool {
    switch (usernameMapping.get(Text.toLowercase(username))) {
      case (?_existing) false;
      case null true;
    }
  };

  // Create user profile (first time setup)
  public func createProfile(caller : Text, input : ProfileInput) : async Result.Result<UserProfileData, Text> {
    // Validate username
    if (not isValidUsername(input.username)) {
      return #err("Invalid username. Must be 3-20 characters with only letters, numbers, and underscores.");
    };
    
    // Check if username is already taken
    let lowercaseUsername = Text.toLowercase(input.username);
    switch (usernameMapping.get(lowercaseUsername)) {
      case (?_existing) {
        return #err("Username is already taken.");
      };
      case null {};
    };
    
    // Check if user already has a profile
    switch (userProfiles.get(caller)) {
      case (?_existing) {
        return #err("Profile already exists. Use updateProfile to modify.");
      };
      case null {};
    };
    
    let now = getCurrentTime();
    let newProfile : UserProfileData = {
      principal_id = caller;
      username = input.username;
      name = input.name;
      about = input.about;
      avatar_url = input.avatar_url;
      social = input.social;
      created_at = now;
      updated_at = now;
      is_profile_complete = true;
    };
    
    // Store profile and username mapping
    userProfiles.put(caller, newProfile);
    usernameMapping.put(lowercaseUsername, caller);
    
    #ok(newProfile)
  };

  // Update existing user profile
  public func updateProfile(caller : Text, input : ProfileInput) : async Result.Result<UserProfileData, Text> {
    switch (userProfiles.get(caller)) {
      case null {
        #err("Profile not found. Create a profile first.")
      };
      case (?existingProfile) {
        // Validate username
        if (not isValidUsername(input.username)) {
          return #err("Invalid username. Must be 3-20 characters with only letters, numbers, and underscores.");
        };
        
        let lowercaseUsername = Text.toLowercase(input.username);
        let existingLowercaseUsername = Text.toLowercase(existingProfile.username);
        
        // Check if username is changing and if new username is available
        if (lowercaseUsername != existingLowercaseUsername) {
          switch (usernameMapping.get(lowercaseUsername)) {
            case (?existing) {
              if (existing != caller) {
                return #err("Username is already taken.");
              };
            };
            case null {};
          };
          
          // Remove old username mapping and add new one
          usernameMapping.delete(existingLowercaseUsername);
          usernameMapping.put(lowercaseUsername, caller);
        };
        
        let updatedProfile : UserProfileData = {
          principal_id = caller;
          username = input.username;
          name = input.name;
          about = input.about;
          avatar_url = input.avatar_url;
          social = input.social;
          created_at = existingProfile.created_at;
          updated_at = getCurrentTime();
          is_profile_complete = true;
        };
        
        userProfiles.put(caller, updatedProfile);
        #ok(updatedProfile)
      };
    }
  };

  // Get user profile by principal ID
  public query func getProfile(principal_id : Text) : async Result.Result<UserProfileData, Text> {
    switch (userProfiles.get(principal_id)) {
      case null #err("Profile not found.");
      case (?profile) #ok(profile);
    }
  };

  // Get user profile by username
  public query func getProfileByUsername(username : Text) : async Result.Result<UserProfileData, Text> {
    let lowercaseUsername = Text.toLowercase(username);
    switch (usernameMapping.get(lowercaseUsername)) {
      case null #err("Username not found.");
      case (?principal_id) {
        switch (userProfiles.get(principal_id)) {
          case null #err("Profile not found.");
          case (?profile) #ok(profile);
        }
      };
    }
  };

  // Check if user has a profile
  public query func hasProfile(principal_id : Text) : async Bool {
    switch (userProfiles.get(principal_id)) {
      case null false;
      case (?profile) profile.is_profile_complete;
    }
  };

  // List all profiles (with pagination)
  public query func listProfiles(offset : Nat, limit : Nat) : async [UserProfileData] {
    let allProfiles = Iter.toArray(userProfiles.vals());
    let profilesArray = Array.sort(allProfiles, func(a: UserProfileData, b: UserProfileData) : {#less; #equal; #greater} {
      if (a.created_at > b.created_at) #less
      else if (a.created_at < b.created_at) #greater
      else #equal
    });
    
    let totalCount = profilesArray.size();
    if (offset >= totalCount) {
      return [];
    };
    
    let endIndex = if (offset + limit > totalCount) totalCount else offset + limit;
    Array.tabulate<UserProfileData>(endIndex - offset, func(i) {
      profilesArray[offset + i]
    })
  };

  // Search profiles by name or username
  public query func searchProfiles(searchQuery : Text) : async [UserProfileData] {
    let lowercaseQuery = Text.toLowercase(searchQuery);
    let allProfiles = Iter.toArray(userProfiles.vals());
    
    Array.filter<UserProfileData>(allProfiles, func(profile) {
      let nameMatch = Text.contains(Text.toLowercase(profile.name), #text lowercaseQuery);
      let usernameMatch = Text.contains(Text.toLowercase(profile.username), #text lowercaseQuery);
      nameMatch or usernameMatch
    })
  };

  // Delete user profile
  public func deleteProfile(caller : Text) : async Result.Result<Text, Text> {
    switch (userProfiles.get(caller)) {
      case null {
        #err("Profile not found.")
      };
      case (?profile) {
        let lowercaseUsername = Text.toLowercase(profile.username);
        userProfiles.delete(caller);
        usernameMapping.delete(lowercaseUsername);
        #ok("Profile deleted successfully.")
      };
    }
  };

  // Get profile statistics
  public query func getProfileStats() : async ProfileStats {
    let allProfiles = Iter.toArray(userProfiles.vals());
    let totalProfiles = allProfiles.size();
    let completeProfiles = Array.filter<UserProfileData>(allProfiles, func(profile) {
      profile.is_profile_complete
    }).size();
    
    {
      total_profiles = totalProfiles;
      complete_profiles = completeProfiles;
      incomplete_profiles = totalProfiles - completeProfiles;
    }
  };

  // Get all usernames (for admin purposes)
  public query func getAllUsernames() : async [Text] {
    Iter.toArray(usernameMapping.keys())
  };

  // ========== USER PREFERENCES FUNCTIONS ==========
  
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
    "✅ Preferences & Profile contract is healthy! Total users with preferences: " # Nat.toText(userPreferences.size()) # ", Total profiles: " # Nat.toText(userProfiles.size())
  };
  
  // Get comprehensive statistics
  public query func getStats() : async {
    preferences: {
      total_users: Nat;
      total_preferences: Nat;
      average_preferences_per_user: Nat;
    };
    profiles: {
      total_profiles: Nat;
      complete_profiles: Nat;
      incomplete_profiles: Nat;
    };
  } {
    // Preferences stats
    let totalPrefUsers = userPreferences.size();
    var totalPreferences = 0;
    
    for (userPref in userPreferences.vals()) {
      totalPreferences += userPref.preferences.size();
    };
    
    let averagePrefs = if (totalPrefUsers > 0) { totalPreferences / totalPrefUsers } else { 0 };

    // Profile stats
    let allProfiles = Iter.toArray(userProfiles.vals());
    let totalProfiles = allProfiles.size();
    let completeProfiles = Array.filter<UserProfileData>(allProfiles, func(profile) {
      profile.is_profile_complete
    }).size();
    
    {
      preferences = {
        total_users = totalPrefUsers;
        total_preferences = totalPreferences;
        average_preferences_per_user = averagePrefs;
      };
      profiles = {
        total_profiles = totalProfiles;
        complete_profiles = completeProfiles;
        incomplete_profiles = totalProfiles - completeProfiles;
      };
    }
  };
}
