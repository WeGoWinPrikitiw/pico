import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { ArrowRight, Code, Zap, Shield, Sparkles, Globe, Users } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img src="/logo2.svg" alt="DFINITY logo" className="mx-auto mb-6 h-16 w-auto" />
          </div>
          
          {/* Main Heading */}
          <h1 className="font-lexend text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pico Greeter
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="font-montserrat text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of decentralized applications built on the 
            <span className="font-semibold text-blue-600"> Internet Computer</span> with DFINITY's Pico SDK
          </p>
          
          {/* CTA Button */}
          <div className="mb-12">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-montserrat font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <Link to="/app" className="inline-flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-lexend text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="font-montserrat text-gray-600">Built on the Internet Computer for unprecedented speed and efficiency</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-white/20">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-lexend text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="font-montserrat text-gray-600">Blockchain-powered security with enterprise-grade reliability</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-white/20">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-lexend text-xl font-semibold text-gray-900 mb-2">Developer Friendly</h3>
            <p className="font-montserrat text-gray-600">Simple, intuitive APIs powered by DFINITY's Pico SDK</p>
          </div>
        </div>
      </div>
      
      {/* Secondary Section */}
      <div className="bg-white/30 backdrop-blur-sm py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-lexend text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Built for the Decentralized Future
          </h2>
          <p className="font-montserrat text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of developers building the next generation of web applications 
            on the Internet Computer protocol.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-lexend text-lg font-semibold text-gray-900 mb-2">Global Network</h3>
              <p className="font-montserrat text-gray-600 text-sm">Distributed across data centers worldwide</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-lexend text-lg font-semibold text-gray-900 mb-2">Innovative Technology</h3>
              <p className="font-montserrat text-gray-600 text-sm">Cutting-edge blockchain innovation</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-lexend text-lg font-semibold text-gray-900 mb-2">Growing Community</h3>
              <p className="font-montserrat text-gray-600 text-sm">Join developers building the future</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 