import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback, Textarea,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Separator
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import {
    useNFT,
    useNFTForums,
    useLikeForum,
    useCommentForum,
    useUserBalance,
    useBuyNFT,
} from "@/hooks";
import {
    ArrowLeft,
    Heart,
    Share2,
    ShoppingCart,
    MessageCircle,
    Send,
    User,
    Sparkles,
    Eye,
    Calendar, Tag,
    ExternalLink, AlertCircle
} from "lucide-react";

export function NFTDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, principal, login } = useAuth();

    const [newComment, setNewComment] = useState("");
    const [activeTab, setActiveTab] = useState("details");

    // Simple toast implementation
    const toast = {
        success: (message: string) => {
            console.log("✅ Success:", message);
            alert(message); // Temporary implementation
        },
        error: (message: string) => {
            console.log("❌ Error:", message);
            alert(message); // Temporary implementation
        }
    };

    const nftId = id ? parseInt(id) : 0;

    // Use hooks from hooks layer
    const {
        data: nft,
        isLoading: isLoadingNFT,
        error: nftError,
    } = useNFT(nftId);

    const {
        data: nftForums = [],
        isLoading: isLoadingForums,
        refetch: refetchForums,
    } = useNFTForums(nftId);

    const {
        data: userBalance = 0,
        isLoading: isLoadingBalance,
    } = useUserBalance(principal);

    // Get the main forum for this NFT
    const mainForum = nftForums.length > 0 ? nftForums[0] : null;

    // Use hooks for mutations
    const likeMutation = useLikeForum();
    const commentMutation = useCommentForum();
    const purchaseMutation = useBuyNFT();

    const handleLike = () => {
        if (!isAuthenticated) {
            toast.error("Please login to like");
            return;
        }
        if (!mainForum || !principal) {
            toast.error("Forum not available");
            return;
        }
        likeMutation.mutate({
            forumId: Number(mainForum.forum_id),
            userId: principal
        });
    };

    const handleComment = () => {
        if (!isAuthenticated) {
            toast.error("Please login to comment");
            return;
        }
        if (!newComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }
        if (!mainForum || !principal) {
            toast.error("Forum not available");
            return;
        }
        commentMutation.mutate({
            forumId: Number(mainForum.forum_id),
            comment: newComment.trim(),
            userId: principal
        }, {
            onSuccess: () => {
                setNewComment("");
                refetchForums();
            }
        });
    };

    const handlePurchase = () => {
        if (!isAuthenticated) {
            login();
            return;
        }
        if (!nft || !principal) {
            toast.error("NFT data not available");
            return;
        }
        purchaseMutation.mutate({
            buyer: principal,
            seller: String(nft.owner),
            nftId: nftId,
            price: Number(nft.price),
            forumId: mainForum ? Number(mainForum.forum_id) : undefined
        });
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    const formatDate = (timestamp: number | bigint) => {
        const date = new Date(Number(timestamp) / 1000000);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (isLoadingNFT) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading NFT...</p>
                </div>
            </div>
        );
    }

    if (nftError || !nft) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">NFT Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The NFT you're looking for doesn't exist or has been removed.
                    </p>
                    <Button onClick={() => navigate("/explore")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Explore
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = principal === String(nft.owner);
    const canPurchase = isAuthenticated && !isOwner && userBalance >= Number(nft.price);
    const hasInsufficientFunds = isAuthenticated && !isOwner && userBalance < Number(nft.price);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div className="h-6 w-px bg-border" />
                            <div>
                                <h1 className="text-lg font-semibold truncate max-w-md">{nft.name}</h1>
                                <p className="text-sm text-muted-foreground">
                                    NFT #{Number(nft.nft_id)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLike}
                                disabled={!isAuthenticated || likeMutation.isPending}
                            >
                                <Heart className={`h-4 w-4 mr-2`} />
                                {mainForum ? Number(mainForum.likes) : 0}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image & Details */}
                    <div className="space-y-6">
                        {/* NFT Image */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="relative aspect-square">
                                    <img
                                        src={nft.image_url || "/placeholder-nft.png"}
                                        alt={nft.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    {nft.is_ai_generated && (
                                        <div className="absolute top-4 left-4">
                                            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                AI Generated
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                                            <Eye className="h-3 w-3 mr-1" />
                                            {Math.floor(Math.random() * 1000)} views
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* NFT Traits */}
                        {nft.traits && nft.traits.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Traits</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {nft.traits.map((trait, index) => (
                                            <div
                                                key={index}
                                                className="p-3 border border-border rounded-lg text-center"
                                            >
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                    {trait.trait_type}
                                                </p>
                                                <p className="font-semibold mt-1">{trait.value}</p>
                                                {trait.rarity && (
                                                    <p className="text-xs text-primary mt-1">{trait.rarity}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Info & Actions */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={`https://avatar.vercel.sh/${nft.owner}.png`} />
                                        <AvatarFallback>
                                            {String(nft.owner).slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Owner</p>
                                        <p className="font-semibold">
                                            {isOwner ? "You" : `${String(nft.owner).slice(0, 10)}...`}
                                        </p>
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold mb-2">{nft.name}</h1>
                                <p className="text-muted-foreground mb-4">{nft.description}</p>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Created {formatDate(nft.created_at)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Tag className="h-4 w-4" />
                                        NFT #{Number(nft.nft_id)}
                                    </div>
                                </div>

                                {/* Price & Purchase */}
                                <div className="border border-border rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Price</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {Number(nft.price)} PiCO
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Your Balance</p>
                                            <p className={`text-lg font-semibold ${hasInsufficientFunds ? "text-destructive" : "text-foreground"}`}>
                                                {isLoadingBalance ? "..." : `${userBalance} PiCO`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {isOwner ? (
                                        <div className="p-4 bg-muted rounded-lg text-center">
                                            <p className="text-sm text-muted-foreground">You own this NFT</p>
                                        </div>
                                    ) : !isAuthenticated ? (
                                        <Button size="lg" className="w-full" onClick={login}>
                                            <User className="mr-2 h-4 w-4" />
                                            Connect Wallet to Purchase
                                        </Button>
                                    ) : hasInsufficientFunds ? (
                                        <div>
                                            <Button size="lg" className="w-full" disabled>
                                                <AlertCircle className="mr-2 h-4 w-4" />
                                                Insufficient Funds
                                            </Button>
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                You need {Number(nft.price) - userBalance} more PiCO tokens
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="w-full"
                                            onClick={handlePurchase}
                                            disabled={purchaseMutation.isPending}
                                        >
                                            {purchaseMutation.isPending ? (
                                                <LoadingSpinner size="sm" className="mr-2" />
                                            ) : (
                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                            )}
                                            Buy Now for {Number(nft.price)} PiCO
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs for additional info */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="activity">Activity</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-4">
                                <Card>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Contract Address</span>
                                            <span className="text-sm font-mono">NFT Contract</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Token ID</span>
                                            <span className="text-sm font-mono">#{Number(nft.nft_id)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Blockchain</span>
                                            <span className="text-sm">Internet Computer</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Standard</span>
                                            <span className="text-sm">ICRC-7</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="activity" className="space-y-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Sparkles className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Minted</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(nft.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Comments Section */}
                {mainForum && (
                    <div className="mt-12">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5" />
                                        Discussion ({mainForum.comments.length})
                                    </h2>
                                    <Link to="/forums" className="text-sm text-primary hover:underline">
                                        View in Forums
                                        <ExternalLink className="h-3 w-3 ml-1 inline" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Add Comment */}
                                {isAuthenticated ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Share your thoughts about this NFT..."
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-muted-foreground">
                                                {newComment.length}/500 characters
                                            </p>
                                            <Button
                                                onClick={handleComment}
                                                disabled={!newComment.trim() || commentMutation.isPending}
                                                size="sm"
                                            >
                                                {commentMutation.isPending ? (
                                                    <LoadingSpinner size="sm" className="mr-2" />
                                                ) : (
                                                    <Send className="mr-2 h-4 w-4" />
                                                )}
                                                Post Comment
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-muted-foreground mb-4">
                                            Connect your wallet to join the discussion
                                        </p>
                                        <Button onClick={login}>
                                            <User className="mr-2 h-4 w-4" />
                                            Connect Wallet
                                        </Button>
                                    </div>
                                )}

                                <Separator />

                                {/* Comments List */}
                                {isLoadingForums ? (
                                    <div className="text-center py-6">
                                        <LoadingSpinner size="sm" />
                                    </div>
                                ) : mainForum.comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {mainForum.comments.map((comment, index) => (
                                            <div key={index} className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${comment.user_id}.png`} />
                                                    <AvatarFallback>
                                                        {comment.user_id.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium">
                                                            {comment.user_id === principal
                                                                ? "You"
                                                                : `${comment.user_id.slice(0, 10)}...`}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(Number(comment.created_at))}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{comment.comment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No comments yet</p>
                                        <p className="text-sm text-muted-foreground">
                                            Be the first to share your thoughts!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
} 