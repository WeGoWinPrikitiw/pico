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
    identity: Identity,
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
        preferencesIdlFactory,
      );
    } catch (error) {
      console.error("Failed to initialize preferences actor:", error);
      throw new ApiError(
        "Failed to initialize preferences service",
        "INIT_ERROR",
      );
    }
  }

  private getActor(): PreferencesContract {
    if (!this.actor) {
      throw new ApiError(
        "Preferences actor not initialized",
        "ACTOR_NOT_INITIALIZED",
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
    preference: string,
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
    preference: string,
  ): Promise<UserPreferences> {
    try {
      const actor = this.getActor();
      const result = await actor.removePreference(principalId, preference);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
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
    total_users: bigint;
    total_preferences: bigint;
    average_preferences_per_user: bigint;
  }> {
    try {
      const actor = this.getActor();
      return await actor.getStats();
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
    total_users: bigint;
    total_preferences: bigint;
    average_preferences_per_user: bigint;
  }) {
    return {
      total_users: this.convertBigIntToNumber(stats.total_users),
      total_preferences: this.convertBigIntToNumber(stats.total_preferences),
      average_preferences_per_user: this.convertBigIntToNumber(
        stats.average_preferences_per_user,
      ),
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
