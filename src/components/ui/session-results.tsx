"use client";

import { btnClass } from "@/components/ui/brutalist";
import { SessionResultsProps } from "@/lib/types";

export default function SessionResults({
	mode,
	score,
	total,
	onRestart,
	onExit,
}: SessionResultsProps) {
	const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
	const isLowScore = percentage < 50;

	return (
		<div className="min-h-screen bg-[#F0F0F0] font-mono flex items-center justify-center p-4">
			<div className="bg-white border border-black p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
				<h2 className="text-4xl text-gray-900 font-extrabold uppercase mb-8 italic">
					Session Complete
				</h2>

				{mode === "quiz" ? (
					<div
						className={`mb-8 border-4 p-4 ${isLowScore ? "text-red-500 border-red-600 bg-red-50" : "text-green-600 border-green-600 bg-green-50"}`}
					>
						<p className="text-xs font-bold uppercase mb-2">Final Analysis</p>
						<p className="text-5xl font-black mb-1">
							{score} / {total}
						</p>
						<p className="text-sm font-bold uppercase tracking-widest">
							({percentage}% Accuracy)
						</p>
					</div>
				) : (
					<p className="mb-8 font-black text-green-900 text-2xl border-4 p-4 border-green-600 bg-green-50 uppercase">
						Reviewed {total} cards
					</p>
				)}

				<div className="flex flex-col gap-4">
					<button
						onClick={onRestart}
						className={`${btnClass} bg-red-400/50 active:bg-red-300/50 text-black`}
					>
						RESTART SESSION
					</button>
					<button onClick={onExit} className={`${btnClass} bg-white text-black`}>
						RETURN TO EDITOR
					</button>
				</div>
			</div>
		</div>
	);
}
