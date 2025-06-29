import { HttpAgent, Identity } from "@dfinity/agent";
import { ApiError, BaseService } from "./base.service";
import { idlFactory as preferencesIdlFactory } from "declarations/preferences_contract";
import { _SERVICE as PreferencesContract } from "declarations/preferences_contract/preferences_contract.did";
import type { UserProfileData, ProfileInput, SocialLinks } from "@/types";
import { getCanisterId } from "@/config/canisters";

// Frontend-specific types with converted timestamps
export interface FrontendUserProfile {
  principal_id: string;
  username: string;
  name: string;
  about: string;
  avatar_url?: string;
  social: {
    website?: string;
    twitter?: string;
    instagram?: string;
  };
  created_at: number;
  updated_at: number;
  is_profile_complete: boolean;
}

export class UserProfileService extends BaseService {
  constructor(agent?: HttpAgent, identity?: Identity) {
    super(agent, identity);
  }

  private getActor(): PreferencesContract {
    const canisterId = getCanisterId("preferences_contract");
    return this.createActor<PreferencesContract>(
      canisterId,
      preferencesIdlFactory
    );
  }

  private convertProfile(profile: UserProfileData): FrontendUserProfile {
    return {
      principal_id: profile.principal_id,
      username: profile.username,
      name: profile.name,
      about: profile.about,
      avatar_url: profile.avatar_url?.[0],
      social: {
        website: profile.social.website?.[0],
        twitter: profile.social.twitter?.[0],
        instagram: profile.social.instagram?.[0],
      },
      created_at: this.convertBigIntToNumber(profile.created_at),
      updated_at: this.convertBigIntToNumber(profile.updated_at),
      is_profile_complete: profile.is_profile_complete,
    };
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const actor = this.getActor();
      return await actor.isUsernameAvailable(username);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createProfile(
    principal: string,
    input: {
      username: string;
      name: string;
      about: string;
      avatar_url?: string;
      social: {
        website?: string;
        twitter?: string;
        instagram?: string;
      };
    }
  ): Promise<FrontendUserProfile> {
    try {
      const actor = this.getActor();

      const profileInput: ProfileInput = {
        username: input.username,
        name: input.name,
        about: input.about,
        avatar_url: input.avatar_url ? [input.avatar_url] : [],
        social: {
          website: input.social.website ? [input.social.website] : [],
          twitter: input.social.twitter ? [input.social.twitter] : [],
          instagram: input.social.instagram ? [input.social.instagram] : [],
        },
      };

      const result = await actor.createProfile(principal, profileInput);
      return this.convertProfile(this.handleResult(result));
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(
    principal: string,
    input: {
      username: string;
      name: string;
      about: string;
      avatar_url?: string;
      social: {
        website?: string;
        twitter?: string;
        instagram?: string;
      };
    }
  ): Promise<FrontendUserProfile> {
    try {
      const actor = this.getActor();

      const profileInput: ProfileInput = {
        username: input.username,
        name: input.name,
        about: input.about,
        avatar_url: input.avatar_url ? [input.avatar_url] : [],
        social: {
          website: input.social.website ? [input.social.website] : [],
          twitter: input.social.twitter ? [input.social.twitter] : [],
          instagram: input.social.instagram ? [input.social.instagram] : [],
        },
      };

      const result = await actor.updateProfile(principal, profileInput);
      return this.convertProfile(this.handleResult(result));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(principal: string): Promise<FrontendUserProfile> {
    try {
      const actor = this.getActor();
      const result = await actor.getProfile(principal);
      return this.convertProfile(this.handleResult(result));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfileByUsername(username: string): Promise<FrontendUserProfile> {
    try {
      const actor = this.getActor();
      const result = await actor.getProfileByUsername(username);
      return this.convertProfile(this.handleResult(result));
    } catch (error) {
      this.handleError(error);
    }
  }

  async hasProfile(principal: string): Promise<boolean> {
    try {
      const actor = this.getActor();
      return await actor.hasProfile(principal);
    } catch (error) {
      this.handleError(error);
    }
  }

  async listProfiles(
    offset: number,
    limit: number
  ): Promise<FrontendUserProfile[]> {
    try {
      const actor = this.getActor();
      const profiles = await actor.listProfiles(BigInt(offset), BigInt(limit));
      return profiles.map((profile) => this.convertProfile(profile));
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchProfiles(searchQuery: string): Promise<FrontendUserProfile[]> {
    try {
      const actor = this.getActor();
      const profiles = await actor.searchProfiles(searchQuery);
      return profiles.map((profile) => this.convertProfile(profile));
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteProfile(principal: string): Promise<string> {
    try {
      const actor = this.getActor();
      const result = await actor.deleteProfile(principal);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStats(): Promise<{
    total_profiles: number;
    complete_profiles: number;
    incomplete_profiles: number;
  }> {
    try {
      const actor = this.getActor();
      const stats = await actor.getProfileStats();
      return {
        total_profiles: this.convertBigIntToNumber(stats.total_profiles),
        complete_profiles: this.convertBigIntToNumber(stats.complete_profiles),
        incomplete_profiles: this.convertBigIntToNumber(
          stats.incomplete_profiles
        ),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async healthCheck(): Promise<string> {
    try {
      const actor = this.getActor();
      return await actor.healthCheck();
    } catch (error) {
      this.handleError(error);
    }
  }
}
