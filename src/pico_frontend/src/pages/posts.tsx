import React, { useState, useEffect } from "react";
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
} from "@/components/ui";
import { useAuth, useServices } from "@/context/auth-context";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  creatorPrincipal: string;
  price: string;
  image: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
  transaction_id?: number;
}

export function PostsPage() {
  const { principal } = useAuth();
  const services = useAuth().isAuthenticated ? useServices() : null;
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("trending");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNfts = async () => {
      if (!services) return;
      setLoading(true);
      try {
        const nfts = await services.nftService.getAllNFTs();
        if (nfts) {
          const formattedPosts: Post[] = nfts.map((nft: any) => ({
            id: nft.nft_id.toString(),
            title: nft.name,
            description: nft.description,
            creator: {
              name: `${nft.owner.toText().slice(0, 8)}...`,
              avatar: `https://avatar.vercel.sh/${nft.owner.toText()}.png`,
              verified: Math.random() > 0.5,
            },
            creatorPrincipal: nft.owner.toText(),
            price: (Number(nft.price) / 100000000).toFixed(2),
            image: nft.image_url,
            likes: Math.floor(Math.random() * 400) + 50,
            comments: Math.floor(Math.random() * 30) + 5,
            shares: Math.floor(Math.random() * 20) + 2,
            isLiked: Math.random() > 0.7,
            createdAt: new Date(
              Number(nft.created_at) / 1000000,
            ).toLocaleString(),
            tags: nft.traits.map((trait: any) => trait.value),
          }));
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNfts();
  }, [services]);

  const sortOptions = [
    { value: "trending", label: "Trending", icon: TrendingUp },
    { value: "recent", label: "Most Recent", icon: Clock },
    { value: "price_high", label: "Price: High to Low", icon: DollarSign },
    { value: "price_low", label: "Price: Low to High", icon: DollarSign },
  ];

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          }
          : post,
      ),
    );
  };

  const handleBuyNFT = async (post: Post) => {
    try {
      if (!principal) {
        alert("Please login to purchase");
        return;
      }

      if (!services) throw new Error("Services not available");
      await services.operationalService.buyNFT(principal, post.creatorPrincipal, parseInt(post.id), parseFloat(post.price));
    } catch (error) {
      console.error("Failed to buy NFT:", error);
      alert(`Failed to buy NFT: ${error}`);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link to="/explore">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Discover NFTs</h1>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-1 md:flex-none items-center gap-4 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search NFTs, creators, tags..."
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-accent" : ""}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-accent" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option.value)}
                className="whitespace-nowrap"
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading NFTs...</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <button
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors",
                      post.isLiked
                        ? "bg-red-500 text-white"
                        : "bg-black/20 text-white hover:bg-black/40",
                    )}
                  >
                    <Heart
                      className={cn("h-4 w-4", post.isLiked && "fill-current")}
                    />
                  </button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={post.creator.avatar}
                        alt={post.creator.name}
                      />
                      <AvatarFallback>{post.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {post.creator.name}
                      </span>
                      {post.creator.verified && (
                        <Badge
                          variant="secondary"
                          className="h-5 w-5 p-0 flex items-center justify-center"
                        >
                          <div className="h-2.5 w-2.5 bg-blue-500 rounded-full" />
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </span>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {post.price} PiCO
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/posts/${post.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Button
                      className="flex-1"
                      onClick={() => handleBuyNFT(post)}
                    >
                      Buy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar>
                              <AvatarImage
                                src={post.creator.avatar}
                                alt={post.creator.name}
                              />
                              <AvatarFallback>
                                {post.creator.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {post.creator.name}
                              </span>
                              {post.creator.verified && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 w-5 p-0 flex items-center justify-center"
                                >
                                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full" />
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              • {post.createdAt}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {post.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            className="text-lg font-semibold mb-2"
                          >
                            {post.price} PiCO
                          </Badge>
                          <div className="flex gap-2">
                            <Link to={`/posts/${post.id}`}>
                              <Button variant="outline">View Details</Button>
                            </Link>
                            <Button onClick={() => handleBuyNFT(post)}>
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={cn(
                              "flex items-center gap-1 transition-colors",
                              post.isLiked
                                ? "text-red-500"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4",
                                post.isLiked && "fill-current",
                              )}
                            />
                            {post.likes}
                          </button>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Share2 className="h-4 w-4" />
                            {post.shares}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
