import { BaseService } from "./base.service";
import type {
  Forum, CreateForumInput
} from "@/types";

export interface ForumsActor {
  createForum: (
    input: CreateForumInput,
  ) => Promise<{ ok: Forum } | { err: string }>;
  getAllForums: () => Promise<Forum[]>;
  getForumsByUser: (principalId: string) => Promise<Forum[]>;
  likeForum: (
    forumId: bigint,
    userId: string,
  ) => Promise<{ ok: Forum } | { err: string }>;
  commentForum: (
    forumId: bigint,
    comment: string,
    userId: string,
  ) => Promise<{ ok: Forum } | { err: string }>;
  healthCheck: () => Promise<string>;
}

export class ForumsService extends BaseService {
  private get forumsActor(): ForumsActor {
    // Using a mock implementation for now since we have import issues
    // TODO: Replace with actual declaration import once resolved
    return {} as ForumsActor;
  }

  async createForum(input: {
    title: string;
    description: string;
    nftId: number;
    nftName: string;
    principalId: string;
  }): Promise<Forum> {
    try {
      const forumInput: CreateForumInput = {
        title: input.title,
        description: input.description,
        nft_id: BigInt(input.nftId),
        nft_name: input.nftName,
        principal_id: input.principalId,
      };

      const result = await this.forumsActor.createForum(forumInput);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllForums(): Promise<Forum[]> {
    try {
      return await this.forumsActor.getAllForums();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getForumsByUser(principalId: string): Promise<Forum[]> {
    try {
      return await this.forumsActor.getForumsByUser(principalId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async likeForum(forumId: number, userId: string): Promise<Forum> {
    try {
      const result = await this.forumsActor.likeForum(BigInt(forumId), userId);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async commentForum(
    forumId: number,
    comment: string,
    userId: string,
  ): Promise<Forum> {
    try {
      const result = await this.forumsActor.commentForum(
        BigInt(forumId),
        comment,
        userId,
      );
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async healthCheck(): Promise<string> {
    try {
      return await this.forumsActor.healthCheck();
    } catch (error) {
      this.handleError(error);
    }
  }
}
