// Export all services
export { AuthService } from "./auth.service";
export { AIService } from "./ai.service";
export { NFTService } from "./nft.service";
export { OperationalService } from "./operational.service";
export { ForumsService } from "./forums.service";
export { PreferencesService } from "./preferences.service";
export { ICRC1Service } from "./icrc1.service";
export { UploadService } from "./upload.service";
export { UserProfileService } from "./user-profile.service";

// Export base service and error handling
export { BaseService, ApiError } from "./base.service";

// Import service classes for internal use
import { AuthService } from "./auth.service";
import { NFTService } from "./nft.service";
import { AIService } from "./ai.service";
import { OperationalService } from "./operational.service";
import { ForumsService } from "./forums.service";
import { PreferencesService } from "./preferences.service";
import { ICRC1Service } from "./icrc1.service";
import { UploadService } from "./upload.service";
import { UserProfileService } from "./user-profile.service";

import type { CanisterConfig } from "@/config/canisters";
import generatedCanisterIds from "@/config/generated-canister-ids.json";

// Service factory for creating service instances with shared agent

export class ServiceFactory {
  private authService: AuthService;
  private canisterIds: CanisterConfig;

  // Service instances
  private nftService?: NFTService;
  private aiService?: AIService;
  private operationalService?: OperationalService;
  private forumsService?: ForumsService;
  private preferencesService?: PreferencesService;
  private icrc1Service?: ICRC1Service;
  private uploadService?: UploadService;
  private userProfileService?: UserProfileService;

  constructor() {
    this.authService = new AuthService();
    // Load canister IDs immediately on creation
    this.canisterIds = { ...generatedCanisterIds.canister_ids };
  }

  async initialize() {
    await this.authService.initialize();
    // After auth is initialized, we have an agent, so we can create services
    this.createAllServices();
  }

  private createAllServices() {
    const agent = this.authService.getAgent();
    const identity = this.authService.getIdentity();

    if (!agent) {
      // Cannot create services without an agent
      return;
    }

    // Always create NFT service as it might have public methods
    this.nftService = new NFTService(
      this.canisterIds.nft_contract,
      agent,
      identity!
    );

    // Services that require a logged-in user
    if (identity) {
      this.aiService = new AIService(
        this.canisterIds.ai_contract,
        agent,
        identity
      );
      this.operationalService = new OperationalService(
        this.canisterIds.operational_contract,
        agent,
        identity
      );
      this.forumsService = new ForumsService(
        this.canisterIds.forums_contract,
        agent,
        identity
      );
      this.preferencesService = new PreferencesService(
        this.canisterIds.preferences_contract,
        agent,
        identity
      );
      this.icrc1Service = new ICRC1Service(
        this.canisterIds.icrc1_ledger_canister,
        agent,
        identity
      );
      this.userProfileService = new UserProfileService(agent, identity);

      // Upload service doesn't require canister interaction, just needs agent/identity
      this.uploadService = new UploadService(agent, identity);
    }
  }

  // --- Service Getters ---

  getAuthService(): AuthService {
    return this.authService;
  }

  getNFTService(): NFTService {
    if (!this.nftService) {
      throw new Error("NFT service not available.");
    }
    return this.nftService;
  }

  getAIService(): AIService {
    if (!this.aiService) {
      throw new Error("AI service not available. Please log in.");
    }
    return this.aiService;
  }

  getOperationalService(): OperationalService {
    if (!this.operationalService) {
      throw new Error("Operational service not available. Please log in.");
    }
    return this.operationalService;
  }

  getForumsService(): ForumsService {
    if (!this.forumsService) {
      throw new Error("Forums service not available. Please log in.");
    }
    return this.forumsService;
  }

  getPreferencesService(): PreferencesService {
    if (!this.preferencesService) {
      throw new Error("Preferences service not available. Please log in.");
    }
    return this.preferencesService;
  }

  getICRC1Service(): ICRC1Service {
    if (!this.icrc1Service) {
      throw new Error("ICRC1 service not available. Please log in.");
    }
    return this.icrc1Service;
  }

  getUploadService(): UploadService {
    if (!this.uploadService) {
      throw new Error("Upload service not available. Please log in.");
    }
    return this.uploadService;
  }

  getUserProfileService(): UserProfileService {
    if (!this.userProfileService) {
      throw new Error("User profile service not available. Please log in.");
    }
    return this.userProfileService;
  }

  // --- Auth Methods ---

  async login() {
    const result = await this.authService.login();
    // Re-create services with the new identity
    this.createAllServices();
    return result;
  }

  async logout() {
    await this.authService.logout();
    // Clear out services
    this.nftService = undefined;
    this.aiService = undefined;
    this.operationalService = undefined;
    this.forumsService = undefined;
    this.preferencesService = undefined;
    this.icrc1Service = undefined;
    this.uploadService = undefined;
    this.userProfileService = undefined;
    // Re-create services with anonymous agent
    this.createAllServices();
  }

  isAuthenticated(): Promise<boolean> {
    return this.authService.isAuthenticated();
  }

  getPrincipal(): string | undefined {
    return this.authService.getPrincipal();
  }
}

// Global service factory instance
export const serviceFactory = new ServiceFactory();
