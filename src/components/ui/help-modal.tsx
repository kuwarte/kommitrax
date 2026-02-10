import { useState, useEffect } from "react";

export default function HelpModal({ onClose }: { onClose: () => void }) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(onClose, 300);
	};

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-200 font-mono transition-transform duration-300 ease-out text-white bg-black pointer-events-auto border-t border-white shadow-[0px_-4px_0px_#000] ${
				isVisible ? "translate-y-0" : "translate-y-full"
			}`}
		>
			<div className="w-full flex h-full min-h-[220px]">
				<div className="flex-grow flex flex-col">
					<div className="w-full p-6 border-b border-white flex items-center justify-start">
						<h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">
							How to use Kommitrax?
						</h3>
					</div>

					<div className="flex-grow p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-center">
						<div className="group flex flex-col gap-2">
							<div className="w-full border-b border-white pb-1 flex justify-between items-end">
								<span className="text-xs font-bold uppercase">Step_01</span>
							</div>
							<div>
								<span className="block text-sm font-black uppercase mb-1">
									Commitment
								</span>
								<p className="text-xs font-medium text-gray-400 leading-tight max-w-[25ch]">
									DEFINE OBJECTIVE AND SET HARD DEADLINE.
								</p>
							</div>
						</div>

						<div className="group flex flex-col gap-2">
							<div className="w-full border-b border-white pb-1 flex justify-between items-end">
								<span className="text-xs font-bold uppercase">Step_02</span>
							</div>
							<div>
								<span className="block text-sm font-black uppercase mb-1">
									Escrow
								</span>
								<p className="text-xs font-medium text-gray-400 leading-tight max-w-[25ch]">
									ASSETS LOCKED. NO WITHDRAWAL UNTIL VERIFIED.
								</p>
							</div>
						</div>

						<div className="group flex flex-col gap-2">
							<div className="w-full border-b border-white pb-1 flex justify-between items-end">
								<span className="text-xs font-bold uppercase">Step_03</span>
							</div>
							<div>
								<span className="block text-sm font-black uppercase mb-1">
									Validation
								</span>
								<p className="text-xs font-medium text-gray-400 leading-tight max-w-[25ch]">
									SUBMIT PROOF DATA TO RECLAIM STAKE.
								</p>
							</div>
						</div>
					</div>
				</div>

				<button
					onClick={handleClose}
					className="group w-16 md:w-24 border-l border-white flex items-center justify-center transition-colors hover:bg-white hover:text-black"
					aria-label="Close"
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="5"
						strokeLinecap="square"
						strokeLinejoin="miter"
						className="transition-transform duration-300 group-hover:rotate-90"
					>
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	);
}
