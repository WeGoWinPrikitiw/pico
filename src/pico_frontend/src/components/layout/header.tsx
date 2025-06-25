import { Link, useLocation } from "react-router-dom";
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
  AvatarFallback,
  AvatarImage,
  Separator,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { useAuth } from "@/context/auth-context";
import {
  User,
  Search,
  Upload,
  Grid3X3,
  LogOut,
  Settings,
  Wallet,
  Menu,
  Home,
  Info,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const { isAuthenticated, login, logout, principal, userBalance, refreshData } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive(to)
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
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
                  <NavLink to="/explore" icon={Search}>Explore</NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="/posts" icon={Grid3X3}>Posts</NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="/upload" icon={Upload}>Upload</NavLink>
                </NavigationMenuItem>
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <NavLink to="/" icon={Home}>Home</NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="#features" icon={Star}>Features</NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="#about" icon={Info}>About</NavLink>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Balance Display */}
              <Badge variant="secondary" className="hidden sm:flex items-center gap-2 px-3 py-1">
                <Wallet className="h-4 w-4" />
                <span>{userBalance} PiCO</span>
              </Badge>

              {/* Profile Menu */}
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer hover:opacity-80">
                    <AvatarImage src={`https://avatar.vercel.sh/${principal}.png`} alt={principal} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${principal}.png`} alt={principal} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Profile</span>
                        <span className="text-xs text-muted-foreground max-w-[150px] truncate" title={principal}>
                          {principal?.length > 20 ? `${principal.slice(0, 10)}...${principal.slice(-10)}` : principal}
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
                      onClick={logout}
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
            <Button onClick={login} variant="default">
              Connect Wallet
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <NavLink to="/explore" icon={Search}>Explore</NavLink>
                    <NavLink to="/posts" icon={Grid3X3}>Posts</NavLink>
                    <NavLink to="/upload" icon={Upload}>Upload</NavLink>
                    <NavLink to="/profile" icon={User}>Profile</NavLink>
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
                      <Wallet className="h-4 w-4" />
                      <span>{userBalance} PiCO</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshData}
                        className="h-6 w-6"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </Badge>
                    <Button
                      onClick={logout}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <NavLink to="/" icon={Home}>Home</NavLink>
                    <NavLink to="#features" icon={Star}>Features</NavLink>
                    <NavLink to="#about" icon={Info}>About</NavLink>
                    <Button onClick={login} variant="default" className="mt-2">
                      Connect Wallet
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
} 