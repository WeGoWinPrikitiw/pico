import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
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
  useForums,
  useLikeForum,
  useCommentForum,
  useDeleteForum,
  useForumFilters,
  useTrendingForums,
  useLatestForums,
  useUserForums,
  useForumsStats,
} from "@/hooks";
import { toast } from "sonner";
import {
  MessageSquare,
  Heart,
  PlusCircle,
  ArrowLeft,
  Loader2,
  Send,
  User,
  Search,
  TrendingUp,
  Clock,
  Filter,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  MessageCircle,
  ThumbsUp,
  Users,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function ForumsPage() {
  const navigate = useNavigate();
  const { principal, isAuthenticated, login } = useAuth();

  // UI State
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "mostComments">("newest");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Form states
  const [newComment, setNewComment] = useState("");

  // Data fetching hooks
  const {
    data: allForums = [],
    isLoading: isLoadingAll,
    error: allForumsError,
    refetch: refetchAllForums,
  } = useForums();

  const {
    data: trendingForums = [],
    isLoading: isLoadingTrending,
  } = useTrendingForums(12);

  const {
    data: latestForums = [],
    isLoading: isLoadingLatest,
  } = useLatestForums(12);

  const {
    data: userForums = [],
    isLoading: isLoadingUserForums,
  } = useUserForums(principal);

  const {
    data: forumsStats,
    isLoading: isLoadingStats,
  } = useForumsStats();

  // Mutation hooks
  const likeMutation = useLikeForum();
  const commentMutation = useCommentForum();
  const deleteMutation = useDeleteForum();

  // Helper hooks
  const { filterForums } = useForumFilters();

  // Get current forums based on active tab
  const getCurrentForums = () => {
    switch (activeTab) {
      case "trending":
        return trendingForums;
      case "latest":
        return latestForums;
      case "my-forums":
        return userForums;
      case "all":
      default:
        return allForums;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case "trending":
        return isLoadingTrending;
      case "latest":
        return isLoadingLatest;
      case "my-forums":
        return isLoadingUserForums;
      case "all":
      default:
        return isLoadingAll;
    }
  };

  // Apply filters and sorting
  const filteredForums = useMemo(() => {
    const currentForums = getCurrentForums();
    return filterForums(currentForums, {
      searchQuery,
      sortBy,
    });
  }, [getCurrentForums(), searchQuery, sortBy, filterForums]);

  // Event handlers
  const handleLikeForum = async (forumId: bigint) => {
    if (!principal) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await likeMutation.mutateAsync({
        forumId: Number(forumId),
        userId: principal,
      });
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleAddComment = async (forumId: bigint) => {
    if (!principal) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      await commentMutation.mutateAsync({
        forumId: Number(forumId),
        comment: newComment.trim(),
        userId: principal,
      });

      setNewComment("");
      toast.success("Comment added successfully!");

      // Refresh the forums data
      refetchAllForums();
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteForum = async (forumId: bigint) => {
    if (!principal) return;

    if (confirm("Are you sure you want to delete this forum? This action cannot be undone.")) {
      try {
        await deleteMutation.mutateAsync(Number(forumId));
        toast.success("Forum deleted successfully!");

        // Forum deleted successfully
      } catch (error) {
        toast.error("Failed to delete forum");
      }
    }
  };

  const openForumDetail = (forumId: string) => {
    navigate(`/forums/${forumId}`);
  };

  const toggleCommentExpansion = (forumId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(forumId)) {
      newExpanded.delete(forumId);
    } else {
      newExpanded.add(forumId);
    }
    setExpandedComments(newExpanded);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const isOwner = (forumPrincipal: string) => principal === forumPrincipal;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-4">
        <div className="max-w-md">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Connect to Join Forums</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to participate in community discussions, create forums, and engage with other NFT enthusiasts.
          </p>
          <Button onClick={login} size="lg">
            <User className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (allForumsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load forums</p>
          <Button onClick={() => refetchAllForums()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="sticky top-14 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Community Forums</h1>
              <p className="text-muted-foreground text-sm">
                Discuss NFTs, share insights, and connect with the community
              </p>
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or NFT name..."
                  className="pl-9"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "mostComments")}
                className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="mostComments">Most Comments</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        {forumsStats && !isLoadingStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{Number(forumsStats.total_forums)}</p>
                <p className="text-sm text-muted-foreground">Total Forums</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <Heart className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{Number(forumsStats.total_likes)}</p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <User className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{Number(forumsStats.total_comments)}</p>
                <p className="text-sm text-muted-foreground">Total Comments</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{Number(forumsStats.active_forums)}</p>
                <p className="text-sm text-muted-foreground">Active Forums</p>
              </div>
            </Card>
          </div>
        )}

        {/* Forum Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="all">All Forums</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="my-forums">My Forums</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {getCurrentLoading() ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredForums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredForums.map((forum) => {
                  const forumId = forum.forum_id.toString();
                  const isExpanded = expandedComments.has(forumId);
                  const isForumOwner = isOwner(forum.principal_id);

                  return (
                    <Card key={forumId} className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h2 className="text-lg font-semibold leading-snug cursor-pointer hover:text-primary" onClick={() => openForumDetail(forumId)}>
                              {forum.title}
                            </h2>
                            {forum.is_sold && <Badge variant="destructive">Sold</Badge>}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={`https://avatar.vercel.sh/${forum.principal_id}.png`} />
                              <AvatarFallback>{forum.principal_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{isForumOwner ? "You" : `${forum.principal_id.slice(0, 5)}...`}</span>
                            <span>•</span>
                            <span>{formatDate(forum.created_at)}</span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{forum.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <button onClick={() => handleLikeForum(forum.forum_id)} className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                              <Heart className="h-4 w-4" /> {Number(forum.likes)}
                            </button>
                            <button onClick={() => toggleCommentExpansion(forumId)} className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-colors">
                              <MessageSquare className="h-4 w-4" /> {forum.comments.length}
                            </button>
                          </div>
                          <button onClick={() => openForumDetail(forumId)} className="text-primary hover:underline text-xs font-semibold">
                            View Discussion
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-muted/50 p-4 border-t">
                          <div className="flex gap-3 items-start">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://avatar.vercel.sh/${principal}.png`} />
                              <AvatarFallback>{principal?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={2}
                                className="mb-2"
                              />
                              <Button size="sm" onClick={() => handleAddComment(forum.forum_id)} disabled={commentMutation.isPending}>
                                {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                              </Button>
                            </div>
                          </div>
                          {forum.comments.length > 0 && <Separator className="my-4" />}
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {forum.comments.slice(0, 3).map((comment, i) => (
                              <div key={i} className="flex gap-2 text-xs">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={`https://avatar.vercel.sh/${comment.user_id}.png`} />
                                </Avatar>
                                <div>
                                  <span className="font-semibold">{comment.user_id === principal ? "You" : `${comment.user_id.slice(0, 5)}...`}</span>
                                  <p className="text-muted-foreground">{comment.comment}</p>
                                </div>
                              </div>
                            ))}
                            {forum.comments.length > 3 && <p className="text-xs text-center text-muted-foreground pt-2">+{forum.comments.length - 3} more comments</p>}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No matching forums found" : "No forums here yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search." : "Why not explore other discussions?"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}