import { Actor, Identity, HttpAgent } from "@dfinity/agent";
import { BaseService, ApiError } from "./base.service";
import {
  createActor as createForumsActor,
  canisterId as forumsCanisterId,
} from "../../../declarations/forums_contract";
import type {
  Forum,
  CreateForumInput,
  UpdateForumInput,
  SearchCriteria,
  Result as ForumResult,
  Result_1 as ForumResult_1,
  Result_2 as ForumResult_2,
  Result_3 as ForumResult_3,
  _SERVICE as ForumsContractService,
} from "../../../declarations/forums_contract/forums_contract.did";

export class ForumsService extends BaseService {
  private actor?: Actor;

  constructor(agent: HttpAgent, identity: Identity) {
    super(agent, identity);
    this.initializeActor();
  }

  private initializeActor() {
    try {
      if (!forumsCanisterId) {
        throw new Error("Forums canister ID not found");
      }

      this.actor = createForumsActor(forumsCanisterId, {
        agent: this.agent,
      }) as Actor;
    } catch (error) {
      console.error("Failed to initialize forums actor:", error);
      throw new ApiError("Failed to initialize forums service", "INIT_ERROR");
    }
  }

  private getActor(): ForumsContractService {
    if (!this.actor) {
      throw new ApiError("Forums actor not initialized", "ACTOR_NOT_INITIALIZED");
    }
    return this.actor as unknown as ForumsContractService;
  }

  // Query methods
  async getAllForums(): Promise<Forum[]> {
    try {
      const actor = this.getActor();
      return await actor.getAllForums();
    } catch (error) {
      console.error("Failed to get all forums:", error);
      throw new ApiError("Failed to fetch forums", "FETCH_ERROR", error);
    }
  }

  async getForum(forumId: bigint): Promise<ForumResult> {
    try {
      const actor = this.getActor();
      return await actor.getForum(forumId);
    } catch (error) {
      console.error("Failed to get forum:", error);
      throw new ApiError("Failed to fetch forum", "FETCH_ERROR", error);
    }
  }

  async getForumsByUser(userId: string): Promise<Forum[]> {
    try {
      const actor = this.getActor();
      return await actor.getForumsByUser(userId);
    } catch (error) {
      console.error("Failed to get user forums:", error);
      throw new ApiError("Failed to fetch user forums", "FETCH_ERROR", error);
    }
  }

  async getForumsByNFT(nftId: bigint): Promise<Forum[]> {
    try {
      const actor = this.getActor();
      return await actor.getForumsByNFT(nftId);
    } catch (error) {
      console.error("Failed to get NFT forums:", error);
      throw new ApiError("Failed to fetch NFT forums", "FETCH_ERROR", error);
    }
  }

  async getTrendingForums(limit?: bigint[]): Promise<Forum[]> {
    try {
      const actor = this.getActor();
      return await actor.getTrendingForums(limit ? [limit[0]] : []);
    } catch (error) {
      console.error("Failed to get trending forums:", error);
      throw new ApiError("Failed to fetch trending forums", "FETCH_ERROR", error);
    }
  }

  async getLatestForums(limit?: bigint[]): Promise<Forum[]> {
    try {
      const actor = this.getActor();
      return await actor.getLatestForums(limit ? [limit[0]] : []);
    } catch (error) {
      console.error("Failed to get latest forums:", error);
      throw new ApiError("Failed to fetch latest forums", "FETCH_ERROR", error);
    }
  }

  async getForumStats(): Promise<{
    total_likes: bigint;
    sold_forums: bigint;
    total_comments: bigint;
    total_forums: bigint;
    active_forums: bigint;
  }> {
    try {
      const actor = this.getActor();
      return await actor.getForumStats();
    } catch (error) {
      console.error("Failed to get forum stats:", error);
      throw new ApiError("Failed to fetch forum stats", "FETCH_ERROR", error);
    }
  }

  async getForumCount(): Promise<bigint> {
    try {
      const actor = this.getActor();
      return await actor.getForumCount();
    } catch (error) {
      console.error("Failed to get forum count:", error);
      throw new ApiError("Failed to fetch forum count", "FETCH_ERROR", error);
    }
  }

  async getForumsLikedByUser(userId: string): Promise<Forum[]> {
    try {
      const actor = this.getActor();
      return await actor.getForumsLikedByUser(userId);
    } catch (error) {
      console.error("Failed to get liked forums:", error);
      throw new ApiError("Failed to fetch liked forums", "FETCH_ERROR", error);
    }
  }

  async hasUserLikedForum(userId: string, forumId: bigint): Promise<boolean> {
    try {
      const actor = this.getActor();
      return await actor.hasUserLikedForum(userId, forumId);
    } catch (error) {
      console.error("Failed to check if user liked forum:", error);
      throw new ApiError("Failed to check like status", "FETCH_ERROR", error);
    }
  }

  async isForumSold(forumId: bigint): Promise<ForumResult_2> {
    try {
      const actor = this.getActor();
      return await actor.isForumSold(forumId);
    } catch (error) {
      console.error("Failed to check if forum is sold:", error);
      throw new ApiError("Failed to check forum sold status", "FETCH_ERROR", error);
    }
  }

  async searchForums(criteria: SearchCriteria): Promise<Forum[]> {
    try {
      const actor = this.getActor();
      return await actor.searchForums(criteria);
    } catch (error) {
      console.error("Failed to search forums:", error);
      throw new ApiError("Failed to search forums", "FETCH_ERROR", error);
    }
  }

  async healthCheck(): Promise<string> {
    try {
      const actor = this.getActor();
      return await actor.healthCheck();
    } catch (error) {
      console.error("Forums health check failed:", error);
      throw new ApiError("Health check failed", "HEALTH_CHECK_ERROR", error);
    }
  }

  // Mutation methods
  async createForum(input: CreateForumInput): Promise<ForumResult> {
    try {
      const actor = this.getActor();
      return await actor.createForum(input);
    } catch (error) {
      console.error("Failed to create forum:", error);
      throw new ApiError("Failed to create forum", "CREATE_ERROR", error);
    }
  }

  async updateForum(input: UpdateForumInput): Promise<ForumResult> {
    try {
      const actor = this.getActor();
      return await actor.updateForum(input);
    } catch (error) {
      console.error("Failed to update forum:", error);
      throw new ApiError("Failed to update forum", "UPDATE_ERROR", error);
    }
  }

  async deleteForum(forumId: bigint): Promise<ForumResult_3> {
    try {
      const actor = this.getActor();
      return await actor.deleteForum(forumId);
    } catch (error) {
      console.error("Failed to delete forum:", error);
      throw new ApiError("Failed to delete forum", "DELETE_ERROR", error);
    }
  }

  async likeForum(forumId: bigint, userId: string): Promise<ForumResult> {
    try {
      const actor = this.getActor();
      return await actor.likeForum(forumId, userId);
    } catch (error) {
      console.error("Failed to like forum:", error);
      throw new ApiError("Failed to like forum", "LIKE_ERROR", error);
    }
  }

  async unlikeForum(forumId: bigint, userId: string): Promise<ForumResult> {
    try {
      const actor = this.getActor();
      return await actor.unlikeForum(forumId, userId);
    } catch (error) {
      console.error("Failed to unlike forum:", error);
      throw new ApiError("Failed to unlike forum", "UNLIKE_ERROR", error);
    }
  }

  async toggleLikeForum(forumId: bigint, userId: string): Promise<ForumResult_1> {
    try {
      const actor = this.getActor();
      return await actor.toggleLikeForum(forumId, userId);
    } catch (error) {
      console.error("Failed to toggle like forum:", error);
      throw new ApiError("Failed to toggle like", "TOGGLE_LIKE_ERROR", error);
    }
  }

  async commentForum(
    forumId: bigint,
    userId: string,
    commentText: string
  ): Promise<ForumResult> {
    try {
      const actor = this.getActor();
      return await actor.commentForum(forumId, userId, commentText);
    } catch (error) {
      console.error("Failed to comment on forum:", error);
      throw new ApiError("Failed to add comment", "COMMENT_ERROR", error);
    }
  }

  async markForumAsSold(forumId: bigint): Promise<ForumResult> {
    try {
      const actor = this.getActor();
      return await actor.markForumAsSold(forumId);
    } catch (error) {
      console.error("Failed to mark forum as sold:", error);
      throw new ApiError("Failed to mark forum as sold", "UPDATE_ERROR", error);
    }
  }

  // Helper methods
  async getForumWithLikeStatus(forumId: bigint, userId?: string): Promise<{
    forum: Forum | null;
    userHasLiked: boolean;
  }> {
    try {
      const forumResult = await this.getForum(forumId);

      if ('err' in forumResult) {
        return { forum: null, userHasLiked: false };
      }

      const forum = forumResult.ok;
      let userHasLiked = false;

      if (userId) {
        try {
          userHasLiked = await this.hasUserLikedForum(userId, forumId);
        } catch (error) {
          console.warn("Failed to check like status:", error);
        }
      }

      return { forum, userHasLiked };
    } catch (error) {
      console.error("Failed to get forum with like status:", error);
      throw new ApiError("Failed to get forum details", "FETCH_ERROR", error);
    }
  }

  async getForumsWithStats(): Promise<{
    forums: Forum[];
    stats: {
      total_likes: bigint;
      sold_forums: bigint;
      total_comments: bigint;
      total_forums: bigint;
      active_forums: bigint;
    };
  }> {
    try {
      const [forums, stats] = await Promise.all([
        this.getAllForums(),
        this.getForumStats(),
      ]);

      return { forums, stats };
    } catch (error) {
      console.error("Failed to get forums with stats:", error);
      throw new ApiError("Failed to get forums with stats", "FETCH_ERROR", error);
    }
  }
}