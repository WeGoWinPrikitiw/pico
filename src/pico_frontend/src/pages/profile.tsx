import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import {
    Settings,
    Edit3,
    Camera,
    Grid3X3,
    Heart,
    Star,
    TrendingUp,
    Users,
    Share2,
    Copy,
    ExternalLink,
    ArrowLeft,
    Upload,
    Wallet
} from 'lucide-react';

interface UserProfile {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    coverImage: string;
    verified: boolean;
    followers: number;
    following: number;
    totalNFTs: number;
    totalSales: string;
    joinDate: string;
    website?: string;
    social?: {
        twitter?: string;
        instagram?: string;
        discord?: string;
    };
}

interface NFTItem {
    id: string;
    title: string;
    image: string;
    price: string;
    likes: number;
    isForSale: boolean;
}

export function ProfilePage() {
    const { principal, userBalance, copyPrincipalToClipboard } = useAuth();
    const [activeTab, setActiveTab] = useState('created');
    const [isEditing, setIsEditing] = useState(false);

    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'Digital Artist',
        username: 'digitalart_master',
        bio: 'Creating unique digital experiences through NFT art. Passionate about blockchain technology and creative expression.',
        avatar: '/brand/pico-logo.svg',
        coverImage: '/landing/landing-hero.png',
        verified: true,
        followers: 1234,
        following: 567,
        totalNFTs: 42,
        totalSales: '156.7',
        joinDate: 'March 2024',
        website: 'https://portfolio.com',
        social: {
            twitter: '@digitalart_master',
            instagram: '@digitalart_master'
        }
    });

    const [createdNFTs] = useState<NFTItem[]>([
        {
            id: '1',
            title: 'Cosmic Sunrise',
            image: '/landing/landing-hero.png',
            price: '25.5',
            likes: 142,
            isForSale: true
        },
        {
            id: '2',
            title: 'Digital Dreams',
            image: '/brand/pico-glow.png',
            price: '18.2',
            likes: 89,
            isForSale: false
        },
        {
            id: '3',
            title: 'Abstract Flow',
            image: '/brand/pico-logo.svg',
            price: '32.1',
            likes: 256,
            isForSale: true
        }
    ]);

    const [collectedNFTs] = useState<NFTItem[]>([
        {
            id: '4',
            title: 'Neon City',
            image: '/brand/pico-glow.png',
            price: '12.8',
            likes: 67,
            isForSale: false
        }
    ]);

    const [wishlistNFTs] = useState<NFTItem[]>([
        {
            id: '5',
            title: 'Future Landscape',
            image: '/landing/landing-hero.png',
            price: '45.0',
            likes: 289,
            isForSale: true
        }
    ]);

    const tabs = [
        { id: 'created', label: 'Created', count: createdNFTs.length, icon: Grid3X3 },
        { id: 'collected', label: 'Collected', count: collectedNFTs.length, icon: Star },
        { id: 'wishlist', label: 'Wishlist', count: wishlistNFTs.length, icon: Heart }
    ];

    const getCurrentNFTs = () => {
        switch (activeTab) {
            case 'created': return createdNFTs;
            case 'collected': return collectedNFTs;
            case 'wishlist': return wishlistNFTs;
            default: return [];
        }
    };

    const handleEditProfile = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = () => {
        // Save profile changes
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Cover Image */}
            <div className="relative h-64 bg-gradient-to-r from-purple-600 to-blue-600 overflow-hidden">
                <img
                    src={userProfile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute top-4 left-4">
                    <Link to="/explore">
                        <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Explore
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleEditProfile} size="sm" className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white">
                        <Settings className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </div>
            </div>

            {/* Profile Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-16 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Avatar and Basic Info */}
                            <div className="flex flex-col items-center lg:items-start">
                                <div className="relative">
                                    <img
                                        src={userProfile.avatar}
                                        alt={userProfile.name}
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                                    />
                                    {isEditing && (
                                        <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700">
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="text-center lg:text-left mt-4">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={userProfile.name}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                                                className="text-center lg:text-left font-bold text-xl"
                                            />
                                            <Input
                                                value={userProfile.username}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, username: e.target.value }))}
                                                className="text-center lg:text-left text-gray-600"
                                                placeholder="@username"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                                <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                                                {userProfile.verified && (
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-600">@{userProfile.username}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="flex-1">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{userProfile.followers.toLocaleString()}</p>
                                        <p className="text-gray-600">Followers</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{userProfile.following.toLocaleString()}</p>
                                        <p className="text-gray-600">Following</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{userProfile.totalNFTs}</p>
                                        <p className="text-gray-600">NFTs Created</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{userProfile.totalSales} PiCO</p>
                                        <p className="text-gray-600">Total Sales</p>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="mb-6">
                                    {isEditing ? (
                                        <textarea
                                            value={userProfile.bio}
                                            onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                                            className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                                            rows={3}
                                            placeholder="Tell us about yourself..."
                                        />
                                    ) : (
                                        <p className="text-gray-700">{userProfile.bio}</p>
                                    )}
                                </div>

                                {/* Wallet Info */}
                                {principal && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Wallet Balance</p>
                                                <p className="font-semibold text-blue-600">{userBalance} PiCO</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-500 font-mono">{principal.slice(0, 10)}...</p>
                                                <Button size="sm" variant="outline" onClick={copyPrincipalToClipboard}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    {isEditing ? (
                                        <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                                            Save Changes
                                        </Button>
                                    ) : (
                                        <>
                                            <Link to="/upload">
                                                <Button className="bg-green-600 hover:bg-green-700">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload NFT
                                                </Button>
                                            </Link>
                                            <Button variant="outline">
                                                <Users className="h-4 w-4 mr-2" />
                                                Follow
                                            </Button>
                                            <Button variant="outline">
                                                <Wallet className="h-4 w-4 mr-2" />
                                                Tip Creator
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* NFT Grid */}
                <div className="pb-8">
                    {getCurrentNFTs().length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {getCurrentNFTs().map((nft) => (
                                <div key={nft.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="aspect-square bg-gray-100 relative">
                                        <img
                                            src={nft.image}
                                            alt={nft.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {nft.isForSale && (
                                            <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                                For Sale
                                            </div>
                                        )}
                                        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                            <Heart className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">{nft.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-blue-600">{nft.price} PiCO</span>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Heart className="h-4 w-4" />
                                                {nft.likes}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            <Link to={`/posts/${nft.id}`} className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full">
                                                    View
                                                </Button>
                                            </Link>
                                            {activeTab === 'created' && (
                                                <Button size="sm" className="flex-1">
                                                    Edit
                                                </Button>
                                            )}
                                            {activeTab === 'wishlist' && (
                                                <Button size="sm" className="flex-1">
                                                    Buy
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Grid3X3 className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {activeTab === 'created' && "You haven't created any NFTs yet. Start creating!"}
                                {activeTab === 'collected' && "You haven't collected any NFTs yet. Start exploring!"}
                                {activeTab === 'wishlist' && "You haven't added any NFTs to your wishlist yet."}
                            </p>
                            {activeTab === 'created' && (
                                <Link to="/upload">
                                    <Button>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Create your first NFT
                                    </Button>
                                </Link>
                            )}
                            {activeTab === 'collected' && (
                                <Link to="/explore">
                                    <Button>
                                        Explore NFTs
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 