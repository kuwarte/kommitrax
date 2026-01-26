import { CommitmentFormProps } from "@/lib/types";
import { btnClass, inputClass } from "./brutalist";

export default function CommitmentForm({
	goal,
	setGoal,
	verifierAddress,
	setVerifierAddress,
	hours,
	setHours,
	handleCreate,
	loading,
}: CommitmentFormProps) {
	return (
		<div className="lg:col-span-1">
			<div className="bg-white border border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-28">
				<div className="bg-black text-white text-xs font-bold uppercase p-1 mb-6 text-center">
					New Commitment
				</div>
				<div className="space-y-6">
					<div>
						<label className="block text-xs font-bold uppercase mb-2">
							Goal Description
						</label>
						<input
							type="text"
							value={goal}
							onChange={(e) => setGoal(e.target.value)}
							placeholder="Complete
                    Module 5..."
							className={inputClass}
						/>
					</div>
					<div>
						<label className="block text-xs font-bold uppercase mb-2">
							Verifier Address
						</label>
						<input
							type="text"
							value={verifierAddress}
							onChange={(e) => setVerifierAddress(e.target.value)}
							placeholder="0x..."
							className={inputClass}
						/>
					</div>
					<div>
						<label className="block text-xs font-bold uppercase mb-2">
							Deadline (Hours)
						</label>
						<input
							type="number"
							value={hours}
							onChange={(e) => setHours(e.target.value)}
							className={inputClass}
						/>
					</div>
					<div className="border border-dashed border-green-900 p-3 text-xs bg-green-50">
						<div className="flex justify-between mb-1">
							<span>STAKE:</span>
							<span className="font-bold">0.01 ETH</span>
						</div>
						<div className="flex justify-between text-gray-500">
							<span>PLATFORM FEE:</span>
							<span>2%</span>
						</div>
					</div>
					<button
						onClick={handleCreate}
						disabled={loading || !goal || !verifierAddress}
						className={`${btnClass}
                    w-full bg-blue-400/50 text-black border-black`}
					>
						{loading ? "PROCESSING..." : "LOCK STAKE"}
					</button>
				</div>
			</div>
		</div>
	);
}
