import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
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
    Separator
} from '@/components/ui';
import { BackendIntegrationDemo } from '@/components/demo/backend-integration-demo';
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
    AlertCircle
} from 'lucide-react';

interface Transaction {
    transaction_id: string;
    created_at: string;
    price_token: number;
    nft_id?: string;
    transaction_type: 'mint' | 'transfer' | 'sale';
}

interface TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    totalHolders: number;
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
    const [mintAmount, setMintAmount] = useState('');
    const [mintRecipient, setMintRecipient] = useState('');
    const [approveAmount, setApproveAmount] = useState('');
    const [nftBuyer, setNftBuyer] = useState('');
    const [nftSeller, setNftSeller] = useState('');
    const [nftId, setNftId] = useState('');
    const [nftPrice, setNftPrice] = useState('');
    const [selfTopUpAmount, setSelfTopUpAmount] = useState('');
    const [checkBalancePrincipal, setCheckBalancePrincipal] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const handleMintTokens = async () => {
        if (!mintAmount || !mintRecipient) {
            setMessage('❌ Please enter both amount and recipient');
            return;
        }
        await mintTokens(mintAmount, mintRecipient);
        setMintAmount('');
        setMintRecipient('');
    };

    const handleApproveContract = async () => {
        if (!approveAmount) {
            setMessage('❌ Please enter approval amount');
            return;
        }
        await approveContract(approveAmount);
        setApproveAmount('');
    };

    const handleBuyNFT = async () => {
        if (!nftBuyer || !nftSeller || !nftId || !nftPrice) {
            setMessage('❌ Please fill all NFT purchase fields');
            return;
        }
        await buyNFT(nftBuyer, nftSeller, nftId, nftPrice);
        setNftBuyer('');
        setNftSeller('');
        setNftId('');
        setNftPrice('');
    };

    const handleSelfTopUp = async () => {
        if (!selfTopUpAmount) {
            setMessage('❌ Please enter top-up amount');
            return;
        }
        await selfTopUp(selfTopUpAmount);
        setSelfTopUpAmount('');
    };

    const handleCheckBalance = async () => {
        if (!checkBalancePrincipal) {
            setMessage('❌ Please enter principal ID');
            return;
        }
        await checkBalance(checkBalancePrincipal);
        setCheckBalancePrincipal('');
    };

    const stats = [
        {
            title: 'Total Balance',
            value: `${userBalance} PiCO`,
            icon: Wallet,
            change: '+12.5%',
            changeType: 'positive'
        },
        {
            title: 'Total Sales',
            value: '156',
            icon: ShoppingCart,
            change: '+8.2%',
            changeType: 'positive'
        },
        {
            title: 'Active Listings',
            value: '23',
            icon: CreditCard,
            change: '-3.1%',
            changeType: 'negative'
        },
        {
            title: 'Transaction Volume',
            value: '2,345 PiCO',
            icon: History,
            change: '+15.3%',
            changeType: 'positive'
        }
    ];

    const recentTransactions = (transactions as Transaction[] || []).slice(0, 5);

    return (
        <div className="min-h-screen bg-background py-8">
            {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center space-y-6">
                            <img src="/logo2.svg" alt="PiCO logo" className="mx-auto max-w-xs" />
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold">
                                    PiCO Token Dashboard
                                </h1>
                                <p className="text-muted-foreground">
                                    Connect with Internet Identity to access your PiCO token operations
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <Button
                                onClick={login}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Connecting...
                                    </>
                                ) : (
                                    'Connect with Internet Identity'
                                )}
                            </Button>

                            {message && (
                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                    <p className="text-primary text-sm">{message}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold">PiCO Token Dashboard</h1>
                                    <p className="text-muted-foreground">Manage your PiCO tokens and transactions</p>
                                </div>
                                <Button onClick={logout} variant="outline">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>

                            {/* User Info */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium mb-2">Principal ID</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-mono text-muted-foreground truncate">{principal}</p>
                                            <Button size="sm" variant="outline" onClick={copyPrincipalToClipboard}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium mb-2">PiCO Balance</h3>
                                        <p className="text-2xl font-bold text-primary">{userBalance}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium mb-2">Token Info</h3>
                                        {tokenInfo ? (
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>{tokenInfo.name} ({tokenInfo.symbol})</p>
                                                <p>Decimals: {tokenInfo.decimals}</p>
                                                {tokenInfo.totalSupply && tokenInfo.totalSupply > 0n ? (
                                                    <p>Total Supply: {tokenInfo.totalSupply.toString()}</p>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Loading...</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Refresh Button */}
                            <div className="mt-4 flex justify-end">
                                <Button onClick={refreshData} disabled={loading} variant="outline">
                                    {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                    Refresh Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Display */}
                    {message && (
                        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <p className="text-primary">{message}</p>
                        </div>
                    )}

                    {/* Tabs */}
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full justify-start border-b rounded-none p-0 h-12 bg-transparent">
                            <TabsTrigger value="overview" className="gap-2">
                                <Wallet className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="nft" className="gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                NFT Marketplace
                            </TabsTrigger>
                            <TabsTrigger value="admin" className="gap-2">
                                <CreditCard className="h-4 w-4" />
                                Admin Functions
                            </TabsTrigger>
                            <TabsTrigger value="transactions" className="gap-2">
                                <History className="h-4 w-4" />
                                Transaction History
                            </TabsTrigger>
                            <TabsTrigger value="demo" className="gap-2">
                                <Code className="h-4 w-4" />
                                Backend Demo
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat) => (
                                    <Card key={stat.title}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <stat.icon className="h-6 w-6 text-primary" />
                                                </div>
                                                <Badge
                                                    variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                                                    className="font-medium"
                                                >
                                                    {stat.change}
                                                </Badge>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Main Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column */}
                                <div className="lg:col-span-2 space-y-8">
                                    <Card>
                                        <CardHeader>
                                            <h2 className="text-xl font-semibold">Recent Transactions</h2>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {recentTransactions.map((tx) => (
                                                    <div
                                                        key={tx.transaction_id}
                                                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.transaction_type === 'mint' ? 'bg-green-100 text-green-700' :
                                                                tx.transaction_type === 'transfer' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {tx.transaction_type === 'mint' ? (
                                                                    <Code className="h-5 w-5" />
                                                                ) : tx.transaction_type === 'transfer' ? (
                                                                    <ArrowRight className="h-5 w-5" />
                                                                ) : (
                                                                    <ShoppingCart className="h-5 w-5" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(Number(tx.created_at) / 1000000).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">
                                                                {(tx.price_token / 100000000).toFixed(2)} PiCO
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {tx.nft_id ? `NFT #${tx.nft_id}` : 'Token Transfer'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {recentTransactions.length === 0 && (
                                                    <div className="text-center py-8">
                                                        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <p className="text-muted-foreground">No transactions yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <h2 className="text-xl font-semibold">Token Information</h2>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-lg border bg-card">
                                                        <p className="text-sm text-muted-foreground">Total Supply</p>
                                                        <p className="text-2xl font-bold mt-1">
                                                            {tokenInfo?.totalSupply ? (Number(tokenInfo.totalSupply) / 100000000).toLocaleString() : '0'} PiCO
                                                        </p>
                                                    </div>
                                                    <div className="p-4 rounded-lg border bg-card">
                                                        <p className="text-sm text-muted-foreground">Holders</p>
                                                        <p className="text-2xl font-bold mt-1">
                                                            {tokenInfo?.totalHolders?.toLocaleString() || '0'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm text-muted-foreground">Token Name</p>
                                                        <p className="font-medium">{tokenInfo?.name || 'PiCO Token'}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm text-muted-foreground">Symbol</p>
                                                        <p className="font-medium">{tokenInfo?.symbol || 'PiCO'}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm text-muted-foreground">Decimals</p>
                                                        <p className="font-medium">{tokenInfo?.decimals || '8'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    <Card>
                                        <CardHeader>
                                            <h2 className="text-xl font-semibold">Quick Actions</h2>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <Button variant="outline" className="w-full justify-between">
                                                    <div className="flex items-center">
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Buy PiCO Tokens
                                                    </div>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" className="w-full justify-between">
                                                    <div className="flex items-center">
                                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                                        Create Listing
                                                    </div>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" className="w-full justify-between">
                                                    <div className="flex items-center">
                                                        <History className="h-4 w-4 mr-2" />
                                                        View All Transactions
                                                    </div>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <h2 className="text-xl font-semibold">System Status</h2>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm">Backend</span>
                                                    </div>
                                                    <Badge variant="outline">Operational</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm">Token Contract</span>
                                                    </div>
                                                    <Badge variant="outline">Operational</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                        <span className="text-sm">NFT Contract</span>
                                                    </div>
                                                    <Badge variant="outline">Maintenance</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="nft">
                            {/* Buy NFT */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Buy NFT</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Buyer Principal ID"
                                            value={nftBuyer}
                                            onChange={(e) => setNftBuyer(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Seller Principal ID"
                                            value={nftSeller}
                                            onChange={(e) => setNftSeller(e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="NFT ID"
                                            value={nftId}
                                            onChange={(e) => setNftId(e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Price in PiCO"
                                            value={nftPrice}
                                            onChange={(e) => setNftPrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <Button onClick={handleBuyNFT} disabled={loading} className="w-full">
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Buy NFT
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="admin">
                            {/* Mint Tokens */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Mint Tokens (Admin)</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            type="number"
                                            placeholder="Amount to mint"
                                            value={mintAmount}
                                            onChange={(e) => setMintAmount(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Recipient Principal ID"
                                            value={mintRecipient}
                                            onChange={(e) => setMintRecipient(e.target.value)}
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <Button onClick={handleMintTokens} disabled={loading} className="w-full">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Mint Tokens
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="transactions">
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Transaction History</h3>
                                </CardHeader>
                                <CardContent>
                                    {transactions.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-border">
                                                <thead>
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                            ID
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                            Amount
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {transactions.map((tx) => (
                                                        <tr key={tx.transaction_id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                #{tx.transaction_id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                                {tx.nft_id ? 'NFT Purchase' : 'Token Transfer'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                                {tx.price_token} PiCO
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <Badge variant="outline" className="capitalize">
                                                                    {Object.keys(tx.status)[0]}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                                {new Date(Number(tx.created_at) / 1000000).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No transactions found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="demo">
                            <BackendIntegrationDemo />
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
} 