import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Identity } from "@dfinity/agent";
import { BaseService } from "./base.service";
import { getHost, getIdentityProvider } from "@/config/canisters";

export class AuthService extends BaseService {
  private authClient?: AuthClient;

  async initialize(): Promise<void> {
    try {
      this.authClient = await AuthClient.create();
      // Always create an agent, even if not authenticated
      const host = getHost();
      if (await this.authClient.isAuthenticated()) {
        const identity = this.authClient.getIdentity();
        this.identity = identity;
        this.agent = HttpAgent.createSync({
          identity,
          host,
        });
      } else {
        // Create anonymous agent for public queries
        this.agent = HttpAgent.createSync({ host });
      }

      // Only fetch root key in development
      if (process.env.DFX_NETWORK !== "ic") {
        await this.agent.fetchRootKey();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(): Promise<{ principal: string; agent: HttpAgent }> {
    try {
      if (!this.authClient) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        this.authClient!.login({
          identityProvider: getIdentityProvider(),
          onSuccess: async () => {
            try {
              const identity = this.authClient!.getIdentity();
              this.identity = identity;

              // Use correct host based on environment
              const host = getHost();

              this.agent = HttpAgent.createSync({
                identity,
                host,
              });

              // Only fetch root key in development
              if (process.env.DFX_NETWORK !== "ic") {
                await this.agent.fetchRootKey();
              }

              const principal = identity.getPrincipal().toString();
              resolve({ principal, agent: this.agent });
            } catch (error) {
              reject(error);
            }
          },
          onError: (error) => {
            reject(new Error(error || "Login failed"));
          },
        });
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.authClient) {
        await this.authClient.logout();
        this.identity = undefined;
        this.agent = undefined;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.authClient) {
        await this.initialize();
      }
      return this.authClient ? await this.authClient.isAuthenticated() : false;
    } catch (error) {
      return false;
    }
  }

  getPrincipal(): string | undefined {
    return this.identity?.getPrincipal().toString();
  }

  getAgent(): HttpAgent | undefined {
    return this.agent;
  }

  getIdentity(): Identity | undefined {
    return this.identity;
  }
}
