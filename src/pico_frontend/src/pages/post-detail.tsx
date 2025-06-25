import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import {
    ArrowLeft,
    Heart,
    Share2,
    MoreHorizontal,
    Eye,
    Clock,
    TrendingUp,
    MessageCircle,
    Send,
    Flag,
    ExternalLink,
    Copy,
    DollarSign,
    Bookmark,
    Gift,
    Star
} from 'lucide-react';

interface Comment {
    id: string;
    user: {
        name: string;
        avatar: string;
        verified: boolean;
    };
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
}

interface PostDetail {
    id: string;
    title: string;
    description: string;
    image: string;
    creator: {
        name: string;
        avatar: string;
        verified: boolean;
        followers: number;
    };
    price: string;
    likes: number;
    views: number;
    shares: number;
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
    tags: string[];
    category: string;
    royalty: number;
    blockchain: string;
    tokenId: string;
    contractAddress: string;
    properties: Array<{
        trait_type: string;
        value: string;
    }>;
    history: Array<{
        type: 'created' | 'listed' | 'sold' | 'transfer';
        from?: string;
        to?: string;
        price?: string;
        timestamp: string;
    }>;
}

export function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { buyNFT, principal } = useAuth();

    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            user: {
                name: 'ArtCollector92',
                avatar: '/brand/pico-logo.svg',
                verified: true
            },
            content: 'This is absolutely stunning! The color palette and composition are perfect.',
            timestamp: '2 hours ago',
            likes: 12,
            isLiked: false
        },
        {
            id: '2',
            user: {
                name: 'CryptoEnthusiast',
                avatar: '/brand/pico-glow.png',
                verified: false
            },
            content: 'Been following this artist for months. Their work just keeps getting better!',
            timestamp: '5 hours ago',
            likes: 8,
            isLiked: true
        }
    ]);

    const [newComment, setNewComment] = useState('');
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    // Mock post data (in real app, this would be fetched based on ID)
    const [post, setPost] = useState<PostDetail>({
        id: id || '1',
        title: 'Digital Sunset Paradise',
        description: 'A stunning digital artwork capturing the essence of a perfect sunset in a virtual world. This piece represents the harmony between nature and technology, featuring vibrant colors that transition from warm oranges to cool purples. Created using advanced digital techniques and inspired by the beauty of natural landscapes.',
        image: '/landing/landing-hero.png',
        creator: {
            name: 'ArtMaster99',
            avatar: '/brand/pico-logo.svg',
            verified: true,
            followers: 2847
        },
        price: '25.5',
        likes: 342,
        views: 1250,
        shares: 89,
        isLiked: false,
        isBookmarked: false,
        createdAt: '2024-03-15',
        tags: ['digital-art', 'landscape', 'sunset', 'virtual'],
        category: 'Digital Art',
        royalty: 10,
        blockchain: 'Internet Computer',
        tokenId: 'PICO-001',
        contractAddress: 'uxrrr-q7777-77774-qaaaq-cai',
        properties: [
            { trait_type: 'Style', value: 'Digital Landscape' },
            { trait_type: 'Color Palette', value: 'Warm Sunset' },
            { trait_type: 'Rarity', value: 'Rare' },
            { trait_type: 'Size', value: '4K Resolution' }
        ],
        history: [
            {
                type: 'created',
                to: 'ArtMaster99',
                timestamp: '2024-03-15 10:30:00'
            },
            {
                type: 'listed',
                price: '25.5 PiCO',
                timestamp: '2024-03-15 11:00:00'
            }
        ]
    });

    const handleLike = () => {
        setPost(prev => ({
            ...prev,
            isLiked: !prev.isLiked,
            likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
        }));
    };

    const handleBookmark = () => {
        setPost(prev => ({
            ...prev,
            isBookmarked: !prev.isBookmarked
        }));
    };

    const handleCommentLike = (commentId: string) => {
        setComments(prev => prev.map(comment =>
            comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                }
                : comment
        ));
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            user: {
                name: 'You',
                avatar: '/brand/pico-logo.svg',
                verified: false
            },
            content: newComment,
            timestamp: 'Just now',
            likes: 0,
            isLiked: false
        };

        setComments(prev => [comment, ...prev]);
        setNewComment('');
    };

    const handleBuyNFT = async () => {
        if (!principal) {
            alert('Please log in to purchase NFTs');
            return;
        }

        try {
            await buyNFT(
                principal,
                post.creator.name,
                post.id,
                post.price
            );
        } catch (error) {
            console.error('Failed to buy NFT:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/posts">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Posts
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image and Details */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <div className="aspect-square bg-gray-100 relative">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleLike}
                                        className={`bg-white/90 backdrop-blur-sm ${post.isLiked ? 'text-red-500' : ''}`}
                                    >
                                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleBookmark}
                                        className={`bg-white/90 backdrop-blur-sm ${post.isBookmarked ? 'text-blue-500' : ''}`}
                                    >
                                        <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-4 left-4 flex gap-4 text-white/90 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {post.views.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="h-4 w-4" />
                                        {post.likes.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Properties */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {post.properties.map((property, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 text-center">
                                        <p className="text-sm text-gray-600 uppercase tracking-wide">{property.trait_type}</p>
                                        <p className="font-semibold text-gray-900">{property.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                                >
                                    {showMoreDetails ? 'Show Less' : 'Show More'}
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Contract Address</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm">{post.contractAddress.slice(0, 10)}...</span>
                                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(post.contractAddress)}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Token ID</span>
                                    <span className="font-mono text-sm">{post.tokenId}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Blockchain</span>
                                    <span className="text-sm">{post.blockchain}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Royalty</span>
                                    <span className="text-sm">{post.royalty}%</span>
                                </div>

                                {showMoreDetails && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Category</span>
                                            <span className="text-sm">{post.category}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Created</span>
                                            <span className="text-sm">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Info and Actions */}
                    <div className="space-y-6">
                        {/* Creator and Title */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={post.creator.avatar}
                                    alt={post.creator.name}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">{post.creator.name}</h3>
                                        {post.creator.verified && (
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{post.creator.followers.toLocaleString()} followers</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Follow
                                </Button>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
                            <p className="text-gray-700 mb-6">{post.description}</p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {post.views.toLocaleString()} views
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {post.likes.toLocaleString()} likes
                                </span>
                                <span className="flex items-center gap-1">
                                    <Share2 className="h-4 w-4" />
                                    {post.shares} shares
                                </span>
                            </div>

                            {/* Price and Actions */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Current Price</p>
                                        <p className="text-3xl font-bold text-blue-600">{post.price} PiCO</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">USD Estimate</p>
                                        <p className="text-lg font-semibold text-gray-900">~$127.50</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <Button onClick={handleBuyNFT} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Buy Now
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        <Gift className="h-4 w-4 mr-2" />
                                        Make Offer
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                        <Flag className="h-4 w-4 mr-2" />
                                        Report
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Comments ({comments.length})
                            </h3>

                            {/* Add Comment */}
                            <div className="flex gap-3 mb-6">
                                <img
                                    src="/brand/pico-logo.svg"
                                    alt="Your avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                    <Input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            size="sm"
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <img
                                            src={comment.user.avatar}
                                            alt={comment.user.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm">{comment.user.name}</span>
                                                {comment.user.verified && (
                                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleCommentLike(comment.id)}
                                                    className={`flex items-center gap-1 text-xs hover:text-red-500 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'
                                                        }`}
                                                >
                                                    <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                                                    {comment.likes}
                                                </button>
                                                <button className="text-xs text-gray-500 hover:text-gray-700">
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 