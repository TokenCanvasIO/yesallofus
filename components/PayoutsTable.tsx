'use client';

interface Payout {
  store_name: string;
  order_id: string;
  amount: number;
  currency: string;
  tx_hash: string;
  paid_at: string;
}

interface PayoutsTableProps {
  payouts: Payout[];
}

export default function PayoutsTable({ payouts }: PayoutsTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (payouts.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-400">No payouts yet. Share your referral links to start earning!</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto sm:overflow-visible">
        <table className="min-w-[500px] sm:min-w-0 w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Date</th>
              <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Store</th>
              <th className="text-right text-zinc-400 text-sm font-medium px-4 py-3">Amount</th>
              <th className="text-right text-zinc-400 text-sm font-medium px-4 py-3">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout, index) => (
              <tr key={index} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                  {formatDate(payout.paid_at)}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{payout.store_name}</td>
                <td className="px-4 py-3 text-sm text-right text-emerald-400 font-medium whitespace-nowrap">
                  ${payout.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                  {payout.tx_hash ? (
                    <a 
                      href={`https://livenet.xrpl.org/transactions/${payout.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 font-mono"
                    >
                      {payout.tx_hash.slice(0, 8)}...
                    </a>
                  ) : (
                    <span className="text-zinc-500">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}