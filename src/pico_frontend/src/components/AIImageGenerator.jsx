import { useState } from "react";
import { pico_backend } from "declarations/pico_backend";

function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState("");

  const examplePrompts = [
    "A cyberpunk warrior with neon armor in a dark urban setting",
    "Abstract geometric patterns in vibrant rainbow colors",
    "A fantasy dragon breathing golden fire over a mystical forest",
    "A peaceful ocean scene with golden sunset reflections",
    "Minimalist space art with cosmic nebula and distant stars",
    "A detailed steampunk clockwork mechanism with intricate gears",
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedImage(null);

    try {
      const result = await pico_backend.generate_ai_image(prompt);

      if ("ok" in result) {
        const imageData = {
          url: result.ok.image_url,
          prompt: prompt,
          traits: result.ok.suggested_traits,
          timestamp: Date.now(),
        };
        setGeneratedImage(imageData);

        // Store in localStorage for the minter to use
        localStorage.setItem("lastGeneratedImage", JSON.stringify(imageData));
      } else {
        setError(result.err || "Failed to generate image");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExamplePrompt = (examplePrompt) => {
    setPrompt(examplePrompt);
    setError("");
  };

  const copyImageUrl = () => {
    if (generatedImage) {
      navigator.clipboard.writeText(generatedImage.url);
      // You could add a toast notification here
      alert("Image URL copied to clipboard!");
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Common":
        return "#6b7280"; // Gray
      case "Rare":
        return "#3b82f6"; // Blue
      case "Epic":
        return "#8b5cf6"; // Purple
      case "Legendary":
        return "#f59e0b"; // Gold
      case "Special":
        return "#ef4444"; // Red
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
    <div className="ai-generator">
      <div className="generator-header">
        <h2>🎨 AI Image Generator</h2>
        <p>Create unique artwork using OpenAI's DALL-E 3</p>
      </div>

      <form onSubmit={handleGenerate} className="generator-form">
        <div className="input-group">
          <label htmlFor="prompt">Describe your image:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A magical forest with glowing mushrooms..."
            rows={3}
            maxLength={1000}
            disabled={loading}
          />
          <div className="char-count">{prompt.length}/1000 characters</div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="generate-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>✨ Generate Image</>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="example-prompts">
        <h3>💡 Try these examples:</h3>
        <div className="prompt-buttons">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExamplePrompt(example)}
              className="example-prompt-button"
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {generatedImage && (
        <div className="generated-result">
          <h3>🎉 Generated Image</h3>
          <div className="result-card">
            <div className="result-image">
              <img
                src={generatedImage.url}
                alt={generatedImage.prompt}
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+";
                }}
              />
            </div>

            <div className="result-info">
              <div className="result-prompt">
                <strong>Prompt:</strong> "{generatedImage.prompt}"
              </div>

              {/* Generated Traits Section */}
              {generatedImage.traits && generatedImage.traits.length > 0 && (
                <div className="generated-traits">
                  <h4>🏷️ AI-Generated Traits</h4>
                  <div className="traits-grid">
                    {generatedImage.traits.map((trait, index) => (
                      <div key={index} className="trait-item">
                        <div className="trait-header">
                          <span className="trait-type">{trait.trait_type}</span>
                          {trait.rarity && (
                            <span
                              className="trait-rarity"
                              style={{ color: getRarityColor(trait.rarity) }}
                            >
                              {getRarityEmoji(trait.rarity)} {trait.rarity}
                            </span>
                          )}
                        </div>
                        <div className="trait-value">{trait.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="traits-note">
                    <small>
                      💡 These traits will be automatically added when minting
                      this image as an NFT
                    </small>
                  </div>
                </div>
              )}

              <div className="result-actions">
                <button onClick={copyImageUrl} className="copy-button">
                  📋 Copy URL
                </button>
                <a
                  href={generatedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-button"
                >
                  👁️ View Full Size
                </a>
              </div>

              <div className="next-step">
                <p>
                  💡 <strong>Next:</strong> Go to the "Mint NFT" tab to turn
                  this image into an NFT with auto-generated traits!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>ℹ️ How it works</h3>
        <ul>
          <li>Enter a creative description of what you want to see</li>
          <li>AI generates a unique 1024x1024 image using DALL-E 3</li>
          <li>Generated images are high-quality and ready for NFT minting</li>
          <li>Each generation costs $0.040 (OpenAI pricing)</li>
        </ul>

        <div className="warning-box">
          <h4>⚠️ Important Note</h4>
          <p>
            Generated image URLs expire after 1-2 hours. Copy the URL and mint
            your NFT quickly, or download the image for permanent storage!
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIImageGenerator;
