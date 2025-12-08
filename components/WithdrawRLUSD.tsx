'use client';

import { useState } from 'react';

const RLUSD_HEX = '524C555344000000000000000000000000000000';
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';

interface WithdrawRLUSDProps {
  walletAddress: string;
  rlusdBalance: number;
  showAmounts: boolean;
  onToggleAmounts: () => void;
  onRefresh: () => Promise<void>;
  onSuccess?: () => void;
}

export default function WithdrawRLUSD({ 
  walletAddress, 
  rlusdBalance, 
  showAmounts,
  onToggleAmounts,
  onRefresh,
  onSuccess 
}: WithdrawRLUSDProps) {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const validateXRPAddress = (address: string): boolean => {
    return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
  };

  const handleWithdraw = async () => {
    setError(null);
    setSuccess(null);

    // Validate destination
    if (!destinationAddress) {
      setError('Please enter a destination address');
      return;
    }

    if (!validateXRPAddress(destinationAddress)) {
      setError('Invalid XRP Ledger address');
      return;
    }

    if (destinationAddress === walletAddress) {
      setError("Can't send to yourself");
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > rlusdBalance) {
      setError(`Insufficient balance. You have ${rlusdBalance.toFixed(2)} RLUSD`);
      return;
    }

    setSending(true);

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();

      if (!web3auth?.provider) {
        throw new Error('Web3Auth not connected. Please refresh and try again.');
      }

      // Build RLUSD payment transaction
      const paymentTx = {
        TransactionType: 'Payment',
        Account: walletAddress,
        Destination: destinationAddress,
        Amount: {
          currency: RLUSD_HEX,
          issuer: RLUSD_ISSUER,
          value: amountNum.toString(),
        },
      };

      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: paymentTx },
      });

      console.log('Withdrawal result:', result);
      setSuccess(`Successfully sent ${amountNum.toFixed(2)} RLUSD to ${destinationAddress.substring(0, 8)}...${destinationAddress.slice(-6)}`);
      setAmount('');
      setDestinationAddress('');
      
      // Refresh balance after successful withdrawal
      await onRefresh();
      onSuccess?.();
    } catch (err: any) {
      console.error('Withdrawal failed:', err);
      setError(err.message || 'Withdrawal failed');
    } finally {
      setSending(false);
    }
  };

  const setMaxAmount = () => {
    setAmount(rlusdBalance.toString());
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">💸 Withdraw RLUSD</h2>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-zinc-500 text-xs">Available</p>
            <p className="text-emerald-400 font-bold">
              {showAmounts ? `$${rlusdBalance.toFixed(2)} RLUSD` : '••••••'}
            </p>
          </div>
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-zinc-400 hover:text-white transition p-1 disabled:opacity-50"
            title="Refresh balance"
          >
            <svg 
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {/* Eye toggle */}
          <button
            onClick={onToggleAmounts}
            className="text-zinc-400 hover:text-white transition p-1"
            title={showAmounts ? 'Hide balance' : 'Show balance'}
          >
            {showAmounts ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Destination Address */}
        <div>
          <label className="text-zinc-400 text-sm block mb-2">Destination Address</label>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value.trim())}
            placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-sm placeholder:text-zinc-600"
          />
          <p className="text-zinc-600 text-xs mt-1">
            Enter an XRP Ledger address with an RLUSD trustline
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="text-zinc-400 text-sm block mb-2">Amount (RLUSD)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
            />
            <button
              onClick={setMaxAmount}
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-3 rounded-lg text-sm transition"
            >
              Max
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm">
            ⚠️ Make sure the destination address has an RLUSD trustline, or the transaction will fail.
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleWithdraw}
          disabled={sending || !destinationAddress || !amount || rlusdBalance === 0}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Sending...
            </span>
          ) : (
            'Withdraw RLUSD'
          )}
        </button>
      </div>
    </div>
  );
}