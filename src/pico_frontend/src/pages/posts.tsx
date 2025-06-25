import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    AvatarFallback
} from '@/components/ui';
import { useAuth } from '@/context/auth-context';
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
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const { buyNFT, transactions, principal } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('trending');

    // Generate posts from real transactions
    const generatePostsFromTransactions = (): Post[] => {
        const mockImages = [
            '/landing/landing-hero.png',
            '/brand/pico-glow.png',
            '/brand/pico-logo.svg',
            '/brand/pico-logo-dark.svg'
        ];

        const artTitles = [
            'Digital Sunset Paradise',
            'Neon City Dreams',
            'Abstract Consciousness',
            'Cosmic Waves',
            'Pixel Art Masterpiece',
            'Future Vision',
            'Digital Ocean',
            'Cyber Dreams'
        ];

        const descriptions = [
            'A stunning digital artwork capturing the essence of a perfect virtual world.',
            'Cyberpunk-inspired artwork featuring futuristic elements with vibrant colors.',
            'An exploration of consciousness through abstract forms and flowing patterns.',
            'A mesmerizing piece that takes you on a journey through space and time.',
            'Carefully crafted pixel art that brings back nostalgic memories.',
            'A glimpse into the future through the lens of digital creativity.',
            'Dive deep into an ocean of digital possibilities and wonder.',
            'Dreams manifested in the cyber realm with stunning visual appeal.'
        ];

        const tagSets = [
            ['digital-art', 'landscape', 'sunset'],
            ['cyberpunk', 'city', 'neon'],
            ['abstract', 'consciousness', 'patterns'],
            ['space', 'cosmic', 'waves'],
            ['pixel-art', 'retro', 'gaming'],
            ['future', 'vision', 'tech'],
            ['ocean', 'blue', 'serenity'],
            ['cyber', 'dreams', 'digital']
        ];

        // Create posts from actual transactions
        const postsFromTransactions = transactions
            .filter(tx => tx.nft_id !== undefined)
            .map((tx, index) => ({
                id: tx.nft_id?.toString() || `tx-${tx.transaction_id}`,
                title: artTitles[index % artTitles.length] || `NFT #${tx.nft_id}`,
                description: descriptions[index % descriptions.length],
                creator: {
                    name: tx.from_principal_id ? `${tx.from_principal_id.slice(0, 8)}...` : 'Unknown Artist',
                    avatar: mockImages[index % mockImages.length],
                    verified: Math.random() > 0.5
                },
                creatorPrincipal: tx.from_principal_id || '',
                price: (tx.price_token / 100000000).toFixed(2), // Convert from e8s to PICO
                image: mockImages[index % mockImages.length],
                likes: Math.floor(Math.random() * 400) + 50,
                comments: Math.floor(Math.random() * 30) + 5,
                shares: Math.floor(Math.random() * 20) + 2,
                isLiked: Math.random() > 0.7,
                createdAt: new Date(Number(tx.created_at) / 1000000).toLocaleString(), // Convert from nanoseconds
                tags: tagSets[index % tagSets.length],
                transaction_id: tx.transaction_id
            }));

        // Add default posts if no transactions
        if (postsFromTransactions.length === 0) {
            return [
                {
                    id: '1',
                    title: 'Digital Sunset Paradise',
                    description: 'A stunning digital artwork capturing the essence of a perfect sunset in a virtual world.',
                    creator: {
                        name: 'ArtMaster99',
                        avatar: '/brand/pico-logo.svg',
                        verified: true
                    },
                    creatorPrincipal: '',
                    price: '25.5',
                    image: '/landing/landing-hero.png',
                    likes: 342,
                    comments: 28,
                    shares: 15,
                    isLiked: false,
                    createdAt: '2 hours ago',
                    tags: ['digital-art', 'landscape', 'sunset']
                },
                {
                    id: '2',
                    title: 'Neon City Dreams',
                    description: 'Cyberpunk-inspired artwork featuring a futuristic cityscape with vibrant neon colors.',
                    creator: {
                        name: 'CyberArtist',
                        avatar: '/brand/pico-glow.png',
                        verified: false
                    },
                    creatorPrincipal: '',
                    price: '18.2',
                    image: '/brand/pico-glow.png',
                    likes: 156,
                    comments: 12,
                    shares: 8,
                    isLiked: true,
                    createdAt: '5 hours ago',
                    tags: ['cyberpunk', 'city', 'neon']
                }
            ];
        }

        return postsFromTransactions;
    };

    const [posts, setPosts] = useState<Post[]>([]);

    // Update posts when transactions change
    React.useEffect(() => {
        setPosts(generatePostsFromTransactions());
    }, [transactions]);

    const sortOptions = [
        { value: 'trending', label: 'Trending', icon: TrendingUp },
        { value: 'recent', label: 'Most Recent', icon: Clock },
        { value: 'price_high', label: 'Price: High to Low', icon: DollarSign },
        { value: 'price_low', label: 'Price: Low to High', icon: DollarSign }
    ];

    const handleLike = (postId: string) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
                : post
        ));
    };

    const handleBuyNFT = async (post: Post) => {
        try {
            if (!principal) {
                alert('Please login to purchase');
                return;
            }

            await buyNFT(
                principal,
                post.creatorPrincipal,
                post.id,
                post.price
            );
        } catch (error) {
            console.error('Failed to buy NFT:', error);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
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
                                    onClick={() => setViewMode('grid')}
                                    className={viewMode === 'grid' ? 'bg-accent' : ''}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={viewMode === 'list' ? 'bg-accent' : ''}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {sortOptions.map(option => (
                            <Button
                                key={option.value}
                                variant={sortBy === option.value ? 'default' : 'outline'}
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
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPosts.map((post) => (
                            <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-200">
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
                                                : "bg-black/20 text-white hover:bg-black/40"
                                        )}
                                    >
                                        <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                                    </button>
                                </div>

                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
                                            <AvatarFallback>{post.creator.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium">{post.creator.name}</span>
                                            {post.creator.verified && (
                                                <Badge variant="info" className="h-5 w-5 p-0 flex items-center justify-center">
                                                    <div className="h-2.5 w-2.5 bg-white rounded-full" />
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-lg mb-1 truncate">{post.title}</h3>
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
                                            <Button variant="outline" className="w-full">View</Button>
                                        </Link>
                                        <Button className="flex-1" onClick={() => handleBuyNFT(post)}>Buy</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPosts.map((post) => (
                            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
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
                                                            <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
                                                            <AvatarFallback>{post.creator.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">{post.creator.name}</span>
                                                            {post.creator.verified && (
                                                                <Badge variant="info" className="h-5 w-5 p-0 flex items-center justify-center">
                                                                    <div className="h-2.5 w-2.5 bg-white rounded-full" />
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">• {post.createdAt}</span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                                                    <p className="text-muted-foreground">{post.description}</p>
                                                </div>

                                                <div className="text-right">
                                                    <Badge variant="secondary" className="text-lg font-semibold mb-2">
                                                        {post.price} PiCO
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        <Link to={`/posts/${post.id}`}>
                                                            <Button variant="outline">View Details</Button>
                                                        </Link>
                                                        <Button onClick={() => handleBuyNFT(post)}>Buy Now</Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleLike(post.id)}
                                                        className={cn(
                                                            "flex items-center gap-1 transition-colors",
                                                            post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
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
                                                    {post.tags.map(tag => (
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
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 