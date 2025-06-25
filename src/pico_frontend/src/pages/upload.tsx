import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Palette
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link to="/explore">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Explore
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Create NFT</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Upload Type Selector */}
                <div className="mb-8">
                    <div className="flex rounded-lg bg-gray-100 p-1">
                        <button
                            onClick={() => setUploadType('upload')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${uploadType === 'upload'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <UploadIcon className="h-5 w-5" />
                            Upload File
                        </button>
                        <button
                            onClick={() => setUploadType('ai-generate')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${uploadType === 'ai-generate'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Sparkles className="h-5 w-5" />
                            AI Generate
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Upload/Generate */}
                    <div>
                        {uploadType === 'upload' ? (
                            /* File Upload */
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Your NFT</h2>

                                {!nftData.previewUrl ? (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragOver
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <UploadIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-900 mb-2">
                                            Drop your file here, or{' '}
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-blue-600 hover:text-blue-700 underline"
                                            >
                                                browse
                                            </button>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            PNG, JPG, GIF, MP4, MP3 up to 50MB
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,video/*,audio/*"
                                            onChange={(e) => handleFileSelect(e.target.files)}
                                            className="hidden"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <img
                                                src={nftData.previewUrl}
                                                alt="Preview"
                                                className="w-full h-64 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => setNftData(prev => ({ ...prev, file: undefined, previewUrl: undefined }))}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex-1"
                                            >
                                                <Camera className="h-4 w-4 mr-2" />
                                                Change File
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,video/*,audio/*"
                                                onChange={(e) => handleFileSelect(e.target.files)}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* AI Generation */
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Generate Art</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Describe your artwork
                                        </label>
                                        <textarea
                                            value={aiPrompt.prompt}
                                            onChange={(e) => setAiPrompt(prev => ({ ...prev, prompt: e.target.value }))}
                                            placeholder="A futuristic cityscape with neon lights and flying cars..."
                                            className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Art Style
                                            </label>
                                            <select
                                                value={aiPrompt.style}
                                                onChange={(e) => setAiPrompt(prev => ({ ...prev, style: e.target.value }))}
                                                className="w-full p-3 border border-gray-200 rounded-lg"
                                            >
                                                {aiStyles.map(style => (
                                                    <option key={style.value} value={style.value}>
                                                        {style.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quality
                                            </label>
                                            <select
                                                value={aiPrompt.quality}
                                                onChange={(e) => setAiPrompt(prev => ({ ...prev, quality: e.target.value }))}
                                                className="w-full p-3 border border-gray-200 rounded-lg"
                                            >
                                                <option value="standard">Standard</option>
                                                <option value="high">High Quality</option>
                                                <option value="ultra">Ultra HD</option>
                                            </select>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGenerateAI}
                                        disabled={isUploading || !aiPrompt.prompt.trim()}
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isUploading ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Generate Art
                                            </>
                                        )}
                                    </Button>

                                    {nftData.previewUrl && (
                                        <div className="mt-6">
                                            <img
                                                src={nftData.previewUrl}
                                                alt="Generated"
                                                className="w-full h-64 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - NFT Details */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">NFT Details</h2>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <Input
                                    value={nftData.title}
                                    onChange={(e) => setNftData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter NFT title"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={nftData.description}
                                    onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe your NFT..."
                                    className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                                    rows={4}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
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

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        placeholder="Add a tag"
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addTag} size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {nftData.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                        >
                                            #{tag}
                                            <button onClick={() => removeTag(tag)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (PiCO) *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="number"
                                        value={nftData.price}
                                        onChange={(e) => setNftData(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="pl-10"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Royalty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Royalty (%)
                                </label>
                                <Input
                                    type="number"
                                    value={nftData.royalty}
                                    onChange={(e) => setNftData(prev => ({ ...prev, royalty: e.target.value }))}
                                    placeholder="10"
                                    min="0"
                                    max="30"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Percentage you'll earn from future sales (max 30%)
                                </p>
                            </div>

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

                            {/* Mint Button */}
                            <Button
                                onClick={handleMintNFT}
                                disabled={isUploading || !nftData.title.trim() || !nftData.description.trim() || !nftData.price.trim() || !nftData.previewUrl}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                {isUploading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Minting...
                                    </>
                                ) : (
                                    <>
                                        <Palette className="h-5 w-5 mr-2" />
                                        Mint NFT
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 