import { btnClass } from "./brutalist";

export default function LockedState({ connect }: { connect: () => void }) {
	return (
		<div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center p-6 font-mono selection:bg-black selection:text-white">
			<div className="border border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full">
				<h2 className="text-6xl font-black text-black  uppercase mb-6 tracking-tighter leading-[0.9]">
					Access <br />
					Denied
				</h2>

				<div className="h-1 bg-black w-full mb-8" />

				<p className="font-bold italic text-gray-800 mb-10 uppercase text-xs tracking-widest leading-relaxed">
					The lab is currently encrypted. <br />
					Connect to Sepolia to enter.
				</p>

				<button
					onClick={connect}
					className={`
            ${btnClass} 
            w-full py-5 text-xl font-black
            bg-blue-400/50 text-black border-2 border-black
            transition-all active:bg-black active:text-white
          `}
				>
					INITIALIZE CONNECTION
				</button>
			</div>
		</div>
	);
}
