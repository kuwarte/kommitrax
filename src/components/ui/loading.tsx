export default function LoadingState({ label = "INITIALIZING" }: { label?: string }) {
	return (
		<div className="fixed inset-0 z-9999 bg-[#F0F0F0] flex flex-col items-center justify-center font-mono">
			<div className="flex gap-6">
				<div className="relative">
					<div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black" />
					<div className="relative w-10 h-24 border border-black bg-white animate-[pulse_1s_ease-in-out_infinite]" />
				</div>

				<div className="relative">
					<div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black" />
					<div className="relative w-10 h-24 border border-black bg-white animate-[pulse_1s_ease-in-out_infinite_200ms]" />
				</div>

				<div className="relative">
					<div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black" />
					<div className="relative w-10 h-24 border border-black bg-white animate-[pulse_1s_ease-in-out_infinite_400ms]" />
				</div>
			</div>

			<div className="mt-12 group relative">
				<div className="absolute inset-0 translate-x-1 translate-y-1" />
				<div className="relative">
					<p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-700 italic">
						{label}
						<span className="inline-block animate-bounce">...</span>
					</p>
				</div>
			</div>
		</div>
	);
}
