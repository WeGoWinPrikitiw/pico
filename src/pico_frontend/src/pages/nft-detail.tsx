import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Textarea,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Separator,
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
    Calendar,
    Tag,
    ExternalLink,
    AlertCircle,
    Loader2,
    MoreVertical,
    List,
    History,
} from "lucide-react";
import { toast } from "sonner";

export function NFTDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, principal, login } = useAuth();

    const [newComment, setNewComment] = useState("");

    const nftId = id ? parseInt(id) : 0;

    const { data: nft, isLoading: isLoadingNFT, error: nftError } = useNFT(nftId);
    const { data: nftForums = [], isLoading: isLoadingForums, refetch: refetchForums } = useNFTForums(nftId);
    const { data: userBalance = 0, isLoading: isLoadingBalance } = useUserBalance(principal);

    const mainForum = nftForums.length > 0 ? nftForums[0] : null;

    const likeMutation = useLikeForum();
    const commentMutation = useCommentForum();
    const purchaseMutation = useBuyNFT();

    const handleLike = () => {
        if (!isAuthenticated) return toast.error("Please login to like.");
        if (!mainForum || !principal) return toast.error("Forum not available.");
        likeMutation.mutate({ forumId: Number(mainForum.forum_id), userId: principal });
    };

    const handleComment = () => {
        if (!isAuthenticated) return toast.error("Please login to comment.");
        if (!newComment.trim()) return toast.error("Please enter a comment.");
        if (!mainForum || !principal) return toast.error("Forum not available.");
        commentMutation.mutate({
            forumId: Number(mainForum.forum_id),
            comment: newComment.trim(),
            userId: principal
        }, {
            onSuccess: () => {
                setNewComment("");
                refetchForums();
                toast.success("Comment posted!");
            }
        });
    };

    const handlePurchase = () => {
        if (!isAuthenticated) return login();
        if (!nft || !principal) return toast.error("NFT data not available.");
        purchaseMutation.mutate({
            buyer: principal,
            seller: String(nft.owner),
            nftId: nftId,
            price: Number(nft.price),
            forumId: mainForum ? Number(mainForum.forum_id) : undefined
        }, {
            onSuccess: () => toast.success("Purchase successful!"),
            onError: (err) => toast.error(`Purchase failed: ${err.message}`),
        });
    };

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
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    if (isLoadingNFT) {
        return (
            <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>
        );
    }

    if (nftError || !nft) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">NFT Not Found</h2>
                <p className="text-muted-foreground">The NFT you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate("/explore")} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
                </Button>
            </div>
        );
    }

    const isOwner = principal === String(nft.owner);
    const hasInsufficientFunds = isAuthenticated && !isOwner && userBalance < Number(nft.price);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="mb-6">
                    <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-12">
                    {/* Left Column (Image) */}
                    <div className="lg:col-span-2 mb-8 lg:mb-0">
                        <Card className="sticky top-24 overflow-hidden border-2 border-border shadow-lg">
                            <CardContent className="p-0">
                                <div className="relative aspect-square">
                                    <img
                                        src={nft.image_url || "/placeholder-nft.png"}
                                        alt={nft.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    {nft.is_ai_generated && (
                                        <Badge variant="secondary" className="absolute top-3 left-3 bg-primary/90 text-primary-foreground shadow-md">
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
                                        <p className="text-sm text-primary font-semibold">PiCO Collection</p>
                                        <h1 className="text-4xl font-bold tracking-tighter">{nft.name}</h1>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={handleLike} disabled={!isAuthenticated || likeMutation.isPending}>
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground font-medium pl-1">{mainForum ? Number(mainForum.likes) : 0}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://avatar.vercel.sh/${nft.owner}.png`} />
                                            <AvatarFallback>{String(nft.owner).slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <span className="text-xs">Owner</span>
                                            <p className="font-semibold text-foreground">{isOwner ? "You" : `${String(nft.owner).slice(0, 6)}...`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        <div>
                                            <span className="text-xs">Created</span>
                                            <p className="font-semibold text-foreground">{formatDate(nft.created_at)}</p>
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

                            {/* Purchase Card */}
                            <Card className="bg-muted/40">
                                <CardHeader>
                                    <CardTitle>Purchase</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Price</p>
                                            <p className="text-3xl font-bold text-primary">{Number(nft.price)} PiCO</p>
                                        </div>
                                        {isAuthenticated && (
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Your Balance</p>
                                                <p className={`text-lg font-semibold ${hasInsufficientFunds ? "text-destructive" : "text-foreground"}`}>
                                                    {isLoadingBalance ? <Loader2 className="h-4 w-4 animate-spin" /> : `${userBalance} PiCO`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {isOwner ? (
                                        <div className="p-3 bg-background rounded-lg text-center text-sm text-muted-foreground">You own this NFT.</div>
                                    ) : !isAuthenticated ? (
                                        <Button size="lg" className="w-full" onClick={login}><User className="mr-2 h-4 w-4" />Connect Wallet to Purchase</Button>
                                    ) : hasInsufficientFunds ? (
                                        <Button size="lg" className="w-full" disabled><AlertCircle className="mr-2 h-4 w-4" />Insufficient Funds</Button>
                                    ) : (
                                        <Button size="lg" className="w-full" onClick={handlePurchase} disabled={purchaseMutation.isPending}>
                                            {purchaseMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                                            Buy Now
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Tabs */}
                            <Tabs defaultValue="discussion">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="discussion"><MessageCircle className="mr-2 h-4 w-4" />Discussion</TabsTrigger>
                                    <TabsTrigger value="traits"><List className="mr-2 h-4 w-4" />Traits</TabsTrigger>
                                    <TabsTrigger value="details"><Tag className="mr-2 h-4 w-4" />Details</TabsTrigger>
                                    <TabsTrigger value="activity"><History className="mr-2 h-4 w-4" />Activity</TabsTrigger>
                                </TabsList>

                                {/* Discussion Tab */}
                                <TabsContent value="discussion" className="mt-4">
                                    <Card className="py-0">
                                        <CardContent className="p-6">
                                            {mainForum ? (
                                                <div className="space-y-6">
                                                    {isAuthenticated ? (
                                                        <div className="flex items-start gap-4">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={`https://avatar.vercel.sh/${principal}.png`} />
                                                                <AvatarFallback>{principal?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="w-full">
                                                                <Textarea
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    placeholder="Share your thoughts..."
                                                                    rows={3}
                                                                />
                                                                <Button onClick={handleComment} disabled={commentMutation.isPending} className="mt-3">
                                                                    {commentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                                    Post
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 rounded-lg bg-muted/40">
                                                            <p className="text-muted-foreground mb-3">Connect your wallet to join the discussion.</p>
                                                            <Button onClick={login}><User className="mr-2 h-4 w-4" />Connect Wallet</Button>
                                                        </div>
                                                    )}
                                                    <Separator />
                                                    <div className="space-y-6">
                                                        <h3 className="font-semibold text-lg">Comments ({mainForum.comments.length})</h3>
                                                        {isLoadingForums ? (
                                                            <div className="flex justify-center py-4"><LoadingSpinner /></div>
                                                        ) : mainForum.comments.length > 0 ? (
                                                            mainForum.comments.map((comment, i) => (
                                                                <div key={i} className="flex items-start gap-4">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={`https://avatar.vercel.sh/${comment.user_id}.png`} />
                                                                        <AvatarFallback>{comment.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="w-full">
                                                                        <div className="flex items-center gap-2 text-sm mb-1">
                                                                            <span className="font-semibold">{comment.user_id === principal ? "You" : `${comment.user_id.slice(0, 5)}...`}</span>
                                                                            <span className="text-muted-foreground">• {new Date(Number(comment.created_at) / 1000000).toLocaleString()}</span>
                                                                        </div>
                                                                        <p className="text-muted-foreground">{comment.comment}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to post!</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                                    <p className="text-muted-foreground">No discussion forum available for this NFT.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Traits Tab */}
                                <TabsContent value="traits" className="mt-4">
                                    <Card className="py-0">
                                        <CardContent className="p-6">
                                            {nft.traits && nft.traits.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {nft.traits.map((trait, index) => (
                                                        <div key={index} className="p-4 border border-border rounded-lg text-center bg-background hover:bg-muted/50 transition-colors">
                                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{trait.trait_type}</p>
                                                            <p className="font-semibold mt-1 text-lg">{trait.value}</p>
                                                            {trait.rarity && <p className="text-xs text-primary mt-1">{trait.rarity}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-center py-4">This NFT has no traits.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Details Tab */}
                                <TabsContent value="details" className="mt-4">
                                    <Card className="py-0">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Contract Address</span>
                                                <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">NFT Contract</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Token ID</span>
                                                <span className="text-sm font-mono text-foreground">#{Number(nft.nft_id)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Blockchain</span>
                                                <span className="text-sm text-foreground">Internet Computer</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Standard</span>
                                                <span className="text-sm text-foreground">ICRC-7</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Activity Tab */}
                                <TabsContent value="activity" className="mt-4">
                                    <Card className="py-0">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Sparkles className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Minted</p>
                                                        <p className="text-sm text-muted-foreground">by {String(nft.owner).slice(0, 6)}... on {formatDate(nft.created_at)}</p>
                                                    </div>
                                                </div>
                                                {/* Future activity items would go here */}
                                            </div>
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
