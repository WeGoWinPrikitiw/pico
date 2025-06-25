import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { BackendIntegrationDemo } from '@/components/demo/backend-integration-demo';

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
    const [activeTab, setActiveTab] = useState('wallet');

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

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-8">
                        <img src="/logo2.svg" alt="PiCO logo" className="mx-auto mb-6 max-w-xs" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            PiCO Token Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Connect with Internet Identity to access your PiCO token operations
                        </p>
                    </div>

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
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-blue-800 text-sm">{message}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">PiCO Token Dashboard</h1>
                            <p className="text-gray-600">Manage your PiCO tokens and transactions</p>
                        </div>
                        <Button onClick={logout} variant="outline">
                            Logout
                        </Button>
                    </div>

                    {/* User Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Principal ID</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600 font-mono truncate">{principal}</p>
                                <Button size="sm" variant="outline" onClick={copyPrincipalToClipboard}>
                                    Copy
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">PiCO Balance</h3>
                            <p className="text-2xl font-bold text-green-600">{userBalance}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Token Info</h3>
                            {tokenInfo ? (
                                <div className="text-sm text-gray-600">
                                    <p>{tokenInfo.name} ({tokenInfo.symbol})</p>
                                    <p>Decimals: {tokenInfo.decimals}</p>
                                    {tokenInfo.totalSupply && tokenInfo.totalSupply > 0n ? (
                                        <p>Total Supply: {tokenInfo.totalSupply.toString()}</p>
                                    ) : null}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Loading...</p>
                            )}
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="mt-4 flex justify-end">
                        <Button onClick={refreshData} disabled={loading} variant="outline">
                            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Message Display */}
                {message && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800">{message}</p>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'wallet', label: 'Wallet Operations' },
                                { id: 'nft', label: 'NFT Marketplace' },
                                { id: 'admin', label: 'Admin Functions' },
                                { id: 'transactions', label: 'Transaction History' },
                                { id: 'demo', label: 'Backend Demo' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeTab === 'wallet' && (
                        <>
                            {/* Self Top-up */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Self Top-up</h3>
                                <div className="space-y-4">
                                    <Input
                                        type="number"
                                        placeholder="Amount to top-up"
                                        value={selfTopUpAmount}
                                        onChange={(e) => setSelfTopUpAmount(e.target.value)}
                                    />
                                    <Button onClick={handleSelfTopUp} disabled={loading} className="w-full">
                                        Top-up My Account
                                    </Button>
                                </div>
                            </div>

                            {/* Approve Contract */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Approve Contract</h3>
                                <div className="space-y-4">
                                    <Input
                                        type="number"
                                        placeholder="Amount to approve"
                                        value={approveAmount}
                                        onChange={(e) => setApproveAmount(e.target.value)}
                                    />
                                    <Button onClick={handleApproveContract} disabled={loading} className="w-full">
                                        Approve
                                    </Button>
                                </div>
                            </div>

                            {/* Check Balance */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Check Balance</h3>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Principal ID to check"
                                        value={checkBalancePrincipal}
                                        onChange={(e) => setCheckBalancePrincipal(e.target.value)}
                                    />
                                    <Button onClick={handleCheckBalance} disabled={loading} className="w-full">
                                        Check Balance
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'nft' && (
                        <>
                            {/* Buy NFT */}
                            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                                <h3 className="text-lg font-semibold mb-4">Buy NFT</h3>
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
                                        Buy NFT
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'admin' && (
                        <>
                            {/* Mint Tokens */}
                            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                                <h3 className="text-lg font-semibold mb-4">Mint Tokens (Admin)</h3>
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
                                        Mint Tokens
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                            {transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {transactions.map((tx) => (
                                                <tr key={tx.transaction_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{tx.transaction_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {tx.nft_id ? 'NFT Purchase' : 'Token Transfer'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {tx.price_token} PiCO
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            {Object.keys(tx.status)[0]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(Number(tx.created_at) / 1000000).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No transactions found</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'demo' && (
                        <div className="lg:col-span-2">
                            <BackendIntegrationDemo />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 