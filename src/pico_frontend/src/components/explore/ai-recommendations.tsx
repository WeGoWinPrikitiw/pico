import { Link } from "react-router-dom";
import { Card, CardContent, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FrontendNFTInfo } from "@/types";
import { Sparkles } from "lucide-react";

interface AIRecommendationsProps {
    recommendations: FrontendNFTInfo[];
    isLoading: boolean;
}

export function AIRecommendations({ recommendations, isLoading }: AIRecommendationsProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">AI Recommendations</h2>
                    <p className="text-muted-foreground">Curated just for you</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="text-center space-y-3">
                        <LoadingSpinner size="md" />
                        <p className="text-muted-foreground">
                            Getting your recommendations...
                        </p>
                    </div>
                </div>
            ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {recommendations.map((nft) => (
                        <AIRecommendationCard key={nft.nft_id} nft={nft} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

interface AIRecommendationCardProps {
    nft: FrontendNFTInfo;
}

function AIRecommendationCard({ nft }: AIRecommendationCardProps) {
    return (
        <Link to={`/nft/${nft.nft_id}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative aspect-square">
                        <img
                            src={nft.image_url || "/placeholder-nft.png"}
                            alt={nft.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Pick
                            </Badge>
                        </div>
                    </div>
                    <div className="p-3 space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-1">
                            {nft.name}
                        </h3>
                        <p className="font-bold text-primary text-sm">
                            {nft.price} PiCO
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
} 