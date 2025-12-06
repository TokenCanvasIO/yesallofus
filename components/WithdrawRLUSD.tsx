'use client';

import { useState } from 'react';

const RLUSD_HEX = '524C555344000000000000000000000000000000';
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';

interface WithdrawRLUSDProps {
  walletAddress: string;
  rlusdBalance: number;
  onSuccess?: () => void;
}

export default function WithdrawRLUSD({ walletAddress, rlusdBalance, onSuccess }: WithdrawRLUSDProps) {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        <div className="text-right">
          <p className="text-zinc-500 text-xs">Available</p>
          <p className="text-emerald-400 font-bold">${rlusdBalance.toFixed(2)} RLUSD</p>
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