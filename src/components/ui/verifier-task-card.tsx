"use client";

import { VerifierTaskCardProps } from "@/lib/types";
import { btnClass } from "./brutalist";

export default function VerifierTaskCard({ task, onVerify }: VerifierTaskCardProps) {
	return (
		<div className="bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
			<div className="flex justify-between items-start mb-6 border-b border-black pb-4">
				<div>
					<p className="text-xs font-bold bg-blue-400/50 text-black inline-block px-1 mb-2">
						PROOF SUBMISSION
					</p>
					<h3 className="text-xl font-bold">{task.goal}</h3>
				</div>
				<div className="text-right">
					<p className="text-[10px] font-bold uppercase text-gray-500">Verifier Fee</p>
					<p className="font-black text-lg">
						{(parseFloat(task.stake) * 0.01).toFixed(5)} ETH
					</p>
				</div>
			</div>
			<div className="bg-gray-100 border border-black p-4 mb-8 font-mono text-sm">
				<span className="text-gray-400 select-none">DESCRIPTION/LINK: </span>
				{task.proof}
			</div>
			<div className="flex gap-4">
				<button
					onClick={() => onVerify(task.id.toString(), false)}
					className={`${btnClass} flex-1 bg-[#ffcccc]
                text-red-900 border-red-900 hover:bg-red-900 hover:text-white`}
				>
					REJECT (SLASH)
				</button>
				<button
					onClick={() => onVerify(task.id.toString(), true)}
					className={`${btnClass} flex-1 bg-[#ccffcc]
                text-green-900 border-green-900 hover:bg-green-900 hover:text-white`}
				>
					APPROVE (RELEASE)
				</button>
			</div>
		</div>
	);
}
