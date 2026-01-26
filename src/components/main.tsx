"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useCommitment } from "@/hooks/useCommitment";
import { btnClass, Toast } from "@/components/ui/brutalist";
import Header from "@/components/sections/header";
import { StudentView, VerifierView } from "@/components/sections/dashboards";
import { Commitment } from "@/lib/types";
import { useToast } from "@/hooks/useToast";
import LoadingState from "./ui/loading";

export default function Main() {
	const [activeTab, setActiveTab] = useState<"student" | "verifier">("student");
	const [goal, setGoal] = useState<string>("");
	const [verifierAddress, setVerifierAddress] = useState<string>("");
	const [hours, setHours] = useState<string>("24");
	const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
	const [proofText, setProofText] = useState<string>("");

	const [isInitializing, setIsInitializing] = useState(true);

	const { toast, showSuccess, showError } = useToast();

	const wallet = useWallet(showError);
	const commitment = useCommitment(wallet.address, wallet.updateBalance, showSuccess, showError);

	useEffect(() => {
		if (wallet.connected) {
			setIsInitializing(false);
			commitment.loadAllCommitments();
			commitment.loadVerifierTasks();
			return;
		}

		const timer = setTimeout(() => {
			setIsInitializing(false);
		}, 1800);

		return () => clearTimeout(timer);
	}, [wallet.connected, wallet.address]);

	const handleCreateCommitment = async () => {
		const success = await commitment.createCommitment(goal, verifierAddress, parseInt(hours));
		if (success) {
			setGoal("");
			setVerifierAddress("");
			setHours("24");
			commitment.loadAllCommitments();
		}
	};

	const handleSubmitProof = async () => {
		if (!selectedCommitment) return;
		const success = await commitment.submitProof(selectedCommitment.id.toString(), proofText);
		if (success) {
			setProofText("");
			setSelectedCommitment(null);
			commitment.loadAllCommitments();
		}
	};

	const handleVerify = async (taskId: string, approved: boolean) => {
		await commitment.verifyTask(taskId, approved);
		commitment.loadAllCommitments();
		commitment.loadVerifierTasks();
	};

	const myCommitments: Commitment[] = wallet.connected
		? commitment.commitments.filter(
				(c: Commitment) => c.student.toLowerCase() === wallet.address.toLowerCase()
			)
		: [];

	if (isInitializing) {
		return <LoadingState label="SYNCING_CHAIN" />;
	}

	return (
		<div className="min-h-screen bg-[#F0F0F0] text-black font-mono selection:bg-black selection:text-white flex flex-col">
			<div className="flex-grow pb-20">
				{toast && <Toast toast={toast} />}

				<Header wallet={wallet} commitment={commitment} />

				{!wallet.connected ? (
					<div className="max-w-7xl mx-auto px-4 py-24 text-center">
						<div className="inline-block border border-black bg-white p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl text-left">
							<h2 className="text-5xl font-black uppercase mb-4 leading-[0.9] tracking-tighter">
								<span className="bg-green-500/30 px-2">Finish the task.</span>
								<br />
								Or <span className="bg-red-500/30 px-2">lose your ETH.</span>
							</h2>

							<p className="text-sm font-bold uppercase mb-10 text-gray-500">
								Procrastination is hard to avoid. Implement risk to motivate.
							</p>

							<div className="space-y-2 mb-10">
								<div className="flex items-start gap-3">
									<span className="bg-black/40 text-black px-2 font-bold">
										STAKE
									</span>
									<p className="text-sm font-bold uppercase tracking-tight">
										Deposit 0.01 ETH as a commitment to your goal.
									</p>
								</div>
								<div className="flex items-start gap-3">
									<span className="bg-black/40 text-black px-2 font-bold">
										RISK
									</span>
									<p className="text-sm font-bold uppercase tracking-tight">
										Failure to provide proof, then funds are forfeited.
									</p>
								</div>
								<div className="flex items-start gap-3">
									<span className="bg-green-500/50 text-black px-2 font-bold">
										REWARD
									</span>
									<p className="text-sm font-bold uppercase tracking-tight">
										Verify your work and reclaim your assets instantly.
									</p>
								</div>
							</div>

							<button
								onClick={wallet.connectWallet}
								className={`${btnClass} text-black hover:text-white w-full py-5 text-xl hover:bg-red-700/50 transition-colors`}
							>
								ACCEPT THE RISK!
							</button>
						</div>
					</div>
				) : (
					<div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
						<div className="flex gap-4 mb-10 border-b border-black pb-4">
							{(["student", "verifier"] as const).map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`text-sm font-bold uppercase tracking-widest px-4 py-2 border border-black transition-all ${
										activeTab === tab
											? "bg-black text-white shadow-[4px_4px_0px_0px_#888]"
											: "bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
									}`}
								>
									{tab === "student"
										? "Student Dashboard"
										: `Verifier Tasks (${commitment.verifierCommitments?.length || 0})`}
								</button>
							))}
						</div>

						{activeTab === "student" ? (
							<StudentView
								goal={goal}
								setGoal={setGoal}
								verifierAddress={verifierAddress}
								setVerifierAddress={setVerifierAddress}
								hours={hours}
								setHours={setHours}
								handleCreate={handleCreateCommitment}
								loading={commitment.loading}
								commitments={myCommitments}
								onOpenProof={setSelectedCommitment}
							/>
						) : (
							<VerifierView
								tasks={commitment.verifierCommitments || []}
								onVerify={handleVerify}
							/>
						)}
					</div>
				)}

				{selectedCommitment && (
					<div className="fixed inset-0 bg-white/90 flex items-center justify-center p-4 z-[100]">
						<div className="bg-white border-2 border-black w-full max-w-lg shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
							<div className="bg-black text-white p-4 flex justify-between items-center">
								<h3 className="font-bold uppercase">Submit Proof</h3>
								<button
									onClick={() => setSelectedCommitment(null)}
									className="text-white hover:text-gray-300 font-mono text-xl"
								>
									X
								</button>
							</div>
							<div className="p-8">
								<p className="text-sm font-bold mb-4 uppercase text-gray-500">
									EVIDENCE OF WORK:
								</p>
								<textarea
									value={proofText}
									onChange={(e) => setProofText(e.target.value)}
									className="w-full h-40 border border-black p-4 font-mono text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none mb-6"
									placeholder="Paste link or describe completion..."
								/>
								<div className="flex gap-4">
									<button
										onClick={() => setSelectedCommitment(null)}
										className={`${btnClass} flex-1 bg-white hover:bg-gray-100`}
									>
										CANCEL
									</button>
									<button
										onClick={handleSubmitProof}
										disabled={!proofText}
										className={`${btnClass} flex-1 bg-blue-400/50 text-black border-black`}
									>
										{commitment.loading ? "SENDING..." : "SUBMIT"}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
