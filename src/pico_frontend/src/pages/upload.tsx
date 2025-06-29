import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMintNFT,
  useGenerateAIImage,
  useDetectAIGenerated,
} from "@/hooks/useNFT";
import { useUploadImage } from "@/hooks/useUpload";
import { useCreateForum } from "@/hooks";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  TraitsEditor,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth, useServices } from "@/context/auth-context";
import { createQueryKey } from "@/lib/query-client";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  ArrowLeft,
  Eye,
  DollarSign,
  FileText,
  Sparkles,
  MoreVertical,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import type { Trait } from "@/types";

interface NFTMetadata {
  title: string; // maps to 'name' in contract
  description: string; // maps to 'description' in contract
  price: string; // maps to 'price' in contract (converted to Nat)
  file?: File;
  previewUrl?: string; // maps to 'image_url' in contract
  isAiGenerated: boolean; // maps to 'is_ai_generated' in contract
  traits: Trait[]; // maps to 'traits' in contract
  forSale: boolean; // maps to 'for_sale' in contract
}

export function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { principal, isAuthenticated, isServicesReady } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get services when available
  const services = isAuthenticated && isServicesReady ? useServices() : null;

  const [activeTab, setActiveTab] = useState<"mint" | "generate">("mint");
  const [dragOver, setDragOver] = useState(false);

  const [nftData, setNftData] = useState<NFTMetadata>({
    title: "",
    description: "",
    price: "",
    isAiGenerated: false,
    traits: [],
    forSale: true,
  });

  // State for AI detection
  const [aiDetectionPerformed, setAiDetectionPerformed] = useState(false);
  const [aiDetectionResult, setAiDetectionResult] = useState<{
    is_ai_generated: boolean;
    confidence: number;
    reasoning: string;
  } | null>(null);

  // Mutations for NFT operations
  const mintNftMutation = useMintNFT();
  const detectAIGeneratedMutation = useDetectAIGenerated();
  const generateAiImageMutation = useGenerateAIImage();
  const uploadImageMutation = useUploadImage();
  const createForumMutation = useCreateForum();

  const [aiPrompt, setAiPrompt] = useState({
    prompt: "",
    style: "realistic",
    quality: "high",
    aspectRatio: "1:1",
  });

  const aiStyles = [
    { value: "realistic", label: "Realistic" },
    { value: "cartoon", label: "Cartoon" },
    { value: "anime", label: "Anime" },
    { value: "abstract", label: "Abstract" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "fantasy", label: "Fantasy" },
  ];
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/") &&
      !file.type.startsWith("audio/")
    ) {
      toast.error("Please select an image, video, or audio file");
      return;
    }

    // Validate file size (10MB max for better upload experience)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB for optimal performance");
      return;
    }

    try {
      // Upload the image
      const uploadPromise = uploadImageMutation.mutateAsync(file);

      toast.promise(uploadPromise, {
        loading: "Uploading image...",
        success: "Image uploaded successfully!",
        error: "Failed to upload image. Please try again.",
      });

      const imageUrl = await uploadPromise;

      setNftData((prev) => ({
        ...prev,
        file,
        previewUrl: imageUrl,
        isAiGenerated: false,
        traits: [],
      }));

      // Reset AI detection state when new image is uploaded
      setAiDetectionPerformed(false);
      setAiDetectionResult(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.prompt.trim()) {
      toast.error("Please enter a prompt for AI generation");
      return;
    }

    try {
      const fullPrompt = `${aiPrompt.prompt}, ${aiPrompt.style} style, ${aiPrompt.quality} quality`;
      const result = await generateAiImageMutation.mutateAsync(fullPrompt);

      // Update NFT data with AI generated content
      setNftData((prev) => ({
        ...prev,
        previewUrl: result.image_url,
        isAiGenerated: true,
        traits: result.suggested_traits,
      }));
      // Automatically mark detection as completed for AI-generated image
      setAiDetectionPerformed(true);
      setAiDetectionResult({ is_ai_generated: true, confidence: 1, reasoning: 'AI Generated' });

    } catch (error) {
      console.error("AI generation failed:", error);
    }
  };

  const handleMintNft = async () => {
    if (!principal) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isFormValid) {
      toast.error(
        "Please complete AI detection and fill in all required fields"
      );
      return;
    }

    try {
      // Convert PiCO units to minimal units (1 PiCO = 1e8 minimal units)
      const priceAsInteger = Math.round(parseFloat(nftData.price) * 100000000);

      // Use regular minting with AI detection result
      const mintResult = await mintNftMutation.mutateAsync({
        to: principal,
        name: nftData.title,
        description: nftData.description,
        price: priceAsInteger,
        imageUrl: nftData.previewUrl || "",
        isAiGenerated: nftData.isAiGenerated,
        traits: nftData.traits,
        forSale: nftData.forSale,
      });

      // Show success message
      toast.success(`NFT #${mintResult} minted successfully!`);

      // Always create a forum for the new NFT
      try {
        await createForumMutation.mutateAsync({
          nftId: mintResult,
          nftName: nftData.title,
          principalId: principal,
          title: nftData.title,
          description: nftData.description,
        });
        toast.success("Forum created for your NFT!");
      } catch (forumError) {
        console.error("Failed to create forum for NFT:", forumError);
        toast.error("Failed to create forum for NFT. You can add one later.");
      }

      console.log("Starting query invalidation...");

      // Aggressively invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: createQueryKey.nfts() }),
        queryClient.refetchQueries({
          queryKey: createQueryKey.nfts(),
          type: "active",
        }),
        queryClient.removeQueries({ queryKey: createQueryKey.nfts() }),
        // Also invalidate all queries that might depend on NFT data
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes("nfts");
          },
        }),
      ]);

      console.log("Query invalidation completed, navigating...");

      // Navigate with state to indicate fresh mint
      navigate("/explore", {
        state: {
          freshlyMinted: true,
          mintedNftId: mintResult,
        },
      });
    } catch (error) {
      console.error("Minting failed:", error);
      toast.error("Failed to mint NFT. Please try again.");
    }
  };

  const resetForm = () => {
    setNftData({
      title: "",
      description: "",
      price: "",
      isAiGenerated: false,
      traits: [],
      forSale: true, // Default to for sale
      previewUrl: undefined,
      file: undefined,
    });
    setAiPrompt({
      prompt: "",
      style: "realistic",
      quality: "high",
      aspectRatio: "1:1",
    });
    // Reset AI detection state
    setAiDetectionPerformed(false);
    setAiDetectionResult(null);
  };

  const isFormValid =
    nftData.title.trim() &&
    nftData.description.trim() &&
    nftData.price.trim() &&
    nftData.previewUrl &&
    (aiDetectionPerformed || nftData.isAiGenerated); // Skip detection if AI-generated

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 py-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Link to="/explore" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden xs:inline">Back</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold">Mint NFT</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Upload and mint your digital artwork
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Mobile dropdown menu for actions */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={resetForm}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Form
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop reset button */}
              <Button
                size="sm"
                onClick={resetForm}
                variant="outline"
                className="hidden sm:inline-flex sm:size-lg"
              >
                Reset
              </Button>

              <Button
                size="sm"
                onClick={handleMintNft}
                disabled={
                  !isFormValid ||
                  mintNftMutation.isPending ||
                  generateAiImageMutation.isPending ||
                  uploadImageMutation.isPending ||
                  createForumMutation.isPending
                }
                className="bg-gradient-to-r from-primary to-primary/90 shadow-lg sm:size-lg flex items-center"
              >
                {mintNftMutation.isPending ||
                  generateAiImageMutation.isPending ||
                  uploadImageMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <UploadIcon className="h-4 w-4 mr-2" />
                )}
                <span className="text-xs sm:text-sm">
                  {mintNftMutation.isPending
                    ? "Minting..."
                    : uploadImageMutation.isPending
                      ? "Uploading..."
                      : createForumMutation.isPending
                        ? "Creating..."
                        : "Mint NFT"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "mint" | "generate")}
        >
          {/* Tab Navigation */}
          <div className="mb-6 sm:mb-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger
                value="mint"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <UploadIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Mint NFT</span>
                <span className="xs:hidden">Mint</span>
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Generate NFT</span>
                <span className="xs:hidden">Generate</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mint">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Upload & Media */}
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Media
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Upload your file to showcase your NFT
                    </p>
                  </CardHeader>
                  <CardContent>
                    {nftData.previewUrl ? (
                      <div className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                          <img
                            src={nftData.previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setNftData((prev) => ({
                              ...prev,
                              file: undefined,
                              previewUrl: undefined,
                            }));
                          }}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${dragOver
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-muted-foreground/50"
                          }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*,audio/*"
                          onChange={(e) => {
                            handleFileSelect(e.target.files);
                          }}
                          className="sr-only"
                        />
                        <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <UploadIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold mb-2">
                            Upload your file
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop or click to browse
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>PNG, JPG, GIF, MP4, MP3</p>
                            <p>Max size: 10MB (Images auto-compressed)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Detection and Checkbox - only show when there's a file uploaded */}
                    {nftData.previewUrl && !nftData.isAiGenerated && (
                      <div className="mt-4 space-y-3">
                        {/* AI Detection Button - Mandatory before minting */}
                        <div className="p-3 border border-border rounded-lg bg-blue-50 dark:bg-blue-950/30">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                AI Detection Required
                              </span>
                              {aiDetectionPerformed && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  ✓ Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Detect if the image is AI-generated using OpenAI
                              Vision (required before minting)
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                if (!nftData.previewUrl) return;

                                try {
                                  const result =
                                    await detectAIGeneratedMutation.mutateAsync(
                                      nftData.previewUrl
                                    );

                                  setAiDetectionResult(result);
                                  setAiDetectionPerformed(true);

                                  // Automatically update the isAiGenerated flag
                                  setNftData((prev) => ({
                                    ...prev,
                                    isAiGenerated: result.is_ai_generated,
                                  }));

                                  toast.success(
                                    `AI Detection: ${result.is_ai_generated
                                      ? "AI-Generated"
                                      : "Human-Made"
                                    } (${Math.round(
                                      result.confidence * 100
                                    )}% confidence)`
                                  );
                                } catch (error) {
                                  console.error("AI detection failed:", error);
                                }
                              }}
                              disabled={
                                detectAIGeneratedMutation.isPending ||
                                !nftData.previewUrl
                              }
                              className="w-full"
                            >
                              {detectAIGeneratedMutation.isPending ? (
                                <>
                                  <LoadingSpinner className="mr-2" />
                                  Analyzing...
                                </>
                              ) : aiDetectionPerformed ? (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Re-run AI Detection
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detect AI Generation
                                </>
                              )}
                            </Button>

                            {/* Show detection result */}
                            {aiDetectionResult && (
                              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                                <p>
                                  <strong>Result:</strong>{" "}
                                  {aiDetectionResult.is_ai_generated
                                    ? "AI-Generated"
                                    : "Human-Made"}
                                </p>
                                <p>
                                  <strong>Confidence:</strong>{" "}
                                  {Math.round(
                                    aiDetectionResult.confidence * 100
                                  )}
                                  %
                                </p>
                                <p>
                                  <strong>Reasoning:</strong>{" "}
                                  {aiDetectionResult.reasoning}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI Generated Checkbox - Now auto-updated by detection */}
                        <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="aiGenerated"
                              checked={nftData.isAiGenerated}
                              onChange={(e) =>
                                setNftData((prev) => ({
                                  ...prev,
                                  isAiGenerated: e.target.checked,
                                }))
                              }
                              className="sr-only"
                            />
                            <label
                              htmlFor="aiGenerated"
                              className="flex items-center cursor-pointer"
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${nftData.isAiGenerated
                                  ? "bg-purple-600 border-purple-600"
                                  : "border-gray-300 hover:border-purple-400"
                                  }`}
                              >
                                {nftData.isAiGenerated && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="ml-3 text-sm font-medium">
                                This image was generated using AI
                                {aiDetectionPerformed && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (Auto-detected)
                                  </span>
                                )}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Preview Card */}
                {nftData.previewUrl && (
                  <Card>
                    <CardHeader className="pb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Preview
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border border-border rounded-lg bg-muted/30">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-background">
                            <img
                              src={nftData.previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {nftData.title || "Untitled NFT"}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {nftData.description || "No description provided"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {nftData.forSale && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  For Sale
                                </span>
                              )}
                              {nftData.isAiGenerated && (
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                  AI Generated
                                </span>
                              )}
                              {nftData.price && (
                                <span className="text-sm font-semibold">
                                  {nftData.price} PiCO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader className="pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Details
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="title"
                        value={nftData.title}
                        onChange={(e) =>
                          setNftData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Name your NFT"
                        maxLength={50}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        {nftData.title.length}/50 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="description"
                        value={nftData.description}
                        onChange={(e) =>
                          setNftData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Tell the story behind your creation..."
                        className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        {nftData.description.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader className="pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">
                        Price (PiCO) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="price"
                        type="number"
                        value={nftData.price}
                        onChange={(e) =>
                          setNftData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="100"
                        min="0"
                        step="1"
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set the price for your NFT in PiCO tokens (whole numbers
                        only)
                      </p>
                    </div>

                    {/* For Sale Toggle */}
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="forSale"
                          checked={nftData.forSale}
                          onChange={(e) =>
                            setNftData((prev) => ({
                              ...prev,
                              forSale: e.target.checked,
                            }))
                          }
                          className="sr-only"
                        />
                        <label
                          htmlFor="forSale"
                          className="flex items-center cursor-pointer"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${nftData.forSale
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300 hover:border-blue-400"
                              }`}
                          >
                            {nftData.forSale && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="ml-3 text-sm font-medium">
                            List NFT for sale immediately
                          </span>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {nftData.forSale
                        ? "✅ Your NFT will be available for purchase immediately after minting"
                        : "⏸️ Your NFT will be minted but not listed for sale (you can list it later)"
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* Traits Editor */}
                <TraitsEditor
                  traits={nftData.traits}
                  onChange={(traits) =>
                    setNftData((prev) => ({ ...prev, traits }))
                  }
                  isAiGenerated={nftData.isAiGenerated}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - AI Generation */}
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Image Generation
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Generate unique artwork using AI
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="prompt" className="text-sm font-medium">
                        Prompt
                      </label>
                      <textarea
                        id="prompt"
                        value={aiPrompt.prompt}
                        onChange={(e) =>
                          setAiPrompt((prev) => ({
                            ...prev,
                            prompt: e.target.value,
                          }))
                        }
                        placeholder="Describe the image you want to generate..."
                        className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        maxLength={500}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="style" className="text-sm font-medium">
                          Style
                        </label>
                        <select
                          id="style"
                          value={aiPrompt.style}
                          onChange={(e) =>
                            setAiPrompt((prev) => ({
                              ...prev,
                              style: e.target.value,
                            }))
                          }
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {aiStyles.map((style) => (
                            <option key={style.value} value={style.value}>
                              {style.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="quality"
                          className="text-sm font-medium"
                        >
                          Quality
                        </label>
                        <select
                          id="quality"
                          value={aiPrompt.quality}
                          onChange={(e) =>
                            setAiPrompt((prev) => ({
                              ...prev,
                              quality: e.target.value,
                            }))
                          }
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="standard">Standard</option>
                          <option value="high">High Quality</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateAI}
                      disabled={
                        !aiPrompt.prompt.trim() ||
                        generateAiImageMutation.isPending
                      }
                      className="w-full"
                    >
                      {generateAiImageMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Generating...
                        </>
                      ) : (
                        "Generate AI Image"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Generated Image Preview */}
                {nftData.previewUrl && nftData.isAiGenerated && (
                  <Card>
                    <CardHeader className="pb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Generated Image
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                        <img
                          src={nftData.previewUrl}
                          alt="Generated Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader className="pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Details
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="title-gen"
                        className="text-sm font-medium"
                      >
                        Title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="title-gen"
                        value={nftData.title}
                        onChange={(e) =>
                          setNftData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Name your NFT"
                        maxLength={50}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        {nftData.title.length}/50 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="description-gen"
                        className="text-sm font-medium"
                      >
                        Description <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="description-gen"
                        value={nftData.description}
                        onChange={(e) =>
                          setNftData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Tell the story behind your creation..."
                        className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        {nftData.description.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader className="pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="price-gen"
                        className="text-sm font-medium"
                      >
                        Price (PiCO) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="price-gen"
                        type="number"
                        value={nftData.price}
                        onChange={(e) =>
                          setNftData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="100"
                        min="0"
                        step="1"
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set the price for your NFT in PiCO tokens (whole numbers
                        only)
                      </p>
                    </div>

                    {/* For Sale Toggle */}
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="forSaleGen"
                          checked={nftData.forSale}
                          onChange={(e) =>
                            setNftData((prev) => ({
                              ...prev,
                              forSale: e.target.checked,
                            }))
                          }
                          className="sr-only"
                        />
                        <label
                          htmlFor="forSaleGen"
                          className="flex items-center cursor-pointer"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${nftData.forSale
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300 hover:border-blue-400"
                              }`}
                          >
                            {nftData.forSale && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="ml-3 text-sm font-medium">
                            List NFT for sale immediately
                          </span>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {nftData.forSale
                        ? "✅ Your NFT will be available for purchase immediately after minting"
                        : "⏸️ Your NFT will be minted but not listed for sale (you can list it later)"
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* AI Generated Traits Editor */}
                <TraitsEditor
                  traits={nftData.traits}
                  onChange={(traits) =>
                    setNftData((prev) => ({ ...prev, traits }))
                  }
                  isAiGenerated={nftData.isAiGenerated}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
