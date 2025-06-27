/*
 * PiCO Forums Contract
 * 
 * This contract handles forum posts for NFTs with comprehensive functionality
 * including likes, comments, trending, search, and sold status tracking.
 */

import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Int "mo:base/Int";

actor Forums {
  
  // Comment type
  public type Comment = {
    user_id : Text; // principal_id as text
    comment : Text;
    created_at : Int;
  };
  
  // Forum post type
  public type Forum = {
    forum_id : Nat;
    nft_id : Nat;
    principal_id : Text;
    nft_name : Text; // For search functionality
    title : Text;
    description : Text;
    likes : Nat;
    comments : [Comment];
    is_sold : Bool;
    created_at : Int;
    updated_at : Int;
  };
  
  // Create forum input type
  public type CreateForumInput = {
    nft_id : Nat;
    principal_id : Text;
    title : Text;
    description : Text;
  };
  
  // Update forum input type
  public type UpdateForumInput = {
    forum_id : Nat;
    title : ?Text; // Optional update
    description : ?Text; // Optional update
    is_sold : ?Bool; // Optional update
  };
  
  // Search/Filter criteria
  public type SearchCriteria = {
    title : ?Text;
    description : ?Text;
    nft_id : ?Nat;
    principal_id : ?Text;
    is_sold : ?Bool;
  };
  
  // Forum counter for unique IDs
  private stable var forumCounter : Nat = 0;
  
  // Storage for forums
  private var forums = HashMap.HashMap<Nat, Forum>(10, Nat.equal, func(n: Nat) : Nat32 { 
    Nat32.fromNat(n % 4294967295) 
  });
  
  // Storage for user likes (user_id -> [forum_ids])
  private var userLikes = HashMap.HashMap<Text, [Nat]>(10, Text.equal, Text.hash);
  
  // Helper functions
  private func getCurrentTime() : Int {
    Time.now()
  };
  
  private func generateForumId() : Nat {
    forumCounter += 1;
    forumCounter
  };
  
  // Add user like to tracking
  private func addUserLike(userId : Text, forumId : Nat) {
    switch (userLikes.get(userId)) {
      case (?existingLikes) {
        // Check if already liked
        let alreadyLiked = Array.find<Nat>(existingLikes, func(id) { id == forumId });
        if (alreadyLiked == null) {
          let updatedLikes = Array.append<Nat>(existingLikes, [forumId]);
          userLikes.put(userId, updatedLikes);
        };
      };
      case null {
        userLikes.put(userId, [forumId]);
      };
    }
  };
  
  // Remove user like from tracking
  private func removeUserLike(userId : Text, forumId : Nat) {
    switch (userLikes.get(userId)) {
      case (?existingLikes) {
        let filteredLikes = Array.filter<Nat>(existingLikes, func(id) { id != forumId });
        userLikes.put(userId, filteredLikes);
      };
      case null { /* No likes to remove */ };
    }
  };
  
  // CREATE FORUM
  public func createForum(input : CreateForumInput) : async Result.Result<Forum, Text> {
    let forumId = generateForumId();
    let currentTime = getCurrentTime();
    
    let newForum : Forum = {
      forum_id = forumId;
      nft_id = input.nft_id;
      principal_id = input.principal_id;
      title = input.title;
      description = input.description;
      likes = 0;
      comments = [];
      is_sold = false;
      created_at = currentTime;
      updated_at = currentTime;
    };
    
    forums.put(forumId, newForum);
    #ok(newForum)
  };
  
  // GET SPECIFIC FORUM
  public query func getForum(forumId : Nat) : async Result.Result<Forum, Text> {
    switch (forums.get(forumId)) {
      case (?forum) {
        #ok(forum)
      };
      case null {
        #err("❌ Forum not found with ID: " # Nat.toText(forumId))
      };
    }
  };
  
  // GET LIST FORUMS BY SEARCH/FILTER
  public query func searchForums(criteria : SearchCriteria) : async [Forum] {
    let allForums = Iter.toArray(forums.vals());
    Array.filter<Forum>(allForums, func(forum) {
      var matches = true;
      
      // Filter by title
      switch (criteria.title) {
        case (?title) {
          matches := matches and Text.contains(forum.title, #text title);
        };
        case null { /* No filter */ };
      };
      
      // Filter by description
      switch (criteria.description) {
        case (?desc) {
          matches := matches and Text.contains(forum.description, #text desc);
        };
        case null { /* No filter */ };
      };
      
      // Filter by NFT ID
      switch (criteria.nft_id) {
        case (?id) {
          matches := matches and (forum.nft_id == id);
        };
        case null { /* No filter */ };
      };
      
      // Filter by principal ID
      switch (criteria.principal_id) {
        case (?principalId) {
          matches := matches and (forum.principal_id == principalId);
        };
        case null { /* No filter */ };
      };
      
      // Filter by sold status
      switch (criteria.is_sold) {
        case (?soldStatus) {
          matches := matches and (forum.is_sold == soldStatus);
        };
        case null { /* No filter */ };
      };
      
      matches
    })
  };
  
  // GET LATEST FORUMS BY CREATED_AT
  public query func getLatestForums(limit : ?Nat) : async [Forum] {
    let allForums = Iter.toArray(forums.vals());
    let sortedForums = Array.sort<Forum>(allForums, func(a, b) {
      Int.compare(b.created_at, a.created_at) // Descending order (newest first)
    });
    
    switch (limit) {
      case (?maxResults) {
        Array.take<Forum>(sortedForums, maxResults)
      };
      case null {
        sortedForums
      };
    }
  };
  
  // GET TRENDING FORUMS BY LIKES
  public query func getTrendingForums(limit : ?Nat) : async [Forum] {
    let allForums = Iter.toArray(forums.vals());
    let sortedForums = Array.sort<Forum>(allForums, func(a, b) {
      Nat.compare(b.likes, a.likes) // Descending order (most likes first)
    });
    
    switch (limit) {
      case (?maxResults) {
        Array.take<Forum>(sortedForums, maxResults)
      };
      case null {
        sortedForums
      };
    }
  };
  
  // GET FORUMS LIKED BY USER
  public query func getForumsLikedByUser(userId : Text) : async [Forum] {
    switch (userLikes.get(userId)) {
      case (?likedForumIds) {
        let likedForums = Array.mapFilter<Nat, Forum>(likedForumIds, func(forumId) {
          forums.get(forumId)
        });
        likedForums
      };
      case null {
        []
      };
    }
  };
  
  // TOGGLE LIKE/UNLIKE FORUM (Single function for both actions)
  public func toggleLikeForum(forumId : Nat, userId : Text) : async Result.Result<{forum: Forum; action: Text}, Text> {
    switch (forums.get(forumId)) {
      case (?forum) {
        // Check if user already liked this forum
        let hasLiked = switch (userLikes.get(userId)) {
          case (?existingLikes) {
            Array.find<Nat>(existingLikes, func(id) { id == forumId }) != null
          };
          case null { false };
        };
        
        if (hasLiked) {
          // User has liked it, so unlike it
          let newLikes = Nat.sub(forum.likes, 1);
          let updatedForum = {
            forum with
            likes = newLikes;
            updated_at = getCurrentTime();
          };
          
          forums.put(forumId, updatedForum);
          removeUserLike(userId, forumId);
          #ok({
            forum = updatedForum;
            action = "unliked";
          })
        } else {
          // User hasn't liked it, so like it
          let updatedForum = {
            forum with
            likes = forum.likes + 1;
            updated_at = getCurrentTime();
          };
          
          forums.put(forumId, updatedForum);
          addUserLike(userId, forumId);
          #ok({
            forum = updatedForum;
            action = "liked";
          })
        }
      };
      case null {
        #err("❌ Forum not found with ID: " # Nat.toText(forumId))
      };
    }
  };
  
  // ADD COMMENT TO FORUM
  public func commentForum(forumId : Nat, userId : Text, commentText : Text) : async Result.Result<Forum, Text> {
    switch (forums.get(forumId)) {
      case (?forum) {
        let newComment : Comment = {
          user_id = userId;
          comment = commentText;
          created_at = getCurrentTime();
        };
        
        let updatedComments = Array.append<Comment>(forum.comments, [newComment]);
        let updatedForum = {
          forum with
          comments = updatedComments;
          updated_at = getCurrentTime();
        };
        
        forums.put(forumId, updatedForum);
        #ok(updatedForum)
      };
      case null {
        #err("❌ Forum not found with ID: " # Nat.toText(forumId))
      };
    }
  };
  
  // UPDATE FORUM
  public func updateForum(input : UpdateForumInput) : async Result.Result<Forum, Text> {
    switch (forums.get(input.forum_id)) {
      case (?forum) {
        var updatedForum = forum;
        
        // Update title if provided
        switch (input.title) {
          case (?newTitle) {
            updatedForum := {
              updatedForum with
              title = newTitle;
            };
          };
          case null { /* No update */ };
        };
        
        // Update description if provided
        switch (input.description) {
          case (?newDescription) {
            updatedForum := {
              updatedForum with
              description = newDescription;
            };
          };
          case null { /* No update */ };
        };
        
        // Update sold status if provided
        switch (input.is_sold) {
          case (?soldStatus) {
            updatedForum := {
              updatedForum with
              is_sold = soldStatus;
            };
          };
          case null { /* No update */ };
        };
        
        // Always update the timestamp
        updatedForum := {
          updatedForum with
          updated_at = getCurrentTime();
        };
        
        forums.put(input.forum_id, updatedForum);
        #ok(updatedForum)
      };
      case null {
        #err("❌ Forum not found with ID: " # Nat.toText(input.forum_id))
      };
    }
  };
  
  // CHECK IF POST IS SOLD
  public query func isForumSold(forumId : Nat) : async Result.Result<Bool, Text> {
    switch (forums.get(forumId)) {
      case (?forum) {
        #ok(forum.is_sold)
      };
      case null {
        #err("❌ Forum not found with ID: " # Nat.toText(forumId))
      };
    }
  };
  
  // MARK FORUM AS SOLD
  public func markForumAsSold(forumId : Nat) : async Result.Result<Forum, Text> {
    switch (forums.get(forumId)) {
      case (?forum) {
        let updatedForum = {
          forum with
          is_sold = true;
          updated_at = getCurrentTime();
        };
        
        forums.put(forumId, updatedForum);
        #ok(updatedForum)
      };
      case null {
        #err("❌ Forum not found with ID: " # Nat.toText(forumId))
      };
    }
  };
  
  // UTILITY FUNCTIONS
  
  // Get all forums
  public query func getAllForums() : async [Forum] {
    Iter.toArray(forums.vals())
  };
  
  // Get forums by user
  public query func getForumsByUser(userId : Text) : async [Forum] {
    let allForums = Iter.toArray(forums.vals());
    Array.filter<Forum>(allForums, func(forum) {
      forum.principal_id == userId
    })
  };
  
  // Get forum count
  public query func getForumCount() : async Nat {
    forums.size()
  };
  
  // Get forums by NFT ID
  public query func getForumsByNFT(nftId : Nat) : async [Forum] {
    let allForums = Iter.toArray(forums.vals());
    Array.filter<Forum>(allForums, func(forum) {
      forum.nft_id == nftId
    })
  };
  
  // Check if user liked a specific forum
  public query func hasUserLikedForum(userId : Text, forumId : Nat) : async Bool {
    switch (userLikes.get(userId)) {
      case (?likedForums) {
        Array.find<Nat>(likedForums, func(id) { id == forumId }) != null
      };
      case null {
        false
      };
    }
  };
  
  // Get forum statistics
  public query func getForumStats() : async {
    total_forums: Nat;
    total_likes: Nat;
    total_comments: Nat;
    sold_forums: Nat;
    active_forums: Nat;
  } {
    let allForums = Iter.toArray(forums.vals());
    var totalLikes = 0;
    var totalComments = 0;
    var soldForums = 0;
    
    for (forum in allForums.vals()) {
      totalLikes += forum.likes;
      totalComments += forum.comments.size();
      if (forum.is_sold) {
        soldForums += 1;
      };
    };
    
    {
      total_forums = allForums.size();
      total_likes = totalLikes;
      total_comments = totalComments;
      sold_forums = soldForums;
      active_forums = allForums.size() - soldForums;
    }
  };
  
  // Health check
  public query func healthCheck() : async Text {
    "✅ Forums contract is healthy! Total forums: " # Nat.toText(forums.size())
  };
  
  // Delete forum (admin function)
  public func deleteForum(forumId : Nat) : async Result.Result<Text, Text> {
    switch (forums.get(forumId)) {
      case (?forum) {
        forums.delete(forumId);
        
        // Remove from all user likes
        for ((userId, likedForums) in userLikes.entries()) {
          let filteredLikes = Array.filter<Nat>(likedForums, func(id) { id != forumId });
          userLikes.put(userId, filteredLikes);
        };
        
        #ok("✅ Forum deleted successfully: " # Nat.toText(forumId))
      };
      case null {
        #err("❌ Forum not found with ID: " # Nat.toText(forumId))
      };
    }
  };
} 