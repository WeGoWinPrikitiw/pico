import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import {
    Search,
    TrendingUp,
    Users,
    Upload,
    User,
    Grid3X3,
    Heart,
    MessageCircle,
    Share2,
    Filter
} from 'lucide-react';

interface NFTItem {
    id: string;
    title: string;
    creator: string;
    price: string;
    image: string;
    likes: number;
    isLiked: boolean;
}

export function ExplorePage() {
    const { principal, userBalance, transactions, tokenInfo, loadUserData } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('trending');

    // Generate NFT data from real transactions
    const generateNFTsFromTransactions = (): NFTItem[] => {
        const mockImages = [
            '/landing/landing-hero.png',
            '/brand/pico-glow.png',
            '/brand/pico-logo.svg',
            '/brand/pico-logo-dark.svg'
        ];

        const nftTitles = [
            'Digital Sunrise',
            'Neon Dreams',
            'Abstract Flow',
            'Cosmic Waves',
            'Pixel Art',
            'Crypto Vision',
            'Digital Ocean',
            'Future Scape'
        ];

        // Create NFTs from actual transactions
        const nftsFromTransactions = transactions
            .filter(tx => tx.nft_id !== undefined)
            .map((tx, index) => ({
                id: tx.nft_id?.toString() || `tx-${tx.transaction_id}`,
                title: nftTitles[index % nftTitles.length] || `NFT #${tx.nft_id}`,
                creator: tx.from_principal_id ? `${tx.from_principal_id.slice(0, 6)}...${tx.from_principal_id.slice(-4)}` : 'Unknown',
                price: (tx.price_token / 100000000).toFixed(2), // Convert from e8s to PICO
                image: mockImages[index % mockImages.length],
                likes: Math.floor(Math.random() * 300) + 50,
                isLiked: Math.random() > 0.7,
                transaction_id: tx.transaction_id
            }));

        // Add some default mock NFTs if no transactions
        if (nftsFromTransactions.length === 0) {
            return [
                {
                    id: '1',
                    title: 'Digital Sunrise',
                    creator: 'CryptoArtist',
                    price: '12.5',
                    image: '/landing/landing-hero.png',
                    likes: 234,
                    isLiked: false
                },
                {
                    id: '2',
                    title: 'Neon Dreams',
                    creator: 'PixelMaster',
                    price: '8.7',
                    image: '/brand/pico-glow.png',
                    likes: 156,
                    isLiked: true
                },
                {
                    id: '3',
                    title: 'Abstract Flow',
                    creator: 'DigitalVibe',
                    price: '15.2',
                    image: '/brand/pico-logo.svg',
                    likes: 89,
                    isLiked: false
                }
            ];
        }

        return nftsFromTransactions;
    };

    const [nfts, setNfts] = useState<NFTItem[]>([]);

    // Update NFTs when transactions change
    React.useEffect(() => {
        setNfts(generateNFTsFromTransactions());
    }, [transactions]);

    const filters = [
        { id: 'trending', label: 'Trending', icon: TrendingUp },
        { id: 'recent', label: 'Recent', icon: Grid3X3 },
        { id: 'price_low', label: 'Price: Low to High', icon: Filter },
        { id: 'price_high', label: 'Price: High to Low', icon: Filter }
    ];

    const handleLike = (nftId: string) => {
        setNfts(prev => prev.map(nft =>
            nft.id === nftId
                ? { ...nft, isLiked: !nft.isLiked, likes: nft.isLiked ? nft.likes - 1 : nft.likes + 1 }
                : nft
        ));
    };

    const quickActions = [
        {
            title: 'View Posts',
            description: 'Browse all NFT posts',
            icon: Grid3X3,
            link: '/posts',
            color: 'bg-blue-500'
        },
        {
            title: 'Upload NFT',
            description: 'Create and upload your NFT',
            icon: Upload,
            link: '/upload',
            color: 'bg-green-500'
        },
        {
            title: 'My Profile',
            description: 'View and edit your profile',
            icon: User,
            link: '/profile',
            color: 'bg-purple-500'
        },
        {
            title: 'Community',
            description: 'Connect with other creators',
            icon: Users,
            link: '/community',
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Explore PiCO</h1>
                            <p className="text-gray-600 mt-1">
                                Discover amazing NFTs and digital art from creators worldwide
                            </p>
                            {principal && (
                                <p className="text-sm text-blue-600 mt-2">
                                    Balance: {userBalance} PiCO tokens
                                </p>
                            )}
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search NFTs, creators, collections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {quickActions.map((action) => (
                        <Link
                            key={action.title}
                            to={action.link}
                            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                                <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                            <p className="text-sm text-gray-600">{action.description}</p>
                        </Link>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeFilter === filter.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <filter.icon className="h-4 w-4" />
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* NFT Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {nfts.map((nft) => (
                        <div key={nft.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative">
                                <img
                                    src={nft.image}
                                    alt={nft.title}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => handleLike(nft.id)}
                                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${nft.isLiked
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Heart className={`h-4 w-4 ${nft.isLiked ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 truncate">{nft.title}</h3>
                                        <p className="text-sm text-gray-600">by {nft.creator}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600">{nft.price} PiCO</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Heart className="h-4 w-4" />
                                            {nft.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="h-4 w-4" />
                                            12
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Link to={`/posts/${nft.id}`}>
                                            <Button size="sm">View</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                    <Button variant="outline" size="lg">
                        Load More NFTs
                    </Button>
                </div>
            </div>
        </div>
    );
} 