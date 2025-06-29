import { ApiError, BaseService } from "./base.service";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { idlFactory as aiIdlFactory } from "../../../declarations/ai_contract";
import type {
    _SERVICE as AIContract,
    Result as AIResult,
    NFTInfo,
} from "../../../declarations/ai_contract/ai_contract.did";

export class AIService extends BaseService {
    private actor?: AIContract;

    constructor(
        private canisterId: string,
        agent: HttpAgent,
        identity: Identity,
    ) {
        super(agent, identity);
        this.initializeActor();
    }

    private async initializeActor() {
        try {
            this.actor = await this.createActor<AIContract>(
                this.canisterId,
                aiIdlFactory,
            );
        } catch (error) {
            console.error("Failed to initialize AI actor:", error);
        }
    }

    private getActor(): AIContract {
        if (!this.actor) {
            throw new ApiError(
                "AI actor not initialized",
                "ACTOR_NOT_INITIALIZED",
            );
        }
        return this.actor;
    }

    // Get AI recommendations for a user
    async getRecommendations(userPrincipal: string, maxRecommendations?: number): Promise<string> {
        try {
            const actor = this.getActor();
            const result = await actor.getRecommendations(
                userPrincipal,
                maxRecommendations ? [BigInt(maxRecommendations)] : []
            );

            if ('ok' in result) {
                return result.ok;
            } else {
                throw new ApiError(result.err, "RECOMMENDATION_ERROR");
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    // Get detailed recommendations with NFT info
    async getDetailedRecommendations(userPrincipal: string, maxRecommendations?: number): Promise<NFTInfo[]> {
        try {
            const actor = this.getActor();
            const result = await actor.getDetailedRecommendations(
                userPrincipal,
                maxRecommendations ? [BigInt(maxRecommendations)] : []
            );

            if ('ok' in result) {
                return result.ok;
            } else {
                throw new ApiError(result.err, "DETAILED_RECOMMENDATION_ERROR");
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    // Helper method to parse recommendation JSON string
    parseRecommendations(recommendationsString: string): number[] {
        try {
            // Clean up the string and parse as JSON
            const cleaned = recommendationsString.trim();
            if (cleaned === '[]' || cleaned === '') {
                return [];
            }

            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed)) {
                return parsed.filter(item => typeof item === 'number');
            }

            return [];
        } catch (error) {
            console.error("Failed to parse recommendations:", error);
            return [];
        }
    }
} 