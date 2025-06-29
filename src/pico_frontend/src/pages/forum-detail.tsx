import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Textarea,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
} from "@/components/ui";
import { UserAvatar, UserName } from "@/components/ui/user-avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import {
  useForum,
  useLikeForum,
  useCommentForum,
  useUpdateForum,
  useDeleteForum,
  useNFT,
} from "@/hooks";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Loader2,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export function ForumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { principal, isAuthenticated } = useAuth();

  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const forumId = id ? parseInt(id) : 0;
  const {
    data: forum,
    isLoading: isLoadingForum,
    error: forumError,
  } = useForum(forumId);
  const { data: nft, isLoading: isLoadingNFT } = useNFT(Number(forum?.nft_id));

  const likeMutation = useLikeForum();
  const commentMutation = useCommentForum();
  const updateMutation = useUpdateForum();
  const deleteMutation = useDeleteForum();

  useEffect(() => {
    if (forum) {
      setEditForm({ title: forum.title, description: forum.description });
    }
  }, [forum]);

  const handleLikeForum = () => {
    if (!principal || !forum)
      return toast.error("Please connect your wallet first");
    likeMutation.mutate({ forumId: Number(forum.forum_id), userId: principal });
  };

  const handleAddComment = () => {
    if (!principal || !forum || !newComment.trim()) {
      return toast.error("Comment cannot be empty.");
    }
    commentMutation.mutate(
      {
        forumId: Number(forum.forum_id),
        comment: newComment.trim(),
        userId: principal,
      },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added successfully!");
        },
        onError: () => {
          toast.error("Failed to add comment. Please try again.");
        },
      }
    );
  };

  const handleUpdateForum = () => {
    if (
      !forum ||
      !principal ||
      !editForm.title.trim() ||
      !editForm.description.trim()
    ) {
      return toast.error("Please fill in all fields.");
    }
    updateMutation.mutate(
      {
        forumId: Number(forum.forum_id),
        title: editForm.title.trim(),
        description: editForm.description.trim(),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Forum updated successfully!");
        },
        onError: () => {
          toast.error("Failed to update forum. Please try again.");
        },
      }
    );
  };

  const handleDeleteForum = () => {
    if (!forum || !principal) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this forum? This action cannot be undone."
    );
    if (!confirmDelete) return;

    deleteMutation.mutate(Number(forum.forum_id), {
      onSuccess: () => {
        toast.success("Forum deleted successfully.");
        navigate("/forums");
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`);
      },
    });
  };

  const formatDate = (timestamp: string | number) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp: string | number) => {
    return new Date(Number(timestamp) / 1000000).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address: string, length = 6) => {
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  };

  const isOwner = forum && principal === forum.principal_id;

  if (isLoadingForum) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading forum details...</p>
        </div>
      </div>
    );
  }

  if (forumError || !forum) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Forum Not Found</h2>
              <p className="text-sm text-muted-foreground">
                This forum may have been deleted or never existed.
              </p>
            </div>
            <Button onClick={() => navigate("/forums")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forums
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/forums")}
            variant="ghost"
            size="sm"
            className="mb-4 hover:bg-muted/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Forums
          </Button>

          {/* Forum Header Card */}
          <Card className="bg-gradient-to-r from-card to-card/80 border-0 shadow-lg py-0">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      principalId={forum.principal_id}
                      size="lg"
                      className="border-2 border-background shadow-sm"
                    />
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                        {forum.title}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          {isOwner
                            ? "You"
                            : truncateAddress(forum.principal_id)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(Number(forum.created_at))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                    {forum.description}
                  </p>
                </div>

                {isOwner && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteForum}
                      className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border/50">
                <Button
                  variant="ghost"
                  onClick={handleLikeForum}
                  disabled={likeMutation.isPending}
                  className="hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      forum.likes > 0 ? "text-red-500 fill-red-500" : ""
                    }`}
                  />
                  {Number(forum.likes)}{" "}
                  {Number(forum.likes) === 1 ? "Like" : "Likes"}
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {forum.comments.length}{" "}
                  {forum.comments.length === 1 ? "Comment" : "Comments"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Discussion
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Discussion Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add Comment Section */}
            {isAuthenticated && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Join the Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <UserAvatar
                      principalId={principal}
                      size="lg"
                      className="border"
                    />
                    <div className="flex-1 space-y-3">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts on this topic..."
                        rows={4}
                        className="resize-none border-muted-foreground/20 focus:border-primary transition-colors"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {newComment.length}/500 characters
                        </p>
                        <Button
                          onClick={handleAddComment}
                          disabled={
                            commentMutation.isPending || !newComment.trim()
                          }
                          size="sm"
                          className="px-4"
                        >
                          {commentMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            Post Comment
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <MessageCircle className="h-5 w-5" />
                  Comments ({forum.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {forum.comments.length > 0 ? (
                  <div className="space-y-6">
                    {forum.comments.map((comment, i) => (
                      <div key={i} className="flex gap-4 group">
                        <UserAvatar
                          principalId={comment.user_id}
                          size="lg"
                          className="border"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="bg-muted/40 rounded-lg p-4 group-hover:bg-muted/60 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  <UserName
                                    principalId={comment.user_id}
                                    currentUser={principal}
                                    maxLength={8}
                                  />
                                </span>
                                {comment.user_id === forum.principal_id && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5 font-medium"
                                  >
                                    Author
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">
                                  {formatDateTime(Number(comment.created_at))}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">No comments yet</h3>
                      <p className="text-xs text-muted-foreground">
                        Be the first to share your thoughts on this topic!
                      </p>
                    </div>
                    {!isAuthenticated && (
                      <p className="text-xs text-muted-foreground">
                        Please connect your wallet to join the discussion.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* NFT Card */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Discussion Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingNFT ? (
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner />
                    </div>
                  ) : nft ? (
                    <div className="space-y-4">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={nft.image_url}
                          alt={nft.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-center">
                          {nft.name}
                        </h4>
                        <p className="text-xs text-muted-foreground text-center line-clamp-2 leading-relaxed">
                          {nft.description}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Link to={`/nft/${nft.nft_id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span className="text-sm font-medium">
                            View NFT Details
                          </span>
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold">
                          General Discussion
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          This forum is not linked to a specific NFT.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Forum</DialogTitle>
            <DialogDescription>
              Update the title and description of your forum post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="Forum Title"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Forum Description"
                rows={4}
                className="w-full resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateForum}
              disabled={
                updateMutation.isPending ||
                !editForm.title.trim() ||
                !editForm.description.trim()
              }
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              <span className="text-sm font-medium">Save Changes</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
