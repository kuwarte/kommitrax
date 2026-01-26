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
}: StudentViewProps) => (
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
			<h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block mb-4">
				Active Staking
			</h2>
			{commitments.length === 0 ? (
				<div className="border border-black bg-gray-100 p-12 text-center font-bold text-gray-400 uppercase tracking-widest">
					No active commitments
				</div>
			) : (
				commitments.map((c: Commitment) => (
					<CommitmentCard key={c.id} c={c} onOpenProof={onOpenProof} />
				))
			)}
		</div>
	</div>
);

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
