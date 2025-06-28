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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { createQueryKey, FrontendNFTInfo } from "@/types";
import { serviceFactory } from "@/services";
import { useDetailedAIRecommendations } from "@/hooks";
import {
  Search,
  Grid3X3,
  List,
  Heart,
  Share2, Sparkles,
  User,
  Eye,
  TrendingUp,
  Filter,
  X
} from "lucide-react";

export function ExplorePage() {
  const { isAuthenticated, login } = useAuth();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    category: "",
    status: "",
    collection: "",
  });

  // Get AI recommendations for authenticated users
  const {
    data: aiRecommendations = [],
    isLoading: isLoadingRecommendations,
  } = useDetailedAIRecommendations(5);

  const {
    data: allNFTs = [],
    isLoading: isLoadingNFTs,
    error: nftError,
    refetch: refetchNFTs,
  } = useQuery({
    queryKey: createQueryKey.nfts(),
    queryFn: async () => {
      console.log("Fetching NFTs from service...");
      await serviceFactory.initialize();
      const nftService = serviceFactory.getNFTService();
      if (!nftService) {
        console.warn("NFT service not available");
        return [];
      }
      const nfts = await nftService.getAllNFTs();
      console.log(`Fetched ${nfts.length} NFTs`);
      return nfts;
    },
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const filteredNFTs = useMemo(() => {
    let filtered = [...allNFTs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(query) ||
          nft.description.toLowerCase().includes(query)
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter((nft) => nft.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((nft) => nft.price <= Number(filters.maxPrice));
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
        break;
    }

    return filtered;
  }, [allNFTs, searchQuery, sortBy, filters]);

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      category: "",
      status: "",
      collection: "",
    });
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(value => value);

  if (isLoadingNFTs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading NFTs...</p>
            <p className="text-sm text-muted-foreground">Discovering amazing digital art</p>
          </div>
        </div>
      </div>
    );
  }

  if (nftError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium text-destructive">Failed to load NFTs</p>
            <p className="text-sm text-muted-foreground">Something went wrong while fetching the data</p>
          </div>
          <Button onClick={() => refetchNFTs()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const NFTGridCard = ({ nft }: { nft: FrontendNFTInfo }) => (
    <Link to={`/nft/${Number(nft.nft_id)}`} className="block">
      <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md py-0">
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={nft.image_url || "/placeholder-nft.png"}
              alt={nft.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {nft.is_ai_generated && (
                <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Creator */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://avatar.vercel.sh/${nft.owner}.png`} />
                <AvatarFallback className="text-xs">
                  {String(nft.owner).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground font-medium">
                {String(nft.owner).slice(0, 6)}...{String(nft.owner).slice(-4)}
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

            {/* Price and Stats */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Current Price</p>
                <p className="font-bold text-base text-primary">
                  {Number(nft.price)} PiCO
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>12</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>234</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const NFTListCard = ({ nft }: { nft: FrontendNFTInfo }) => (
    <Link to={`/nft/${Number(nft.nft_id)}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            {/* Image */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
              <img
                src={nft.image_url || "/placeholder-nft.png"}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              {nft.is_ai_generated && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://avatar.vercel.sh/${nft.owner}.png`} />
                      <AvatarFallback className="text-xs">
                        {String(nft.owner).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {String(nft.owner).slice(0, 6)}...{String(nft.owner).slice(-4)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
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
                    {Number(nft.price)} PiCO
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>12</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>234</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Hot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search NFTs, collections, or creators"
                className="pl-10 h-10 bg-background/50 border-muted-foreground/20 w-full focus:border-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <Button onClick={login} size="sm" className="bg-primary hover:bg-primary/90">
                  <User className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}

              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>

              <div className="flex items-center rounded-lg border bg-background overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-muted/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-base">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="buy-now">Buy Now</SelectItem>
                    <SelectItem value="on-auction">On Auction</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collections</label>
                <Select value={filters.collection} onValueChange={(value) => setFilters(prev => ({ ...prev, collection: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Collections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Collections</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Recommendations Section */}
        {isAuthenticated && (
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

            {isLoadingRecommendations ? (
              <div className="flex justify-center py-12">
                <div className="text-center space-y-3">
                  <LoadingSpinner size="md" />
                  <p className="text-muted-foreground">Getting your recommendations...</p>
                </div>
              </div>
            ) : aiRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {aiRecommendations.map((nft) => (
                  <Link key={Number(nft.nft_id)} to={`/nft/${Number(nft.nft_id)}`}>
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
                          <h3 className="font-semibold text-sm line-clamp-1">{nft.name}</h3>
                          <p className="font-bold text-primary text-sm">
                            {Number(nft.price)} PiCO
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* All NFTs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {searchQuery ? `Search Results for "${searchQuery}"` : "All NFTs"}
              </h2>
              <p className="text-muted-foreground">
                {filteredNFTs.length} NFT{filteredNFTs.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {filteredNFTs.length > 0 ? (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredNFTs.map((nft) => (
                viewMode === "grid" ? (
                  <NFTGridCard key={Number(nft.nft_id)} nft={nft} />
                ) : (
                  <NFTListCard key={Number(nft.nft_id)} nft={nft} />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || hasActiveFilters
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "No NFTs have been created yet. Be the first to mint something amazing!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(searchQuery || hasActiveFilters) && (
                  <Button onClick={clearFilters} variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
                {!isAuthenticated && (
                  <Button onClick={login}>
                    <User className="mr-2 h-4 w-4" />
                    Connect Wallet to Create NFTs
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}