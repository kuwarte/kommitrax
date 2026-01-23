import { btnClass } from "../ui/Brutalist";

export default function Header({ wallet, commitment }: any) {
  return (
    <header className="bg-white border-b border-black sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-3xl cursor-pointer">☐</div>
            <div className="flex flex-col cursor-pointer">
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none">
            KOMMITRAX
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
            On-Chain Study Commitment & Proof System
          </span>
        </div>
          </div>
          
          {!wallet.connected ? (
            <button onClick={wallet.connectWallet} disabled={wallet.loading} className={`${btnClass} bg-white hover:bg-black hover:text-white`}>
              {wallet.loading ? 'CONNECTING...' : 'CONNECT WALLET'}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right leading-none">
                <div className="text-[10px] uppercase font-bold text-gray-500">Balance</div>
                <div className="font-bold">{parseFloat(wallet.balance).toFixed(4)} ETH</div>
              </div>
              <div className="px-3 py-1.5 border border-black bg-gray-100 text-xs font-bold">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
              <button onClick={commitment.checkAndWithdraw} disabled={commitment.loading} className={`${btnClass} bg-[#ccffcc] py-2 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
                CLAIM
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
