import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import {
  useForums,
  useCreateForum,
  useLikeForum,
  useCommentForum,
  useForumFilters,
  useTrendingForums,
  useLatestForums,
  useUserForums,
} from "@/hooks";
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
} from "lucide-react";

export function ForumsPage() {
  const { principal, isAuthenticated, login } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "mostComments">(
    "newest",
  );
  const [newForum, setNewForum] = useState({
    title: "",
    description: "",
    nftId: "",
    nftName: "",
  });

  // Hooks for different forum queries
  const {
    data: allForums = [],
    isLoading: isLoadingAll,
    error: allForumsError,
    refetch: refetchAllForums,
  } = useForums();

  const {
    data: trendingForums = [],
    isLoading: isLoadingTrending,
    error: trendingError,
  } = useTrendingForums();

  const {
    data: latestForums = [],
    isLoading: isLoadingLatest,
    error: latestError,
  } = useLatestForums();

  const {
    data: userForums = [],
    isLoading: isLoadingUserForums,
    error: userForumsError,
  } = useUserForums(principal);

  // Mutations
  const createForumMutation = useCreateForum();
  const likeMutation = useLikeForum();
  const commentMutation = useCommentForum();

  // Helper hooks
  const { filterForums } = useForumFilters();

  // Get current forums based on active tab
  const getCurrentForums = () => {
    switch (activeTab) {
      case "trending":
        return trendingForums;
      case "latest":
        return latestForums;
      case "following":
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
      case "following":
        return isLoadingUserForums;
      case "all":
      default:
        return isLoadingAll;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case "trending":
        return trendingError;
      case "latest":
        return latestError;
      case "following":
        return userForumsError;
      case "all":
      default:
        return allForumsError;
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

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principal) return;

    try {
      await createForumMutation.mutateAsync({
        title: newForum.title,
        description: newForum.description,
        nftId: parseInt(newForum.nftId),
        nftName: newForum.nftName,
        principalId: principal,
      });

      // Reset form
      setShowCreateForm(false);
      setNewForum({ title: "", description: "", nftId: "", nftName: "" });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleLikeForum = async (forumId: number) => {
    if (!principal) return;

    try {
      await likeMutation.mutateAsync({
        forumId,
        userId: principal,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <h2 className="text-2xl font-semibold mb-4">Please log in</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view and create forums.
        </p>
        <Button onClick={login}>
          <User className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  const isLoading = getCurrentLoading();
  const error = getCurrentError();

  if (error) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-4">
              <Link to="/explore">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Forums</h1>
                <p className="text-muted-foreground text-sm">
                  Discussions around NFTs and more
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search forums..."
                  className="pl-9"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "popular" | "mostComments")
                }
                className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="mostComments">Most Comments</option>
              </select>
            </div>

            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {showCreateForm ? "Cancel" : "Create Forum"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Forum Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Start a New Discussion</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateForum} className="space-y-4">
                <Input
                  placeholder="Forum Title"
                  value={newForum.title}
                  onChange={(e) =>
                    setNewForum({ ...newForum, title: e.target.value })
                  }
                  required
                />
                <Textarea
                  placeholder="What do you want to talk about?"
                  value={newForum.description}
                  onChange={(e) =>
                    setNewForum({ ...newForum, description: e.target.value })
                  }
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Associated NFT ID"
                    type="number"
                    value={newForum.nftId}
                    onChange={(e) =>
                      setNewForum({ ...newForum, nftId: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Associated NFT Name"
                    value={newForum.nftName}
                    onChange={(e) =>
                      setNewForum({ ...newForum, nftName: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" disabled={createForumMutation.isPending}>
                  {createForumMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Post Forum
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Forum Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Forums
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Latest
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Forums
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredForums.length > 0 ? (
              <div className="space-y-6">
                {filteredForums.map((forum) => (
                  <Card
                    key={forum.forum_id.toString()}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${forum.principal_id}.png`}
                          />
                          <AvatarFallback>
                            {forum.principal_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-semibold">
                                {forum.title}
                              </h2>
                              <p className="text-sm text-muted-foreground">
                                Started by{" "}
                                <span className="font-medium text-primary">
                                  {forum.principal_id.slice(0, 10)}...
                                </span>{" "}
                                about "{forum.nft_name}"
                              </p>
                            </div>
                            <Badge variant="secondary">
                              NFT ID: {forum.nft_id.toString()}
                            </Badge>
                          </div>
                          <p className="text-card-foreground mb-4">
                            {forum.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 px-6 py-3">
                      <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                        <div className="flex gap-6">
                          <button
                            onClick={() =>
                              handleLikeForum(Number(forum.forum_id))
                            }
                            disabled={likeMutation.isPending}
                            className="flex items-center gap-2 hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <Heart className="h-4 w-4" />
                            <span>{forum.likes.toString()} Likes</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>{forum.comments.length} Comments</span>
                          </div>
                        </div>
                        <p>
                          {new Date(
                            Number(forum.created_at / 1000000n),
                          ).toLocaleString()}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No matching forums" : "No forums yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Be the first one to start a discussion!"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}