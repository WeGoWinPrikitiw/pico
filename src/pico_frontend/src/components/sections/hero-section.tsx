import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
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

  const floatingElements = [
    {
      className:
        "absolute top-1/4 left-1/6 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-fuchsia-400 rounded-full animate-ping",
      delay: "0.5s",
    },
    {
      className:
        "absolute top-2/3 right-1/4 w-2 h-2 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-lime-400 rounded-full animate-ping",
      delay: "1s",
    },
    {
      className:
        "absolute top-1/2 left-3/4 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-purple-400 rounded-full animate-ping",
      delay: "1.5s",
    },
    {
      className:
        "absolute top-3/4 left-1/3 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-cyan-400 rounded-full animate-ping",
      delay: "2s",
    },
  ];

  return (
    <div className="relative bg-[#0C031A] overflow-hidden">
      {/* Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 z-20">
        <img
          src="/brand/pico-logo.svg"
          alt="PICO"
          className="h-6 w-auto sm:h-8 md:h-10 lg:h-12 xl:h-14"
        />
      </div>

      {/* Hero Section - Image and Text */}
      <div className="relative flex flex-col items-center justify-start pt-16 sm:pt-20 md:pt-24 lg:pt-28 xl:pt-32 px-4 sm:px-6 md:px-8">
        {/* Hero Image Background */}
        <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl">
          <img
            src="/landing/landing-hero.png"
            alt="PICO Hero"
            className="w-full h-auto object-contain opacity-90"
          />

          {/* Hero Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="font-lexend text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-[#E7D8FF] font-bold leading-none tracking-tight text-center">
              <span className="block sm:inline">Collect art that</span>
              <br className="hidden sm:block" />
              <span className="block sm:inline"> speaks to you!</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto text-center px-4 sm:px-6 md:px-8 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
        {/* Description */}
        <p className="text-sm text-balance sm:text-base md:text-lg lg:text-xl xl:text-2xl text-[#E7D8FFA8] max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl leading-relaxed px-2 sm:px-0">
          The ultimate art marketplace where creativity meets the blockchain.
          Mint your artwork as NFTs, showcase it, and connect with collectors{" "}
          <span className="font-black">who truly get it.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button
            onClick={handleGetStarted}
            className="flex text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl w-auto h-auto px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 justify-center items-center gap-2 rounded-full border border-white/37 bg-[rgba(255,158,251,0.23)] text-white hover:bg-[rgba(255,158,251,0.35)] transition-all duration-300 hover:scale-105 backdrop-blur-sm min-w-max disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <>
              <span className="hidden sm:inline">
                {isAuthenticated ? "Enter App" : "Start Creating for Free"}
              </span>
              <span className="sm:hidden">
                {isAuthenticated ? "Enter App" : "Get Started"}
              </span>
            </>
          </Button>
        </div>
        {!isAuthenticated && (
          <p className="text-xs sm:text-sm text-[#E7D8FFA8] opacity-75">
            No wallet? No problem! Connect and start exploring instantly.
          </p>
        )}
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {mounted && (
          <>
            {floatingElements.map((element, index) => (
              <div
                key={index}
                className={element.className}
                style={{
                  animationDelay: element.delay,
                  animationDuration: "3s",
                }}
              />
            ))}

            {/* Additional responsive floating elements for larger screens */}
            <div className="hidden md:block">
              <div
                className="absolute top-1/6 right-1/6 w-2 h-2 lg:w-3 lg:h-3 xl:w-4 xl:h-4 bg-yellow-400 rounded-full animate-ping"
                style={{ animationDelay: "2.5s", animationDuration: "4s" }}
              />
              <div
                className="absolute bottom-1/4 left-1/5 w-2 h-2 lg:w-3 lg:h-3 xl:w-4 xl:h-4 bg-blue-400 rounded-full animate-ping"
                style={{ animationDelay: "3s", animationDuration: "3.5s" }}
              />
            </div>

            {/* Extra floating elements for very large screens */}
            <div className="hidden xl:block">
              <div
                className="absolute top-1/3 right-1/3 w-3 h-3 2xl:w-4 2xl:h-4 bg-pink-400 rounded-full animate-ping"
                style={{ animationDelay: "4s", animationDuration: "3s" }}
              />
              <div
                className="absolute bottom-1/3 right-1/5 w-2 h-2 2xl:w-3 2xl:h-3 bg-green-400 rounded-full animate-ping"
                style={{ animationDelay: "4.5s", animationDuration: "3.5s" }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
