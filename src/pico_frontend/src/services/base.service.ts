import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { ContractResult } from "@/types";

export class ApiError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export abstract class BaseService {
  protected agent?: HttpAgent;
  protected identity?: Identity;

  constructor(agent?: HttpAgent, identity?: Identity) {
    this.agent = agent;
    this.identity = identity;
  }

  protected createActor<T>(canisterId: string, idlFactory: any): T {
    if (!this.agent) {
      throw new Error("Agent not initialized");
    }

    return Actor.createActor<T>(idlFactory, {
      agent: this.agent,
      canisterId,
    });
  }

  protected handleResult<T>(result: ContractResult<T>): T {
    if ("ok" in result) {
      return result.ok;
    } else {
      throw new ApiError(result.err);
    }
  }

  protected handleError(error: unknown): never {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ApiError(error.message);
    }

    throw new ApiError("An unknown error occurred");
  }

  protected convertBigIntToNumber(value: bigint): number {
    return Number(value);
  }

  protected convertToPrincipal(value: string | Principal): Principal {
    if (typeof value === "string") {
      return Principal.fromText(value);
    }
    return value;
  }

  public updateAgent(agent: HttpAgent, identity?: Identity) {
    this.agent = agent;
    this.identity = identity;
  }
}
