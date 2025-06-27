import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

interface BenefitCard {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  backgroundColor: string;
  textColor?: string;
}

const benefitsData: BenefitCard[] = [
  {
    id: "1",
    title: "Create, Mint, Own.",
    description:
      "Turn your creativity into verifiable digital assets. Whether it's AI-generated or hand-crafted, mint your art as NFTs — easily, securely, and transparently.",
    iconUrl: "/landing/create-mint-own.png.svg",
    backgroundColor: "bg-purple-500",
    textColor: "text-white",
  },
  {
    id: "2",
    title: "A social home for digital Art",
    description:
      "Connect with a vibrant community of artists and collectors. Share your work, receive feedback, and build meaningful relationships in a space designed for digital art enthusiasts.",
    iconUrl: "/landing/social-rewards-heart-like-circle.svg",
    backgroundColor: "bg-pink-500",
    textColor: "text-white",
  },
  {
    id: "3",
    title: "Verified Identity, True Ownership",
    description:
      "Experience the security of blockchain-backed ownership with easy-to-use identity verification. Your creations are permanently linked to you, ensuring authentic provenance and protecting your artistic legacy.",
    iconUrl: "/landing/social-rewards-certified-ribbon.svg",
    backgroundColor: "bg-lime-400",
    textColor: "text-black",
  },
];

function BenefitCard({ benefit }: { benefit: BenefitCard }) {
  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 h-full flex flex-col min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px] transform hover:scale-105 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm border border-white/20 overflow-hidden group`}
    >
      {/* Glass background with color tint */}
      <div
        className={`absolute inset-0 ${benefit.backgroundColor} opacity-80 rounded-3xl`}
      ></div>

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-3xl"></div>

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon Container */}
        <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 flex items-center justify-center">
            <img
              src={benefit.iconUrl}
              alt={benefit.title}
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold ${
            benefit.textColor || "text-white"
          } mb-4 sm:mb-6 md:mb-8 leading-tight font-lexend drop-shadow-lg text-center`}
        >
          {benefit.title}
        </h3>

        {/* Description - centered in remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <p
            className={`text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ${
              benefit.textColor || "text-white"
            } opacity-90 leading-relaxed text-center drop-shadow-md`}
          >
            {benefit.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BenefitsSection() {
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      // Already authenticated, go to explore
      navigate("/explore");
    } else {
      // Start authentication process
      try {
        await login();
        // After successful login, navigate to explore
        if (isAuthenticated) {
          navigate("/explore");
        }
      } catch (error) {
        // Error is handled by useAsync in the auth context
        console.error("Login failed:", error);
      }
    }
  };

  return (
    <section className="bg-[#0C031A] py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 relative overflow-hidden">
      {/* Floating Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {mounted && (
          <>
            <div
              className="absolute top-1/4 left-1/6 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-lime-400 rounded-full animate-ping"
              style={{ animationDelay: "0.5s", animationDuration: "3s" }}
            />
            <div
              className="absolute top-2/3 right-1/4 w-2 h-2 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-pink-400 rounded-full animate-ping"
              style={{ animationDelay: "1s", animationDuration: "4s" }}
            />
            <div
              className="absolute top-1/2 left-3/4 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-purple-400 rounded-full animate-ping"
              style={{ animationDelay: "1.5s", animationDuration: "3.5s" }}
            />
          </>
        )}
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <div className="relative inline-block">
            {/* Glowing text effect */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center mb-6 sm:mb-8 md:mb-10 font-lexend">
              <span className="text-white">Why </span>
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-pulse">
                  PiCO
                </span>
                {/* Glow effect */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 blur-sm opacity-50">
                    PiCO
                  </span>
                </div>
              </span>
            </h2>

            {/* Decorative star/flower element */}
            <div className="absolute -top-4 sm:-top-6 md:-top-8 lg:-top-10 right-0 sm:right-4 md:right-8 lg:right-12">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-purple-400 animate-spin-slow">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                  <path
                    d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
          {benefitsData.map((benefit) => (
            <div key={benefit.id} className="h-full">
              <BenefitCard benefit={benefit} />
            </div>
          ))}
        </div>

        {/* Bottom Section with ICP Powered */}
        <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 xl:mt-32 text-center">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
            {/* Decorative elements */}
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-lime-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-pink-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>

            {/* ICP Logo */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                <img
                  src="/landing/icp-logo.svg"
                  alt="Internet Computer Protocol"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 font-lexend">
                  Powered by{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    ICP
                  </span>
                </h3>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-[#E7D8FFA8] leading-relaxed">
                  Built on the Internet Computer Protocol
                </p>
              </div>
            </div>

            {/* More decorative elements */}
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-cyan-400 rounded-full animate-pulse"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* From Pixel to Priceless Section */}
        <div className="mt-20 sm:mt-24 md:mt-28 lg:mt-32 xl:mt-40 text-center relative">
          {/* Background glowing elements */}
          <div className="relative flex flex-col items-center">
            {/* Central glow box with floating elements */}
            <div className="relative mb-8 sm:mb-12 md:mb-16 lg:mb-20">
              {/* Main glow box */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 mx-auto relative">
                <img
                  src="/landing/pico-glow-box.svg"
                  alt="Glowing star"
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>

              {/* Floating elements around the glow box */}
              {mounted && (
                <>
                  {/* Pink square - top left */}
                  <div
                    className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 md:-top-8 md:-left-8 lg:-top-10 lg:-left-10 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-pink-500 rounded-sm animate-bounce shadow-lg shadow-pink-500/50"
                    style={{ animationDelay: "0s", animationDuration: "2s" }}
                  />

                  {/* Lime green square - bottom right */}
                  <div
                    className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 md:-bottom-8 md:-right-8 lg:-bottom-10 lg:-right-10 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-lime-400 rounded-sm animate-bounce shadow-lg shadow-lime-400/50"
                    style={{ animationDelay: "1s", animationDuration: "2.5s" }}
                  />
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-lexend leading-tight">
              From{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Pixel
              </span>{" "}
              to Priceless.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#E7D8FFA8] mb-8 sm:mb-10 md:mb-12 lg:mb-16 max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl leading-relaxed px-4">
              Transform your digital art into NFTs and connect with collectors
              who see the value in every pixel.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 lg:px-16 lg:py-7 xl:px-20 xl:py-8 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-white bg-gradient-to-r from-purple-600/80 to-pink-600/80 rounded-full backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/60 to-pink-600/60 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Button text */}
              <span className="relative z-10">
                {isAuthenticated ? "Enter App" : "Explore Now for Free"}
              </span>

              {/* Subtle animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
