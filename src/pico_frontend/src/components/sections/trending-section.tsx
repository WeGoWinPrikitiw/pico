import { Heart, MessageCircle, Share2 } from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isAI: boolean;
  likes: number;
  comments: number;
  shares: number;
}

const trendingData: TrendingItem[] = [
  {
    id: "4",
    title: "Portrait of a Sophisticated Frog",
    description:
      "Surreal classical portrait of an anthropomorphic frog with a sleek bob haircut rendered in Renaissance painting style",
    imageUrl: "/landing/trending/ai-generated3.png",
    isAI: true,
    likes: 324,
    comments: 67,
    shares: 41,
  },
  {
    id: "12",
    title: "Baby Yoda in Nature",
    description:
      "Adorable Grogu (Baby Yoda) sitting peacefully in a natural outdoor setting with soft sunlight filtering through trees",
    imageUrl: "/landing/trending/natural1.png",
    isAI: false,
    likes: 523,
    comments: 95,
    shares: 67,
  },
  {
    id: "8",
    title: "Shadow Warrior in Mist",
    description:
      "Silhouetted armored figure holding a sword in a mysterious foggy forest with dramatic lighting",
    imageUrl: "/landing/trending/natural5.png",
    isAI: false,
    likes: 312,
    comments: 52,
    shares: 28,
  },
  {
    id: "2",
    title: "Feline Camping Adventure",
    description:
      "Adorable cats enjoying a camping trip with tent, campfire, and scattered camping supplies in a scenic mountain landscape",
    imageUrl: "/landing/trending/ai-generated5.png",
    isAI: true,
    likes: 267,
    comments: 45,
    shares: 32,
  },
  {
    id: "10",
    title: "Tokyo Ghoul Winter Scene",
    description:
      "Dark atmospheric artwork of Kaneki Ken from Tokyo Ghoul in a snowy urban setting with his characteristic mask and kagune",
    imageUrl: "/landing/trending/natural3.png",
    isAI: false,
    likes: 367,
    comments: 74,
    shares: 45,
  },
  {
    id: "6",
    title: "Hypnotic Eyeball",
    description:
      "Realistic rendering of a large eyeball with striking blue iris and red blood vessels against a neutral background",
    imageUrl: "/landing/trending/ai-generated1.png",
    isAI: true,
    likes: 156,
    comments: 19,
    shares: 11,
  },
  {
    id: "1",
    title: "Gothic Anime Rebel",
    description:
      "Stylized anime character with long black hair wearing a red leather jacket, spiked collar, and cross earring in a rebellious gothic punk aesthetic",
    imageUrl: "/landing/trending/ai-generated6.png",
    isAI: true,
    likes: 142,
    comments: 28,
    shares: 15,
  },
  {
    id: "11",
    title: "Energetic Anime Schoolgirl",
    description:
      "Vibrant anime character with blonde hair in school uniform striking a cheerful pose under red neon lighting",
    imageUrl: "/landing/trending/natural2.png",
    isAI: false,
    likes: 234,
    comments: 38,
    shares: 19,
  },
  {
    id: "7",
    title: "Majestic Gundam Mecha",
    description:
      "Imposing white and blue Gundam robot viewed from below against a cloudy blue sky, showcasing its detailed mechanical design",
    imageUrl: "/landing/trending/natural6.png",
    isAI: false,
    likes: 445,
    comments: 89,
    shares: 56,
  },
  {
    id: "3",
    title: "Ethereal Dark Skull",
    description:
      "Haunting metallic skull with glowing blue highlights and wisps of smoke against a black background",
    imageUrl: "/landing/trending/ai-generated4.png",
    isAI: true,
    likes: 89,
    comments: 12,
    shares: 8,
  },
  {
    id: "5",
    title: "Urban Chase Adventure",
    description:
      "Dynamic scene of a young character running from a police officer along train tracks, collecting golden coins in a Subway Surfers-style setting",
    imageUrl: "/landing/trending/ai-generated2.png",
    isAI: true,
    likes: 198,
    comments: 34,
    shares: 22,
  },
  {
    id: "9",
    title: "Chibi Itachi Figure",
    description:
      "Cute miniature figure of Itachi Uchiha from Naruto in Akatsuki robes with selective focus photography",
    imageUrl: "/landing/trending/natural4.png",
    isAI: false,
    likes: 278,
    comments: 43,
    shares: 31,
  },
];

function TrendingCard({ item }: { item: TrendingItem }) {
  return (
    <div className="bg-gray-900/60 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 min-w-[250px] max-w-[400px]">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-[250px] object-cover"
        />

        {/* AI Label Overlay */}
        <div className="absolute top-3 left-3">
          <div className="flex flex-col items-center p-2 rounded-full backdrop-blur-sm border border-white/30 bg-black/40">
            <span
              className={`text-xs font-semibold ${
                item.isAI ? "text-purple-400" : "text-green-400"
              }`}
            >
              {item.isAI ? "AI" : "HUMAN"}
            </span>
          </div>
        </div>

        {/* Action Icons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="p-1.5 bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/40 transition-colors">
            <Heart className="w-4 h-4 text-white" />
          </button>
          <button className="p-1.5 bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/40 transition-colors">
            <MessageCircle className="w-4 h-4 text-white" />
          </button>
          <button className="p-1.5 bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/40 transition-colors">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export function TrendingSection() {
  // Split data into two rows - 6 items each
  const topRowData = trendingData.slice(0, 6);
  const bottomRowData = trendingData.slice(6, 12);

  return (
    <section className="bg-[#0C031A] py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
      {/* Section Header */}
      <div className=" mx-auto px-4 sm:px-6 md:px-8 mb-12 sm:mb-16">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#E7D8FF] mb-4">
            #Trending Now
          </h2>
          <div className="w-[90%] h-0.5 bg-[#FF77FA1F] mx-auto"></div>
        </div>
      </div>

      {/* Scrolling Container - Full Width */}
      <div className="relative w-full overflow-hidden">
        {/* Left Gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0C031A] to-transparent z-10 pointer-events-none"></div>

        {/* Right Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0C031A] to-transparent z-10 pointer-events-none"></div>

        {/* Top Row - Scroll Left */}
        <div className="mb-6 lg:mb-8">
          <div
            className="flex items-start"
            style={{
              animation: "scroll-left 20s linear infinite",
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...topRowData, ...topRowData, ...topRowData].map(
              (item, index) => (
                <div
                  key={`top-${index}`}
                  className="flex-shrink-0 mr-6 lg:mr-8"
                >
                  <TrendingCard item={item} />
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom Row - Scroll Right */}
        <div>
          <div
            className="flex items-start"
            style={{
              animation: "scroll-right 20s linear infinite",
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...bottomRowData, ...bottomRowData, ...bottomRowData].map(
              (item, index) => (
                <div
                  key={`bottom-${index}`}
                  className="flex-shrink-0 mr-6 lg:mr-8"
                >
                  <TrendingCard item={item} />
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                    @keyframes scroll-left {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-33.333%);
                        }
                    }

                    @keyframes scroll-right {
                        0% {
                            transform: translateX(-33.333%);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }
                `,
        }}
      />
    </section>
  );
}
