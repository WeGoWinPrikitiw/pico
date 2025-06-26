import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Textarea,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth, useServices } from "@/context/auth-context";
import { createQueryKey } from "@/lib/query-client";
import {
  MessageSquare,
  Heart,
  PlusCircle,
  ArrowLeft,
  Loader2,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { Forum } from "declarations/forums_contract/forums_contract.did";

export function ForumsPage() {
  const { principal, isAuthenticated, login } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newForum, setNewForum] = useState({
    title: "",
    description: "",
    nftId: "",
    nftName: "",
  });

  // Get forums service only when authenticated
  const forumsService = isAuthenticated ? useServices().forumsService : null;

  // Fetch all forums
  const {
    data: forums = [],
    isLoading: isLoadingForums,
    error: forumsError,
  } = useQuery({
    queryKey: createQueryKey.forums(),
    queryFn: async () => {
      if (!forumsService) return [];
      return await forumsService.getAllForums();
    },
    enabled: isAuthenticated && !!forumsService,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create forum mutation
  const createForumMutation = useMutation({
    mutationFn: async (forumData: {
      title: string;
      description: string;
      nftId: number;
      nftName: string;
      principalId: string;
    }) => {
      if (!forumsService) throw new Error("Forums service not available");
      return await forumsService.createForum(forumData);
    },
    onSuccess: (newForum) => {
      toast.success("Forum created successfully!");
      setShowCreateForm(false);
      setNewForum({ title: "", description: "", nftId: "", nftName: "" });

      // Invalidate forums query to refetch
      queryClient.invalidateQueries({ queryKey: createQueryKey.forums() });
    },
    onError: (error) => {
      console.error("Failed to create forum:", error);
      toast.error("Failed to create forum. Please try again.");
    },
  });

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principal) return;

    const forumData = {
      title: newForum.title,
      description: newForum.description,
      nftId: parseInt(newForum.nftId),
      nftName: newForum.nftName,
      principalId: principal,
    };

    await createForumMutation.mutateAsync(forumData);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <h2 className="text-2xl font-semibold mb-4">Please log in</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view and create forums.
        </p>
        <Button onClick={login}>
          <User className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (isLoadingForums) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading forums...</p>
        </div>
      </div>
    );
  }

  if (forumsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load forums</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/explore">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Forums</h1>
              <p className="text-muted-foreground">
                Discussions around NFTs and more.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {showCreateForm ? "Cancel" : "Create Forum"}
          </Button>
        </div>

        {/* Create Forum Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Start a New Discussion</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateForum} className="space-y-4">
                <Input
                  placeholder="Forum Title"
                  value={newForum.title}
                  onChange={(e) =>
                    setNewForum({ ...newForum, title: e.target.value })
                  }
                  required
                />
                <Textarea
                  placeholder="What do you want to talk about?"
                  value={newForum.description}
                  onChange={(e) =>
                    setNewForum({ ...newForum, description: e.target.value })
                  }
                  required
                />
                <div className="flex gap-4">
                  <Input
                    placeholder="Associated NFT ID"
                    type="number"
                    value={newForum.nftId}
                    onChange={(e) =>
                      setNewForum({ ...newForum, nftId: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Associated NFT Name"
                    value={newForum.nftName}
                    onChange={(e) =>
                      setNewForum({ ...newForum, nftName: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" disabled={createForumMutation.isPending}>
                  {createForumMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Post Forum
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Forums List */}
        <div className="space-y-6">
          {isLoadingForums ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : forums.length > 0 ? (
            forums.map((forum) => (
              <Card
                key={forum.forum_id.toString()}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${forum.principal_id}.png`}
                      />
                      <AvatarFallback>
                        {forum.principal_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {forum.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Started by{" "}
                            <span className="font-medium text-primary">
                              {forum.principal_id.slice(0, 10)}...
                            </span>{" "}
                            about "{forum.nft_name}"
                          </p>
                        </div>
                        <Badge variant="secondary">
                          NFT ID: {forum.nft_id.toString()}
                        </Badge>
                      </div>
                      <p className="mt-4 text-card-foreground">
                        {forum.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-3">
                  <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                    <div className="flex gap-6">
                      <button className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>{forum.likes.toString()} Likes</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{forum.comments.length} Comments</span>
                      </div>
                    </div>
                    <p>
                      {new Date(
                        Number(forum.created_at / 1000000n),
                      ).toLocaleString()}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No forums yet</h3>
              <p className="text-muted-foreground">
                Be the first one to start a discussion!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
