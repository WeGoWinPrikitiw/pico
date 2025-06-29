import { Button } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, X, User } from "lucide-react";

interface LoadingStateProps {
    message?: string;
    submessage?: string;
}

export function LoadingState({
    message = "Loading NFTs...",
    submessage = "Discovering amazing digital art"
}: LoadingStateProps) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <LoadingSpinner size="lg" className="mx-auto" />
                <div className="space-y-2">
                    <p className="text-lg font-medium">{message}</p>
                    <p className="text-sm text-muted-foreground">{submessage}</p>
                </div>
            </div>
        </div>
    );
}

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Failed to load NFTs",
    message = "Something went wrong while fetching the data",
    onRetry
}: ErrorStateProps) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <X className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <p className="text-base font-medium text-destructive">{title}</p>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                {onRetry && (
                    <Button onClick={onRetry} className="mt-4">
                        Try Again
                    </Button>
                )}
            </div>
        </div>
    );
}

interface EmptyStateProps {
    searchQuery?: string;
    hasActiveFilters?: boolean;
    isAuthenticated?: boolean;
    onClearFilters?: () => void;
    onLogin?: () => void;
}

export function EmptyState({
    searchQuery,
    hasActiveFilters,
    isAuthenticated,
    onClearFilters,
    onLogin
}: EmptyStateProps) {
    const hasSearch = searchQuery && searchQuery.trim() !== "";
    const showFiltersMessage = hasSearch || hasActiveFilters;

    return (
        <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {showFiltersMessage
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "No NFTs have been created yet. Be the first to mint something amazing!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {showFiltersMessage && onClearFilters && (
                    <Button onClick={onClearFilters} variant="outline">
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
                {!isAuthenticated && onLogin && (
                    <Button onClick={onLogin}>
                        <User className="mr-2 h-4 w-4" />
                        Connect Wallet to Create NFTs
                    </Button>
                )}
            </div>
        </div>
    );
} 