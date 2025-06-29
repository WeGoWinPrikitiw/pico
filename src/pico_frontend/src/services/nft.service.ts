import { ApiError, BaseService } from "./base.service";
import type {
  NFTInfo,
  Trait,
  AIImageResult,
  Account,
  FrontendNFTInfo,
} from "@/types";
import {
  NFT,
  TransferArgs,
  _SERVICE as NFTContract,
} from "../../../declarations/nft_contract/nft_contract.did";
import { idlFactory as nftIdlFactory } from "../../../declarations/nft_contract";
import { getCanisterId } from "@/config/canisters";
import { HttpAgent } from "@dfinity/agent";
import { Identity } from "@dfinity/agent";

export class NFTService extends BaseService {
  private actor?: NFTContract;

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
        throw new Error("NFT canister ID not provided");
      }
      this.actor = this.createActor<NFTContract>(
        this.canisterId,
        nftIdlFactory
      );
    } catch (error) {
      console.error("Failed to initialize nft actor:", error);
      throw new ApiError("Failed to initialize nft service", "INIT_ERROR");
    }
  }

  private getActor(): NFTContract {
    if (!this.actor) {
      throw new ApiError("NFT actor not initialized", "ACTOR_NOT_INITIALIZED");
    }
    return this.actor;
  }

  private convertNFTInfo(nft: NFTInfo): FrontendNFTInfo {
    return {
      ...nft,
      nft_id: this.convertBigIntToNumber(nft.nft_id),
      price: this.convertBigIntToNumber(nft.price),
      created_at: this.convertBigIntToNumber(nft.created_at),
      owner: nft.owner.toString(),
      is_for_sale: nft.is_for_sale,
      traits: nft.traits.map((trait) => ({
        trait_type: trait.trait_type,
        value: trait.value,
        rarity: trait.rarity.length > 0 ? trait.rarity[0] : undefined,
      })),
    };
  }

  // NFT Query Methods
  async getAllNFTs(): Promise<FrontendNFTInfo[]> {
    try {
      const actor = this.getActor();
      const result = await actor.list_all_nfts();
      return result.map((nft: NFTInfo) => this.convertNFTInfo(nft));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFT(id: number): Promise<FrontendNFTInfo | null> {
    try {
      const actor = this.getActor();
      const result = await actor.get_nft(BigInt(id));
      if (result.length > 0 && result[0]) {
        return this.convertNFTInfo(result[0]);
      }
      return null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAIGeneratedNFTs(): Promise<FrontendNFTInfo[]> {
    try {
      const actor = this.getActor();
      const result = await actor.get_ai_generated_nfts();
      return result.map((nft) => this.convertNFTInfo(nft));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFTStats(): Promise<{
    total_nfts: number;
    ai_generated: number;
    self_made: number;
  }> {
    try {
      const actor = this.getActor();
      const result = await actor.get_stats();
      return {
        total_nfts: this.convertBigIntToNumber(result.total_nfts),
        ai_generated: this.convertBigIntToNumber(result.ai_generated),
        self_made: this.convertBigIntToNumber(result.self_made),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllTraitTypes(): Promise<string[]> {
    try {
      const actor = this.getActor();
      return await actor.get_all_trait_types();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTraitValues(traitType: string): Promise<string[]> {
    try {
      const actor = this.getActor();
      return await actor.get_trait_values(traitType);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFTsByTrait(
    traitType: string,
    traitValue: string
  ): Promise<FrontendNFTInfo[]> {
    try {
      const actor = this.getActor();
      const result = await actor.get_nfts_by_trait(traitType, traitValue);
      return result.map((nft) => this.convertNFTInfo(nft));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFTsByRarity(rarity: string): Promise<FrontendNFTInfo[]> {
    try {
      const actor = this.getActor();
      const result = await actor.get_nfts_by_rarity(rarity);
      return result.map((nft) => this.convertNFTInfo(nft));
    } catch (error) {
      this.handleError(error);
    }
  }

  // ICRC-7 Standard Methods
  async getBalance(account: Account): Promise<number> {
    try {
      const actor = this.getActor();
      const result = await actor.icrc7_balance_of([account]);
      return this.convertBigIntToNumber(result[0]);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOwnerOf(tokenIds: number[]): Promise<(Account | null)[]> {
    try {
      const actor = this.getActor();
      const result = await actor.icrc7_owner_of(
        tokenIds.map((id) => BigInt(id))
      );
      return result.map((owner) =>
        owner.length > 0 && owner[0] ? owner[0] : null
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTokensOf(
    account: Account,
    prev?: number,
    take?: number
  ): Promise<number[]> {
    try {
      const actor = this.getActor();
      const result = await actor.icrc7_tokens_of(
        account,
        prev ? [BigInt(prev)] : [],
        take ? [BigInt(take)] : []
      );
      return result.map((id) => this.convertBigIntToNumber(id));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCollectionMetadata(): Promise<Record<string, any>> {
    try {
      const actor = this.getActor();
      const result = await actor.icrc7_collection_metadata();
      const metadata: Record<string, any> = {};
      result.forEach(([key, value]) => {
        if ("Text" in value) {
          metadata[key] = value.Text;
        } else if ("Nat" in value) {
          metadata[key] = this.convertBigIntToNumber(value.Nat);
        } else if ("Int" in value) {
          metadata[key] = this.convertBigIntToNumber(value.Int);
        }
      });
      return metadata;
    } catch (error) {
      this.handleError(error);
    }
  }

  // NFT Mutation Methods
  async mintNFT(
    to: string,
    name: string,
    description: string,
    price: number,
    imageUrl: string,
    isAiGenerated: boolean,
    traits: Trait[],
    forSale?: boolean,
  ): Promise<number> {
    try {
      const toPrincipal = this.convertToPrincipal(to);
      const actor = this.getActor() as any;
      const result = await actor.mint_nft(
        toPrincipal,
        name,
        description,
        BigInt(price),
        imageUrl,
        isAiGenerated,
        traits,
        forSale !== undefined ? [forSale] : [], // Pass as optional parameter
      );
      return this.convertBigIntToNumber(this.handleResult(result));
    } catch (error) {
      this.handleError(error);
    }
  }

  async transferNFT(transferArgs: TransferArgs[]): Promise<(string | null)[]> {
    try {
      const args: TransferArgs[] = transferArgs.map((arg) => ({
        to: arg.to,
        token_id: BigInt(arg.token_id),
        memo: arg.memo || [],
        from_subaccount: arg.from_subaccount || [],
        created_at_time: arg.created_at_time || [],
      }));

      const actor = this.getActor();
      const result = await actor.icrc7_transfer(args);
      return result.map((error) => (error ? Object.keys(error)[0] : null));
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateAIImage(prompt: string): Promise<AIImageResult> {
    try {
      const actor = this.getActor();
      const result = await actor.generate_ai_image(prompt);
      return this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  // AI Detection Methods
  async detectAIGenerated(imageUrl: string): Promise<{
    is_ai_generated: boolean;
    confidence: number;
    reasoning: string;
  }> {
    try {
      const actor = this.getActor();
      const result = await actor.detect_ai_generated(imageUrl);
      const detection = this.handleResult(result);
      return {
        is_ai_generated: detection.is_ai_generated,
        confidence: detection.confidence,
        reasoning: detection.reasoning,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async mintNFTWithAIDetection(
    to: string,
    name: string,
    description: string,
    price: number,
    imageUrl: string,
    traits: Trait[]
  ): Promise<{
    nft_id: number;
    ai_detection: {
      is_ai_generated: boolean;
      confidence: number;
      reasoning: string;
    };
  }> {
    try {
      const toPrincipal = this.convertToPrincipal(to);
      const actor = this.getActor();
      const result = await actor.mint_nft_with_ai_detection(
        toPrincipal,
        name,
        description,
        BigInt(price),
        imageUrl,
        traits
      );
      const mintResult = this.handleResult(result);
      return {
        nft_id: this.convertBigIntToNumber(mintResult.nft_id),
        ai_detection: {
          is_ai_generated: mintResult.ai_detection.is_ai_generated,
          confidence: mintResult.ai_detection.confidence,
          reasoning: mintResult.ai_detection.reasoning,
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async setOpenAIAPIKey(apiKey: string): Promise<void> {
    try {
      const actor = this.getActor();
      const result = await actor.set_openai_api_key(apiKey);
      this.handleResult(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Helper method to create Account from principal string
  createAccount(principal: string, subaccount?: Uint8Array): Account {
    return {
      owner: this.convertToPrincipal(principal),
      subaccount: subaccount ? [subaccount] : [],
    };
  }

  // NEW OWNERSHIP AND SALE STATUS METHODS

  // Check if a principal owns a specific NFT
  async checkOwnership(tokenId: number, principalId: string): Promise<boolean> {
    try {
      const actor = this.getActor() as any;
      const principal = this.convertToPrincipal(principalId);
      return await actor.check_ownership(BigInt(tokenId), principal);
    } catch (error) {
      console.warn("checkOwnership method not available yet, falling back to owner comparison");
      const nft = await this.getNFT(tokenId);
      return nft?.owner === principalId;
    }
  }

  // Get all NFTs owned by a specific principal
  async getNFTsByOwner(ownerPrincipal: string): Promise<FrontendNFTInfo[]> {
    try {
      const actor = this.getActor() as any;
      const principal = this.convertToPrincipal(ownerPrincipal);
      const result = await actor.get_nfts_by_owner(principal);
      return result.map((nft: any) => this.convertNFTInfo(nft));
    } catch (error) {
      console.warn("getNFTsByOwner method not available yet, falling back to filtering all NFTs");
      const allNFTs = await this.getAllNFTs();
      return allNFTs.filter(nft => nft.owner === ownerPrincipal);
    }
  }

  // Get only NFTs that are for sale
  async getNFTsForSale(): Promise<FrontendNFTInfo[]> {
    try {
      const actor = this.getActor() as any;
      const result = await actor.get_nfts_for_sale();
      return result.map((nft: any) => this.convertNFTInfo(nft));
    } catch (error) {
      console.warn("getNFTsForSale method not available yet, falling back to filtering all NFTs");
      const allNFTs = await this.getAllNFTs();
      return allNFTs.filter(nft => nft.is_for_sale);
    }
  }

  // Set NFT for sale status (only owner can call this)
  async setNFTForSale(
    tokenId: number,
    forSale: boolean,
    newPrice?: number
  ): Promise<FrontendNFTInfo> {
    try {
      const actor = this.getActor() as any;
      const priceParam = newPrice ? [BigInt(newPrice)] : [];
      const result = await actor.set_nft_for_sale(
        BigInt(tokenId),
        forSale,
        priceParam
      );
      return this.convertNFTInfo(this.handleResult(result));
    } catch (error) {
      throw new Error("setNFTForSale method not available yet - contract needs to be updated");
    }
  }

  // Validate if a purchase is allowed before attempting
  async validatePurchase(
    tokenId: number,
    buyerPrincipal: string
  ): Promise<{ isValid: boolean; price?: number; seller?: string; error?: string }> {
    try {
      const actor = this.getActor() as any;
      const principal = this.convertToPrincipal(buyerPrincipal);
      const result = await actor.validate_purchase(BigInt(tokenId), principal);

      if ('ok' in result) {
        return {
          isValid: true,
          price: this.convertBigIntToNumber(result.ok.price),
          seller: result.ok.seller.toString(),
        };
      } else {
        const errorMessage = this.mapSaleError(result.err);
        return {
          isValid: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.warn("validatePurchase method not available yet, performing basic validation");
      const nft = await this.getNFT(tokenId);
      if (!nft) {
        return { isValid: false, error: "NFT does not exist" };
      }
      if (nft.owner === buyerPrincipal) {
        return { isValid: false, error: "You cannot purchase your own NFT" };
      }
      if (!nft.is_for_sale) {
        return { isValid: false, error: "This NFT is not for sale" };
      }
      return {
        isValid: true,
        price: nft.price,
        seller: nft.owner,
      };
    }
  }

  // Helper method to map sale errors to user-friendly messages
  private mapSaleError(error: any): string {
    if ('NotForSale' in error) {
      return "This NFT is not for sale";
    } else if ('SelfPurchase' in error) {
      return "You cannot purchase your own NFT";
    } else if ('AlreadyOwned' in error) {
      return "You already own this NFT";
    } else if ('NonExistentTokenId' in error) {
      return "NFT does not exist";
    } else if ('Unauthorized' in error) {
      return "Unauthorized access";
    } else if ('GenericError' in error) {
      return error.GenericError.message || "Generic error occurred";
    } else {
      return "Unknown error occurred";
    }
  }
}
