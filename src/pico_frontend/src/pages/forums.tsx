import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Button,
    Input,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Textarea,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    Badge,
    Separator
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import {
    useForums,
    useLikeForum,
    useCreateForum,
    useUserForums,
    useForumsStats,
    useForumFilters,
} from "@/hooks";
import { toast } from "sonner";
import {
    MessageSquare,
    Heart,
    PlusCircle,
    User,
    Search,
    TrendingUp,
    AlertCircle,
    Loader2,
    Filter,
    Clock,
    Users,
    ChevronDown
} from "lucide-react";

export function ForumsPage() {
    const navigate = useNavigate();
    const { principal, isAuthenticated, login } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "popular" | "mostComments">("newest");
    const [activeFilter, setActiveFilter] = useState<"all" | "my-forums">("all");

    const { data: allForums = [], isLoading: isLoadingAll, error: allForumsError, refetch: refetchAllForums } = useForums();
    const { data: userForums = [], isLoading: isLoadingUserForums } = useUserForums(principal);
    const { data: forumsStats, isLoading: isLoadingStats } = useForumsStats();

    const likeMutation = useLikeForum();
    const createForumMutation = useCreateForum();

    const { filterForums } = useForumFilters();

    const forumsToDisplay = useMemo(() => {
        const sourceForums = activeFilter === "my-forums" ? userForums : allForums;
        return filterForums(sourceForums, { searchQuery, sortBy });
    }, [activeFilter, userForums, allForums, searchQuery, sortBy, filterForums]);

    const isLoading = activeFilter === "my-forums" ? isLoadingUserForums : isLoadingAll;

    const handleLikeForum = (forumId: bigint) => {
        if (!principal) return toast.error("Please connect your wallet first");
        likeMutation.mutate({ forumId: Number(forumId), userId: principal });
    };

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1000000);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const formatRelativeTime = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1000000);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return formatDate(timestamp);
    };

    const getSortLabel = (sort: string) => {
        switch (sort) {
            case 'newest': return 'Newest First';
            case 'popular': return 'Most Popular';
            case 'mostComments': return 'Most Discussed';
            default: return 'Sort By';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-6">
                <div className="max-w-lg space-y-6">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">Join the Discussion</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Connect your wallet to participate in community conversations, create engaging topics, and connect with fellow NFT enthusiasts.
                        </p>
                    </div>
                    <Button onClick={login} size="lg" className="px-8">
                        <User className="mr-2 h-5 w-5" />
                        Connect Wallet
                    </Button>
                </div>
            </div>
        );
    }

    if (allForumsError) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-6 p-6">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold">Unable to Load Forums</h2>
                    <p className="text-muted-foreground max-w-md">
                        We encountered an issue while fetching the community forums. Please check your connection and try again.
                    </p>
                </div>
                <Button onClick={() => refetchAllForums()} variant="outline" size="lg">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-14 z-30">
                <div className="container max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight">Community Forums</h1>
                            <p className="text-xl text-muted-foreground">
                                Discover insights, share ideas, and connect with the PiCO community
                            </p>
                        </div>

                        {!isLoadingStats && forumsStats && (
                            <div className="flex items-center gap-8 p-4 bg-muted/30 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">
                                        {Number(forumsStats.total_forums).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium">Total Forums</p>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">
                                        {Number(forumsStats.total_comments).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium">Comments</p>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">
                                        {Number(forumsStats.total_likes).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium">Likes</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    {/* Filter Tabs */}
                                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                                        <Button
                                            variant={activeFilter === 'all' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setActiveFilter('all')}
                                            className="text-sm font-medium"
                                        >
                                            All Forums
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                {allForums.length}
                                            </Badge>
                                        </Button>
                                        <Button
                                            variant={activeFilter === 'my-forums' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setActiveFilter('my-forums')}
                                            className="text-sm font-medium"
                                        >
                                            My Forums
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                {userForums.length}
                                            </Badge>
                                        </Button>
                                    </div>

                                    {/* Search and Sort Controls */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:flex-none">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search discussions..."
                                                className="pl-10 w-full sm:w-64"
                                            />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4" />
                                                    <span className="hidden sm:inline">{getSortLabel(sortBy)}</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    Newest First
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortBy('popular')}>
                                                    <Heart className="mr-2 h-4 w-4" />
                                                    Most Popular
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortBy('mostComments')}>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Most Discussed
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <LoadingSpinner size="lg" />
                                    </div>
                                ) : forumsToDisplay.length > 0 ? (
                                    <div className="space-y-0">
                                        {forumsToDisplay.map((forum, index) => (
                                            <div
                                                key={String(forum.forum_id)}
                                                className={`group p-6 hover:bg-muted/30 transition-all duration-200 ${index !== forumsToDisplay.length - 1 ? 'border-b' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Avatar */}
                                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                                        <AvatarImage src={`https://avatar.vercel.sh/${forum.principal_id}.png`} />
                                                        <AvatarFallback className="text-sm font-medium">
                                                            {forum.principal_id.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <Link
                                                                    to={`/forums/${forum.forum_id}`}
                                                                    className="block group-hover:text-primary transition-colors"
                                                                >
                                                                    <h3 className="text-xl font-semibold leading-tight mb-2 line-clamp-2">
                                                                        {forum.title}
                                                                    </h3>
                                                                </Link>
                                                                <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                                                    {forum.description}
                                                                </p>

                                                                {/* Meta Information */}
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Users className="h-4 w-4" />
                                                                        <span className="font-medium">
                                                                            {principal === forum.principal_id ? "You" : `${forum.principal_id.slice(0, 8)}...`}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-muted-foreground/60">•</span>
                                                                    <span>{formatRelativeTime(forum.created_at)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Engagement Stats */}
                                                            <div className="flex items-center gap-6 text-sm text-muted-foreground flex-shrink-0">
                                                                <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                                                    <Heart className="h-4 w-4" />
                                                                    <span className="font-medium">{Number(forum.likes)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                                                    <MessageSquare className="h-4 w-4" />
                                                                    <span className="font-medium">{forum.comments.length}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 space-y-4">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold">No Forums Found</h3>
                                            <p className="text-muted-foreground max-w-md mx-auto">
                                                {searchQuery
                                                    ? `No forums match "${searchQuery}". Try adjusting your search terms or filters.`
                                                    : activeFilter === 'my-forums'
                                                        ? "You haven't created any forums yet. Start a new discussion to get the conversation going!"
                                                        : "No forums available in this category. Be the first to start a discussion!"
                                                }
                                            </p>
                                        </div>
                                        {!searchQuery && (
                                            <Button variant="outline" onClick={() => setActiveFilter('all')}>
                                                View All Forums
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        <TrendingTopicsCard forums={allForums.slice(0, 5)} />
                    </aside>
                </div>
            </main>
        </div>
    );
}

function TrendingTopicsCard({ forums }: { forums: any[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </div>
                    Trending Now
                </CardTitle>
                <CardDescription className="text-sm">
                    Popular discussions in the community
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                {forums.length > 0 ? (
                    <div className="space-y-4">
                        {forums.map((forum, index) => (
                            <div key={index} className="group">
                                <Link
                                    to={`/forums/${forum.forum_id}`}
                                    className="block space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <h4 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {forum.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-3 w-3" />
                                                <span className="font-medium">{Number(forum.likes)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                <span className="font-medium">{forum.comments.length}</span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            #{index + 1}
                                        </Badge>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 space-y-2">
                        <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                            No trending topics yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}