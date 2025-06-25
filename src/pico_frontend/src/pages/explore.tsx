import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Input,
    Separator
} from '@/components/ui';
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
    Sliders
} from 'lucide-react';

interface NFTCard {
    id: string;
    title: string;
    image: string;
    price: string;
    likes: number;
    views: number;
    creator: {
        name: string;
        avatar: string;
        verified: boolean;
    };
    isLiked: boolean;
}

export function ExplorePage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const mockNFTs: NFTCard[] = [
        {
            id: '1',
            title: 'Abstract Waves',
            image: '/landing/landing-hero.png',
            price: '25.5',
            likes: 342,
            views: 1250,
            creator: {
                name: 'ArtMaster99',
                avatar: '/brand/pico-logo.svg',
                verified: true
            },
            isLiked: false
        },
        // Add more mock NFTs here
    ];

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
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
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
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full"
                                    />
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
                                <label className="block text-sm font-medium mb-2">
                                    Status
                                </label>
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
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-6'}>
                    {mockNFTs.map((nft) => (
                        <Link key={nft.id} to={`/nft/${nft.id}`}>
                            <Card className="group hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    {/* Image */}
                                    <div className="relative aspect-square">
                                        <img
                                            src={nft.image}
                                            alt={nft.title}
                                            className="w-full h-full object-cover rounded-t-lg"
                                        />
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                                                    <Heart className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={nft.creator.avatar} />
                                                <AvatarFallback>{nft.creator.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground">
                                                {nft.creator.name}
                                            </span>
                                        </div>

                                        <h3 className="font-semibold mb-2">{nft.title}</h3>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                                                <p className="font-semibold text-primary">{nft.price} PiCO</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Heart className="h-4 w-4" />
                                                    {nft.likes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="h-4 w-4" />
                                                    {nft.views}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
} 