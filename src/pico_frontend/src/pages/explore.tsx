import { useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { FrontendNFTInfo } from "@/types";
import {
  NFTCard,
  SearchAndFilters,
  AIRecommendations,
  LoadingState,
  ErrorState,
  EmptyState
} from "@/components/explore";
import { useExplore } from "@/hooks/useExplore";

export function ExplorePage() {
  const { isAuthenticated, login } = useAuth();

  // Use the custom hook for all state and data management
  const {
    filteredNFTs,
    aiRecommendations,
    availableCategories,
    isLoadingNFTs,
    isLoadingRecommendations,
    nftError,
    viewMode,
    sortBy,
    searchQuery,
    filters,
    hasActiveFilters,
    setViewMode,
    setSortBy,
    setSearchQuery,
    setFilters,
    clearFilters,
    refetchNFTs,
  } = useExplore();

  // Action handlers
  const handleLike = useCallback((nftId: number) => {
    // TODO: Implement like functionality
    console.log("Liked NFT:", nftId);
  }, []);

  const handleShare = useCallback((nft: FrontendNFTInfo) => {
    // TODO: Implement share functionality
    console.log("Shared NFT:", nft);
  }, []);

  // Loading and error states
  if (isLoadingNFTs) {
    return <LoadingState />;
  }

  if (nftError) {
    return <ErrorState onRetry={refetchNFTs} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        availableCategories={availableCategories}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        isAuthenticated={isAuthenticated}
        onLogin={login}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Recommendations */}
        {isAuthenticated && (
          <AIRecommendations
            recommendations={aiRecommendations}
            isLoading={isLoadingRecommendations}
          />
        )}

        {/* Main NFT Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : "All NFTs"}
              </h2>
              <p className="text-muted-foreground">
                {filteredNFTs.length} NFT
                {filteredNFTs.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {filteredNFTs.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredNFTs.map((nft) => (
                <NFTCard
                  key={nft.nft_id}
                  nft={nft}
                  variant={viewMode}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              searchQuery={searchQuery}
              hasActiveFilters={hasActiveFilters}
              isAuthenticated={isAuthenticated}
              onClearFilters={clearFilters}
              onLogin={login}
            />
          )}
        </div>
      </div>
    </div>
  );
}