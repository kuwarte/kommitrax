"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useStudyManager } from "@/hooks/useStudyManager";
import { Toast } from "@/components/ui/brutalist";
import LockedState from "@/components/ui/locked-state";
import ActiveSession from "@/components/ui/active-session";
import SessionResults from "@/components/ui/session-results";
import StudyEditor from "@/components/ui/study-editor";
import { useToast } from "@/hooks/useToast";
import LoadingState from "@/components/ui/loading";
import { Timer, Play, Pause, RotateCcw, Minimize2 } from "lucide-react";

export default function StudyPage() {
	const [mode, setMode] = useState<"flashcards" | "quiz">("flashcards");
	const [lastScore, setLastScore] = useState(0);
	const { toast, showSuccess, showError } = useToast();
	const wallet = useWallet(showError);
	const study = useStudyManager(wallet.address, showError, showSuccess);

	const POMODORO_MINUTES = 25;
	const [secondsLeft, setSecondsLeft] = useState(POMODORO_MINUTES * 60);
	const [isRunning, setIsRunning] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const progress = (secondsLeft / (POMODORO_MINUTES * 60)) * 100;

	useEffect(() => {
		if (!isRunning) return;
		const interval = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					setIsRunning(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [isRunning]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (!isRunning) return;

		const interval = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					setIsRunning(false);

					showSuccess("SESSION_COMPLETE", "Time is up! Take a well-deserved break.");

					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isRunning, showSuccess]);

	const resetTimer = () => {
		setIsRunning(false);
		setSecondsLeft(POMODORO_MINUTES * 60);
	};

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	if (study.isLoading) {
		return <LoadingState label="RETRIEVING_DATA" />;
	}
	if (!wallet.connected) {
		return (
			<>
				<LockedState connect={wallet.connectWallet} />
				{toast && <Toast toast={toast} />}
			</>
		);
	}
	const renderView = () => {
		switch (study.studyState) {
			case "active":
				return (
					<ActiveSession
						mode={mode}
						items={mode === "flashcards" ? study.cards : study.quizzes}
						onFinish={(finalScore) => {
							setLastScore(finalScore);
							study.setStudyState("complete");
						}}
						onExit={() => study.setStudyState("idle")}
					/>
				);
			case "complete":
				return (
					<SessionResults
						mode={mode}
						score={lastScore}
						total={mode === "flashcards" ? study.cards.length : study.quizzes.length}
						onRestart={() => study.setStudyState("active")}
						onExit={() => study.setStudyState("idle")}
					/>
				);
			default:
				return (
					<StudyEditor
						study={study}
						mode={mode}
						setMode={setMode}
						walletAddress={wallet.address!}
					/>
				);
		}
	};

	return (
		<>
			{toast && <Toast toast={toast} />}
			{renderView()}
			<div
				ref={containerRef}
				onClick={() => setIsOpen((prev) => !prev)}
				className={`fixed top-6 right-6 z-50 transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] 
					border border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
					${
						isOpen
							? "w-72 p-0"
							: "w-10 h-10 flex items-center justify-center cursor-pointer hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
					}
				`}
			>
				{!isOpen ? (
					<div className="flex flex-col items-center justify-center gap-0.5">
						<Timer className={`w-5 h-5 text-black`} strokeWidth={3} />
					</div>
				) : (
					<div
						className="flex flex-col w-full bg-white"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex justify-between items-center border-b-2 border-black p-3 bg-black text-white">
							<div className="flex items-center gap-2">
								<Timer className="w-4 h-4" />
								<span className="font-bold text-xs font-mono uppercase tracking-widest">
									POMODORO
								</span>
							</div>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsOpen(false);
								}}
								className="hover:text-gray-300 transition-colors"
							>
								<Minimize2 className="w-4 h-4" strokeWidth={2.5} />
							</button>
						</div>

						<div className="p-4 flex flex-col gap-4">
							<div className="relative h-12 border border-black bg-white w-full overflow-hidden group">
								<div
									className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-linear ${
										isRunning ? "bg-blue-400" : "bg-orange-300"
									}`}
									style={{ width: `${progress}%` }}
								/>

								<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

								<div className="absolute inset-0 flex items-center justify-between px-4">
									<span className="font-mono text-2xl font-bold tracking-tight z-10 mix-blend-hard-light text-black">
										{formatTime(secondsLeft)}
									</span>
									<span
										className={`text-[10px] font-bold uppercase border border-black px-1 z-10 bg-white ${isRunning ? "animate-pulse" : ""}`}
									>
										{isRunning ? "Running" : "Paused"}
									</span>
								</div>
							</div>

							<div className="grid grid-cols-4 gap-2">
								<button
									onClick={() => setIsRunning((v) => !v)}
									className={`col-span-3 flex items-center justify-center gap-2 border border-black py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all
										${
											isRunning
												? "bg-white hover:bg-gray-100 text-black"
												: "bg-neutral-800 text-white hover:bg-neutral-600"
										}`}
								>
									{isRunning ? (
										<>
											<Pause className="w-4 h-4 fill-current" />
											<span className="text-xs font-bold uppercase font-mono">
												Pause
											</span>
										</>
									) : (
										<>
											<Play className="w-4 h-4 fill-current" />
											<span className="text-xs font-bold uppercase font-mono">
												Start Focus
											</span>
										</>
									)}
								</button>

								<button
									onClick={resetTimer}
									title="Reset Timer"
									className="col-span-1 flex items-center justify-center border border-black bg-red-500 hover:bg-red-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
								>
									<RotateCcw className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
