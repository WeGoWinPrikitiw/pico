import { useAuth } from '@/context/auth-context';
import { useContractContext } from '@/context/contract-context';

export function ContractDemoComponent() {
    const { isAuthenticated, principal, login } = useAuth();
    const { preferences, token, isInitialized } = useContractContext();

    if (!isAuthenticated) {
        return (
            <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Contract Integration Demo</h2>
                <p className="mb-4">Please log in to test the contract integration</p>
                <button 
                    onClick={login}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <h2 className="text-xl font-bold">Contract Integration Demo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auth Status */}
                <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">Authentication</h3>
                    <p className="text-sm text-green-600">✓ Authenticated</p>
                    <p className="text-xs text-gray-600 truncate">Principal: {principal}</p>
                </div>

                {/* Contract Status */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Contracts</h3>
                    <p className="text-sm text-blue-600">
                        {isInitialized ? '✓ Initialized' : '⏳ Loading...'}
                    </p>
                </div>

                {/* Preferences Status */}
                <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Preferences Contract</h3>
                    {preferences.isLoading ? (
                        <p className="text-sm text-purple-600">⏳ Loading preferences...</p>
                    ) : preferences.error ? (
                        <p className="text-sm text-red-600">❌ Error loading preferences</p>
                    ) : preferences.data ? (
                        <div>
                            <p className="text-sm text-purple-600">✓ Preferences loaded</p>
                            <p className="text-xs text-gray-600">
                                Count: {preferences.data.preferences.length}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600">No preferences found</p>
                    )}
                </div>

                {/* Token Status */}
                <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-orange-800">ICRC1 Token</h3>
                    {token.info.isLoading ? (
                        <p className="text-sm text-orange-600">⏳ Loading token info...</p>
                    ) : token.info.error ? (
                        <p className="text-sm text-red-600">❌ Error loading token</p>
                    ) : token.info.data ? (
                        <div>
                            <p className="text-sm text-orange-600">✓ Token info loaded</p>
                            <p className="text-xs text-gray-600">
                                {token.info.data.name} ({token.info.data.symbol})
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600">Token info not available</p>
                    )}

                    {token.balance.data !== undefined && (
                        <p className="text-xs text-gray-600">
                            Balance: {token.balance.formatted || '0'}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                    <button 
                        onClick={() => {
                            if (principal) {
                                preferences.operations.addPreference({
                                    principalId: principal,
                                    preference: 'crypto'
                                });
                            }
                        }}
                        disabled={preferences.operations.isLoading}
                        className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                    >
                        {preferences.operations.isLoading ? 'Adding...' : 'Add "crypto" Preference'}
                    </button>
                    
                    <button 
                        onClick={() => {
                            preferences.refetch();
                            // Token info refetch if available
                        }}
                        className="w-full px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Statistics */}
            {preferences.stats.data && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                    <h3 className="font-semibold text-indigo-800 mb-2">Global Stats</h3>
                    <div className="text-sm text-indigo-600 space-y-1">
                        <p>Total Users: {preferences.stats.data.total_users}</p>
                        <p>Total Preferences: {preferences.stats.data.total_preferences}</p>
                        <p>Avg per User: {preferences.stats.data.average_preferences_per_user}</p>
                    </div>
                </div>
            )}
        </div>
    );
}