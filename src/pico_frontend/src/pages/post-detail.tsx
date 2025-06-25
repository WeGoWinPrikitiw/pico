import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
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
  Star,
  ShoppingCart,
  ChevronRight,
  Globe,
  Twitter,
  Instagram,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator,
} from "@/components/ui";

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

interface Creator {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: number;
  username: string;
  website?: string;
  social?: {
    twitter?: string;
    instagram?: string;
  };
  nfts: number;
  sales: number;
}

interface Property {
  trait_type: string;
  value: string;
  rarity: number;
}

interface Transaction {
  id: string;
  type: "sale" | "list";
  price: string;
  timestamp: string;
}

interface PostDetail {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: Creator;
  price: string;
  views: number;
  likes: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tokenId: string;
  contractAddress: string;
  blockchain: string;
  royalty: number;
  category: string;
  createdAt: string;
  tags: string[];
  properties: Property[];
  history: Transaction[];
  isForSale: boolean;
  saleEnds: string;
  comments: number;
}

const defaultPost: PostDetail = {
  id: "1",
  title: "Awesome NFT",
  description: "This is an amazing NFT with unique properties",
  image: "/landing/landing-hero.png",
  creator: {
    id: "1",
    name: "John Doe",
    avatar: "/brand/pico-logo.svg",
    verified: true,
    followers: 2847,
    username: "johndoe",
    website: "https://johndoe.com",
    social: {
      twitter: "johndoe",
      instagram: "johndoe",
    },
    nfts: 45,
    sales: 156,
  },
  price: "25.5",
  views: 1234,
  likes: 567,
  shares: 89,
  isLiked: false,
  isBookmarked: false,
  tokenId: "123456",
  contractAddress: "0x1234567890abcdef",
  blockchain: "Internet Computer",
  royalty: 10,
  category: "Art",
  createdAt: "2024-03-14",
  tags: ["art", "digital", "unique"],
  properties: [
    { trait_type: "Background", value: "Blue", rarity: 15 },
    { trait_type: "Eyes", value: "Green", rarity: 25 },
    { trait_type: "Mouth", value: "Smile", rarity: 30 },
    { trait_type: "Outfit", value: "Suit", rarity: 20 },
  ],
  history: [
    {
      id: "1",
      type: "list",
      price: "20 PiCO",
      timestamp: "2024-03-14 10:00:00",
    },
    {
      id: "2",
      type: "sale",
      price: "25.5 PiCO",
      timestamp: "2024-03-15 11:00:00",
    },
  ],
  isForSale: true,
  saleEnds: "2024-04-14",
  comments: 45,
};

export function PostDetailPage() {
  const { id } = useParams();
  const { buyNFT, principal, transactions } = useAuth();
  const [post] = useState<PostDetail>(defaultPost);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      user: {
        name: "ArtCollector92",
        avatar: "/brand/pico-logo.svg",
        verified: true,
      },
      content:
        "This is absolutely stunning! The color palette and composition are perfect.",
      timestamp: "2 hours ago",
      likes: 12,
      isLiked: false,
    },
    {
      id: "2",
      user: {
        name: "CryptoEnthusiast",
        avatar: "/brand/pico-glow.png",
        verified: false,
      },
      content:
        "Been following this artist for months. Their work just keeps getting better!",
      timestamp: "5 hours ago",
      likes: 8,
      isLiked: true,
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const getMockData = (id: string): PostDetail => {
    if (id === "mock") {
      // Build initial post detail from transactions if available
      const buildPostFromTx = (): PostDetail => {
        const tx = transactions.find(
          (t: any) => t.nft_id && t.nft_id.toString() === id,
        );
        if (tx) {
          // Use available data, fill rest with defaults
          const imageFallback = "/landing/landing-hero.png";
          return {
            id: id || "1",
            title: `NFT #${tx.nft_id}`,
            description: "NFT purchased on PiCO marketplace",
            image: imageFallback,
            creator: {
              id: tx.from_principal_id
                ? `${tx.from_principal_id.slice(0, 8)}...`
                : "Unknown",
              name: tx.from_principal_id
                ? `${tx.from_principal_id.slice(0, 8)}...`
                : "Unknown",
              avatar: imageFallback,
              verified: false,
              followers: 0,
              username: "",
              nfts: 0,
              sales: 0,
            },
            price: (tx.price_token / 100000000).toFixed(2),
            views: 0,
            likes: 0,
            shares: 0,
            isLiked: false,
            isBookmarked: false,
            createdAt: new Date(
              Number(tx.created_at) / 1000000,
            ).toLocaleDateString(),
            tags: [],
            category: "NFT",
            royalty: 0,
            blockchain: "Internet Computer",
            tokenId: tx.nft_id?.toString() || "",
            contractAddress: "",
            properties: [],
            history: [],
            isForSale: false,
            saleEnds: "",
            comments: 0,
          };
        }

        // fallback to mock (previous content remains unchanged)
        return {
          id: id || "1",
          title: "Digital Sunset Paradise",
          description:
            "A stunning digital artwork capturing the essence of a perfect sunset in a virtual world. This piece represents the harmony between nature and technology, featuring vibrant colors that transition from warm oranges to cool purples. Created using advanced digital techniques and inspired by the beauty of natural landscapes.",
          image: "/landing/landing-hero.png",
          creator: {
            id: "ArtMaster99",
            name: "ArtMaster99",
            avatar: "/brand/pico-logo.svg",
            verified: true,
            followers: 2847,
            username: "",
            nfts: 0,
            sales: 0,
          },
          price: "25.5",
          views: 1250,
          likes: 342,
          shares: 89,
          isLiked: false,
          isBookmarked: false,
          createdAt: "2024-03-15",
          tags: ["digital-art", "landscape", "sunset", "virtual"],
          category: "Digital Art",
          royalty: 10,
          blockchain: "Internet Computer",
          tokenId: "PICO-001",
          contractAddress: "uxrrr-q7777-77774-qaaaq-cai",
          properties: [
            { trait_type: "Style", value: "Digital Landscape" },
            { trait_type: "Color Palette", value: "Warm Sunset" },
            { trait_type: "Rarity", value: "Rare" },
            { trait_type: "Size", value: "4K Resolution" },
          ],
          history: [
            {
              id: "1",
              type: "created",
              price: "25.5 PiCO",
              timestamp: "2024-03-15 10:30:00",
            },
            {
              id: "2",
              type: "listed",
              price: "25.5 PiCO",
              timestamp: "2024-03-15 11:00:00",
            },
          ],
          isForSale: false,
          saleEnds: "",
          comments: 0,
        };
      };

      const [post, setPost] = useState<PostDetail>(buildPostFromTx());

      const handleLike = () => {
        setPost((prev) => ({
          ...prev,
          isLiked: !prev.isLiked,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        }));
      };

      const handleBookmark = () => {
        setPost((prev) => ({
          ...prev,
          isBookmarked: !prev.isBookmarked,
        }));
      };

      const handleCommentLike = (commentId: string) => {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked
                    ? comment.likes - 1
                    : comment.likes + 1,
                }
              : comment,
          ),
        );
      };

      const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
          id: Date.now().toString(),
          user: {
            name: "You",
            avatar: "/brand/pico-logo.svg",
            verified: false,
          },
          content: newComment,
          timestamp: "Just now",
          likes: 0,
          isLiked: false,
        };

        setComments((prev) => [comment, ...prev]);
        setNewComment("");
      };

      const handleBuyNFT = async () => {
        if (!principal) {
          alert("Please log in to purchase NFTs");
          return;
        }

        try {
          await buyNFT(
            principal,
            transactions.find(
              (t: any) => t.nft_id && t.nft_id.toString() === id,
            )?.from_principal_id || "",
            post.id,
            post.price,
          );
        } catch (error) {
          console.error("Failed to buy NFT:", error);
        }
      };

      const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
      };

      return (
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navigation */}
            <div className="mb-8">
              <Link to="/explore">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Explore
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* NFT Image and Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      {post.isForSale && (
                        <Badge className="absolute top-4 left-4">
                          For Sale
                        </Badge>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-background/80 backdrop-blur-sm"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-background/80 backdrop-blur-sm"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NFT Information */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">
                          {post.title}
                        </h1>
                        <p className="text-muted-foreground">
                          {post.description}
                        </p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Price
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {post.price} PiCO
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Views
                          </p>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Likes
                          </p>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Comments
                          </p>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Tags */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Properties */}
                      <div>
                        <h3 className="text-sm font-medium mb-4">Properties</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {post.properties.map((prop) => (
                            <div
                              key={prop.trait_type}
                              className="p-3 bg-muted rounded-lg"
                            >
                              <p className="text-xs text-muted-foreground uppercase">
                                {prop.trait_type}
                              </p>
                              <p className="font-medium truncate">
                                {prop.value}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {prop.rarity}% have this trait
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">
                      Transaction History
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {post.history.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                              {tx.type === "sale" ? (
                                <ShoppingCart className="h-5 w-5 text-primary" />
                              ) : (
                                <DollarSign className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {tx.type === "sale" ? "Sold" : "Listed"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-primary">
                            {tx.price} PiCO
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Creator Info and Actions */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={post.creator.avatar}
                          alt={post.creator.name}
                        />
                        <AvatarFallback>{post.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{post.creator.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          @{post.creator.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                      {post.creator.website && (
                        <a
                          href={post.creator.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-5 w-5" />
                        </a>
                      )}
                      {post.creator.social?.twitter && (
                        <a
                          href={`https://twitter.com/${post.creator.social.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {post.creator.social?.instagram && (
                        <a
                          href={`https://instagram.com/${post.creator.social.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                      <div>
                        <p className="text-2xl font-bold">
                          {post.creator.followers}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Followers
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {post.creator.nfts}
                        </p>
                        <p className="text-sm text-muted-foreground">NFTs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {post.creator.sales}
                        </p>
                        <p className="text-sm text-muted-foreground">Sales</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full">Follow Creator</Button>
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Card */}
                {post.isForSale && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Current Price
                          </p>
                          <p className="text-3xl font-bold text-primary">
                            {post.price} PiCO
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Button className="w-full" size="lg">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Now
                          </Button>
                          <Button variant="outline" className="w-full">
                            Make Offer
                          </Button>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <p>
                              Sale ends{" "}
                              {new Date(post.saleEnds).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/explore">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>

        {/* Rest of the JSX remains the same */}
      </div>
    </div>
  );
}
