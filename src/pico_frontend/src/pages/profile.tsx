import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    Input,
    Card,
    CardContent,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Separator
} from '@/components/ui';
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
    Wallet,
    Link as LinkIcon,
    Twitter,
    Instagram,
    Globe
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
        <div className="min-h-screen bg-background">
            {/* Cover Image */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={userProfile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <Link to="/explore">
                        <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleEditProfile} size="sm" className="bg-background/90 backdrop-blur-sm">
                        <Settings className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-24">
                    <Card className="border-none shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Avatar and Basic Info */}
                                <div className="flex flex-col items-center lg:items-start">
                                    <div className="relative">
                                        <Avatar className="w-32 h-32 border-4 border-background">
                                            <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                                            <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                                                <Camera className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="text-center lg:text-left mt-4 space-y-2">
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    value={userProfile.name}
                                                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Your name"
                                                    className="text-lg font-bold"
                                                />
                                                <Input
                                                    value={userProfile.username}
                                                    onChange={(e) => setUserProfile(prev => ({ ...prev, username: e.target.value }))}
                                                    placeholder="@username"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 justify-center lg:justify-start">
                                                    <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                                                    {userProfile.verified && (
                                                        <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                                                            <div className="h-2.5 w-2.5 bg-primary rounded-full" />
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground">@{userProfile.username}</p>
                                            </>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    {!isEditing && userProfile.social && (
                                        <div className="flex gap-3 mt-4">
                                            {userProfile.website && (
                                                <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                                    <Globe className="h-5 w-5" />
                                                </a>
                                            )}
                                            {userProfile.social.twitter && (
                                                <a href={`https://twitter.com/${userProfile.social.twitter}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                                    <Twitter className="h-5 w-5" />
                                                </a>
                                            )}
                                            {userProfile.social.instagram && (
                                                <a href={`https://instagram.com/${userProfile.social.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                                    <Instagram className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Profile Details */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold">{userProfile.followers.toLocaleString()}</p>
                                            <p className="text-muted-foreground">Followers</p>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold">{userProfile.following.toLocaleString()}</p>
                                            <p className="text-muted-foreground">Following</p>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold">{userProfile.totalNFTs}</p>
                                            <p className="text-muted-foreground">NFTs Created</p>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{userProfile.totalSales} PiCO</p>
                                            <p className="text-muted-foreground">Total Sales</p>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-6">
                                        {isEditing ? (
                                            <textarea
                                                value={userProfile.bio}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                                                className="w-full p-3 rounded-lg bg-muted resize-none"
                                                rows={3}
                                                placeholder="Tell us about yourself..."
                                            />
                                        ) : (
                                            <p className="text-muted-foreground">{userProfile.bio}</p>
                                        )}
                                    </div>

                                    {/* Wallet Info */}
                                    {principal && (
                                        <Card className="mb-6">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Wallet Balance</p>
                                                        <p className="font-semibold text-primary">{userBalance} PiCO</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-mono text-muted-foreground">{principal.slice(0, 10)}...</p>
                                                        <Button size="sm" variant="outline" onClick={copyPrincipalToClipboard}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        {isEditing ? (
                                            <Button onClick={handleSaveProfile} className="bg-primary">
                                                Save Changes
                                            </Button>
                                        ) : (
                                            <>
                                                <Link to="/upload">
                                                    <Button className="bg-primary">
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
                        </CardContent>
                    </Card>
                </div>

                {/* NFT Tabs */}
                <div className="py-8">
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full justify-start border-b rounded-none p-0 h-12 bg-transparent">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                    <Badge variant="secondary" className="ml-2">
                                        {tab.count}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {tabs.map((tab) => (
                            <TabsContent key={tab.id} value={tab.id}>
                                {getCurrentNFTs().length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {getCurrentNFTs().map((nft) => (
                                            <Card key={nft.id} className="group overflow-hidden">
                                                <div className="aspect-square relative">
                                                    <img
                                                        src={nft.image}
                                                        alt={nft.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    />
                                                    {nft.isForSale && (
                                                        <Badge className="absolute top-3 left-3">
                                                            For Sale
                                                        </Badge>
                                                    )}
                                                    <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors">
                                                        <Heart className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <CardContent className="p-4">
                                                    <h3 className="font-semibold mb-2">{nft.title}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-primary">{nft.price} PiCO</span>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Heart className="h-4 w-4" />
                                                            {nft.likes}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-3">
                                                        <Link to={`/posts/${nft.id}`} className="flex-1">
                                                            <Button variant="outline" className="w-full">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        {activeTab === 'created' && (
                                                            <Button className="flex-1">
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {activeTab === 'wishlist' && (
                                                            <Button className="flex-1">
                                                                Buy
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            No {tab.label.toLowerCase()} yet
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            {tab.id === 'created' && "You haven't created any NFTs yet. Start creating!"}
                                            {tab.id === 'collected' && "You haven't collected any NFTs yet. Start exploring!"}
                                            {tab.id === 'wishlist' && "You haven't added any NFTs to your wishlist yet."}
                                        </p>
                                        {tab.id === 'created' && (
                                            <Link to="/upload">
                                                <Button>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Create your first NFT
                                                </Button>
                                            </Link>
                                        )}
                                        {tab.id === 'collected' && (
                                            <Link to="/explore">
                                                <Button>
                                                    Explore NFTs
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
} 