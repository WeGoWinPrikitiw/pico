import { useState } from "react";
import { useAuth, useServices } from "@/context/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKey } from "@/lib/query-client";
import { toast } from "sonner";
import {
  Button,
  Input,
  LoadingSpinner,
  Card,
  CardHeader,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  Wallet,
  CreditCard,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  LogOut,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";

export function OperationalDashboard() {
  const auth = useAuth();
  const { isAuthenticated, principal, isLoading: authIsLoading, error: authError, login, logout, userBalance, copyPrincipalToClipboard } = auth;
  
  // Get services when authenticated
  const services = isAuthenticated ? useServices() : null;
  const queryClient = useQueryClient();

  // Form inputs
  const [mintAmount, setMintAmount] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");
  const [nftBuyer, setNftBuyer] = useState("");
  const [nftSeller, setNftSeller] = useState("");
  const [nftId, setNftId] = useState("");
  const [nftPrice, setNftPrice] = useState("");
  const [selfTopUpAmount, setSelfTopUpAmount] = useState("");
  const [checkBalancePrincipal, setCheckBalancePrincipal] = useState("");

  // React Query for token info
  const {
    data: tokenInfo,
  } = useQuery({
    queryKey: createQueryKey.tokenInfo(),
    queryFn: async () => {
      if (!services) throw new Error("Services not available");
      return await services.operationalService.getTokenInfo();
    },
    enabled: !!services,
    staleTime: 1000 * 60 * 5,
  });

  // React Query for transactions
  const {
    data: transactions = [],
  } = useQuery({
    queryKey: createQueryKey.userTransactions(principal || ""),
    queryFn: async () => {
      if (!services || !principal) throw new Error("Services or principal not available");
      return await services.operationalService.getUserTransactions(principal);
    },
    enabled: !!services && !!principal,
    staleTime: 1000 * 30,
  });

  // Mutations
  const mintTokensMutation = useMutation({
    mutationFn: async ({ amount, recipient }: { amount: string; recipient: string }) => {
      if (!services) throw new Error("Services not available");
      return await services.operationalService.mintToUser(recipient, Number(amount));
    },
    onSuccess: (data) => {
      toast.success(`Tokens minted successfully! Transaction ID: ${data.transactionId}`);
      queryClient.invalidateQueries({ queryKey: createQueryKey.balance(principal || "") });
      queryClient.invalidateQueries({ queryKey: createQueryKey.userTransactions(principal || "") });
    },
    onError: (error) => {
      toast.error(`Failed to mint tokens: ${error.message}`);
    },
  });

  const selfTopUpMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!services || !principal) throw new Error("Services or principal not available");
      return await services.operationalService.topUp(principal, Number(amount));
    },
    onSuccess: (data) => {
      toast.success(`Top-up successful! Transaction ID: ${data.transactionId}`);
      queryClient.invalidateQueries({ queryKey: createQueryKey.balance(principal || "") });
      queryClient.invalidateQueries({ queryKey: createQueryKey.userTransactions(principal || "") });
    },
    onError: (error) => {
      toast.error(`Failed to top up: ${error.message}`);
    },
  });

  const buyNFTMutation = useMutation({
    mutationFn: async ({ buyer, seller, nftId, price }: { buyer: string; seller: string; nftId: string; price: string }) => {
      if (!services) throw new Error("Services not available");
      return await services.operationalService.buyNFT(buyer, seller, Number(nftId), Number(price));
    },
    onSuccess: (data) => {
      toast.success(`NFT purchased successfully! Transaction ID: ${data.transactionId}`);
      queryClient.invalidateQueries({ queryKey: createQueryKey.balance(principal || "") });
      queryClient.invalidateQueries({ queryKey: createQueryKey.userTransactions(principal || "") });
    },
    onError: (error) => {
      toast.error(`Failed to buy NFT: ${error.message}`);
    },
  });

  const checkBalanceMutation = useMutation({
    mutationFn: async (principalId: string) => {
      if (!services) throw new Error("Services not available");
      return await services.operationalService.getUserBalance(principalId);
    },
    onSuccess: (balance) => {
      toast.success(`Balance: ${balance} PiCO`);
    },
    onError: (error) => {
      toast.error(`Failed to check balance: ${error.message}`);
    },
  });

  // Handlers
  const handleMintTokens = async () => {
    if (!mintAmount || !mintRecipient) {
      toast.error("Please enter both amount and recipient");
      return;
    }
    mintTokensMutation.mutate({ amount: mintAmount, recipient: mintRecipient });
    setMintAmount("");
    setMintRecipient("");
  };

  const handleSelfTopUp = async () => {
    if (!selfTopUpAmount) {
      toast.error("Please enter top-up amount");
      return;
    }
    selfTopUpMutation.mutate(selfTopUpAmount);
    setSelfTopUpAmount("");
  };

  const handleBuyNFT = async () => {
    if (!nftBuyer || !nftSeller || !nftId || !nftPrice) {
      toast.error("Please fill all NFT purchase fields");
      return;
    }
    buyNFTMutation.mutate({ buyer: nftBuyer, seller: nftSeller, nftId, price: nftPrice });
    setNftBuyer("");
    setNftSeller("");
    setNftId("");
    setNftPrice("");
  };

  const handleCheckBalance = async () => {
    if (!checkBalancePrincipal) {
      toast.error("Please enter principal ID");
      return;
    }
    checkBalanceMutation.mutate(checkBalancePrincipal);
    setCheckBalancePrincipal("");
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: createQueryKey.balance(principal || "") });
    queryClient.invalidateQueries({ queryKey: createQueryKey.userTransactions(principal || "") });
    queryClient.invalidateQueries({ queryKey: createQueryKey.tokenInfo() });
  };

  const stats = [
    {
      title: "Your Balance",
      value: `${userBalance || 0} PiCO`,
      icon: Wallet,
      description: "Current token balance",
    },
    {
      title: "Token Info",
      value: tokenInfo ? `${tokenInfo.name} (${tokenInfo.symbol})` : "Loading...",
      icon: TrendingUp,
      description: "Token information",
    },
    {
      title: "Transactions",
      value: transactions.length.toString(),
      icon: Activity,
      description: "Your transaction count",
    },
    {
      title: "Network Status",
      value: "Online",
      icon: CheckCircle2,
      description: "Blockchain network status",
    },
  ];

  const recentTransactions = (transactions || []).slice(0, 5);

  // Combined loading state from all async operations
  const isLoading = authIsLoading || mintTokensMutation.isPending || selfTopUpMutation.isPending || 
    buyNFTMutation.isPending || checkBalanceMutation.isPending;

  // Error display helper
  const getErrorMessage = () => {
    return authError?.message || mintTokensMutation.error?.message || selfTopUpMutation.error?.message ||
      buyNFTMutation.error?.message || checkBalanceMutation.error?.message || null;
  };

  const currentError = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="h-12 w-12 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  PiCO Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your gateway to decentralized token operations
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Secure Internet Identity authentication</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Direct blockchain integration</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Real-time token operations</span>
                  </div>
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect with Internet Identity
                    </>
                  )}
                </Button>

                {currentError && (
                  <div className="p-4 border rounded-lg bg-destructive/10 border-destructive/20 text-destructive">
                    <p className="text-sm">{currentError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <Card className="mb-8 border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-tr from-primary to-primary/80 rounded-xl flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        PiCO Dashboard
                      </h1>
                      <p className="text-muted-foreground">
                        Manage your tokens and transactions
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={isLoading}
                  variant="outline"
                  className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  Logout
                </Button>
              </div>

              {/* User Info Cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">
                          Principal ID
                        </h3>
                        <p className="text-sm font-mono text-blue-700 dark:text-blue-300 truncate">
                          {principal}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyPrincipalToClipboard}
                        className="border-blue-200 hover:bg-blue-100"
                      >
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-900 dark:text-green-100">
                          PiCO Balance
                        </h3>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {userBalance || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Refresh Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleRefreshData}
                  variant="outline"
                  className="shadow-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold mt-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Operations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Token Minting */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Token Minting
                </h3>
                <p className="text-muted-foreground">
                  Administrative function to mint new tokens
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Amount to Mint
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Recipient Principal ID
                    </label>
                    <Input
                      placeholder="Enter recipient's principal ID"
                      value={mintRecipient}
                      onChange={(e) => setMintRecipient(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleMintTokens}
                  disabled={mintTokensMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg"
                >
                  {mintTokensMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <DollarSign className="h-4 w-4 mr-2" />
                  )}
                  Mint Tokens
                </Button>
              </CardContent>
            </Card>

            {/* Self Top-Up */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Self Top-Up
                </h3>
                <p className="text-muted-foreground">
                  Add tokens to your own account
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Top-Up Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount to add"
                    value={selfTopUpAmount}
                    onChange={(e) => setSelfTopUpAmount(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <Button
                  onClick={handleSelfTopUp}
                  disabled={selfTopUpMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg"
                >
                  {selfTopUpMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Wallet className="h-4 w-4 mr-2" />
                  )}
                  Top Up Account
                </Button>
              </CardContent>
            </Card>

            {/* Balance Check */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Balance Check
                </h3>
                <p className="text-muted-foreground">
                  Check the token balance of any principal
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Principal ID</label>
                  <Input
                    placeholder="Enter principal ID to check"
                    value={checkBalancePrincipal}
                    onChange={(e) => setCheckBalancePrincipal(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <Button
                  onClick={handleCheckBalance}
                  disabled={checkBalanceMutation.isPending}
                  variant="outline"
                  className="w-full h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground"
                >
                  {checkBalanceMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  Check Balance
                </Button>
              </CardContent>
            </Card>

            {/* NFT Purchase */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  NFT Purchase
                </h3>
                <p className="text-muted-foreground">
                  Execute NFT transactions on the marketplace
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Buyer Principal ID
                    </label>
                    <Input
                      placeholder="Enter buyer's principal ID"
                      value={nftBuyer}
                      onChange={(e) => setNftBuyer(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Seller Principal ID
                    </label>
                    <Input
                      placeholder="Enter seller's principal ID"
                      value={nftSeller}
                      onChange={(e) => setNftSeller(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">NFT ID</label>
                    <Input
                      type="number"
                      placeholder="Enter NFT ID"
                      value={nftId}
                      onChange={(e) => setNftId(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Price (PiCO)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter price in PiCO"
                      value={nftPrice}
                      onChange={(e) => setNftPrice(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBuyNFT}
                  disabled={buyNFTMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                >
                  {buyNFTMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Purchase NFT
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Transactions
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Token Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          Number(tx.created_at) / 1000000,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {Number(tx.price_token) / 100000000} PiCO
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Transfer
                    </Badge>
                  </div>
                </div>
              ))}

              {recentTransactions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    No transactions yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your transaction history will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}