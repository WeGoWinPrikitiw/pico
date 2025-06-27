import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Input,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { createQueryKey } from "@/types";
import { serviceFactory } from "@/services";
import {
  Search,
  Grid3X3,
  List,
  Heart,
  MessageCircle,
  Share2,
  Sliders,
  Sparkles,
  User,
} from "lucide-react";

export function ExplorePage() {
  const { isAuthenticated, isServicesReady, login } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: allNFTs = [],
    isLoading: isLoadingNFTs,
    error: nftError,
    refetch: refetchNFTs,
  } = useQuery({
    queryKey: createQueryKey.nfts(),
    queryFn: async () => {
      // Ensure services are initialized
      await serviceFactory.initialize();
      const nftService = serviceFactory.getNFTService();
      if (!nftService) {
        console.warn("NFT service not available");
        return [];
      }
      return await nftService.getAllNFTs();
    },
    enabled: true, // Enable even without authentication for public queries
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredNFTs = useMemo(() => {
    let filtered = [...allNFTs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(query) ||
          nft.description.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.created_at - a.created_at);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "trending":
      default:
        // Keep original order for trending
        break;
    }

    return filtered;
  }, [allNFTs, searchQuery, sortBy]);

  if (isLoadingNFTs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  if (nftError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load NFTs</p>
          <Button onClick={() => refetchNFTs()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search NFTs, collections, or creators"
                className="pl-9 w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Button
                  onClick={login}
                  size="sm"
                  className="bg-primary"
                >
                  <User className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Sliders className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <div className="flex items-center rounded-lg border bg-background">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" className="w-full" />
                  <Input type="number" placeholder="Max" className="w-full" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select className="w-full h-9 rounded-md border bg-background px-3 py-1 text-sm">
                  <option value="">All Categories</option>
                  <option value="art">Art</option>
                  <option value="music">Music</option>
                  <option value="photography">Photography</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select className="w-full h-9 rounded-md border bg-background px-3 py-1 text-sm">
                  <option value="">All Status</option>
                  <option value="buy-now">Buy Now</option>
                  <option value="on-auction">On Auction</option>
                  <option value="new">New</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Collections
                </label>
                <select className="w-full h-9 rounded-md border bg-background px-3 py-1 text-sm">
                  <option value="">All Collections</option>
                  <option value="featured">Featured</option>
                  <option value="trending">Trending</option>
                  <option value="verified">Verified Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }
        >
          {filteredNFTs.length > 0 ? (
            filteredNFTs.map((nft) => (
              <Link key={nft.nft_id} to={`/nft/${nft.nft_id}`}>
                <Card className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative aspect-square">
                      <img
                        src={nft.image_url || "/placeholder-nft.png"}
                        alt={nft.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-background/80 backdrop-blur-sm"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-background/80 backdrop-blur-sm"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {nft.is_ai_generated && (
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant="secondary"
                            className="bg-primary/90 text-primary-foreground"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${nft.owner}.png`}
                          />
                          <AvatarFallback>
                            {String(nft.owner).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {String(nft.owner).slice(0, 8)}...
                        </span>
                      </div>

                      <h3 className="font-semibold mb-2">{nft.name}</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Current Price
                          </p>
                          <p className="font-semibold text-primary">
                            {nft.price} PiCO
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />0
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />0
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No NFTs have been created yet"}
              </p>
              {!isAuthenticated && (
                <Button onClick={login} className="mt-4">
                  <User className="mr-2 h-4 w-4" />
                  Connect Wallet to Create NFTs
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
