import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useNFTs } from "@/hooks/useNFT";
import { usePreferences, useUpdatePreferences } from "@/hooks/usePreferences";
import {
  useUserProfile,
  useHasProfile,
  useCreateProfile,
  useUpdateProfile,
} from "@/hooks/useUserProfile";
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
  Separator,
} from "@/components/ui";
import { useAuth, useServices } from "@/context/auth-context";
import {
  Settings,
  Edit3,
  Camera,
  Grid3X3,
  Heart,
  TrendingUp,
  Users,
  Share2,
  Copy,
  ArrowLeft,
  Upload,
  Wallet,
  Globe,
  Eye,
  MoreHorizontal,
  Check,
  Columns3,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

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
  views?: number;
  creator?: string;
}

export function ProfilePage() {
  const {
    principal,
    userBalance,
    copyPrincipalToClipboard,
    isAuthenticated,
    isServicesReady,
  } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("created");
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Get services when available
  const services = isAuthenticated && isServicesReady ? useServices() : null;

  // User profile queries
  const { data: userProfileData, isLoading: isLoadingProfile } =
    useUserProfile(principal);
  const { data: hasProfile } = useHasProfile(principal);
  const createProfileMutation = useCreateProfile();
  const updateProfileMutation = useUpdateProfile();

  // Initialize profile state based on real data or defaults
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: userProfileData?.name || "User",
    username: userProfileData?.username || principal?.slice(0, 8) || "user",
    bio: userProfileData?.about || "Welcome to my profile!",
    avatar: userProfileData?.avatar_url || "/brand/pico-logo.svg",
    coverImage: "/landing/landing-hero.png",
    verified: true,
    followers: 0,
    following: 0,
    totalNFTs: 0,
    totalSales: "0",
    joinDate: userProfileData?.created_at
      ? new Date(
          Number(userProfileData.created_at) / 1000000
        ).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Recently",
    website: userProfileData?.social?.website,
    social: {
      twitter: userProfileData?.social?.twitter,
      instagram: userProfileData?.social?.instagram,
    },
  });

  // Update local state when profile data changes
  useEffect(() => {
    if (userProfileData) {
      setUserProfile((prev) => ({
        ...prev,
        name: userProfileData.name,
        username: userProfileData.username,
        bio: userProfileData.about,
        avatar: userProfileData.avatar_url || "/brand/pico-logo.svg",
        website: userProfileData.social?.website,
        social: {
          twitter: userProfileData.social?.twitter,
          instagram: userProfileData.social?.instagram,
        },
        joinDate: new Date(
          Number(userProfileData.created_at) / 1000000
        ).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      }));
    }
  }, [userProfileData]);

  const [createdNFTs, setCreatedNFTs] = useState<NFTItem[]>([]);
  const [collectedNFTs, setCollectedNFTs] = useState<NFTItem[]>([]);
  const [wishlistNFTs] = useState<NFTItem[]>([
    {
      id: "6",
      title: "Future Landscape",
      image: "/brand/pico-logo.svg",
      price: "55.0",
      likes: 312,
      isForSale: false,
      views: 4500,
      creator: "visionary_art",
    },
  ]);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [availablePreferences] = useState([
    "art",
    "gaming",
    "music",
    "photography",
    "sports",
    "technology",
    "memes",
    "collectibles",
  ]);

  // Query for user NFTs
  const { data: nftData } = useNFTs();
  const { data: preferencesData } = usePreferences(principal || "");
  const updatePreferencesMutation = useUpdatePreferences();

  // Format NFT data
  useEffect(() => {
    if (nftData) {
      const formattedNfts: NFTItem[] = nftData.map((nft) => ({
        id: nft.nft_id.toString(),
        title: nft.name,
        image: nft.image_url,
        price: (Number(nft.price) / 100000000).toFixed(2),
        likes: Math.floor(Math.random() * 100),
        isForSale: true,
        views: Math.floor(Math.random() * 1000),
        creator: nft.owner,
      }));

      setCreatedNFTs(formattedNfts);
      setCollectedNFTs(formattedNfts);

      setUserProfile((prev) => ({
        ...prev,
        totalNFTs: formattedNfts.length,
      }));
    }
  }, [nftData]);

  // Set preferences from query data
  useEffect(() => {
    if (preferencesData?.preferences) {
      setUserPreferences(preferencesData.preferences);
    }
  }, [preferencesData]);

  const tabs = [
    {
      id: "created",
      label: "Created",
      count: createdNFTs.length,
      icon: Grid3X3,
    },
    {
      id: "collected",
      label: "Collected",
      count: collectedNFTs.length,
      icon: Heart,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      count: wishlistNFTs.length,
      icon: Grid3X3,
    },
    {
      id: "settings",
      label: "Settings",
      count: 0, // or some other indicator
      icon: Settings,
    },
  ];

  const getCurrentNFTs = () => {
    switch (activeTab) {
      case "created":
        return createdNFTs;
      case "collected":
        return collectedNFTs;
      case "wishlist":
        return wishlistNFTs;
      default:
        return [];
    }
  };

  const handleEditProfile = () => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!principal) return;

    try {
      const profileData = {
        username: userProfile.username,
        name: userProfile.name,
        about: userProfile.bio,
        avatar_url:
          userProfile.avatar !== "/brand/pico-logo.svg"
            ? userProfile.avatar
            : undefined,
        social: {
          website: userProfile.website,
          twitter: userProfile.social?.twitter,
          instagram: userProfile.social?.instagram,
        },
      };

      if (hasProfile) {
        await updateProfileMutation.mutateAsync(profileData);
      } else {
        await createProfileMutation.mutateAsync(profileData);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleCancelEdit = () => {
    // Reset avatar upload state
    setAvatarFile(null);
    setAvatarPreview(null);

    // Reset profile to original data
    if (userProfileData) {
      setUserProfile((prev) => ({
        ...prev,
        name: userProfileData.name,
        username: userProfileData.username,
        bio: userProfileData.about,
        avatar: userProfileData.avatar_url || "/brand/pico-logo.svg",
        website: userProfileData.social?.website,
        social: {
          twitter: userProfileData.social?.twitter,
          instagram: userProfileData.social?.instagram,
        },
      }));
    }

    setIsEditing(false);
  };

  const handleTogglePreference = (preference: string) => {
    setUserPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSaveChanges = async () => {
    if (!principal) return;
    try {
      await updatePreferencesMutation.mutateAsync({
        principal_id: principal,
        preferences: userPreferences,
      });
    } catch (error) {
      console.error("Failed to save preferences", error);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setAvatarFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setUserProfile((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => {
    const input = document.getElementById("avatar-upload") as HTMLInputElement;
    input?.click();
  };

  const stats = [
    {
      label: "Followers",
      value: userProfile.followers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Following",
      value: userProfile.following,
      icon: Users,
      color: "from-green-500 to-green-600",
    },
    {
      label: "NFTs Created",
      value: userProfile.totalNFTs,
      icon: Grid3X3,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Total Sales",
      value: `${userProfile.totalSales} PiCO`,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Profile Completion Prompt */}
      {isAuthenticated && hasProfile === false && !isEditing && (
        <div className="border-b bg-primary/10 border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-primary">
                    Complete your profile
                  </h3>
                  <p className="text-sm text-primary/80">
                    Add your name, bio, and social links to get started
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingProfile && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoadingProfile && (
        <>
          {/* Hidden file input for avatar upload */}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          {/* Enhanced Cover Section */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={userProfile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Navigation */}
            <div className="absolute top-6 left-0 right-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <Link to="/explore">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background/90 backdrop-blur-sm border-0 shadow-lg hover:bg-background"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Explore
                    </Button>
                  </Link>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background/90 backdrop-blur-sm border-0 shadow-lg hover:bg-background"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleEditProfile}
                      size="sm"
                      className="bg-primary/90 backdrop-blur-sm shadow-lg hover:bg-primary"
                    >
                      {isEditing ? (
                        <>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-32 pb-8">
              {/* Main Profile Card */}
              <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Profile Info Section */}
                    <div className="flex flex-col items-center lg:items-start">
                      {/* Avatar */}
                      <div className="relative mb-6">
                        <div className="relative">
                          <Avatar className="w-40 h-40 border-4 border-background shadow-xl">
                            <AvatarImage
                              src={userProfile.avatar}
                              alt={userProfile.name}
                            />
                            <AvatarFallback className="text-2xl">
                              {userProfile.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {isEditing && (
                          <button
                            onClick={triggerAvatarUpload}
                            className="absolute bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shadow-lg transition-all"
                          >
                            <Camera className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Name and Username */}
                      <div className="text-center lg:text-left space-y-3 mb-6">
                        {isEditing ? (
                          <div className="space-y-3">
                            <Input
                              value={userProfile.name}
                              onChange={(e) =>
                                setUserProfile((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Your name"
                              className="text-xl font-bold text-center lg:text-left"
                            />
                            <Input
                              value={userProfile.username}
                              onChange={(e) =>
                                setUserProfile((prev) => ({
                                  ...prev,
                                  username: e.target.value,
                                }))
                              }
                              placeholder="@username"
                              className="text-center lg:text-left"
                            />
                          </div>
                        ) : (
                          <>
                            <h1 className="text-3xl font-bold">
                              {userProfile.name}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                              @{userProfile.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {userProfile.joinDate}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Social Links */}
                      {isEditing ? (
                        <div className="space-y-3 mb-6">
                          <h4 className="text-sm font-medium">Social Links</h4>
                          <div className="space-y-2">
                            <Input
                              value={userProfile.website || ""}
                              onChange={(e) =>
                                setUserProfile((prev) => ({
                                  ...prev,
                                  website: e.target.value,
                                }))
                              }
                              placeholder="Website URL"
                              className="text-sm"
                            />
                            <Input
                              value={userProfile.social?.twitter || ""}
                              onChange={(e) =>
                                setUserProfile((prev) => ({
                                  ...prev,
                                  social: {
                                    ...prev.social,
                                    twitter: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Twitter username"
                              className="text-sm"
                            />
                            <Input
                              value={userProfile.social?.instagram || ""}
                              onChange={(e) =>
                                setUserProfile((prev) => ({
                                  ...prev,
                                  social: {
                                    ...prev.social,
                                    instagram: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Instagram username"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        !isEditing &&
                        userProfile.social && (
                          <div className="flex gap-4 mb-6">
                            {userProfile.website && (
                              <a
                                href={userProfile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <Globe className="h-5 w-5" />
                              </a>
                            )}
                            {userProfile.social.twitter && (
                              <a
                                href={`https://twitter.com/${userProfile.social.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-blue-500 hover:text-white transition-colors"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                              </a>
                            )}
                            {userProfile.social.instagram && (
                              <a
                                href={`https://instagram.com/${userProfile.social.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-colors"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                          <Card
                            key={stat.label}
                            className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 hover:shadow-lg transition-all"
                          >
                            <CardContent className="p-4 text-center">
                              <div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-2`}
                              >
                                <stat.icon className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-2xl font-bold">
                                {typeof stat.value === "number"
                                  ? stat.value.toLocaleString()
                                  : stat.value}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stat.label}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Bio Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">About</h3>
                        {isEditing ? (
                          <textarea
                            value={userProfile.bio}
                            onChange={(e) =>
                              setUserProfile((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            className="w-full p-4 rounded-xl bg-muted/50 border-0 resize-none focus:ring-2 focus:ring-primary"
                            rows={4}
                            placeholder="Tell us about yourself..."
                          />
                        ) : (
                          <p className="text-muted-foreground leading-relaxed">
                            {userProfile.bio}
                          </p>
                        )}
                      </div>

                      {/* Wallet Info */}
                      {principal && (
                        <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-primary">
                                  Wallet Connected
                                </p>
                                <p className="text-2xl font-bold text-primary">
                                  {userBalance} PiCO
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Available Balance
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <p className="text-xs font-mono text-muted-foreground">
                                  {principal.slice(0, 10)}...
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={copyPrincipalToClipboard}
                                  className="border-primary/20"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy ID
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        {isEditing ? (
                          <Button
                            onClick={handleSaveProfile}
                            className="bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        ) : (
                          <>
                            <Link to="/upload">
                              <Button className="bg-gradient-to-r from-primary to-primary/90 shadow-lg">
                                <Upload className="h-4 w-4 mr-2" />
                                Create NFT
                              </Button>
                            </Link>
                            <Button variant="outline" className="shadow-sm">
                              <Users className="h-4 w-4 mr-2" />
                              Follow
                            </Button>
                            <Button variant="outline" className="shadow-sm">
                              <Wallet className="h-4 w-4 mr-2" />
                              Send Tip
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NFT Tabs Section */}
            <div className="py-8">
              <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <Tabs
                    defaultValue={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                  >
                    {/* Enhanced Tab Header */}
                    <div className="flex items-center justify-between">
                      <TabsList className="bg-muted/50 p-1 rounded-xl">
                        {tabs.map((tab) => (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                          >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            <Badge
                              variant="secondary"
                              className="ml-1 h-5 min-w-[20px] flex items-center justify-center"
                            >
                              {tab.count}
                            </Badge>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-muted/50 rounded-lg p-1">
                          <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className="h-8 w-8 p-0"
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="h-8 w-8 p-0"
                          >
                            <Columns3 className="h-4 w-4 rotate-90" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Tab Content */}
                    {tabs.map((tab) => (
                      <TabsContent
                        key={tab.id}
                        value={tab.id}
                        className="space-y-6"
                      >
                        {tab.id === "settings" ? (
                          <div className="space-y-6">
                            <h3 className="text-xl font-semibold">
                              Your Interests
                            </h3>
                            <p className="text-muted-foreground">
                              Select topics you're interested in to personalize
                              your experience.
                            </p>

                            <div className="flex flex-wrap gap-3">
                              {availablePreferences.map((pref) => (
                                <button
                                  key={pref}
                                  onClick={() => handleTogglePreference(pref)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                                    userPreferences.includes(pref)
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-transparent hover:bg-muted"
                                  }`}
                                >
                                  {userPreferences.includes(pref) && (
                                    <Check className="h-4 w-4" />
                                  )}
                                  <span className="capitalize">{pref}</span>
                                </button>
                              ))}
                            </div>

                            <Separator />

                            <Button
                              onClick={handleSaveChanges}
                              disabled={updatePreferencesMutation.isPending}
                            >
                              {updatePreferencesMutation.isPending ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                              ) : null}
                              Save Changes
                            </Button>
                          </div>
                        ) : getCurrentNFTs().length > 0 ? (
                          <div
                            className={
                              viewMode === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "space-y-4"
                            }
                          >
                            {getCurrentNFTs().map((nft) => (
                              <Card
                                key={nft.id}
                                className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {viewMode === "grid" ? (
                                  <>
                                    <div className="aspect-square relative overflow-hidden">
                                      <img
                                        src={nft.image}
                                        alt={nft.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                      {/* Overlay Actions */}
                                      <div className="absolute top-3 left-3 right-3 flex justify-between">
                                        {nft.isForSale && (
                                          <Badge className="bg-green-500/90 text-white border-0">
                                            For Sale
                                          </Badge>
                                        )}
                                        <div className="flex gap-2 ml-auto">
                                          <button className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors">
                                            <Heart className="h-4 w-4" />
                                          </button>
                                          <button className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Stats Overlay */}
                                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex items-center gap-3 text-white text-sm">
                                          <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {nft.views}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Heart className="h-4 w-4" />
                                            {nft.likes}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <CardContent className="p-4 space-y-3">
                                      <div>
                                        <h3 className="font-semibold truncate">
                                          {nft.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          by{" "}
                                          {nft.creator || userProfile.username}
                                        </p>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-primary">
                                          {nft.price} PiCO
                                        </span>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Heart className="h-4 w-4" />
                                          {nft.likes}
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <Link
                                          to={`/posts/${nft.id}`}
                                          className="flex-1"
                                        >
                                          <Button
                                            variant="outline"
                                            className="w-full"
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                          </Button>
                                        </Link>
                                        {activeTab === "created" && (
                                          <Button size="sm" variant="outline">
                                            <Edit3 className="h-4 w-4" />
                                          </Button>
                                        )}
                                        {activeTab === "wishlist" &&
                                          nft.isForSale && (
                                            <Button
                                              size="sm"
                                              className="bg-primary"
                                            >
                                              Buy
                                            </Button>
                                          )}
                                      </div>
                                    </CardContent>
                                  </>
                                ) : (
                                  // List view
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      <img
                                        src={nft.image}
                                        alt={nft.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                      />
                                      <div className="flex-1">
                                        <h3 className="font-semibold">
                                          {nft.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          by{" "}
                                          {nft.creator || userProfile.username}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {nft.views}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Heart className="h-3 w-3" />
                                            {nft.likes}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-primary">
                                          {nft.price} PiCO
                                        </p>
                                        {nft.isForSale && (
                                          <Badge
                                            variant="outline"
                                            className="mt-1"
                                          >
                                            For Sale
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        {activeTab === "created" && (
                                          <Button size="sm" variant="outline">
                                            <Edit3 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <tab.icon className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                              No {tab.label.toLowerCase()} yet
                            </h3>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                              {tab.id === "created" &&
                                "Start your NFT journey by creating your first digital artwork"}
                              {tab.id === "collected" &&
                                "Discover and collect amazing NFTs from talented creators"}
                              {tab.id === "wishlist" &&
                                "Save NFTs you love to your wishlist for later"}
                            </p>
                            {tab.id === "created" && (
                              <Link to="/upload">
                                <Button className="bg-gradient-to-r from-primary to-primary/90 shadow-lg">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Create your first NFT
                                </Button>
                              </Link>
                            )}
                            {tab.id === "collected" && (
                              <Link to="/explore">
                                <Button className="bg-gradient-to-r from-primary to-primary/90 shadow-lg">
                                  Explore NFTs
                                </Button>
                              </Link>
                            )}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
