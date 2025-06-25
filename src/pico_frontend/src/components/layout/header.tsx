import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  User,
  Search,
  Upload,
  Grid3X3,
  LogOut,
  Settings,
  Wallet
} from "lucide-react";

export function Header() {
  const location = useLocation();
  const { isAuthenticated, login, logout, principal, userBalance, refreshData } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/brand/pico-logo.svg" alt="PiCO" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold text-gray-900">PiCO</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              // Authenticated Navigation
              <>
                <Link
                  to="/explore"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/explore')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Search className="h-4 w-4" />
                  Explore
                </Link>

                <Link
                  to="/posts"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/posts')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  Posts
                </Link>

                <Link
                  to="/upload"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/upload')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Link>
              </>
            ) : (
              // Non-authenticated Navigation
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  Home
                </Link>

                <a
                  href="#features"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Features
                </a>

                <a
                  href="#about"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  About
                </a>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated User Actions
              <>
                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      {userBalance} PiCO
                    </span>
                  </div>
                  <button
                    onClick={refreshData}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md"
                    title="Refresh balance"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </div>

                {/* Admin Link (for testing) */}
                <Link
                  to="/admin"
                  className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  title="Admin Dashboard"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>

                {/* Logout */}
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              // Non-authenticated Actions
              <Button
                onClick={login}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex items-center justify-around">
              <Link
                to="/explore"
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${isActive('/explore')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Search className="h-5 w-5" />
                Explore
              </Link>

              <Link
                to="/posts"
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${isActive('/posts')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Grid3X3 className="h-5 w-5" />
                Posts
              </Link>

              <Link
                to="/upload"
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${isActive('/upload')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Upload className="h-5 w-5" />
                Upload
              </Link>

              <Link
                to="/profile"
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${isActive('/profile')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 