import { ApiError, BaseService } from "./base.service";
import type { OperationalTransaction } from "@/types";
import {
  idlFactory as operationalIdlFactory
} from "../../../declarations/operational_contract";
import { HttpAgent, Identity } from "@dfinity/agent";

export interface OperationalActor {
  top_up: (
    userPrincipal: string,
    amount: bigint,
  ) => Promise<
    { ok: { transaction_id: bigint; message: string } } | { err: string }
  >;
  buy_nft: (
    buyer: string,
    seller: string,
    nftId: bigint,
    price: bigint,
    forumId?: [bigint],
  ) => Promise<
    { ok: { transaction_id: bigint; message: string } } | { err: string }
  >;
  getUserBalance: (
    userPrincipal: string,
  ) => Promise<{ ok: bigint } | { err: string }>;
  check_allowance: (
    userPrincipal: string,
  ) => Promise<{ ok: bigint } | { err: string }>;
  check_nft_purchase_approval: (
    buyer: string,
    price: bigint,
  ) => Promise<
    | {
      ok: {
        has_sufficient_approval: boolean;
        current_allowance_pico: bigint;
        required_amount_pico: bigint;
        approval_message: string;
      };
    }
    | { err: string }
  >;
  getUserTransactions: (
    userPrincipal: string,
  ) => Promise<OperationalTransaction[]>;
  getAllTransactions: () => Promise<OperationalTransaction[]>;
  getNFTTransactionHistory: (
    nftId: bigint,
  ) => Promise<OperationalTransaction[]>;
  getTokenInfo: () => Promise<
    { ok: { name: string; symbol: string; decimals: number } } | { err: string }
  >;
  getTotalSupplyInfo: () => Promise<
    { ok: { holders_count: bigint; minter_balance: bigint } } | { err: string }
  >;
  get_approval_info: (
    amount: bigint,
  ) => Promise<{
    ledger_canister_id: string;
    spender_principal: string;
    amount_in_units: bigint;
    javascript_example: string;
  }>;
  mint_to_user: (
    userPrincipal: string,
    amount: bigint,
  ) => Promise<
    { ok: { transaction_id: bigint; mint_command: string } } | { err: string }
  >;
  is_contract_healthy: () => Promise<string>;
}

export class OperationalService extends BaseService {
  private actor?: OperationalActor;

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
        throw new Error("Operational canister ID not provided");
      }
      this.actor = this.createActor<OperationalActor>(
        this.canisterId,
        operationalIdlFactory,
      );
    } catch (error) {
      console.error("Failed to initialize operational actor:", error);
      throw new ApiError(
        "Failed to initialize operational service",
        "INIT_ERROR",
      );
    }
  }

  private getActor(): OperationalActor {
    if (!this.actor) {
      throw new ApiError(
        "Operational actor not initialized",
        "ACTOR_NOT_INITIALIZED",
      );
    }
    return this.actor;
  }

  // Token Operations
  async topUp(
    userPrincipal: string,
    amount: number,
  ): Promise<{ transactionId: number; message: string }> {
    try {
      const actor = this.getActor();
      const result = await actor.top_up(
        userPrincipal,
        BigInt(amount),
      );
      const data = this.handleResult(result);
      return {
        transactionId: this.convertBigIntToNumber(data.transaction_id),
        message: data.message,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async mintToUser(
    userPrincipal: string,
    amount: number,
  ): Promise<{ transactionId: number; mintCommand: string }> {
    try {
      const actor = this.getActor();
      const result = await actor.mint_to_user(
        userPrincipal,
        BigInt(amount),
      );
      const data = this.handleResult(result);
      return {
        transactionId: this.convertBigIntToNumber(data.transaction_id),
        mintCommand: data.mint_command,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserBalance(userPrincipal: string): Promise<number> {
    try {
      const actor = this.getActor();
      const result = await actor.getUserBalance(userPrincipal);
      const balance = this.handleResult(result);
      return this.convertBigIntToNumber(balance);
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkAllowance(userPrincipal: string): Promise<number> {
    try {
      const actor = this.getActor();
      const result = await actor.check_allowance(userPrincipal);
      const allowance = this.handleResult(result);
      return this.convertBigIntToNumber(allowance);
    } catch (error) {
      this.handleError(error);
    }
  }

  // NFT Purchase Operations
  async buyNFT(
    buyer: string,
    seller: string,
    nftId: number,
    price: number,
    forumId?: number,
  ): Promise<{ transactionId: number; message: string }> {
    try {
      const actor = this.getActor();
      const result = await actor.buy_nft(
        buyer,
        seller,
        BigInt(nftId),
        BigInt(price),
        forumId ? [BigInt(forumId)] : undefined,
      );
      const data = this.handleResult(result);
      return {
        transactionId: this.convertBigIntToNumber(data.transaction_id),
        message: data.message,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkNFTPurchaseApproval(
    buyer: string,
    price: number,
  ): Promise<{
    hasSufficientApproval: boolean;
    currentAllowancePico: number;
    requiredAmountPico: number;
    approvalMessage: string;
  }> {
    try {
      const actor = this.getActor();
      const result = await actor.check_nft_purchase_approval(
        buyer,
        BigInt(price),
      );
      const data = this.handleResult(result);
      return {
        hasSufficientApproval: data.has_sufficient_approval,
        currentAllowancePico: this.convertBigIntToNumber(
          data.current_allowance_pico,
        ),
        requiredAmountPico: this.convertBigIntToNumber(
          data.required_amount_pico,
        ),
        approvalMessage: data.approval_message,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getApprovalInfo(amount: number): Promise<{
    ledgerCanisterId: string;
    spenderPrincipal: string;
    amountInUnits: number;
    javascriptExample: string;
  }> {
    try {
      const actor = this.getActor();
      const result = await actor.get_approval_info(
        BigInt(amount),
      );
      return {
        ledgerCanisterId: result.ledger_canister_id,
        spenderPrincipal: result.spender_principal,
        amountInUnits: this.convertBigIntToNumber(result.amount_in_units),
        javascriptExample: result.javascript_example,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Transaction History
  async getUserTransactions(
    userPrincipal: string,
  ): Promise<OperationalTransaction[]> {
    try {
      const actor = this.getActor();
      const result = await actor.getUserTransactions(userPrincipal);
      return result.map(this.mapTransaction);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllTransactions(): Promise<OperationalTransaction[]> {
    try {
      const actor = this.getActor();
      const result = await actor.getAllTransactions();
      return result.map(this.mapTransaction);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFTTransactionHistory(
    nftId: number,
  ): Promise<OperationalTransaction[]> {
    try {
      const actor = this.getActor();
      const result = await actor.getNFTTransactionHistory(
        BigInt(nftId),
      );
      return result.map(this.mapTransaction);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Token Information
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    try {
      const actor = this.getActor();
      const result = await actor.getTokenInfo();
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTotalSupplyInfo(): Promise<{
    holdersCount: number;
    minterBalance: number;
  }> {
    try {
      const actor = this.getActor();
      const result = await actor.getTotalSupplyInfo();
      const data = this.handleResult(result);
      return {
        holdersCount: this.convertBigIntToNumber(data.holders_count),
        minterBalance: this.convertBigIntToNumber(data.minter_balance),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Health Check
  async isContractHealthy(): Promise<string> {
    try {
      const actor = this.getActor();
      return await actor.is_contract_healthy();
    } catch (error) {
      this.handleError(error);
    }
  }

  // Helper method to map transaction data
  private mapTransaction = (
    tx: OperationalTransaction,
  ): OperationalTransaction => {
    return tx; // For now, return as-is since types match
  };
}
