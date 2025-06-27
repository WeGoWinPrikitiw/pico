import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { createQueryKey } from "@/lib/query-client";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  User,
  Star,
  ExternalLink,
} from "lucide-react";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  // Mock data for now since we don't have a backend post service yet
  const { data: post, isLoading } = useQuery({
    queryKey: createQueryKey.forum(id || ""),
    queryFn: async () => {
      // Mock post data
      return {
        id: id,
        title: "Digital Dreams Collection",
        description: "Exploring the intersection of technology and art through this unique NFT collection. Each piece represents a different aspect of our digital future, combining traditional artistic techniques with cutting-edge AI generation.",
        content: "This collection was inspired by my fascination with how technology shapes our perception of reality. Each NFT in this series explores different themes - from virtual landscapes to digital emotions. The creation process involved both traditional digital art techniques and AI-assisted generation, resulting in a unique blend of human creativity and machine learning.\n\nThe journey began with simple sketches and evolved into complex digital compositions. I wanted to capture the essence of our digital age while maintaining the emotional depth that makes art truly meaningful.",
        image: "/brand/pico-logo.svg",
        author: {
          id: "artist123",
          name: "Digital Artist",
          avatar: "/brand/pico-logo.svg",
          verified: true,
        },
        stats: {
          likes: 142,
          comments: 23,
          shares: 15,
          views: 1250,
        },
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        tags: ["digital-art", "nft", "ai-generated", "futuristic"],
        category: "Art",
        nftId: "12345",
        isLiked: false,
      };
    },
    enabled: !!id,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <h2 className="text-2xl font-semibold mb-4">Please log in</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view post details.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Post not found</h2>
          <p className="text-muted-foreground mb-6">
            The post you're looking for doesn't exist.
          </p>
          <Link to="/posts">
            <Button>Back to Posts</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/posts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Header */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <p className="text-lg text-muted-foreground">{post.description}</p>
            </div>

            {/* Featured Image */}
            <div className="aspect-video rounded-xl overflow-hidden bg-muted">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Content */}
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {post.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Comments Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Comments ({post.stats.comments})
                </h3>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Comments feature coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{post.author.name}</h3>
                      {post.author.verified && (
                        <Star className="h-4 w-4 text-primary" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{post.author.id}</p>
                  </div>
                </div>
                <Button className="w-full">Follow</Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Post Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Likes</span>
                    </div>
                    <span className="font-semibold">{post.stats.likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Comments</span>
                    </div>
                    <span className="font-semibold">{post.stats.comments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Shares</span>
                    </div>
                    <span className="font-semibold">{post.stats.shares}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Views</span>
                    </div>
                    <span className="font-semibold">{post.stats.views}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                {post.isLiked ? "Unlike" : "Like"} Post
              </Button>
              <Button className="w-full" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Post
              </Button>
              {post.nftId && (
                <Link to={`/nft/${post.nftId}`}>
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View NFT
                  </Button>
                </Link>
              )}
            </div>

            {/* Post Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Post Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  {post.nftId && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span>NFT ID: {post.nftId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}