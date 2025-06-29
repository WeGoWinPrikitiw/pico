import { useCallback } from "react";
import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui";
import { NFTFilters, RARITY_OPTIONS, SortType, ViewMode } from "@/lib/nft-utils";
import {
    Search,
    Grid3X3,
    List,
    Filter,
    X,
    User,
} from "lucide-react";

interface SearchAndFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filters: NFTFilters;
    setFilters: (filters: NFTFilters | ((prev: NFTFilters) => NFTFilters)) => void;
    sortBy: SortType;
    setSortBy: (sort: SortType) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    availableCategories: string[];
    hasActiveFilters: boolean;
    clearFilters: () => void;
    isAuthenticated: boolean;
    onLogin: () => void;
}

export function SearchAndFilters({
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    availableCategories,
    hasActiveFilters,
    clearFilters,
    isAuthenticated,
    onLogin,
}: SearchAndFiltersProps) {
    const handleCategoryChange = useCallback((value: string) => {
        setFilters((prev) => ({
            ...prev,
            category: value === "all" ? "" : value
        }));
    }, [setFilters]);

    const handleFilterChange = useCallback((field: keyof NFTFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    }, [setFilters]);

    return (
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-lg border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search NFTs, collections, or creators"
                            className="pl-10 h-10 bg-background/50 border-muted-foreground/20 w-full focus:border-primary"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filters Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                {/* <Button variant="outline" size="sm" className="relative h-10">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                                    )}
                                </Button> */}
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-screen max-w-sm sm:max-w-md p-6"
                                align="end"
                                sideOffset={8}
                                collisionPadding={16}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-base">Filters</h3>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear All
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {/* Price Range */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Price Range</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                                                className="w-full"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <Select
                                            value={filters.category || "all"}
                                            onValueChange={handleCategoryChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {availableCategories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select
                                            value={filters.status}
                                            onValueChange={(value) => handleFilterChange("status", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Status</SelectItem>
                                                <SelectItem value="buy-now">Buy Now</SelectItem>
                                                <SelectItem value="new">New</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Rarity */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Rarity</label>
                                        <Select
                                            value={filters.rarity}
                                            onValueChange={(value) => handleFilterChange("rarity", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Rarities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Rarities</SelectItem>
                                                {RARITY_OPTIONS.map((rarity) => (
                                                    <SelectItem key={rarity} value={rarity}>
                                                        {rarity}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* View Mode Toggle */}
                        <div className="flex w-full items-center h-10 rounded-lg border border-input bg-background overflow-hidden">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className="rounded-none border-0 h-10"
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className="rounded-none border-0 h-10"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Sort Select */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full !h-10">
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
    );
} 