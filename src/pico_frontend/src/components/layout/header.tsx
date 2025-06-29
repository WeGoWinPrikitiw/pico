import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Button,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { useAuth } from "@/context/auth-context";
import {
  User,
  Search,
  Upload, LogOut,
  Settings,
  Wallet,
  Menu,
  Home,
  Info,
  Star,
  MessageSquare,
  PlusIcon,
  X,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isAuthenticated,
    login,
    logout,
    principal,
    userBalance,
    refreshBalance,
  } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({
    to,
    icon: Icon,
    children,
    onClick,
  }: {
    to: string;
    icon: React.ElementType;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        isActive(to)
          ? "text-primary bg-primary/10 border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{children}</span>
      <ChevronRight className="h-4 w-4 opacity-30" />
    </Link>
  );

  const MobileNavLink = ({
    to,
    icon: Icon,
    children,
    onClick,
  }: {
    to: string;
    icon: React.ElementType;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      onClick={() => {
        onClick?.();
        setIsMobileMenuOpen(false);
      }}
      className={cn(
        "flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 group",
        isActive(to)
          ? "text-primary bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm"
          : "text-foreground hover:text-primary hover:bg-accent/70 active:bg-accent",
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        isActive(to)
          ? "bg-primary/20 text-primary"
          : "bg-muted group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 font-medium">{children}</span>
      {isActive(to) && (
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/brand/pico-logo.svg" alt="PiCO" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {isAuthenticated ? (
              <>
                <NavigationMenuItem>
                  <NavLink to="/explore" icon={Search}>
                    Explore
                  </NavLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavLink to="/upload" icon={Upload}>
                    Upload
                  </NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="/forums" icon={MessageSquare}>
                    Forums
                  </NavLink>
                </NavigationMenuItem>
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <NavLink to="/" icon={Home}>
                    Home
                  </NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="#features" icon={Star}>
                    Features
                  </NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="#about" icon={Info}>
                    About
                  </NavLink>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Balance Display with Top Up Popover */}
              <Popover open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="hidden sm:flex items-center gap-2 px-3 py-1 border border-input bg-background rounded-full cursor-pointer hover:bg-accent transition-colors text-sm"
                    onClick={() => setIsTopUpOpen(!isTopUpOpen)}
                  >
                    <img src="/brand/pico-glow.png" className="size-8" alt="PiCO" />
                    <span>{userBalance !== undefined ? (userBalance / 100000000).toFixed(2) : "0.00"}</span>
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 gap-2 rounded-lg p-6 text-white">
                    <div className="text-center mb-6">
                      <h3 className="text-sm font-medium text-purple-200 mb-2">Top Up Pop out</h3>

                      {/* Balance Display */}
                      <div className="relative mx-auto w-full">
                        <div className="bg-black/20 backdrop-blur-sm border border-purple-400/30 rounded-full w-full px-6 py-2 flex items-center gap-4">
                          <img src="/brand/pico-glow.png" className="size-16 relative z-10" alt="PiCO" />

                          <div className="text-left">
                            <div className="text-4xl font-bold text-white">{userBalance !== undefined ? (userBalance / 100000000).toFixed(2) : "0.00"}</div>
                            <div className="text-lg font-medium text-purple-200">Pico Coins</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-white">Top Up</h4>
                    </div>

                    {/* Top Up Options */}
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-[#CE0AFF] hover:bg-[#CE0AFF]/30 text-white font-medium py-3 rounded-full border-0"
                        size="lg"
                      >
                        P2P
                      </Button>

                      <Button
                        className="w-full bg-[#CE0AFF] hover:bg-[#CE0AFF]/30 text-white font-medium py-3 rounded-full border-0"
                        size="lg"
                      >
                        Bank
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Profile Menu */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer hover:opacity-80 rounded-full">
                    <Avatar>
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${principal}.png`}
                        alt={principal}
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${principal}.png`}
                          alt={principal}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Profile</span>
                        <span
                          className="text-xs text-muted-foreground max-w-[150px] truncate"
                          title={principal}
                        >
                          {principal && principal.length > 20
                            ? `${principal.slice(0, 10)}...${principal.slice(-10)}`
                            : principal}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent"
                    >
                      <Settings className="h-4 w-4" />
                      Admin Settings
                    </Link>
                    <Button
                      onClick={() => logout()}
                      variant="outline"
                      size="sm"
                      className="w-full mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button onClick={() => login()} variant="default">
              Connect Wallet
            </Button>
          )}

          {/* Enhanced Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent/50">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0">
              {/* Custom Header */}
              <div className="flex items-center gap-3 p-6 border-b bg-gradient-to-r from-background to-accent/10">
                <img src="/brand/pico-logo.svg" alt="PiCO" className="h-8 w-auto" />
                <div>
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <p className="text-sm text-muted-foreground">Navigate PiCO</p>
                </div>
              </div>

              <div className="flex flex-col h-full">
                {/* Profile Section for Authenticated Users */}
                {isAuthenticated && (
                  <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-b">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${principal}.png`}
                          alt={principal}
                        />
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">Welcome back!</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]" title={principal}>
                          {principal && principal.length > 25
                            ? `${principal.slice(0, 12)}...${principal.slice(-8)}`
                            : principal}
                        </p>
                      </div>
                    </div>

                    {/* Balance Card with Top Up Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 cursor-pointer hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/10 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src="/brand/pico-glow.png" className="size-10" alt="PiCO" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-2xl font-bold text-foreground">{userBalance !== undefined ? (userBalance / 100000000).toFixed(2) : "0.00"}</p>
                                  <PlusIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">Pico Coins • Tap to top up</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                refreshBalance();
                              }}
                              className="h-8 w-8 rounded-full hover:bg-primary/10"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="center" side="bottom">
                        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 gap-2 rounded-lg p-6 text-white">
                          <div className="text-center mb-6">
                            <h3 className="text-sm font-medium text-purple-200 mb-2">Top Up Pop out</h3>

                            {/* Balance Display */}
                            <div className="relative mx-auto w-full">
                              <div className="bg-black/20 backdrop-blur-sm border border-purple-400/30 rounded-full w-full px-6 py-2 flex items-center gap-4">
                                <img src="/brand/pico-glow.png" className="size-16 relative z-10" alt="PiCO" />

                                <div className="text-left">
                                  <div className="text-4xl font-bold text-white">{userBalance !== undefined ? (userBalance / 100000000).toFixed(2) : "0.00"}</div>
                                  <div className="text-lg font-medium text-purple-200">Pico Coins</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center mb-6">
                            <h4 className="text-lg font-semibold text-white">Top Up</h4>
                          </div>

                          {/* Top Up Options */}
                          <div className="space-y-3">
                            <Button
                              className="w-full bg-[#CE0AFF] hover:bg-[#CE0AFF]/30 text-white font-medium py-3 rounded-full border-0"
                              size="lg"
                            >
                              P2P
                            </Button>

                            <Button
                              className="w-full bg-[#CE0AFF] hover:bg-[#CE0AFF]/30 text-white font-medium py-3 rounded-full border-0"
                              size="lg"
                            >
                              Bank
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 p-6 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                          Main Navigation
                        </h4>
                        <div className="space-y-1">
                          <MobileNavLink to="/explore" icon={Search}>
                            Explore Content
                          </MobileNavLink>
                          <MobileNavLink to="/upload" icon={Upload}>
                            Upload Media
                          </MobileNavLink>
                          <MobileNavLink to="/forums" icon={MessageSquare}>
                            Community Forums
                          </MobileNavLink>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                          Account
                        </h4>
                        <div className="space-y-1">
                          <MobileNavLink to="/profile" icon={User}>
                            My Profile
                          </MobileNavLink>
                          <MobileNavLink to="/admin" icon={Settings}>
                            Admin Settings
                          </MobileNavLink>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                          Discover
                        </h4>
                        <div className="space-y-1">
                          <MobileNavLink to="/" icon={Home}>
                            Home
                          </MobileNavLink>
                          <MobileNavLink to="#features" icon={Star}>
                            Features
                          </MobileNavLink>
                          <MobileNavLink to="#about" icon={Info}>
                            About Us
                          </MobileNavLink>
                        </div>
                      </div>
                    </>
                  )}
                </nav>

                {/* Bottom Action */}
                <div className="p-6 border-t bg-gradient-to-r from-background to-accent/5">
                  {isAuthenticated ? (
                    <Button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="destructive"
                      size="lg"
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl shadow-sm"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      <span>Sign Out</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        login();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="default"
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl shadow-sm"
                    >
                      <Wallet className="h-5 w-5 mr-2" />
                      <span>Connect Wallet</span>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}