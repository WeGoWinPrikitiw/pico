import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardHeader,
    CardContent,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Textarea,
    Separator,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui";
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
    MoreVertical,
    Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

export function ForumDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { principal, isAuthenticated, login } = useAuth();

    const [newComment, setNewComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: "", description: "" });

    const { data: forum, isLoading: isLoadingForum, error: forumError, refetch } = useForum(id ? parseInt(id) : 0);
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
        if (!principal || !forum) return toast.error("Please connect your wallet first");
        likeMutation.mutate({ forumId: Number(forum.forum_id), userId: principal });
    };

    const handleAddComment = () => {
        if (!principal || !forum || !newComment.trim()) return toast.error("Comment cannot be empty.");
        commentMutation.mutate({
            forumId: Number(forum.forum_id),
            comment: newComment.trim(),
            userId: principal,
        }, {
            onSuccess: () => {
                setNewComment("");
                toast.success("Comment added!");
            }
        });
    };

    const handleUpdateForum = () => {
        if (!forum || !principal) return;
        updateMutation.mutate({
            forumId: Number(forum.forum_id),
            title: editForm.title,
            description: editForm.description,
        }, {
            onSuccess: () => {
                setIsEditing(false);
                toast.success("Forum updated successfully!");
            }
        });
    };

    const handleDeleteForum = () => {
        if (!forum || !principal) return;
        if (confirm("Are you sure you want to delete this forum?")) {
            deleteMutation.mutate(Number(forum.forum_id), {
                onSuccess: () => navigate("/forums"),
            });
        }
    };

    const isOwner = forum && principal === forum.principal_id;

    if (isLoadingForum) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }

    if (forumError || !forum) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-destructive">Forum not found or failed to load.</p>
                <Button onClick={() => navigate("/forums")} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forums
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl py-8">
            <div className="mb-6">
                <Button onClick={() => navigate("/forums")} variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Forums
                </Button>
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="text-3xl font-bold leading-tight tracking-tighter resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                            placeholder="Forum Title"
                            rows={1}
                        />
                        <Textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="text-lg text-muted-foreground resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                            placeholder="Forum Description"
                            rows={2}
                        />
                    </div>
                ) : (
                    <div>
                        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">{forum.title}</h1>
                        <p className="text-lg text-muted-foreground">{forum.description}</p>
                    </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${forum.principal_id}.png`} />
                                <AvatarFallback>{forum.principal_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{isOwner ? "You" : `${forum.principal_id.slice(0, 5)}...`}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(Number(forum.created_at) / 1000000).toLocaleDateString()}</div>
                    </div>
                    {isOwner && (
                        <div>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleUpdateForum} disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}><Edit3 className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDeleteForum}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-semibold mb-6">Discussion ({forum.comments.length})</h2>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={`https://avatar.vercel.sh/${principal}.png`} />
                                <AvatarFallback>{principal?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                />
                                <Button onClick={handleAddComment} disabled={commentMutation.isPending} className="mt-3">
                                    {commentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Comment"}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-8">
                            {forum.comments.map((comment, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://avatar.vercel.sh/${comment.user_id}.png`} />
                                        <AvatarFallback>{comment.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full">
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <span className="font-semibold">{comment.user_id === principal ? "You" : `${comment.user_id.slice(0, 5)}...`}</span>
                                            <span className="text-muted-foreground">• {new Date(Number(comment.created_at) / 1000000).toLocaleString()}</span>
                                        </div>
                                        <p className="text-muted-foreground">{comment.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="md:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <h3 className="font-semibold">Discussion Topic</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingNFT ? (
                                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center"><LoadingSpinner /></div>
                            ) : nft ? (
                                <div className="space-y-3">
                                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                                        <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{nft.name}</h4>
                                        <p className="text-sm text-muted-foreground">{nft.description}</p>
                                    </div>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to={`/nft/${nft.nft_id}`}><ExternalLink className="mr-2 h-4 w-4" /> View Full Details</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center text-center p-4">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                    <h4 className="font-medium text-sm">General Discussion</h4>
                                    <p className="text-xs text-muted-foreground">This forum is not linked to a specific NFT.</p>
                                </div>
                            )}
                            <Separator />
                            <div className="flex items-center justify-around text-sm text-muted-foreground">
                                <button onClick={handleLikeForum} disabled={likeMutation.isPending} className="flex items-center gap-2 hover:text-red-500">
                                    <Heart className="h-4 w-4" /> {Number(forum.likes)} Likes
                                </button>
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" /> {forum.comments.length} Comments
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 