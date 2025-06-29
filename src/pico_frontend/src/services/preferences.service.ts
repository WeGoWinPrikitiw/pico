import { HttpAgent, Identity } from "@dfinity/agent";
import { ApiError, BaseService } from "./base.service";
import { idlFactory as preferencesIdlFactory } from "declarations/preferences_contract";
import { _SERVICE as PreferencesContract } from "declarations/preferences_contract/preferences_contract.did";
import type { UserPreferences, PreferencesInput } from "@/types";
import { getCanisterId } from "@/config/canisters";

export class PreferencesService extends BaseService {
  private actor?: PreferencesContract;

  constructor(
    private canisterId: string,
    agent: HttpAgent,
    identity: Identity
  ) {
    super(agent, identity);
    this.initializeActor();
  }

  private initializeActor() {
    try {
      if (!this.canisterId) {
        throw new Error("Preferences canister ID not provided");
      }
      this.actor = this.createActor<PreferencesContract>(
        this.canisterId,
        preferencesIdlFactory
      );
    } catch (error) {
      console.error("Failed to initialize preferences actor:", error);
      throw new ApiError(
        "Failed to initialize preferences service",
        "INIT_ERROR"
      );
    }
  }

  private getActor(): PreferencesContract {
    if (!this.actor) {
      throw new ApiError(
        "Preferences actor not initialized",
        "ACTOR_NOT_INITIALIZED"
      );
    }
    return this.actor;
  }

  // Core preferences methods
  async createPreferences(input: PreferencesInput): Promise<UserPreferences> {
    try {
      const actor = this.getActor();
      const result = await actor.createPreferences(input);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPreferences(principalId: string): Promise<UserPreferences> {
    try {
      const actor = this.getActor();
      const result = await actor.getPreferences(principalId);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updatePreferences(input: PreferencesInput): Promise<UserPreferences> {
    try {
      const actor = this.getActor();
      const result = await actor.updatePreferences(input);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deletePreferences(principalId: string): Promise<string> {
    try {
      const actor = this.getActor();
      const result = await actor.deletePreferences(principalId);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async addPreference(
    principalId: string,
    preference: string
  ): Promise<UserPreferences> {
    try {
      const actor = this.getActor();
      const result = await actor.addPreference(principalId, preference);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async removePreference(
    principalId: string,
    preference: string
  ): Promise<UserPreferences> {
    try {
      const actor = this.getActor();
      const result = await actor.removePreference(principalId, preference);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Smart method that creates or updates preferences as needed
  async createOrUpdatePreferences(
    input: PreferencesInput
  ): Promise<UserPreferences> {
    try {
      // First try to update
      return await this.updatePreferences(input);
    } catch (error: any) {
      // Check if the error is about missing preferences
      const errorMessage = error?.message || error?.toString() || "";
      if (
        errorMessage.includes("No preferences found") ||
        errorMessage.includes("createPreferences")
      ) {
        // User has no preferences record, create it first
        return await this.createPreferences(input);
      } else {
        // Different error, re-throw it
        throw error;
      }
    }
  }

  // Query methods
  async getAllPreferences(): Promise<UserPreferences[]> {
    try {
      const actor = this.getActor();
      return await actor.getAllPreferences();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllUserIds(): Promise<string[]> {
    try {
      const actor = this.getActor();
      return await actor.getAllUserIds();
    } catch (error) {
      this.handleError(error);
    }
  }

  async hasPreferences(principalId: string): Promise<boolean> {
    try {
      const actor = this.getActor();
      return await actor.hasPreferences(principalId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUsersByPreference(preference: string): Promise<UserPreferences[]> {
    try {
      const actor = this.getActor();
      return await actor.getUsersByPreference(preference);
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchPreferences(query: string): Promise<UserPreferences[]> {
    try {
      const actor = this.getActor();
      return await actor.searchPreferences(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Stats and utility methods
  async getStats(): Promise<{
    preferences: {
      total_users: bigint;
      total_preferences: bigint;
      average_preferences_per_user: bigint;
    };
    profiles: {
      total_profiles: bigint;
      complete_profiles: bigint;
      incomplete_profiles: bigint;
    };
  }> {
    try {
      const actor = this.getActor();
      const stats = await actor.getStats();
      return stats;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPreferencesCount(): Promise<bigint> {
    try {
      const actor = this.getActor();
      return await actor.getPreferencesCount();
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

  // Utility methods for frontend usage
  convertStatsToFrontend(stats: {
    preferences: {
      total_users: bigint;
      total_preferences: bigint;
      average_preferences_per_user: bigint;
    };
    profiles: {
      total_profiles: bigint;
      complete_profiles: bigint;
      incomplete_profiles: bigint;
    };
  }) {
    return {
      preferences: {
        total_users: this.convertBigIntToNumber(stats.preferences.total_users),
        total_preferences: this.convertBigIntToNumber(
          stats.preferences.total_preferences
        ),
        average_preferences_per_user: this.convertBigIntToNumber(
          stats.preferences.average_preferences_per_user
        ),
      },
      profiles: {
        total_profiles: this.convertBigIntToNumber(
          stats.profiles.total_profiles
        ),
        complete_profiles: this.convertBigIntToNumber(
          stats.profiles.complete_profiles
        ),
        incomplete_profiles: this.convertBigIntToNumber(
          stats.profiles.incomplete_profiles
        ),
      },
    };
  }

  convertPreferencesToFrontend(preferences: UserPreferences) {
    return {
      ...preferences,
      created_at: this.convertBigIntToNumber(preferences.created_at),
      updated_at: this.convertBigIntToNumber(preferences.updated_at),
    };
  }
}
