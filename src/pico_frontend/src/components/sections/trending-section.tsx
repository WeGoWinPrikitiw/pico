import { Heart, MessageCircle, Share2 } from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  profileImage: string;
  likes: number;
  comments: number;
  shares: number;
  width: number; // Add width property
}

const mockTrendingData: TrendingItem[] = [
  {
    id: "1",
    title: "Title",
    description:
      "Please add your content here. Keep it short and simple. And smile :)",
    imageUrl:
      "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=300&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    likes: 42,
    comments: 8,
    shares: 5,
    width: 300,
  },
  {
    id: "2",
    title: "Title",
    description:
      "Please add your content here. Keep it short and simple. And smile :)",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=350&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=40&h=40&fit=crop&crop=face",
    likes: 67,
    comments: 12,
    shares: 9,
    width: 350,
  },
  {
    id: "3",
    title: "Title",
    description:
      "Please add your content here. Keep it short and simple. And smile :)",
    imageUrl:
      "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=280&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    likes: 89,
    comments: 23,
    shares: 15,
    width: 280,
  },
  {
    id: "4",
    title: "Title",
    description:
      "Please add your content here. Keep it short and simple. And smile :)",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=320&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    likes: 34,
    comments: 6,
    shares: 3,
    width: 320,
  },
  {
    id: "5",
    title: "Title",
    description:
      "Please add your content here. Keep it short and simple. And smile :)",
    imageUrl:
      "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    likes: 156,
    comments: 34,
    shares: 28,
    width: 400,
  },
  {
    id: "6",
    title: "Title",
    description:
      "Please add your content here. Keep it short and simple. And smile :)",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=270&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    likes: 78,
    comments: 16,
    shares: 11,
    width: 270,
  },
];

function TrendingCard({ item }: { item: TrendingItem }) {
  return (
    <div
      className="bg-gray-900/60 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
      style={{ width: `${item.width}px` }}
    >
      {/* Image Container */}
      <div
        className="relative overflow-hidden"
        style={{
          width: `${item.width}px`,
          height: "250px", // Fixed height for all images
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />

        {/* Profile Picture Overlay */}
        <div className="absolute top-3 left-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 backdrop-blur-sm">
            <img
              src={item.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
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
  // Split data into two rows
  const topRowData = mockTrendingData.slice(0, 3);
  const bottomRowData = mockTrendingData.slice(3, 6);

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
