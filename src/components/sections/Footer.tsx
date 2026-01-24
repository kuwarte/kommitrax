import { btnClass } from "../ui/Brutalist";

export default function Footer() {
    return (
        <footer className="bg-black text-white py-12 border-t border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-10">
              
                    <div className="text-center md:text-left space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Network Status</p>
                        <p className="text-sm font-mono">
                            Running on <span className="text-green-200 font-bold">Sepolia Testnet</span>
                        </p>
                    </div>

                    <div className="text-center flex flex-col items-center">
                        <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed italic">
                            For Educational Purposes Only.
                        </p>
                    </div>

                    <div className="text-center md:text-right">
                    <a 
                        href="https://github.com/kuwarte/kommitrax/blob/main/contracts/StudyCommitment.sol" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-block border border-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-200 ${btnClass} !shadow-[4px_4px_0px_#888] hover:!shadow-[2px_2px_0px_#888] active:!shadow-none`}
                >
                        Review Smart Contract
                    </a>
                </div>
              </div>
            </div>
        </footer>    

    )
}
