import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Button,
  Input,
  LoadingSpinner,
  Card,
  CardHeader,
  CardContent,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
} from "@/components/ui";
import {
  Wallet,
  CreditCard,
  ShoppingCart,
  History,
  Code,
  Copy,
  DollarSign,
  RefreshCw,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export function OperationalDashboard() {
  const {
    isAuthenticated,
    principal,
    loading,
    message,
    setMessage,
    tokenInfo,
    userBalance,
    transactions,
    login,
    logout,
    refreshData,
    mintTokens,
    approveContract,
    buyNFT,
    checkBalance,
    selfTopUp,
    copyPrincipalToClipboard,
    validatePrincipal,
  } = useAuth();

  // Form inputs
  const [mintAmount, setMintAmount] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [nftBuyer, setNftBuyer] = useState("");
  const [nftSeller, setNftSeller] = useState("");
  const [nftId, setNftId] = useState("");
  const [nftPrice, setNftPrice] = useState("");
  const [selfTopUpAmount, setSelfTopUpAmount] = useState("");
  const [checkBalancePrincipal, setCheckBalancePrincipal] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const handleMintTokens = async () => {
    if (!mintAmount || !mintRecipient) {
      setMessage("❌ Please enter both amount and recipient");
      return;
    }
    await mintTokens(mintAmount, mintRecipient);
    setMintAmount("");
    setMintRecipient("");
  };

  const handleApproveContract = async () => {
    if (!approveAmount) {
      setMessage("❌ Please enter approval amount");
      return;
    }
    await approveContract(approveAmount);
    setApproveAmount("");
  };

  const handleBuyNFT = async () => {
    if (!nftBuyer || !nftSeller || !nftId || !nftPrice) {
      setMessage("❌ Please fill all NFT purchase fields");
      return;
    }
    await buyNFT(nftBuyer, nftSeller, nftId, nftPrice);
    setNftBuyer("");
    setNftSeller("");
    setNftId("");
    setNftPrice("");
  };

  const handleSelfTopUp = async () => {
    if (!selfTopUpAmount) {
      setMessage("❌ Please enter top-up amount");
      return;
    }
    await selfTopUp(selfTopUpAmount);
    setSelfTopUpAmount("");
  };

  const handleCheckBalance = async () => {
    if (!checkBalancePrincipal) {
      setMessage("❌ Please enter principal ID");
      return;
    }
    await checkBalance(checkBalancePrincipal);
    setCheckBalancePrincipal("");
  };

  const stats = [
    {
      title: "Your Balance",
      value: `${userBalance} PiCO`,
      icon: Wallet,
      change: "+12.5%",
      changeType: "positive" as const,
      description: "Current token balance",
    },
    {
      title: "Total Supply",
      value: tokenInfo?.totalSupply
        ? (Number(tokenInfo.totalSupply) / 100000000).toLocaleString()
        : "0",
      icon: TrendingUp,
      change: "+8.2%",
      changeType: "positive" as const,
      description: "Total PiCO tokens in circulation",
    },
    {
      title: "Transactions",
      value: transactions.length.toString(),
      icon: Activity,
      change: "-3.1%",
      changeType: "negative" as const,
      description: "Your transaction count",
    },
    {
      title: "Network Status",
      value: "Online",
      icon: CheckCircle2,
      change: "100%",
      changeType: "positive" as const,
      description: "Blockchain network status",
    },
  ];

  const recentTransactions = (transactions || []).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="w-full max-w-md space-y-8">
            {/* Logo Section */}
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

            {/* Login Card */}
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
                  onClick={login}
                  disabled={loading}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                >
                  {loading ? (
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

                {message && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-primary text-sm">{message}</p>
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
                  onClick={logout}
                  variant="outline"
                  className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              {/* User Info Cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Copy className="h-5 w-5 text-white" />
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
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-900 dark:text-green-100">
                          PiCO Balance
                        </h3>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {userBalance}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Code className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-purple-900 dark:text-purple-100">
                          Token Info
                        </h3>
                        {tokenInfo ? (
                          <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                            <p className="font-medium">
                              {tokenInfo.name} ({tokenInfo.symbol})
                            </p>
                            <p>Decimals: {tokenInfo.decimals}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Loading...
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Refresh Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={refreshData}
                  disabled={loading}
                  variant="outline"
                  className="shadow-sm"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message Display */}
          {message && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-sm">
              <p className="text-primary font-medium">{message}</p>
            </div>
          )}

          {/* Enhanced Tabs */}
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-2 shadow-lg border-0">
              <TabsList className="w-full justify-start bg-transparent p-0 h-auto space-x-2">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  <Wallet className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="nft"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  <ShoppingCart className="h-4 w-4" />
                  NFT Operations
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  <CreditCard className="h-4 w-4" />
                  Admin Functions
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  <History className="h-4 w-4" />
                  Transactions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <Card
                    key={stat.title}
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
                        <Badge
                          variant={
                            stat.changeType === "positive"
                              ? "default"
                              : "destructive"
                          }
                          className="font-medium"
                        >
                          {stat.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <History className="h-5 w-5 text-primary" />
                          Recent Transactions
                        </h2>
                        <Button variant="ghost" size="sm">
                          View All
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentTransactions.map((tx) => (
                        <div
                          key={tx.transaction_id}
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
                              {(tx.price_token / 100000000).toFixed(2)} PiCO
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {tx.nft_id ? `NFT #${tx.nft_id}` : "Transfer"}
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {recentTransactions.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="h-8 w-8 text-muted-foreground" />
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

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Quick Actions
                      </h2>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-between group hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Buy PiCO Tokens
                        </div>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between group hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <div className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          NFT Marketplace
                        </div>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between group hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <div className="flex items-center">
                          <History className="h-4 w-4 mr-2" />
                          Transaction History
                        </div>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* System Status */}
                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        System Status
                      </h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">
                            Backend Services
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          Operational
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">
                            Token Contract
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          Operational
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">
                            NFT Contract
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-yellow-600 border-yellow-200"
                        >
                          Maintenance
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nft" className="space-y-6">
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
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    Purchase NFT
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
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
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <DollarSign className="h-4 w-4 mr-2" />
                    )}
                    Mint Tokens
                  </Button>
                </CardContent>
              </Card>

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
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                    )}
                    Top Up Account
                  </Button>
                </CardContent>
              </Card>

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
                    disabled={loading}
                    variant="outline"
                    className="w-full h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Activity className="h-4 w-4 mr-2" />
                    )}
                    Check Balance
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Transaction History
                  </h3>
                  <p className="text-muted-foreground">
                    Complete history of your transactions
                  </p>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((tx) => (
                        <div
                          key={tx.transaction_id}
                          className="flex items-center justify-between p-4 rounded-xl border bg-card/30 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <ArrowRight className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {tx.nft_id ? "NFT Purchase" : "Token Transfer"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Transaction #{tx.transaction_id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  Number(tx.created_at) / 1000000,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tx.price_token} PiCO</p>
                            <Badge variant="outline" className="capitalize">
                              {Object.keys(tx.status)[0]}
                            </Badge>
                            {tx.nft_id && (
                              <p className="text-xs text-muted-foreground mt-1">
                                NFT #{tx.nft_id}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-muted-foreground mb-2">
                        No transactions found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your transaction history will appear here once you start
                        making transactions
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
