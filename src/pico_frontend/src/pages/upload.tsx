import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, Input, Badge, Separator } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/context/auth-context';
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
    Percent
} from 'lucide-react';

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

    const [uploadType, setUploadType] = useState<'upload' | 'ai-generate'>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [currentTag, setCurrentTag] = useState('');

    const [nftData, setNftData] = useState<NFTMetadata>({
        title: '',
        description: '',
        price: '',
        category: 'art',
        tags: [],
        royalty: '10',
        isForSale: true
    });

    const [aiPrompt, setAiPrompt] = useState({
        prompt: '',
        style: 'realistic',
        quality: 'high',
        aspectRatio: '1:1'
    });

    const categories = [
        { value: 'art', label: 'Digital Art' },
        { value: 'photography', label: 'Photography' },
        { value: 'music', label: 'Music' },
        { value: 'video', label: 'Video' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'collectibles', label: 'Collectibles' },
        { value: 'utility', label: 'Utility' },
        { value: 'memes', label: 'Memes' }
    ];

    const aiStyles = [
        { value: 'realistic', label: 'Realistic' },
        { value: 'cartoon', label: 'Cartoon' },
        { value: 'anime', label: 'Anime' },
        { value: 'abstract', label: 'Abstract' },
        { value: 'cyberpunk', label: 'Cyberpunk' },
        { value: 'fantasy', label: 'Fantasy' }
    ];

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
            alert('Please select an image, video, or audio file');
            return;
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be less than 50MB');
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setNftData(prev => ({
            ...prev,
            file,
            previewUrl
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
            setNftData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setNftData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt.prompt.trim()) {
            alert('Please enter a prompt for AI generation');
            return;
        }

        setIsUploading(true);

        try {
            // Simulate AI generation (in real app, this would call an AI service)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Simulate generated image
            const mockGeneratedUrl = '/brand/pico-glow.png';

            setNftData(prev => ({
                ...prev,
                previewUrl: mockGeneratedUrl,
                title: aiPrompt.prompt.slice(0, 50) + (aiPrompt.prompt.length > 50 ? '...' : ''),
                description: `AI-generated artwork based on prompt: "${aiPrompt.prompt}"`
            }));

            setUploadType('upload'); // Switch to upload view after generation
        } catch (error) {
            console.error('AI generation failed:', error);
            alert('AI generation failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleMintNFT = async () => {
        if (!nftData.title.trim() || !nftData.description.trim() || !nftData.price.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        if (!nftData.previewUrl) {
            alert('Please upload an image or generate one with AI');
            return;
        }

        if (!principal) {
            alert('Please connect your wallet first');
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
            console.log('Step 1: Uploading file to decentralized storage...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Step 2: Creating NFT metadata...');
            const metadata = {
                name: nftData.title,
                description: nftData.description,
                image: nftData.previewUrl,
                attributes: [
                    { trait_type: 'Category', value: nftData.category },
                    { trait_type: 'Creator', value: principal },
                    { trait_type: 'Royalty', value: `${nftData.royalty}%` }
                ],
                tags: nftData.tags,
                created_at: Date.now()
            };

            console.log('Step 3: Minting NFT...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock mint process - in reality would call smart contract
            const mockNFTId = Math.floor(Math.random() * 10000);

            if (nftData.isForSale) {
                console.log('Step 4: Listing NFT for sale...');
                await new Promise(resolve => setTimeout(resolve, 500));

                // This would call the marketplace contract to list the NFT
                console.log(`NFT listed for ${nftData.price} PiCO tokens`);
            }

            console.log('NFT minted successfully!', {
                nftId: mockNFTId,
                metadata,
                isForSale: nftData.isForSale,
                price: nftData.isForSale ? nftData.price : null
            });

            // Show success message
            alert(`✅ NFT "${nftData.title}" minted successfully! ${nftData.isForSale ? `Listed for ${nftData.price} PiCO tokens.` : ''}`);

            // Navigate to profile or success page
            navigate('/profile');

        } catch (error) {
            console.error('Minting failed:', error);
            alert('Minting failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation */}
                <div className="mb-8">
                    <Link to="/explore">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Explore
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <h1 className="text-3xl font-bold">Create New NFT</h1>
                        <p className="text-muted-foreground">Upload your artwork and create your NFT</p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleMintNFT} className="space-y-8">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-4">
                                    Upload Image
                                </label>
                                <div className="relative">
                                    {nftData.previewUrl ? (
                                        <div className="relative aspect-square rounded-lg overflow-hidden">
                                            <img
                                                src={nftData.previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNftData(prev => ({ ...prev, file: undefined, previewUrl: undefined }));
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="block">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,video/*,audio/*"
                                                onChange={(e) => handleFileSelect(e.target.files)}
                                                className="sr-only"
                                            />
                                            <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG, GIF, MP4, MP3 up to 50MB
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Title and Description */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-bold mb-2">
                                        Title *
                                    </label>
                                    <Input
                                        id="title"
                                        value={nftData.title}
                                        onChange={(e) => setNftData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Give your NFT a name"
                                        maxLength={50}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {nftData.title.length}/50 characters
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        value={nftData.description}
                                        onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Tell the story of your NFT"
                                        className="w-full min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {nftData.description.length}/500 characters
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium mb-2">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={nftData.category}
                                    onChange={(e) => setNftData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                >
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Separator />

                            {/* Price and Royalty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium mb-2">
                                        Price (PiCO) *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="price"
                                            type="number"
                                            value={nftData.price}
                                            onChange={(e) => setNftData(prev => ({ ...prev, price: e.target.value }))}
                                            placeholder="0.00"
                                            className="pl-9"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="royalty" className="block text-sm font-medium mb-2">
                                        Royalty %
                                    </label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="royalty"
                                            type="number"
                                            value={nftData.royalty}
                                            onChange={(e) => setNftData(prev => ({ ...prev, royalty: e.target.value }))}
                                            placeholder="2.5"
                                            className="pl-9"
                                            min="0"
                                            max="15"
                                            step="0.1"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum 15%
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tags
                                </label>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {nftData.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="flex items-center gap-1"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        {nftData.tags.length < 5 && (
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    value={currentTag}
                                                    onChange={(e) => {
                                                        setCurrentTag(e.target.value);
                                                        addTag();
                                                    }}
                                                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                    placeholder="Add a tag"
                                                    className="pl-9"
                                                    maxLength={20}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Press enter to add a tag. Maximum 5 tags.
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* For Sale Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="forSale"
                                    checked={nftData.isForSale}
                                    onChange={(e) => setNftData(prev => ({ ...prev, isForSale: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <label htmlFor="forSale" className="text-sm font-medium text-gray-700">
                                    List for sale immediately
                                </label>
                            </div>

                            {/* Preview */}
                            {nftData.previewUrl && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Eye className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Preview</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="aspect-square w-24 h-24 bg-gray-200 rounded-lg overflow-hidden mb-3">
                                            <img
                                                src={nftData.previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h4 className="font-medium text-gray-900">{nftData.title || 'Untitled'}</h4>
                                        <p className="text-sm text-gray-600 truncate">{nftData.description || 'No description'}</p>
                                        <p className="text-sm font-semibold text-blue-600 mt-1">
                                            {nftData.price ? `${nftData.price} PiCO` : 'Price not set'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="reset"
                                    variant="outline"
                                    onClick={() => {
                                        setNftData(prev => ({
                                            ...prev,
                                            title: '',
                                            description: '',
                                            price: '',
                                            royalty: '10',
                                            isForSale: true,
                                            tags: []
                                        }));
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUploading || !nftData.title.trim() || !nftData.description.trim() || !nftData.price.trim() || !nftData.previewUrl}
                                    className="min-w-[120px]"
                                >
                                    {isUploading ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Minting...
                                        </>
                                    ) : (
                                        <>
                                            <Palette className="h-4 w-4 mr-2" />
                                            Mint NFT
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 