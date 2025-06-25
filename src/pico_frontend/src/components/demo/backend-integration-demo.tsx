import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useBackend } from '@/hooks/useBackend';

import {
    Wallet,
    Coins,
    TrendingUp,
    Users,
    Activity,
    RefreshCw,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export function BackendIntegrationDemo() {
    const {
        isAuthenticated,
        principal,
        userBalance,
        tokenInfo,
        transactions,
        loading,
        message,
        refreshData,
        mintTokens,
        selfTopUp,
        checkBalance
    } = useAuth();

    const [demoAmount, setDemoAmount] = useState('100');
    const [targetPrincipal, setTargetPrincipal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleMintDemo = async () => {
        if (!principal || !demoAmount) return;

        setIsLoading(true);
        setLastAction('minting');

        try {
            await mintTokens(demoAmount, principal);
            await refreshData();
            setLastAction('mint-success');
        } catch (error) {
            setLastAction('mint-error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTopUpDemo = async () => {
        if (!demoAmount) return;

        setIsLoading(true);
        setLastAction('topping-up');

        try {
            await selfTopUp(demoAmount);
            await refreshData();
            setLastAction('topup-success');
        } catch (error) {
            setLastAction('topup-error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckBalanceDemo = async () => {
        if (!targetPrincipal) return;

        setIsLoading(true);
        setLastAction('checking-balance');

        try {
            await checkBalance(targetPrincipal);
            setLastAction('balance-check-success');
        } catch (error) {
            setLastAction('balance-check-error');
        } finally {
            setIsLoading(false);
        }
    };

    const contractStats = {
        totalTransactions: transactions.length,
        totalVolume: transactions.reduce((sum, tx) => sum + (tx.price_token || 0), 0),
        uniqueUsers: new Set(transactions.map(tx => tx.from_principal_id)).size,
        averageTransaction: transactions.length > 0
            ? transactions.reduce((sum, tx) => sum + (tx.price_token || 0), 0) / transactions.length
            : 0
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Backend Integration Demo
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Connect your wallet to see real-time contract interactions
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Contract Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Contract Integration Status</h3>
                    <Button
                        onClick={refreshData}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">Connected</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                            All contracts operational
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Balance</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">
                            {userBalance} PiCO
                        </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <Activity className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-900">Transactions</span>
                        </div>
                        <p className="text-lg font-bold text-purple-700">
                            {contractStats.totalTransactions}
                        </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-900">Volume</span>
                        </div>
                        <p className="text-lg font-bold text-orange-700">
                            {(contractStats.totalVolume / 100000000).toFixed(2)} PiCO
                        </p>
                    </div>
                </div>
            </div>

            {/* Token Information */}
            {tokenInfo && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Token Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Name</label>
                            <p className="font-medium">{tokenInfo.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Symbol</label>
                            <p className="font-medium">{tokenInfo.symbol}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Decimals</label>
                            <p className="font-medium">{tokenInfo.decimals}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Demo Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Interactive Contract Demo</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mint Tokens */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Mint Tokens</h4>
                        <div className="space-y-3">
                            <Input
                                type="number"
                                placeholder="Amount to mint"
                                value={demoAmount}
                                onChange={(e) => setDemoAmount(e.target.value)}
                                className="w-full"
                            />
                            <Button
                                onClick={handleMintDemo}
                                disabled={isLoading || !demoAmount}
                                className="w-full flex items-center gap-2"
                            >
                                {isLoading && lastAction === 'minting' ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <Coins className="h-4 w-4" />
                                )}
                                Mint {demoAmount} PiCO
                            </Button>
                        </div>
                    </div>

                    {/* Top Up */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Self Top-Up</h4>
                        <div className="space-y-3">
                            <Input
                                type="number"
                                placeholder="Amount to top up"
                                value={demoAmount}
                                onChange={(e) => setDemoAmount(e.target.value)}
                                className="w-full"
                            />
                            <Button
                                onClick={handleTopUpDemo}
                                disabled={isLoading || !demoAmount}
                                variant="outline"
                                className="w-full flex items-center gap-2"
                            >
                                {isLoading && lastAction === 'topping-up' ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <ArrowUpRight className="h-4 w-4" />
                                )}
                                Top Up {demoAmount} PiCO
                            </Button>
                        </div>
                    </div>

                    {/* Check Balance */}
                    <div className="space-y-4 lg:col-span-2">
                        <h4 className="font-medium text-gray-900">Check Any User's Balance</h4>
                        <div className="flex gap-3">
                            <Input
                                placeholder="Enter principal ID to check"
                                value={targetPrincipal}
                                onChange={(e) => setTargetPrincipal(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleCheckBalanceDemo}
                                disabled={isLoading || !targetPrincipal}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                {isLoading && lastAction === 'checking-balance' ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <Users className="h-4 w-4" />
                                )}
                                Check Balance
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx, index) => (
                            <div key={tx.transaction_id} className="flex items-center justify-between p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <ArrowDownLeft className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            Transaction #{tx.transaction_id}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {tx.from_principal_id?.slice(0, 8)}... → {tx.to_principal_id?.slice(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {(tx.price_token / 100000000).toFixed(2)} PiCO
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(Number(tx.created_at) / 1000000).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Messages */}
            {message && (
                <div className={`rounded-lg p-4 ${message.includes('✅') ? 'bg-green-50 border border-green-200' :
                    message.includes('❌') ? 'bg-red-50 border border-red-200' :
                        'bg-blue-50 border border-blue-200'
                    }`}>
                    <div className="flex items-center gap-2">
                        {message.includes('✅') ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : message.includes('❌') ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                            <Activity className="h-5 w-5 text-blue-600" />
                        )}
                        <p className={`text-sm ${message.includes('✅') ? 'text-green-800' :
                            message.includes('❌') ? 'text-red-800' :
                                'text-blue-800'
                            }`}>
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 