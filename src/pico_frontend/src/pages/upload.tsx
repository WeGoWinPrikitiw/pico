import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Badge,
  Separator,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  Plus,
  X,
  Eye,
  DollarSign,
  Tag,
  FileText,
  Camera,
  Palette,
  Info,
  Clock,
  Percent,
  Check,
  AlertCircle,
} from "lucide-react";

interface NFTMetadata {
  title: string;
  description: string;
  price: string;
  category: string;
  tags: string[];
  royalty: string;
  isForSale: boolean;
  file?: File;
  previewUrl?: string;
}

export function UploadPage() {
  const navigate = useNavigate();
  const { principal, mintTokens } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadType, setUploadType] = useState<"upload" | "ai-generate">(
    "upload",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentTag, setCurrentTag] = useState("");

  const [nftData, setNftData] = useState<NFTMetadata>({
    title: "",
    description: "",
    price: "",
    category: "art",
    tags: [],
    royalty: "10",
    isForSale: true,
  });

  const [aiPrompt, setAiPrompt] = useState({
    prompt: "",
    style: "realistic",
    quality: "high",
    aspectRatio: "1:1",
  });

  const categories = [
    { value: "art", label: "Digital Art", icon: "🎨" },
    { value: "photography", label: "Photography", icon: "📸" },
    { value: "music", label: "Music", icon: "🎵" },
    { value: "video", label: "Video", icon: "🎬" },
    { value: "gaming", label: "Gaming", icon: "🎮" },
    { value: "collectibles", label: "Collectibles", icon: "💎" },
    { value: "utility", label: "Utility", icon: "🔧" },
    { value: "memes", label: "Memes", icon: "😂" },
  ];

  const aiStyles = [
    { value: "realistic", label: "Realistic" },
    { value: "cartoon", label: "Cartoon" },
    { value: "anime", label: "Anime" },
    { value: "abstract", label: "Abstract" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "fantasy", label: "Fantasy" },
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/") &&
      !file.type.startsWith("audio/")
    ) {
      alert("Please select an image, video, or audio file");
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setNftData((prev) => ({
      ...prev,
      file,
      previewUrl,
    }));
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

  const addTag = () => {
    if (currentTag.trim() && !nftData.tags.includes(currentTag.trim())) {
      setNftData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNftData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.prompt.trim()) {
      alert("Please enter a prompt for AI generation");
      return;
    }

    setIsUploading(true);

    try {
      // Simulate AI generation (in real app, this would call an AI service)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate generated image
      const mockGeneratedUrl = "/brand/pico-glow.png";

      setNftData((prev) => ({
        ...prev,
        previewUrl: mockGeneratedUrl,
        title:
          aiPrompt.prompt.slice(0, 50) +
          (aiPrompt.prompt.length > 50 ? "..." : ""),
        description: `AI-generated artwork based on prompt: "${aiPrompt.prompt}"`,
      }));

      setUploadType("upload"); // Switch to upload view after generation
    } catch (error) {
      console.error("AI generation failed:", error);
      alert("AI generation failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMintNFT = async () => {
    if (
      !nftData.title.trim() ||
      !nftData.description.trim() ||
      !nftData.price.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!nftData.previewUrl) {
      alert("Please upload an image or generate one with AI");
      return;
    }

    if (!principal) {
      alert("Please connect your wallet first");
      return;
    }

    setIsUploading(true);

    try {
      // In a real implementation, this would:
      // 1. Upload file to IPFS/Arweave
      // 2. Create NFT metadata JSON
      // 3. Upload metadata to IPFS
      // 4. Call NFT minting contract with metadata URI
      // 5. If isForSale, list on marketplace

      // For demo, we'll simulate the process and create a mock transaction
      console.log("Step 1: Uploading file to decentralized storage...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Step 2: Creating NFT metadata...");
      const metadata = {
        name: nftData.title,
        description: nftData.description,
        image: nftData.previewUrl,
        attributes: [
          { trait_type: "Category", value: nftData.category },
          { trait_type: "Creator", value: principal },
          { trait_type: "Royalty", value: `${nftData.royalty}%` },
        ],
        tags: nftData.tags,
        created_at: Date.now(),
      };

      console.log("Step 3: Minting NFT...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock mint process - in reality would call smart contract
      const mockNFTId = Math.floor(Math.random() * 10000);

      if (nftData.isForSale) {
        console.log("Step 4: Listing NFT for sale...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // This would call the marketplace contract to list the NFT
        console.log(`NFT listed for ${nftData.price} PiCO tokens`);
      }

      console.log("NFT minted successfully!", {
        nftId: mockNFTId,
        metadata,
        isForSale: nftData.isForSale,
        price: nftData.isForSale ? nftData.price : null,
      });

      // Show success message
      alert(
        `✅ NFT "${nftData.title}" minted successfully! ${nftData.isForSale ? `Listed for ${nftData.price} PiCO tokens.` : ""}`,
      );

      // Navigate to profile or success page
      navigate("/profile");
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = nftData.title.trim() &&
    nftData.description.trim() &&
    nftData.price.trim() &&
    nftData.previewUrl;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/explore">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold">Create NFT</h1>
                <p className="text-sm text-muted-foreground">Upload and mint your digital artwork</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNftData({
                    title: "",
                    description: "",
                    price: "",
                    category: "art",
                    tags: [],
                    royalty: "10",
                    isForSale: true,
                  });
                }}
                className="min-w-[120px]"
              >
                Reset
              </Button>
              <Button
                onClick={handleMintNFT}
                disabled={!isFormValid || isUploading}
                size="sm"
                className="gap-2 min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4" />
                    Mint NFT
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Media */}
          <div className="space-y-6">
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
                      <X className="h-4 w-4" />
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
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="sr-only"
                    />
                    <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <UploadIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2">Upload your file</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click to browse
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>PNG, JPG, GIF, MP4, MP3</p>
                        <p>Max size: 50MB</p>
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
                          <Badge variant="secondary" className="text-xs">
                            {categories.find(c => c.value === nftData.category)?.icon} {categories.find(c => c.value === nftData.category)?.label}
                          </Badge>
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
                      setNftData((prev) => ({ ...prev, title: e.target.value }))
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
                  <label htmlFor="description" className="text-sm font-medium">
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

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    value={nftData.category}
                    onChange={(e) =>
                      setNftData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
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
                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="royalty" className="text-sm font-medium">
                      Royalty %
                    </label>
                    <Input
                      id="royalty"
                      type="number"
                      value={nftData.royalty}
                      onChange={(e) =>
                        setNftData((prev) => ({
                          ...prev,
                          royalty: e.target.value,
                        }))
                      }
                      placeholder="10"
                      min="0"
                      max="15"
                      step="0.1"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <input
                    type="checkbox"
                    id="forSale"
                    checked={nftData.isForSale}
                    onChange={(e) =>
                      setNftData((prev) => ({
                        ...prev,
                        isForSale: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="forSale" className="text-sm font-medium">
                    List for sale immediately
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className="pb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add tags to help people discover your NFT
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {nftData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {nftData.tags.length < 5 && (
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add a tag..."
                      className="h-9"
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={!currentTag.trim()}
                      className="h-9 px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Maximum 5 tags. Press Enter or click + to add.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
