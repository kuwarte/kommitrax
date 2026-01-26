"use client";

import { CommitmentCardProps } from "@/lib/types";
import { btnClass } from "./brutalist";

export default function CommitmentCard({ c, onOpenProof }: CommitmentCardProps) {
	return (
		<div className="bg-white border border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
			<div className="absolute top-0 right-0 bg-black text-white text-[10px] px-2 py-1 uppercase font-bold">
				{c.status}
			</div>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
				<div className="flex-1">
					<h3 className="font-bold text-lg leading-tight mb-2">{c.goal}</h3>
					<p className="text-xs text-gray-500 font-mono border-l-2 border-black pl-2">
						DEADLINE: {c.deadline}
					</p>
				</div>
				<div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
					<div className="text-right">
						<span className="text-[10px] font-bold uppercase block text-gray-500">
							Locked Stake
						</span>
						<span className="font-black text-lg">{c.stake} ETH</span>
					</div>
					{c.rawStatus === 0 && (
						<button
							onClick={() => onOpenProof(c)}
							className={`${btnClass} py-2 px-4 bg-white hover:bg-black
                        hover:text-white text-xs`}
						>
							SUBMIT PROOF
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
