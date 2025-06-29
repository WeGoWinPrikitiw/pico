import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Separator,
} from "@/components/ui";
import { UserAvatar, UserName } from "@/components/ui/user-avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNFT, useNFTForums } from "@/hooks";
import {
    ArrowLeft,
    Heart,
    Share2,
    ShoppingCart,
    MessageCircle,
    User,
    Sparkles,
    Calendar,
    Tag,
    ExternalLink,
    AlertCircle,
    List,
    History,
    Globe,
} from "lucide-react";
import { toast } from "sonner";

export function PublicNFTSharePage() {
    const { id } = useParams<{ id: string }>();

    const nftId = id ? parseInt(id) : 0;
    const {
        data: nft,
        isLoading: isLoadingNFT,
        error: nftError,
    } = useNFT(nftId);
    const {
        data: nftForums = [],
        isLoading: isLoadingForums,
    } = useNFTForums(nftId);

    const mainForum = nftForums.length > 0 ? nftForums[0] : null;

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy link.");
        }
    };

    const formatDate = (timestamp: number | bigint) => {
        const date = new Date(Number(timestamp) / 1000000);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoadingNFT) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (nftError || !nft) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">NFT Not Found</h2>
                <p className="text-muted-foreground">
                    The NFT you're looking for doesn't exist or has been removed.
                </p>
                <Button asChild variant="outline">
                    <Link to="/explore">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Explore PiCO
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header Bar */}
            <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/brand/pico-logo.svg"
                            alt="PiCO"
                            className="h-8 w-auto"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span>Public View</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                        <Button asChild size="sm">
                            <Link to={`/nft/${nftId}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View on PiCO
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-12">
                    {/* Left Column (Image) */}
                    <div className="lg:col-span-2 mb-8 lg:mb-0">
                        <Card className="overflow-hidden border-2 border-border shadow-lg">
                            <CardContent className="p-0">
                                <div className="relative aspect-square">
                                    <img
                                        src={nft.image_url || "/placeholder-nft.png"}
                                        alt={nft.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {nft.is_ai_generated && (
                                        <Badge
                                            variant="secondary"
                                            className="absolute top-3 left-3 bg-primary/90 text-primary-foreground shadow-md"
                                        >
                                            <Sparkles className="h-3 w-3 mr-1.5" /> AI Generated
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Details) */}
                    <div className="lg:col-span-3">
                        <div className="flex flex-col space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-primary font-semibold">
                                            PiCO Collection
                                        </p>
                                        <h1 className="text-4xl font-bold tracking-tighter">
                                            {nft.name}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground font-medium">
                                            {mainForum ? Number(mainForum.likes) : 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <UserAvatar principalId={String(nft.owner)} size="md" />
                                        <div>
                                            <span className="text-xs">Owner</span>
                                            <p className="font-semibold text-foreground">
                                                <UserName principalId={String(nft.owner)} />
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        <div>
                                            <span className="text-xs">Created</span>
                                            <p className="font-semibold text-foreground">
                                                {formatDate(nft.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{nft.description}</p>
                                </CardContent>
                            </Card>

                            {/* Price Display */}
                            <Card className="bg-muted/40">
                                <CardHeader>
                                    <CardTitle>Price Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {nft.is_for_sale ? "Current Price" : "Last Listed Price"}
                                            </p>
                                            <p className="text-3xl font-bold text-primary">
                                                {(nft.price / 1e8).toFixed(2)} PiCO
                                            </p>
                                        </div>
                                        {!nft.is_for_sale && (
                                            <Badge variant="secondary">
                                                <Tag className="mr-1 h-3 w-3" />
                                                Not For Sale
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-4 p-3 bg-background rounded-lg text-center">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Want to purchase this NFT?
                                        </p>
                                        <Button asChild className="w-full">
                                            <Link to={`/nft/${nftId}`}>
                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                                View on PiCO to Buy
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabs */}
                            <Tabs defaultValue="traits">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="traits">
                                        <List className="mr-2 h-4 w-4" />
                                        Traits
                                    </TabsTrigger>
                                    <TabsTrigger value="details">
                                        <Tag className="mr-2 h-4 w-4" />
                                        Details
                                    </TabsTrigger>
                                    <TabsTrigger value="discussion">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Discussion
                                    </TabsTrigger>
                                </TabsList>

                                {/* Traits Tab */}
                                <TabsContent value="traits" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            {nft.traits && nft.traits.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {nft.traits.map((trait, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-4 border border-border rounded-lg text-center bg-background hover:bg-muted/50 transition-colors"
                                                        >
                                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                                                {trait.trait_type}
                                                            </p>
                                                            <p className="font-semibold mt-1 text-lg">
                                                                {trait.value}
                                                            </p>
                                                            {trait.rarity && (
                                                                <p className="text-xs text-primary mt-1">
                                                                    {trait.rarity}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-center py-4">
                                                    This NFT has no traits.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Details Tab */}
                                <TabsContent value="details" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">
                                                    Contract Address
                                                </span>
                                                <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                                                    NFT Contract
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">
                                                    Token ID
                                                </span>
                                                <span className="text-sm font-mono text-foreground">
                                                    #{Number(nft.nft_id)}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">
                                                    Blockchain
                                                </span>
                                                <span className="text-sm text-foreground">
                                                    Internet Computer
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">
                                                    Standard
                                                </span>
                                                <span className="text-sm text-foreground">ICRC-7</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Discussion Tab */}
                                <TabsContent value="discussion" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            {mainForum ? (
                                                <div className="space-y-6">
                                                    <div className="text-center py-6 rounded-lg bg-muted/40">
                                                        <p className="text-muted-foreground mb-3">
                                                            Join the discussion on PiCO
                                                        </p>
                                                        <Button asChild>
                                                            <Link to={`/nft/${nftId}`}>
                                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                                View Full Discussion
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                    <Separator />
                                                    <div className="space-y-6">
                                                        <h3 className="font-semibold text-lg">
                                                            Recent Comments ({Math.min(mainForum.comments.length, 3)})
                                                        </h3>
                                                        {isLoadingForums ? (
                                                            <div className="flex justify-center py-4">
                                                                <LoadingSpinner />
                                                            </div>
                                                        ) : mainForum.comments.length > 0 ? (
                                                            mainForum.comments.slice(0, 3).map((comment, i) => (
                                                                <div key={i} className="flex items-start gap-4">
                                                                    <UserAvatar
                                                                        principalId={comment.user_id}
                                                                        size="lg"
                                                                    />
                                                                    <div className="w-full">
                                                                        <div className="flex items-center gap-2 text-sm mb-1">
                                                                            <span className="font-semibold">
                                                                                <UserName
                                                                                    principalId={comment.user_id}
                                                                                    maxLength={8}
                                                                                />
                                                                            </span>
                                                                            <span className="text-muted-foreground">
                                                                                •{" "}
                                                                                {new Date(
                                                                                    Number(comment.created_at) / 1000000
                                                                                ).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-muted-foreground">
                                                                            {comment.comment}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted-foreground text-center py-4">
                                                                No comments yet.
                                                            </p>
                                                        )}
                                                        {mainForum.comments.length > 3 && (
                                                            <div className="text-center">
                                                                <Button asChild variant="outline">
                                                                    <Link to={`/nft/${nftId}`}>
                                                                        View All {mainForum.comments.length} Comments
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                                    <p className="text-muted-foreground">
                                                        No discussion forum available for this NFT.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 