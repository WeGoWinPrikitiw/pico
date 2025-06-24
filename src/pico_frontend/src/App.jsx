import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';

// Import the generated declarations
import { operational_contract } from 'declarations/operational_contract';
import { token_contract } from 'declarations/token_contract';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState('');
  const [agent, setAgent] = useState(null);

  // Contract actors
  const [operationalActor, setOperationalActor] = useState(null);
  const [tokenActor, setTokenActor] = useState(null);
  const [ledgerActor, setLedgerActor] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('wallet');

  // Data state
  const [tokenInfo, setTokenInfo] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [tokenHolders, setTokenHolders] = useState([]);

  // Form inputs
  const [mintAmount, setMintAmount] = useState('');
  const [mintRecipient, setMintRecipient] = useState('');
  const [approveAmount, setApproveAmount] = useState('');
  const [nftBuyer, setNftBuyer] = useState('');
  const [nftSeller, setNftSeller] = useState('');
  const [nftId, setNftId] = useState('');
  const [nftPrice, setNftPrice] = useState('');

  // Initialize authentication
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        await handleAuthenticated(client);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setMessage('Authentication initialization failed');
    }
  };

  const handleAuthenticated = async (client) => {
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();
    
    setIdentity(identity);
    setPrincipal(principal.toString());
    setIsAuthenticated(true);

    // Create authenticated agent
    const agent = new HttpAgent({
      identity,
      host: process.env.DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://ic0.app'
    });

    if (process.env.DFX_NETWORK === 'local') {
      await agent.fetchRootKey();
    }

    setAgent(agent);

    // Create authenticated actors
    const operationalActor = Actor.createActor(operational_contract.idlFactory, {
      agent,
      canisterId: operational_contract.canisterId
    });

    const tokenActor = Actor.createActor(token_contract.idlFactory, {
      agent,
      canisterId: token_contract.canisterId
    });

    // Create ICRC ledger actor
    const ledgerActor = IcrcLedgerCanister.create({
      agent,
      canisterId: 'uxrrr-q7777-77774-qaaaq-cai' // ICRC-1 ledger canister
    });

    setOperationalActor(operationalActor);
    setTokenActor(tokenActor);
    setLedgerActor(ledgerActor);

    // Load initial data
    await loadUserData(operationalActor, tokenActor, principal.toString());
    
    setMessage('✅ Successfully authenticated and connected to contracts!');
  };

  const login = async () => {
    try {
      setLoading(true);
      await authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'local' 
          ? `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`
          : 'https://identity.ic0.app',
        onSuccess: () => handleAuthenticated(authClient),
        onError: (error) => {
          console.error('Login failed:', error);
          setMessage('Login failed');
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Login error occurred');
      setLoading(false);
    }
  };

  const logout = async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setPrincipal('');
    setAgent(null);
    setOperationalActor(null);
    setTokenActor(null);
    setLedgerActor(null);
    setMessage('Logged out successfully');
  };

  const loadUserData = async (opActor, tokActor, userPrincipal) => {
    try {
      // Load token info
      const tokenInfo = await tokActor.get_token_info();
      setTokenInfo(tokenInfo);

      // Load user balance
      const balanceResult = await opActor.getUserBalance(userPrincipal);
      if (balanceResult.ok !== undefined) {
        setUserBalance(balanceResult.ok);
      }

      // Load user allowance
      const allowanceResult = await opActor.check_allowance(userPrincipal);
      if (allowanceResult.ok !== undefined) {
        setAllowance(allowanceResult.ok);
      }

      // Load user transactions
      const userTxs = await opActor.getUserTransactions(userPrincipal);
      setTransactions(userTxs);

      // Load token holders
      const holders = await tokActor.get_all_token_holders();
      setTokenHolders(holders);

    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage('Error loading user data: ' + error.message);
    }
  };

  const refreshData = async () => {
    if (operationalActor && tokenActor && principal) {
      await loadUserData(operationalActor, tokenActor, principal);
      setMessage('✅ Data refreshed');
    }
  };

  // Token operations
  const mintTokens = async () => {
    if (!operationalActor || !mintRecipient || !mintAmount) {
      setMessage('Please fill in recipient and amount');
      return;
    }

    try {
      setLoading(true);
      const result = await operationalActor.top_up(mintRecipient, parseInt(mintAmount));
      
      if (result.ok) {
        setMessage(`✅ ${result.ok.message}`);
        await refreshData();
      } else {
        setMessage(`❌ ${result.err}`);
      }
    } catch (error) {
      setMessage(`❌ Mint failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const approveContract = async () => {
    if (!ledgerActor || !approveAmount) {
      setMessage('Please enter approval amount');
      return;
    }

    try {
      setLoading(true);
      
      // Get approval info from operational contract
      const approvalInfo = await operationalActor.get_approval_info(parseInt(approveAmount));
      
      // Approve the operational contract to spend tokens
      const result = await ledgerActor.approve({
        spender: {
          owner: Principal.fromText(approvalInfo.spender_principal),
          subaccount: []
        },
        amount: BigInt(approvalInfo.amount_in_units),
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: []
      });

      if (result.Ok !== undefined) {
        setMessage(`✅ Approved ${approveAmount} PiCO for contract to spend. Block: ${result.Ok}`);
        await refreshData();
      } else {
        setMessage(`❌ Approval failed: ${JSON.stringify(result.Err)}`);
      }
    } catch (error) {
      setMessage(`❌ Approval failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async () => {
    if (!operationalActor || !nftBuyer || !nftSeller || !nftId || !nftPrice) {
      setMessage('Please fill in all NFT purchase fields');
      return;
    }

    try {
      setLoading(true);
      const result = await operationalActor.buy_nft(
        nftBuyer,
        nftSeller,
        parseInt(nftId),
        parseInt(nftPrice),
        []
      );

      if (result.ok) {
        setMessage(`✅ ${result.ok.message}`);
        await refreshData();
      } else {
        setMessage(`❌ ${result.err}`);
      }
    } catch (error) {
      setMessage(`❌ NFT purchase failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkBalance = async (principalId) => {
    if (!tokenActor) return;

    try {
      const result = await tokenActor.check_balance(principalId);
      setMessage(`Balance for ${principalId}: ${result.balance_pico} PiCO`);
    } catch (error) {
      setMessage(`❌ Balance check failed: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="auth-container">
          <img src="/logo2.svg" alt="PiCO Logo" className="logo" />
          <h1>PiCO NFT Marketplace</h1>
          <p>Connect with Internet Identity to access the marketplace</p>
          <button 
            onClick={login} 
            disabled={loading}
            className="login-btn"
          >
            {loading ? 'Connecting...' : 'Connect with Internet Identity'}
          </button>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <img src="/logo2.svg" alt="PiCO Logo" className="logo-small" />
          <h1>PiCO NFT Marketplace</h1>
          <div className="user-info">
            <span>Principal: {principal.slice(0, 10)}...</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'wallet' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('wallet')}
        >
          Wallet
        </button>
        <button 
          className={activeTab === 'nft' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('nft')}
        >
          NFT Marketplace
        </button>
        <button 
          className={activeTab === 'admin' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('admin')}
        >
          Admin
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </nav>

      <main className="main-content">
        {message && <div className="message">{message}</div>}

        {activeTab === 'wallet' && (
          <div className="tab-content">
            <h2>Wallet</h2>
            
            <div className="info-cards">
              <div className="card">
                <h3>Token Info</h3>
                {tokenInfo && (
                  <div>
                    <p>Name: {tokenInfo.name}</p>
                    <p>Symbol: {tokenInfo.symbol}</p>
                    <p>Decimals: {tokenInfo.decimals.toString()}</p>
                    <p>Total Supply: {(Number(tokenInfo.total_supply) / 100000000).toLocaleString()} PiCO</p>
                    <p>Fee: {Number(tokenInfo.fee)} units</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3>Your Balance</h3>
                <p className="balance">{userBalance.toLocaleString()} PiCO</p>
                <p>Approved for Contract: {allowance.toLocaleString()} PiCO</p>
              </div>
            </div>

            <div className="action-section">
              <h3>Approve Contract</h3>
              <p>Approve the contract to spend your tokens for NFT purchases</p>
              <div className="input-group">
                <input
                  type="number"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  placeholder="Amount to approve"
                />
                <button onClick={approveContract} disabled={loading}>
                  {loading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>

            <button onClick={refreshData} className="refresh-btn">
              Refresh Data
            </button>
          </div>
        )}

        {activeTab === 'nft' && (
          <div className="tab-content">
            <h2>NFT Marketplace</h2>
            
            <div className="action-section">
              <h3>Buy NFT</h3>
              <div className="form-grid">
                <input
                  type="text"
                  value={nftBuyer}
                  onChange={(e) => setNftBuyer(e.target.value)}
                  placeholder="Buyer Principal ID"
                />
                <input
                  type="text"
                  value={nftSeller}
                  onChange={(e) => setNftSeller(e.target.value)}
                  placeholder="Seller Principal ID"
                />
                <input
                  type="number"
                  value={nftId}
                  onChange={(e) => setNftId(e.target.value)}
                  placeholder="NFT ID"
                />
                <input
                  type="number"
                  value={nftPrice}
                  onChange={(e) => setNftPrice(e.target.value)}
                  placeholder="Price in PiCO"
                />
              </div>
              <button onClick={buyNFT} disabled={loading} className="buy-btn">
                {loading ? 'Processing...' : 'Buy NFT'}
              </button>
            </div>

            <div className="transactions-section">
              <h3>Your Transactions</h3>
              <div className="transactions-list">
                {transactions.length === 0 ? (
                  <p>No transactions found</p>
                ) : (
                  transactions.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="tx-header">
                        <span className="tx-id">#{tx.transaction_id}</span>
                        <span className={`tx-status ${tx.status}`}>
                          {Object.keys(tx.status)[0]}
                        </span>
                      </div>
                      <div className="tx-details">
                        <p>From: {tx.from_principal_id.slice(0, 15)}...</p>
                        <p>To: {tx.to_principal_id.slice(0, 15)}...</p>
                        <p>Amount: {tx.price_token} PiCO</p>
                        {tx.nft_id[0] && <p>NFT ID: {tx.nft_id[0]}</p>}
                        <p>Date: {new Date(Number(tx.created_at) / 1000000).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="tab-content">
            <h2>Admin Functions</h2>
            
            <div className="action-section">
              <h3>Mint Tokens</h3>
              <div className="input-group">
                <input
                  type="text"
                  value={mintRecipient}
                  onChange={(e) => setMintRecipient(e.target.value)}
                  placeholder="Recipient Principal ID"
                />
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="Amount to mint"
                />
                <button onClick={mintTokens} disabled={loading}>
                  {loading ? 'Minting...' : 'Mint Tokens'}
                </button>
              </div>
            </div>

            <div className="token-holders-section">
              <h3>Token Holders ({tokenHolders.length})</h3>
              <div className="holders-list">
                {tokenHolders.map((holder, index) => (
                  <div key={index} className="holder-item">
                    <span>{holder}</span>
                    <button 
                      onClick={() => checkBalance(holder)}
                      className="check-balance-btn"
                    >
                      Check Balance
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <h2>Analytics</h2>
            <div className="analytics-grid">
              <div className="card">
                <h3>Total Token Holders</h3>
                <p className="big-number">{tokenHolders.length}</p>
              </div>
              
              <div className="card">
                <h3>Total Transactions</h3>
                <p className="big-number">{transactions.length}</p>
              </div>
              
              <div className="card">
                <h3>Your Balance</h3>
                <p className="big-number">{userBalance.toLocaleString()} PiCO</p>
              </div>
              
              <div className="card">
                <h3>Contract Approval</h3>
                <p className="big-number">{allowance.toLocaleString()} PiCO</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
