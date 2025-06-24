import { useState } from "react";
import { pico_backend } from "declarations/pico_backend";
import { Principal } from "@dfinity/principal";

function NFTMinter({ onMinted }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    price: "1000000",
    isAiGenerated: false,
  });
  const [traits, setTraits] = useState([]);
  const [newTrait, setNewTrait] = useState({
    trait_type: "",
    value: "",
    rarity: "Common",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [imageError, setImageError] = useState(false);

  const rarityOptions = ["Common", "Rare", "Epic", "Legendary", "Special"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    if (name === "imageUrl") {
      setImageError(false);
    }
  };

  const handleTraitChange = (e) => {
    const { name, value } = e.target;
    setNewTrait((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTrait = () => {
    if (!newTrait.trait_type.trim() || !newTrait.value.trim()) {
      setError("Please fill in both trait type and value");
      return;
    }

    // Check for duplicate trait types
    if (traits.some((trait) => trait.trait_type === newTrait.trait_type)) {
      setError("A trait with this type already exists");
      return;
    }

    setTraits((prev) => [...prev, { ...newTrait }]);
    setNewTrait({ trait_type: "", value: "", rarity: "Common" });
    setError("");
  };

  const removeTrait = (index) => {
    setTraits((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.imageUrl.trim()) return "Image URL is required";
    if (!formData.price || Number(formData.price) <= 0)
      return "Valid price is required";

    // Basic URL validation
    try {
      new URL(formData.imageUrl);
    } catch {
      return "Please enter a valid image URL";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      // Use the anonymous principal for testing (correct format)
      // In a real app, you'd get this from IC authentication
      const anonymousPrincipal = Principal.anonymous();

      console.log("Original traits:", JSON.stringify(traits, null, 2));

      // Convert traits to the format expected by the backend
      const backendTraits = traits.map((trait) => {
        // Handle rarity: ensure it's properly formatted for Motoko optional field
        let rarityValue = [];
        if (trait.rarity) {
          // If trait.rarity is already an array (from backend), take first element
          // If it's a string (from manual input), use as is
          const rarityString = Array.isArray(trait.rarity)
            ? trait.rarity[0]
            : trait.rarity;
          if (rarityString && rarityString !== "") {
            rarityValue = [rarityString];
          }
        }

        return {
          trait_type: trait.trait_type,
          value: trait.value,
          rarity: rarityValue, // Optional field for Motoko: [] or ["value"]
        };
      });

      console.log("Traits being sent:", JSON.stringify(backendTraits, null, 2));

      const result = await pico_backend.mint_nft(
        anonymousPrincipal, // to: Principal
        formData.name, // name: Text
        formData.description, // description: Text
        BigInt(formData.price), // price: Nat
        formData.imageUrl, // image_url: Text
        formData.isAiGenerated, // is_ai_generated: Bool
        backendTraits // traits: [Trait]
      );

      if ("ok" in result) {
        setSuccess({
          nftId: result.ok,
          name: formData.name,
          traitsCount: traits.length,
        });

        // Reset form
        setFormData({
          name: "",
          description: "",
          imageUrl: "",
          price: "1000000",
          isAiGenerated: false,
        });
        setTraits([]);

        if (onMinted) onMinted();
      } else {
        setError(result.err || "Failed to mint NFT");
      }
    } catch (error) {
      console.error("Minting error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickFillAI = () => {
    // Check if there's a recently generated image in localStorage or context
    const lastAIImage = localStorage.getItem("lastGeneratedImage");
    if (lastAIImage) {
      try {
        const imageData = JSON.parse(lastAIImage);
        setFormData((prev) => ({
          ...prev,
          name: `AI Art: ${imageData.prompt.substring(0, 30)}${
            imageData.prompt.length > 30 ? "..." : ""
          }`,
          description: `AI-generated artwork created with prompt: "${imageData.prompt}"`,
          imageUrl: imageData.url,
          isAiGenerated: true,
        }));

        // Auto-fill traits from AI generation
        if (imageData.traits && Array.isArray(imageData.traits)) {
          setTraits(
            imageData.traits.map((trait) => ({
              trait_type: trait.trait_type,
              value: trait.value,
              rarity: Array.isArray(trait.rarity)
                ? trait.rarity[0]
                : trait.rarity || "Common",
            }))
          );
        }

        setImageError(false);
      } catch (e) {
        console.error("Failed to parse last AI image:", e);
      }
    }
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleRetryImage = () => {
    setImageError(false);
    // Force reload by adding a timestamp to the URL
    const currentUrl = formData.imageUrl;
    const separator = currentUrl.includes("?") ? "&" : "?";
    const newUrl = `${currentUrl}${separator}_retry=${Date.now()}`;
    setFormData((prev) => ({ ...prev, imageUrl: newUrl }));
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Common":
        return "#6b7280";
      case "Rare":
        return "#3b82f6";
      case "Epic":
        return "#8b5cf6";
      case "Legendary":
        return "#f59e0b";
      case "Special":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getRarityEmoji = (rarity) => {
    switch (rarity) {
      case "Common":
        return "⚪";
      case "Rare":
        return "🔵";
      case "Epic":
        return "🟣";
      case "Legendary":
        return "🟡";
      case "Special":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="nft-minter">
      <div className="minter-header">
        <h2>💎 Mint NFT</h2>
        <p>Create a new NFT with custom metadata and traits</p>
      </div>

      {success && (
        <div className="success-message">
          <h3>🎉 NFT Minted Successfully!</h3>
          <p>
            <strong>"{success.name}"</strong> has been minted with Token ID:
            <span className="token-id">#{success.nftId}</span>
            {success.traitsCount > 0 && (
              <span className="traits-count">
                {" "}
                and {success.traitsCount} trait
                {success.traitsCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
          <button onClick={() => setSuccess(null)} className="dismiss-button">
            ✅ Mint Another
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="minter-form">
        <div className="form-group">
          <label htmlFor="name">NFT Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter a catchy name for your NFT"
            maxLength={100}
            disabled={loading}
            required
          />
          <div className="char-count">{formData.name.length}/100</div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your NFT in detail..."
            rows={4}
            maxLength={500}
            disabled={loading}
            required
          />
          <div className="char-count">{formData.description.length}/500</div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL *</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/your-image.jpg"
            disabled={loading}
            required
          />
          <div className="url-actions">
            <button
              type="button"
              onClick={quickFillAI}
              className="quick-fill-button"
              disabled={loading}
            >
              🤖 Use Last AI Image + Traits
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (cycles) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="1000000"
            min="1"
            disabled={loading}
            required
          />
          <div className="price-display">
            ≈ {formatPrice(formData.price)} cycles
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isAiGenerated"
              checked={formData.isAiGenerated}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isAiGenerated: e.target.checked,
                }))
              }
              disabled={loading}
            />
            <span className="checkbox-text">
              🤖 This is an AI-generated image
            </span>
          </label>
          <div className="checkbox-description">
            Check this if the image was created using AI (like DALL-E,
            Midjourney, etc.)
          </div>
        </div>

        {/* Traits Section */}
        <div className="traits-section">
          <h3>🏷️ NFT Traits</h3>
          <p className="traits-description">
            Add custom traits to make your NFT unique and searchable
          </p>

          {/* Current Traits */}
          {traits.length > 0 && (
            <div className="current-traits">
              <h4>Current Traits ({traits.length})</h4>
              <div className="traits-list">
                {traits.map((trait, index) => (
                  <div key={index} className="trait-item">
                    <div className="trait-content">
                      <div className="trait-header">
                        <span className="trait-type">{trait.trait_type}</span>
                        <span
                          className="trait-rarity"
                          style={{ color: getRarityColor(trait.rarity) }}
                        >
                          {getRarityEmoji(trait.rarity)} {trait.rarity}
                        </span>
                      </div>
                      <div className="trait-value">{trait.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTrait(index)}
                      className="remove-trait-button"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Trait */}
          <div className="add-trait-section">
            <h4>Add New Trait</h4>
            <div className="trait-form">
              <div className="trait-inputs">
                <input
                  type="text"
                  name="trait_type"
                  value={newTrait.trait_type}
                  onChange={handleTraitChange}
                  placeholder="Trait Type (e.g., Style, Color, Theme)"
                  disabled={loading}
                />
                <input
                  type="text"
                  name="value"
                  value={newTrait.value}
                  onChange={handleTraitChange}
                  placeholder="Trait Value (e.g., Cyberpunk, Blue, Space)"
                  disabled={loading}
                />
                <select
                  name="rarity"
                  value={newTrait.rarity}
                  onChange={handleTraitChange}
                  disabled={loading}
                >
                  {rarityOptions.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {getRarityEmoji(rarity)} {rarity}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addTrait}
                className="add-trait-button"
                disabled={
                  loading ||
                  !newTrait.trait_type.trim() ||
                  !newTrait.value.trim()
                }
              >
                + Add Trait
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Image Preview */}
        {formData.imageUrl && (
          <div className="image-preview-enhanced">
            <h4>🖼️ NFT Image Preview</h4>
            <div className="preview-container">
              <div className="image-wrapper">
                <img
                  src={formData.imageUrl}
                  alt="NFT Preview"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  className={`preview-image ${
                    imageError ? "error" : "loading"
                  }`}
                />
                {imageError && (
                  <div className="image-overlay">
                    <div className="overlay-content">
                      <span className="overlay-icon">🖼️</span>
                      <p>Preview Blocked</p>
                      <small>CORS restriction</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="preview-info">
                <div className="image-url-display">
                  <label>Image URL:</label>
                  <div className="url-container">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      readOnly
                      className="url-display"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.imageUrl);
                        // Optional: Add toast notification
                      }}
                      className="copy-url-button"
                      title="Copy URL"
                    >
                      📋
                    </button>
                    <a
                      href={formData.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-url-button"
                      title="Open in new tab"
                    >
                      🔗
                    </a>
                  </div>
                </div>

                {imageError && (
                  <div className="cors-help">
                    <p>
                      <strong>Can't see the image?</strong>
                    </p>
                    <ul>
                      <li>✅ Your NFT will still mint successfully</li>
                      <li>🔗 Click the link above to view in a new tab</li>
                      <li>⏰ OpenAI URLs expire in 1-2 hours</li>
                    </ul>
                    <button
                      type="button"
                      onClick={handleRetryImage}
                      className="retry-image-button"
                      disabled={loading}
                    >
                      🔄 Retry Loading Image
                    </button>
                  </div>
                )}

                {!imageError && (
                  <div className="preview-success">
                    <p>✅ Image loaded successfully!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="mint-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Minting...
              </>
            ) : (
              <>💎 Mint NFT</>
            )}
          </button>
        </div>
      </form>

      <div className="quick-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="action-buttons">
          <button
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                name: "Digital Masterpiece",
                description:
                  "A unique digital artwork created for the blockchain",
                price: "5000000",
              }))
            }
            className="template-button"
            disabled={loading}
          >
            📝 Art Template
          </button>

          <button
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                name: "Collectible Item",
                description: "A rare collectible item with special properties",
                price: "2000000",
              }))
            }
            className="template-button"
            disabled={loading}
          >
            🎯 Collectible Template
          </button>
        </div>
      </div>

      <div className="info-section">
        <h3>ℹ️ Minting Information</h3>
        <ul>
          <li>
            <strong>Cost:</strong> Free to mint (only pay cycles as NFT price)
          </li>
          <li>
            <strong>Blockchain:</strong> Internet Computer (ICP)
          </li>
          <li>
            <strong>Token Standard:</strong> ICRC-7 compatible
          </li>
          <li>
            <strong>Metadata:</strong> Stored on-chain for permanence
          </li>
        </ul>

        <div className="warning-box">
          <h4>⚠️ Important</h4>
          <p>
            Make sure your image URL is permanent and accessible. Temporary URLs
            (like OpenAI URLs) expire after 1-2 hours! Consider uploading to a
            permanent storage service like IPFS, Arweave, or a cloud storage
            provider.
          </p>
          <div className="warning-note">
            <strong>CORS Notice:</strong> Some images may not display in preview
            due to browser security restrictions, but they will still be saved
            to your NFT.
          </div>
        </div>
      </div>
    </div>
  );
}

export default NFTMinter;
