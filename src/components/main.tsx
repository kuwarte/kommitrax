"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useCommitment } from "@/hooks/useCommitment";
import { btnClass, inputClass, Toast } from "@/components/ui/brutalist";
import Header from "@/components/sections/header";
import { StudentView, VerifierView } from "@/components/sections/dashboards";
import { Commitment, WarpLine } from "@/lib/types";
import { useToast } from "@/hooks/useToast";
import LoadingState from "./ui/loading";
import HelpModal from "./ui/help-modal";

export default function Main() {
	const [activeTab, setActiveTab] = useState<"student" | "verifier" | "admin">("student");
	const [goal, setGoal] = useState<string>("");
	const [verifierAddress, setVerifierAddress] = useState<string>("");
	const [hours, setHours] = useState<string>("24");
	const [mintTo, setMintTo] = useState<string>("");
	const [mintTitle, setMintTitle] = useState<string>("");
	const [mintDescription, setMintDescription] = useState<string>("");
	const [mintRarity, setMintRarity] = useState<string>("0");
	const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
	const [proofText, setProofText] = useState<string>("");

	const [isInitializing, setIsInitializing] = useState(true);

	const [warpLines, setWarpLines] = useState<WarpLine[]>([]);
	const { toast, showSuccess, showError } = useToast();

	const [showHelp, setShowHelp] = useState(false);

	const wallet = useWallet(showError);
	const commitment = useCommitment(wallet.address, wallet.updateBalance, showSuccess, showError);

	useEffect(() => {
		const lines = [...Array(25)].map((_, i) => ({
			id: i,
			height: Math.random() * 1.5 + 0.5 + "px",
			width: Math.random() * 200 + 100 + "px",
			top: Math.random() * 100 + "%",
			delay: Math.random() * 4 + "s",
			duration: Math.random() * 0.8 + 0.2 + "s",
		}));
		setWarpLines(lines);
	}, []);

	useEffect(() => {
		const lastSeenDate = localStorage.getItem("track_date_now");
		const today = new Date().toDateString();

		if (lastSeenDate !== today) {
			const timer = setTimeout(() => setShowHelp(true), 1000);
			return () => clearTimeout(timer);
		}
	}, []);

	const closeHelp = () => {
		localStorage.setItem("track_date_now", new Date().toDateString());
		setShowHelp(false);
	};

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

	const handleAdminMint = async () => {
		if (!mintTo || !mintTitle || !mintDescription) {
			showError("VALIDATION", "Fill all fields");
			return;
		}
		await commitment.adminMint(mintTo, mintTitle, mintDescription, parseInt(mintRarity));
		setMintTo("");
		setMintTitle("");
		setMintDescription("");
		setMintRarity("0");
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
			{showHelp && wallet.connected && <HelpModal onClose={closeHelp} />}

			<div className="flex-grow pb-2">
				{toast && <Toast toast={toast} />}

				<Header wallet={wallet} commitment={commitment} />

				{!wallet.connected ? (
					<div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-mono md:m-12">
						<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
							{warpLines.map((line) => (
								<div
									key={line.id}
									className="absolute bg-white opacity-20 animate-warp-horiz"
									style={{
										height: line.height,
										width: line.width,
										top: line.top,
										left: "110%",
										animationDelay: line.delay,
										animationDuration: line.duration,
									}}
								/>
							))}{" "}
						</div>

						<div className="relative z-10 max-w-xs md:max-w-xl lg:max-w-2xl w-full mx-4 animate-vibrate flex items-center">
							<div className="absolute -left-28 top-1/2 -translate-y-1/2 w-28 h-32 pointer-events-none flex items-center justify-end overflow-hidden">
								<div
									className="h-16 bg-white opacity-90 animate-flame-fast"
									style={{
										clipPath: "polygon(100% 0%, 0% 50%, 100% 100%, 80% 50%)",
										width: "40px",
									}}
								></div>

								<div
									className="h-24 bg-white opacity-30 animate-flame-slow"
									style={{
										clipPath: "polygon(100% 0%, 0% 50%, 100% 100%, 70% 50%)",
										width: "20px",
									}}
								></div>
							</div>
							<div className="absolute -right-20 top-0 bottom-0 w-20 bg-white border-l-4 border-y border-r border-black z-20"></div>

							<div className="bg-white border border-black relative w-full overflow-hidden shadow-[4px_8px_0px_0px_#27272a]">
								<div className="absolute top-1 left-0 right-0 flex justify-between px-4 opacity-30">
									{[...Array(12)].map((_, i) => (
										<div key={i} className="w-0.5 h-0.5 bg-black"></div>
									))}
								</div>

								<div className="p-8 md:p-10 md:px-20">
									<h2 className="text-4xl md:text-5xl font-black uppercase leading-[0.8] tracking-tighter">
										<span className="block bg-black text-white p-1 px-2 w-fit">
											FINISH TASK
										</span>
										<span className="block  p-1 px-2 w-fit">OR</span>
										<span className="block bg-black text-white p-1 px-2  w-fit">
											FORFEIT ETH
										</span>
									</h2>

									<div className="flex items-center gap-3">
										<p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">
											Connect Your Wallet To Continue
										</p>
									</div>
								</div>

								<div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 opacity-30">
									{[...Array(12)].map((_, i) => (
										<div key={i} className="w-[2px] h-[2px] bg-black"></div>
									))}
								</div>
							</div>

							<div className="absolute -left-6 top-0 bottom-0 w-6 flex flex-col justify-between py-2">
								<div
									className="h-10 w-full bg-white border border-black"
									style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
								></div>
								<div
									className="h-10 w-full bg-white border border-black"
									style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
								></div>
							</div>

							<div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-16 bg-[#27272a] border border-black"></div>
						</div>
					</div>
				) : (
					<div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
						<div className="flex gap-4 mb-10 border-b border-black pb-4">
							{["student", "verifier", ...(commitment.isOwner ? ["admin"] : [])].map(
								(tab) => (
									<button
										key={tab}
										onClick={() =>
											setActiveTab(tab as "student" | "verifier" | "admin")
										}
										className={`text-sm font-bold uppercase tracking-widest px-4 py-2 border border-black transition-all ${
											activeTab === tab
												? "bg-black text-white shadow-[4px_4px_0px_0px_#888]"
												: "bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
										}`}
									>
										{tab === "student"
											? "Student Dashboard"
											: tab === "verifier"
												? `Verifier Tasks (${commitment.verifierCommitments?.length || 0})`
												: "Admin Panel"}
									</button>
								)
							)}
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
						) : activeTab === "verifier" ? (
							<VerifierView
								tasks={commitment.verifierCommitments || []}
								onVerify={handleVerify}
							/>
						) : (
							<div className="max-w-2xl mx-auto space-y-8 bg-indigo-200 border border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
								<h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block">
									Admin Panel - NFT Testing
								</h2>
								<div className="border border-black bg-white p-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
									<h3 className="text-xl font-bold uppercase mb-6">
										Mint Test NFT
									</h3>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Recipient Address
											</label>
											<input
												type="text"
												value={mintTo}
												onChange={(e) => setMintTo(e.target.value)}
												className={inputClass}
												placeholder="0x..."
											/>
										</div>
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Title
											</label>
											<input
												type="text"
												value={mintTitle}
												onChange={(e) => setMintTitle(e.target.value)}
												className={inputClass}
												placeholder="Achievement Title"
											/>
										</div>
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Description
											</label>
											<textarea
												value={mintDescription}
												onChange={(e) => setMintDescription(e.target.value)}
												className={inputClass}
												rows={3}
												placeholder="Achievement description"
											/>
										</div>
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Rarity
											</label>
											<select
												value={mintRarity}
												onChange={(e) => setMintRarity(e.target.value)}
												className={inputClass}
											>
												<option value="0">Common</option>
												<option value="1">Rare</option>
												<option value="2">Legendary</option>
												<option value="3">Mythic</option>
											</select>
										</div>
										<button
											onClick={handleAdminMint}
											disabled={commitment.loading}
											className={`${btnClass} w-full bg-indigo-400 text-white hover:bg-purple-600`}
										>
											{commitment.loading ? "MINTING..." : "MINT TEST NFT"}
										</button>
									</div>
								</div>
							</div>
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
