import { BaseService } from "./base.service";
import type {
  NFTInfo,
  Trait,
  AIImageResult,
  Account, FrontendNFTInfo
} from "@/types";
import {
  NFT,
  TransferArgs,
} from "../../../declarations/nft_contract/nft_contract.did";
import { idlFactory as nftIdlFactory } from "../../../declarations/nft_contract";

export class NFTService extends BaseService {
  private get nftActor(): NFT {
    return this.createActor<NFT>(
      "v56tl-sp777-77774-qaahq-cai",
      nftIdlFactory,
    );
  }

  private convertNFTInfo(nft: NFTInfo): FrontendNFTInfo {
    return {
      ...nft,
      nft_id: this.convertBigIntToNumber(nft.nft_id),
      price: this.convertBigIntToNumber(nft.price),
      created_at: this.convertBigIntToNumber(nft.created_at),
      owner: nft.owner.toString(),
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
      const result = await this.nftActor.list_all_nfts();
      return result.map((nft: NFTInfo) => this.convertNFTInfo(nft));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFT(id: number): Promise<FrontendNFTInfo | null> {
    try {
      const result = await this.nftActor.get_nft(BigInt(id));
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
      const result = await this.nftActor.get_ai_generated_nfts();
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
      const result = await this.nftActor.get_stats();
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
      return await this.nftActor.get_all_trait_types();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTraitValues(traitType: string): Promise<string[]> {
    try {
      return await this.nftActor.get_trait_values(traitType);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFTsByTrait(
    traitType: string,
    traitValue: string,
  ): Promise<FrontendNFTInfo[]> {
    try {
      const result = await this.nftActor.get_nfts_by_trait(
        traitType,
        traitValue,
      );
      return result.map((nft) => this.convertNFTInfo(nft));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getNFTsByRarity(rarity: string): Promise<FrontendNFTInfo[]> {
    try {
      const result = await this.nftActor.get_nfts_by_rarity(rarity);
      return result.map((nft) => this.convertNFTInfo(nft));
    } catch (error) {
      this.handleError(error);
    }
  }

  // ICRC-7 Standard Methods
  async getBalance(account: Account): Promise<number> {
    try {
      const result = await this.nftActor.icrc7_balance_of([account]);
      return this.convertBigIntToNumber(result[0]);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOwnerOf(tokenIds: number[]): Promise<(Account | null)[]> {
    try {
      const result = await this.nftActor.icrc7_owner_of(
        tokenIds.map((id) => BigInt(id)),
      );
      return result.map((owner) =>
        owner.length > 0 && owner[0] ? owner[0] : null,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTokensOf(
    account: Account,
    prev?: number,
    take?: number,
  ): Promise<number[]> {
    try {
      const result = await this.nftActor.icrc7_tokens_of(
        account,
        prev ? [BigInt(prev)] : [],
        take ? [BigInt(take)] : [],
      );
      return result.map((id) => this.convertBigIntToNumber(id));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCollectionMetadata(): Promise<Record<string, any>> {
    try {
      const result = await this.nftActor.icrc7_collection_metadata();
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
  ): Promise<number> {
    try {
      const toPrincipal = this.convertToPrincipal(to);
      const result = await this.nftActor.mint_nft(
        toPrincipal,
        name,
        description,
        BigInt(price),
        imageUrl,
        isAiGenerated,
        traits,
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

      const result = await this.nftActor.icrc7_transfer(args);
      return result.map((error) => (error ? Object.keys(error)[0] : null));
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateAIImage(prompt: string): Promise<AIImageResult> {
    try {
      const result = await this.nftActor.generate_ai_image(prompt);
      return this.handleResult(result);
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
}
