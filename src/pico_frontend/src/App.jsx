import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';

// Import the generated declarations
import { operational_contract, idlFactory as operationalIdlFactory } from 'declarations/operational_contract';
import { token_contract, idlFactory as tokenIdlFactory } from 'declarations/token_contract';

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
  const [selfTopUpAmount, setSelfTopUpAmount] = useState('');

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

    try {
      // Create authenticated agent
      const isLocal = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const host = isLocal ? 'http://localhost:4943' : 'https://ic0.app';
      
      console.log('Creating agent with host:', host, 'isLocal:', isLocal);
      
      const agent = new HttpAgent({
        identity,
        host
      });

      if (isLocal) {
        await agent.fetchRootKey();
        console.log('Root key fetched for local development');
      }

      setAgent(agent);

      // Create authenticated actors with fallback canister IDs
      const operationalCanisterId = operational_contract.canisterId || 'u6s2n-gx777-77774-qaaba-cai';
      const tokenCanisterId = token_contract.canisterId || 'umunu-kh777-77774-qaaca-cai';
      const ledgerCanisterId = 'uxrrr-q7777-77774-qaaaq-cai';
      
      console.log('Creating actors with canister IDs:');
      console.log('operational_contract:', operationalCanisterId);
      console.log('token_contract:', tokenCanisterId);
      console.log('ledger_canister:', ledgerCanisterId);
      console.log('IDL factories available:');
      console.log('operational_contract.idlFactory:', !!operational_contract?.idlFactory);
      console.log('token_contract.idlFactory:', !!token_contract?.idlFactory);
      console.log('operationalIdlFactory:', !!operationalIdlFactory);
      console.log('tokenIdlFactory:', !!tokenIdlFactory);
      
      // Use directly imported IDL factories as fallback
      const operationalIdl = operational_contract?.idlFactory || operationalIdlFactory;
      const tokenIdl = token_contract?.idlFactory || tokenIdlFactory;
      
      const operationalActor = Actor.createActor(operationalIdl, {
        agent,
        canisterId: operationalCanisterId
      });

      const tokenActor = Actor.createActor(tokenIdl, {
        agent,
        canisterId: tokenCanisterId
      });

      // Create ICRC ledger actor
      const ledgerActor = IcrcLedgerCanister.create({
        agent,
        canisterId: ledgerCanisterId
      });

      console.log('Actors created successfully');
      console.log('operationalActor:', !!operationalActor);
      console.log('tokenActor:', !!tokenActor);
      console.log('ledgerActor:', !!ledgerActor);

      setOperationalActor(operationalActor);
      setTokenActor(tokenActor);
      setLedgerActor(ledgerActor);

      // Load initial data
      await loadUserData(operationalActor, tokenActor, principal.toString());
      
      setMessage('✅ Successfully authenticated and connected to contracts!');
    } catch (error) {
      console.error('Error during authentication setup:', error);
      setMessage(`❌ Failed to connect to contracts: ${error.message}`);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const isLocal = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const identityProvider = isLocal 
        ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`
        : 'https://identity.ic0.app';
      
      console.log('Logging in with identity provider:', identityProvider);
      
      await authClient.login({
        identityProvider,
        onSuccess: () => handleAuthenticated(authClient),
        onError: (error) => {
          console.error('Login faileds:', error);
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
    console.log('Starting to load user data for:', userPrincipal);
    
    // Load token info
    try {
      const tokenInfo = await tokActor.get_token_info();
      setTokenInfo(tokenInfo);
      console.log('✅ Token info loaded');
    } catch (error) {
      console.error('❌ Failed to load token info:', error);
    }

    // Load user balance
    try {
      const balanceResult = await opActor.getUserBalance(userPrincipal);
      if (balanceResult.ok !== undefined) {
        setUserBalance(balanceResult.ok);
        console.log('✅ User balance loaded:', balanceResult.ok);
      }
    } catch (error) {
      console.error('❌ Failed to load user balance:', error);
      setUserBalance(0);
    }

    // Load user allowance (skip if it causes IDL errors)
    try {
      console.log('Attempting to load allowance...');
      const allowanceResult = await opActor.check_allowance(userPrincipal);
      if (allowanceResult.ok !== undefined) {
        setAllowance(allowanceResult.ok);
        console.log('✅ Allowance loaded:', allowanceResult.ok);
      }
    } catch (error) {
      console.error('❌ Failed to load allowance (IDL issue), skipping:', error.message);
      setAllowance(0); // Set default value
    }

    // Load user transactions
    try {
      console.log('Loading transactions for user:', userPrincipal);
      const userTxs = await opActor.getUserTransactions(userPrincipal);
      console.log('✅ Loaded transactions:', userTxs);
      setTransactions(userTxs);
    } catch (error) {
      console.error('❌ Failed to load transactions:', error);
      setTransactions([]);
    }

    // Load token holders with balances from operational contract
    try {
      console.log('Loading token holders...');
      const holdersWithBalances = await opActor.getAllTokenHoldersWithBalances();
      if (holdersWithBalances.ok) {
        setTokenHolders(holdersWithBalances.ok);
        console.log('✅ Token holders with balances loaded:', holdersWithBalances.ok.length);
      } else {
        // Fallback to simple holder list
        const holders = await opActor.getAllTokenHolders();
        setTokenHolders(holders.map(holder => [holder, 0])); // Format as [principal, balance] pairs
        console.log('✅ Token holders loaded (simple list):', holders.length);
      }
    } catch (error) {
      console.log('❌ Failed to load holders with balances, using simple list:', error);
      try {
        const holders = await opActor.getAllTokenHolders();
        setTokenHolders(holders.map(holder => [holder, 0])); // Format as [principal, balance] pairs
        console.log('✅ Token holders loaded (fallback):', holders.length);
      } catch (fallbackError) {
        console.error('❌ Failed to load token holders completely:', fallbackError);
        setTokenHolders([]);
      }
    }

    console.log('✅ User data loading completed');
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
      console.log('Approval info:', approvalInfo);
      
      // Approve the operational contract to spend tokens
      const approveArgs = {
        spender: {
          owner: Principal.fromText(approvalInfo.spender_principal),
          subaccount: []
        },
        amount: BigInt(approvalInfo.amount_in_units)
        // Remove optional fields to let the library handle defaults
      };
      
      console.log('Approve args:', approveArgs);
      
      const result = await ledgerActor.approve(approveArgs);
      console.log('Approval result:', result);

      // The @dfinity/ledger-icrc library returns the block number directly on success
      if (typeof result === 'bigint' || typeof result === 'number') {
        setMessage(`✅ Approved ${approveAmount} PiCO for contract to spend. Block: ${result}`);
        await refreshData();
      } else if (result.Ok !== undefined) {
        setMessage(`✅ Approved ${approveAmount} PiCO for contract to spend. Block: ${result.Ok}`);
        await refreshData();
      } else {
        setMessage(`❌ Approval failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      setMessage(`❌ Approval failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validatePrincipal = (principalStr) => {
    try {
      Principal.fromText(principalStr);
      return true;
    } catch (error) {
      return false;
    }
  };

  const buyNFT = async () => {
    if (!operationalActor || !nftBuyer || !nftSeller || !nftId || !nftPrice) {
      setMessage('Please fill in all NFT purchase fields');
      return;
    }

    // Validate principal IDs
    if (!validatePrincipal(nftBuyer)) {
      setMessage('❌ Invalid buyer principal ID format');
      return;
    }

    if (!validatePrincipal(nftSeller)) {
      setMessage('❌ Invalid seller principal ID format');
      return;
    }

    try {
      setLoading(true);
      
      // Convert and validate parameters
      const nftIdNum = parseInt(nftId);
      const nftPriceNum = parseInt(nftPrice);
      
      if (isNaN(nftIdNum) || nftIdNum < 0) {
        setMessage('❌ Invalid NFT ID - must be a positive number');
        return;
      }
      
      if (isNaN(nftPriceNum) || nftPriceNum <= 0) {
        setMessage('❌ Invalid price - must be a positive number');
        return;
      }
      
      console.log('Buying NFT with parameters:');
      console.log('Buyers:', nftBuyer, typeof nftBuyer);
      console.log('Seller:', nftSeller, typeof nftSeller);
      console.log('NFT ID:', BigInt(nftIdNum), typeof BigInt(nftIdNum));
      console.log('Price:', BigInt(nftPriceNum), typeof BigInt(nftPriceNum));
      console.log('Forum ID (optional):', [], typeof []);
      
      const result = await operationalActor.buy_nft(
        nftBuyer,
        nftSeller,
        BigInt(nftIdNum), // Convert to BigInt for Candid Nat
        BigInt(nftPriceNum) // Convert to BigInt for Candid Nat
      );

      console.log('Buy NFT result:', result);

      if (result.ok) {
        setMessage(`✅ ${result.ok.message}`);
        await refreshData();
      } else {
        setMessage(`❌ ${result.err}`);
      }
    } catch (error) {
      console.error('Buy NFT error:', error);
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

  const copyPrincipalToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(principal);
      setMessage('✅ Principal ID copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = principal;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setMessage('✅ Principal ID copied to clipboard!');
    }
  };

  const selfTopUp = async () => {
    console.log('selfTopUp called with amount:', selfTopUpAmount);
    console.log('operationalActor exists:', !!operationalActor);
    console.log('principal:', principal);
    
    if (!operationalActor) {
      setMessage('❌ Contract not connected. Please refresh the page.');
      return;
    }
    
    if (!selfTopUpAmount || selfTopUpAmount.trim() === '' || Number(selfTopUpAmount) <= 0) {
      setMessage('❌ Please enter a valid top-up amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      setMessage('🔄 Processing top-up...');
      
      const amount = parseInt(selfTopUpAmount);
      console.log('Calling top_up with:', principal, amount);
      
      const result = await operationalActor.top_up(principal, amount);
      console.log('Top-up result:', result);
      
      if (result.ok) {
        setMessage(`✅ ${result.ok.message}`);
        await refreshData();
        setSelfTopUpAmount('');
      } else {
        setMessage(`❌ ${result.err}`);
      }
    } catch (error) {
      console.error('Top-up error:', error);
      setMessage(`❌ Top-up failed: ${error.message}`);
    } finally {
      setLoading(false);
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
            <div className="principal-section">
              <span className="principal-label">Principal ID:</span>
              <span className="principal-id">{principal}</span>
              <button onClick={copyPrincipalToClipboard} className="copy-btn" title="Copy Principal ID">
                📋
              </button>
            </div>
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
                <h3>Your Principal ID</h3>
                <div className="principal-display">
                  <p className="principal-text">{principal}</p>
                  <button onClick={copyPrincipalToClipboard} className="copy-principal-btn">
                    Copy Principal ID
                  </button>
                </div>
              </div>

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
              <h3>Quick Top-Up</h3>
              <p>Add PiCO tokens to your balance</p>
              <div className="input-group">
                <input
                  type="number"
                  value={selfTopUpAmount}
                  onChange={(e) => {
                    console.log('Input changed to:', e.target.value);
                    setSelfTopUpAmount(e.target.value);
                  }}
                  placeholder="Amount to top-up"
                  min="1"
                  step="1"
                />
                <button onClick={selfTopUp} disabled={loading} className="topup-btn">
                  {loading ? 'Processing...' : 'Top-Up'}
                </button>
              </div>
              <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>
                Current amount: "{selfTopUpAmount}" (length: {selfTopUpAmount.length})
              </p>
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
              
              <div style={{marginBottom: '1rem'}}>
                <button 
                  onClick={() => {
                    setNftBuyer(principal);
                    setNftSeller(principal);
                    setNftId('1');
                    setNftPrice('1');
                  }}
                  className="copy-btn"
                  style={{marginRight: '0.5rem'}}
                >
                  Fill Test Data
                </button>
                <button 
                  onClick={() => setNftBuyer(principal)}
                  className="copy-btn"
                  style={{marginRight: '0.5rem'}}
                >
                  Use My Principal as Buyer
                </button>
                <button 
                  onClick={() => setNftSeller(principal)}
                  className="copy-btn"
                >
                  Use My Principal as Seller
                </button>
              </div>
              
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
              
              <div style={{fontSize: '0.8rem', color: '#666', margin: '0.5rem 0'}}>
                <p>Buyer valid: {nftBuyer ? (validatePrincipal(nftBuyer) ? '✅' : '❌') : '⚪'}</p>
                <p>Seller valid: {nftSeller ? (validatePrincipal(nftSeller) ? '✅' : '❌') : '⚪'}</p>
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
                {tokenHolders.map((holderData, index) => {
                  // Handle both formats: [principal, balance] or just principal
                  const holder = Array.isArray(holderData) ? holderData[0] : holderData;
                  const balance = Array.isArray(holderData) ? holderData[1] : 'Unknown';
                  
                  return (
                    <div key={index} className="holder-item">
                      <div className="holder-info">
                        <span className="holder-principal">{holder.slice(0, 20)}...</span>
                        <span className="holder-balance">{balance} PiCO</span>
                      </div>
                      <button 
                        onClick={() => checkBalance(holder)}
                        className="check-balance-btn"
                      >
                        Refresh Balance
                      </button>
                    </div>
                  );
                })}
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
