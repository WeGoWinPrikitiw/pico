import { useState, useEffect } from "react";
import { pico_backend } from "declarations/pico_backend";
import NFTGallery from "./components/NFTGallery";
import AIImageGenerator from "./components/AIImageGenerator";
import NFTMinter from "./components/NFTMinter";
import "./index.scss";

function App() {
  const [currentTab, setCurrentTab] = useState("gallery");
  const [stats, setStats] = useState({
    total_nfts: 0,
    ai_generated: 0,
    self_made: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await pico_backend.get_stats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const tabs = [
    { id: "gallery", label: "NFT Gallery", icon: "🖼️" },
    { id: "generate", label: "AI Generate", icon: "🎨" },
    { id: "mint", label: "Mint NFT", icon: "💎" },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎨 Pico NFT</h1>
          <div className="stats">
            <span className="stat">
              <strong>{stats.total_nfts}</strong> Total NFTs
            </span>
            <span className="stat">
              <strong>{stats.ai_generated}</strong> AI Generated
            </span>
            <span className="stat">
              <strong>{stats.self_made}</strong> Hand Made
            </span>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${currentTab === tab.id ? "active" : ""}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {currentTab === "gallery" && <NFTGallery onStatsUpdate={loadStats} />}
        {currentTab === "generate" && <AIImageGenerator />}
        {currentTab === "mint" && <NFTMinter onMinted={loadStats} />}
      </main>

      <footer className="app-footer">
        <p>Built on Internet Computer • Powered by OpenAI DALL-E 3</p>
      </footer>
    </div>
  );
}

export default App;
