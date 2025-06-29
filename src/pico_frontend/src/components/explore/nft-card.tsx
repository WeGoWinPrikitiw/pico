import { Link } from "react-router-dom";
import { useCallback } from "react";
import {
    Button,
    Card,
    CardContent,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui";
import { FrontendNFTInfo } from "@/types";
import {
    isNewNFT,
    formatOwnerAddress,
} from "@/lib/nft-utils";
import {
    Heart,
    Share2,
    Sparkles,
    Eye,
    TrendingUp,
} from "lucide-react";

interface NFTCardProps {
    nft: FrontendNFTInfo;
    variant?: "grid" | "list";
    onLike?: (nftId: number) => void;
    onShare?: (nft: FrontendNFTInfo) => void;
}

export function NFTCard({ nft, variant = "grid", onLike, onShare }: NFTCardProps) {
    const isNew = isNewNFT(nft.created_at);

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onLike?.(nft.nft_id);
    }, [nft.nft_id, onLike]);

    const handleShare = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onShare?.(nft);
    }, [nft, onShare]);

    if (variant === "list") {
        return <NFTListCard nft={nft} isNew={isNew} onLike={handleLike} onShare={handleShare} />;
    }

    return <NFTGridCard nft={nft} isNew={isNew} onLike={handleLike} onShare={handleShare} />;
}

interface NFTCardInternalProps {
    nft: FrontendNFTInfo;
    isNew: boolean;
    onLike: (e: React.MouseEvent) => void;
    onShare: (e: React.MouseEvent) => void;
}

function NFTGridCard({ nft, isNew, onLike, onShare }: NFTCardInternalProps) {
    return (
        <Link to={`/nft/${nft.nft_id}`} className="block">
            <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md py-0">
                <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden">
                        <img
                            src={nft.image_url || "/placeholder-nft.png"}
                            alt={nft.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <Badge
                                className={
                                    nft.is_for_sale
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg"
                                        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg"
                                }
                            >
                                {nft.is_for_sale ? "For Sale" : "Not For Sale"}
                            </Badge>
                            {nft.is_ai_generated && (
                                <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-lg">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI Generated
                                </Badge>
                            )}
                            {isNew && (
                                <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-lg">
                                    New
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Owner */}
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={`https://avatar.vercel.sh/${nft.owner}.png`} />
                                <AvatarFallback className="text-xs">
                                    {nft.owner.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground font-medium">
                                {formatOwnerAddress(nft.owner)}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-base leading-tight line-clamp-1">
                            {nft.name}
                        </h3>

                        {/* Traits */}
                        {nft.traits && nft.traits.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {nft.traits.slice(0, 2).map((trait, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs px-2 py-1 bg-muted/50"
                                    >
                                        {trait.trait_type}: {trait.value}
                                    </Badge>
                                ))}
                                {nft.traits.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                        +{nft.traits.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Price and stats */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">
                                    Current Price
                                </p>
                                <p className="font-bold text-base text-primary">
                                    {nft.price} PiCO
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function NFTListCard({ nft, isNew, onLike, onShare }: NFTCardInternalProps) {
    return (
        <Link to={`/nft/${nft.nft_id}`} className="block">
            <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden py-0">
                <CardContent className="p-0">
                    <div className="flex">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                            <img
                                src={nft.image_url || "/placeholder-nft.png"}
                                alt={nft.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <Badge
                                    className={
                                        nft.is_for_sale
                                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0"
                                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0"
                                    }
                                >
                                    {nft.is_for_sale ? "For Sale" : "Not For Sale"}
                                </Badge>
                                {nft.is_ai_generated && (
                                    <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI
                                    </Badge>
                                )}
                                {isNew && (
                                    <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
                                        New
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={`https://avatar.vercel.sh/${nft.owner}.png`}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {nft.owner.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">
                                            {formatOwnerAddress(nft.owner)}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-lg">{nft.name}</h3>

                                {nft.traits && nft.traits.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {nft.traits.slice(0, 4).map((trait, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="text-xs px-2 py-1"
                                            >
                                                {trait.trait_type}: {trait.value}
                                            </Badge>
                                        ))}
                                        {nft.traits.length > 4 && (
                                            <Badge variant="outline" className="text-xs px-2 py-1">
                                                +{nft.traits.length - 4} more
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Current Price</p>
                                    <p className="font-bold text-lg text-primary">
                                        {nft.price} PiCO
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
} 