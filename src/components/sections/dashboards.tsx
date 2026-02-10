import { useState, useMemo } from "react";
import { Commitment, StudentViewProps, VerifierTask, VerifierViewProps } from "@/lib/types";
import CommitmentCard from "../ui/commitment-card";
import VerifierTaskCard from "../ui/verifier-task-card";
import CommitmentForm from "../ui/commitment-form";

export const StudentView = ({
	goal,
	setGoal,
	verifierAddress,
	setVerifierAddress,
	hours,
	setHours,
	handleCreate,
	loading,
	commitments,
	onOpenProof,
}: StudentViewProps) => {
	const [filterStatus, setFilterStatus] = useState<string>("ALL");
	const [sortBy, setSortBy] = useState<string>("URGENCY");

	const processedCommitments = useMemo(() => {
		let result = [...commitments];

		if (filterStatus !== "ALL") {
			result = result.filter((c) => c.status.toLowerCase() === filterStatus.toLowerCase());
		}

		result.sort((a, b) => {
			if (sortBy === "URGENCY") {
				return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
			} else if (sortBy === "LATEST") {
				return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
			} else if (sortBy === "A-Z") {
				return a.goal.localeCompare(b.goal);
			}
			return 0;
		});

		return result;
	}, [commitments, filterStatus, sortBy]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
			<CommitmentForm
				goal={goal}
				setGoal={setGoal}
				verifierAddress={verifierAddress}
				setVerifierAddress={setVerifierAddress}
				hours={hours}
				setHours={setHours}
				handleCreate={handleCreate}
				loading={loading}
			/>
			<div className="lg:col-span-2 space-y-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 mb-4">
					<div className="border-b-4 border-black">
						<h2 className="text-2xl font-black uppercase inline-block">
							Active Staking
						</h2>
					</div>

					<div className="flex flex-wrap gap-2">
						<div className="flex flex-col">
							<label className="text-[10px] font-bold uppercase mb-1">
								Filter By
							</label>
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className="border border-black bg-white px-2 py-1 text-xs font-bold uppercase focus:outline-none focus:ring focus:ring-black"
							>
								<option value="ALL">Show All</option>
								<option value="active">Active</option>
								<option value="submitted">Submitted</option>
								<option value="verified">Verified</option>
							</select>
						</div>

						<div className="flex flex-col">
							<label className="text-[10px] font-bold uppercase mb-1">Sort By</label>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="border border-black bg-white px-2 py-1 text-xs font-bold uppercase focus:outline-none focus:ring focus:ring-black"
							>
								<option value="URGENCY">Urgency (Date)</option>
								<option value="LATEST">Later Dates</option>
								<option value="A-Z">Name (A-Z)</option>
							</select>
						</div>
					</div>
				</div>

				{processedCommitments.length === 0 ? (
					<div className="border border-black bg-gray-100 p-12 text-center font-bold text-gray-400 uppercase tracking-widest">
						{filterStatus === "ALL"
							? "No active commitments"
							: `No ${filterStatus} commitments found`}
					</div>
				) : (
					processedCommitments.map((c: Commitment) => (
						<CommitmentCard key={c.id} c={c} onOpenProof={onOpenProof} />
					))
				)}
			</div>
		</div>
	);
};

export const VerifierView = ({ tasks, onVerify }: VerifierViewProps) => (
	<div className="max-w-4xl mx-auto space-y-8">
		<h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block">
			Verification Queue
		</h2>
		{!tasks || tasks.length === 0 ? (
			<div className="border border-black bg-gray-100 p-12 text-center font-bold text-gray-400 uppercase tracking-widest">
				Queue Empty
			</div>
		) : (
			tasks.map((task: VerifierTask) => (
				<VerifierTaskCard key={task.id} task={task} onVerify={onVerify} />
			))
		)}
	</div>
);
