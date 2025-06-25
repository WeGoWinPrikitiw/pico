import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    ArrowLeft,
    TrendingUp,
    Clock,
    DollarSign
} from 'lucide-react';

interface Post {
    id: string;
    title: string;
    description: string;
    creator: {
        name: string;
        avatar: string;
        verified: boolean;
    };
    price: string;
    image: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    createdAt: string;
    tags: string[];
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
            await buyNFT(
                'buyer-principal-here', // This would be the current user's principal
                post.creator.name,
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/explore">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Explore
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                        {/* Search */}
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search posts, creators, tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full"
                            />
                        </div>

                        {/* View and Sort Controls */}
                        <div className="flex items-center gap-4">
                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* View Mode */}
                            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-square bg-gray-100 relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${post.isLiked
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <img
                                            src={post.creator.avatar}
                                            alt={post.creator.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm text-gray-600">{post.creator.name}</span>
                                        {post.creator.verified && (
                                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-blue-600">{post.price} PiCO</span>
                                        <span className="text-xs text-gray-500">{post.createdAt}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Heart className="h-4 w-4" />
                                                {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="h-4 w-4" />
                                                {post.comments}
                                            </span>
                                        </div>

                                        <div className="flex gap-1">
                                            <Link to={`/posts/${post.id}`}>
                                                <Button size="sm" variant="outline">View</Button>
                                            </Link>
                                            <Button size="sm" onClick={() => handleBuyNFT(post)}>Buy</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-4">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-6">
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <img
                                                        src={post.creator.avatar}
                                                        alt={post.creator.name}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                    <span className="text-sm text-gray-600">{post.creator.name}</span>
                                                    {post.creator.verified && (
                                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-gray-500">• {post.createdAt}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600 mb-2">{post.price} PiCO</p>
                                                <div className="flex gap-2">
                                                    <Link to={`/posts/${post.id}`}>
                                                        <Button size="sm" variant="outline">View Details</Button>
                                                    </Link>
                                                    <Button size="sm" onClick={() => handleBuyNFT(post)}>Buy Now</Button>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-4">{post.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className={`flex items-center gap-1 hover:text-red-500 ${post.isLiked ? 'text-red-500' : ''}`}
                                                >
                                                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                                    {post.likes}
                                                </button>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="h-4 w-4" />
                                                    {post.comments}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Share2 className="h-4 w-4" />
                                                    {post.shares}
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredPosts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No posts found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 