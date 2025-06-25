import { useState, useEffect } from "react";
import { pico_backend } from "declarations/pico_backend";

function NFTGallery({ onStatsUpdate }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [traitFilter, setTraitFilter] = useState({
    traitType: "",
    traitValue: "",
  });
  const [availableTraits, setAvailableTraits] = useState({});
  const [expandedCards, setExpandedCards] = useState(new Set());

  useEffect(() => {
    loadNFTs();
    loadAvailableTraits();
  }, []);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const result = await pico_backend.list_all_nfts();
      setNfts(result);
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      console.error("Failed to load NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTraits = async () => {
    try {
      const traitTypes = await pico_backend.get_all_trait_types();
      const traitsMap = {};

      for (const traitType of traitTypes) {
        const traitValues = await pico_backend.get_trait_values(traitType);
        traitsMap[traitType] = traitValues;
      }

      setAvailableTraits(traitsMap);
    } catch (error) {
      console.error("Failed to load available traits:", error);
    }
  };

  const filterNFTsByTraits = async () => {
    if (!traitFilter.traitType || !traitFilter.traitValue) {
      return nfts;
    }

    try {
      const result = await pico_backend.get_nfts_by_trait(
        traitFilter.traitType,
        traitFilter.traitValue
      );
      return result;
    } catch (error) {
      console.error("Failed to filter by traits:", error);
      return nfts;
    }
  };

  const filteredNFTs = nfts.filter((nft) => {
    // First apply type filter
    if (filter === "ai" && !nft.is_ai_generated) return false;
    if (filter === "manual" && nft.is_ai_generated) return false;

    // Then apply trait filter if set
    if (traitFilter.traitType && traitFilter.traitValue) {
      return (
        nft.traits &&
        nft.traits.some(
          (trait) =>
            trait.trait_type === traitFilter.traitType &&
            trait.value === traitFilter.traitValue
        )
      );
    }

    return true;
  });

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString();
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

  const toggleCardExpansion = (nftId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(nftId)) {
      newExpanded.delete(nftId);
    } else {
      newExpanded.add(nftId);
    }
    setExpandedCards(newExpanded);
  };

  const clearTraitFilter = () => {
    setTraitFilter({ traitType: "", traitValue: "" });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading NFTs...</p>
      </div>
    );
  }

  return (
    <div className="nft-gallery">
      <div className="gallery-header">
        <h2>NFT Collection</h2>

        {/* Type Filter */}
        <div className="filter-section">
          <div className="filter-group">
            <label>Filter by Type:</label>
            <div className="filter-buttons">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All ({nfts.length})
              </button>
              <button
                className={filter === "ai" ? "active" : ""}
                onClick={() => setFilter("ai")}
              >
                AI Generated ({nfts.filter((n) => n.is_ai_generated).length})
              </button>
              <button
                className={filter === "manual" ? "active" : ""}
                onClick={() => setFilter("manual")}
              >
                Hand Made ({nfts.filter((n) => !n.is_ai_generated).length})
              </button>
            </div>
          </div>

          {/* Trait Filter */}
          {Object.keys(availableTraits).length > 0 && (
            <div className="filter-group">
              <label>Filter by Traits:</label>
              <div className="trait-filters">
                <select
                  value={traitFilter.traitType}
                  onChange={(e) =>
                    setTraitFilter((prev) => ({
                      ...prev,
                      traitType: e.target.value,
                      traitValue: "",
                    }))
                  }
                >
                  <option value="">Select Trait Type</option>
                  {Object.keys(availableTraits).map((traitType) => (
                    <option key={traitType} value={traitType}>
                      {traitType}
                    </option>
                  ))}
                </select>

                {traitFilter.traitType && (
                  <select
                    value={traitFilter.traitValue}
                    onChange={(e) =>
                      setTraitFilter((prev) => ({
                        ...prev,
                        traitValue: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Trait Value</option>
                    {availableTraits[traitFilter.traitType]?.map(
                      (traitValue) => (
                        <option key={traitValue} value={traitValue}>
                          {traitValue}
                        </option>
                      )
                    )}
                  </select>
                )}

                {(traitFilter.traitType || traitFilter.traitValue) && (
                  <button
                    onClick={clearTraitFilter}
                    className="clear-filter-button"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredNFTs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🖼️</div>
          <h3>No NFTs found</h3>
          <p>
            {traitFilter.traitType
              ? "No NFTs found with the selected traits. Try different filters!"
              : "Start by generating an AI image or minting your first NFT!"}
          </p>
        </div>
      ) : (
        <div className="nft-grid">
          {filteredNFTs.map((nft) => (
            <div key={nft.nft_id} className="nft-card">
              <div className="nft-image-container">
                <img
                  src={nft.image_url}
                  alt={nft.name}
                  className="nft-image"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=";
                  }}
                />
                <div className="nft-type-badge">
                  {nft.is_ai_generated ? "🤖 AI" : "✋ Manual"}
                </div>
              </div>

              <div className="nft-info">
                <h3 className="nft-title">{nft.name}</h3>
                <p className="nft-description">{nft.description}</p>

                {/* Traits Preview */}
                {nft.traits && nft.traits.length > 0 && (
                  <div className="traits-preview">
                    <div className="traits-header">
                      <span className="traits-label">
                        🏷️ Traits ({nft.traits.length})
                      </span>
                      <button
                        onClick={() => toggleCardExpansion(nft.nft_id)}
                        className="expand-button"
                      >
                        {expandedCards.has(nft.nft_id) ? "▼" : "▶"}
                      </button>
                    </div>

                    {expandedCards.has(nft.nft_id) ? (
                      <div className="traits-expanded">
                        {nft.traits.map((trait, index) => (
                          <div key={index} className="trait-tag">
                            <div className="trait-content">
                              <span className="trait-type">
                                {trait.trait_type}
                              </span>
                              <span className="trait-value">{trait.value}</span>
                            </div>
                            {trait.rarity && (
                              <span
                                className="trait-rarity-badge"
                                style={{ color: getRarityColor(trait.rarity) }}
                              >
                                {getRarityEmoji(trait.rarity)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="traits-summary">
                        {nft.traits.slice(0, 2).map((trait, index) => (
                          <span key={index} className="trait-summary">
                            {trait.trait_type}: {trait.value}
                          </span>
                        ))}
                        {nft.traits.length > 2 && (
                          <span className="more-traits">
                            +{nft.traits.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="nft-details">
                  <div className="detail-row">
                    <span className="label">Token ID:</span>
                    <span className="value">#{nft.nft_id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Price:</span>
                    <span className="value">
                      {formatPrice(nft.price)} cycles
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(nft.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="gallery-actions">
        <button onClick={loadNFTs} className="refresh-button">
          🔄 Refresh Gallery
        </button>
        <button onClick={loadAvailableTraits} className="refresh-button">
          🏷️ Refresh Traits
        </button>
      </div>
    </div>
  );
}

export default NFTGallery;
