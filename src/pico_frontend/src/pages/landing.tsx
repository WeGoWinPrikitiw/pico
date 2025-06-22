import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { ArrowRight, Code, Zap, Shield } from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Developer Friendly",
      description: "Built with modern web technologies and best practices"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast & Reliable",
      description: "Optimized performance with lightning-fast response times"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure",
      description: "Enterprise-grade security with end-to-end encryption"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="mb-8">
          <img src="/logo2.svg" alt="DFINITY logo" className="mx-auto mb-8 max-w-md h-auto" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pico
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A powerful, modern web application built on the Internet Computer. 
          Experience the future of decentralized computing.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/app" className="inline-flex items-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 