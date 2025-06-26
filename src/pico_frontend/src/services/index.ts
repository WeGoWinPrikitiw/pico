// Export all services
export { AuthService } from "./auth.service";
export { NFTService } from "./nft.service";
export { OperationalService } from "./operational.service";
export { ForumsService } from "./forums.service";
export { PreferencesService } from "./preferences.service";
export { ICRC1Service } from "./icrc1.service";

// Export base service and error handling
export { BaseService, ApiError } from "./base.service";

// Import service classes for internal use
import { AuthService } from "./auth.service";
import { NFTService } from "./nft.service";
import { OperationalService } from "./operational.service";
import { ForumsService } from "./forums.service";
import { PreferencesService } from "./preferences.service";
import { ICRC1Service } from "./icrc1.service";

// Service factory for creating service instances with shared agent
export class ServiceFactory {
  private authService: AuthService;
  private nftService?: NFTService;
  private operationalService?: OperationalService;
  private forumsService?: ForumsService;
  private preferencesService?: PreferencesService;
  private icrc1Service?: ICRC1Service;

  constructor() {
    this.authService = new AuthService();
  }

  async initialize() {
    await this.authService.initialize();
    this.updateServices();
  }

  private updateServices() {
    const agent = this.authService.getAgent();
    const identity = this.authService.getIdentity();

    if (agent && identity) {
      this.nftService = new NFTService(agent, identity);
      this.operationalService = new OperationalService(agent, identity);
      this.forumsService = new ForumsService(agent, identity);
      this.preferencesService = new PreferencesService(agent, identity);
      this.icrc1Service = new ICRC1Service(agent, identity);
    }
  }

  getAuthService(): AuthService {
    return this.authService;
  }

  getNFTService(): NFTService {
    if (!this.nftService) {
      throw new Error("NFT service not initialized. Please login first.");
    }
    return this.nftService;
  }

  getOperationalService(): OperationalService {
    if (!this.operationalService) {
      throw new Error(
        "Operational service not initialized. Please login first.",
      );
    }
    return this.operationalService;
  }

  getForumsService(): ForumsService {
    if (!this.forumsService) {
      throw new Error("Forums service not initialized. Please login first.");
    }
    return this.forumsService;
  }

  getPreferencesService(): PreferencesService {
    if (!this.preferencesService) {
      throw new Error(
        "Preferences service not initialized. Please login first.",
      );
    }
    return this.preferencesService;
  }

  getICRC1Service(): ICRC1Service {
    if (!this.icrc1Service) {
      throw new Error("ICRC1 service not initialized. Please login first.");
    }
    return this.icrc1Service;
  }

  async login() {
    const result = await this.authService.login();
    this.updateServices();
    return result;
  }

  async logout() {
    await this.authService.logout();
    this.nftService = undefined;
    this.operationalService = undefined;
    this.forumsService = undefined;
    this.preferencesService = undefined;
    this.icrc1Service = undefined;
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
