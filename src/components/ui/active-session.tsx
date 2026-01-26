"use client";
import { useState } from "react";
import { btnClass } from "@/components/ui/brutalist";
import { ActiveSessionProps, Flashcard, QuizItem, QuizStatus } from "@/lib/types";

export default function ActiveSession({ mode, items, onFinish, onExit }: ActiveSessionProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [quizUserAnswer, setQuizUserAnswer] = useState("");
	const [quizStatus, setQuizStatus] = useState<QuizStatus>("unanswered");

	const total = items.length;
	const progress = ((currentIndex + 1) / total) * 100;
	const currentItem = items[currentIndex];

	const handleNext = () => {
		if (currentIndex + 1 >= total) {
			onFinish(score);
		} else {
			setCurrentIndex((prev) => prev + 1);
			setIsFlipped(false);
			setQuizUserAnswer("");
			setQuizStatus("unanswered");
		}
	};

	const checkQuizAnswer = () => {
		const isCorrect =
			quizUserAnswer.trim().toLowerCase() ===
			(currentItem as QuizItem).answer.trim().toLowerCase();
		if (isCorrect) {
			setScore((s) => s + 1);
			setQuizStatus("correct");
		} else {
			setQuizStatus("incorrect");
		}
	};

	return (
		<div className="min-h-screen bg-[#F0F0F0] font-mono text-black flex flex-col items-center justify-center p-4 relative">
			<div className="absolute top-0 left-0 w-full h-4 bg-white border-b border-black">
				<div
					className="h-full bg-green-400/50 transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>

			<div className="w-full max-w-2xl flex justify-between items-center mb-8">
				<div className="text-xs font-black uppercase tracking-widest bg-black text-white p-2">
					{mode === "flashcards" ? "Flashcard" : "Quiz"}
				</div>
				<div className="font-black text-xl">
					{currentIndex + 1} / {total}
				</div>
				<button
					onClick={onExit}
					className="text-xs font-bold uppercase underline hover:text-zinc-500 px-2"
				>
					Exit
				</button>
			</div>

			<div className="w-full max-w-2xl h-112.5 relative" style={{ perspective: "1000px" }}>
				{mode === "flashcards" ? (
					<div
						className="relative w-full h-full transition-transform duration-500 cursor-pointer"
						style={{
							transformStyle: "preserve-3d",
							transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
						}}
						onClick={() => setIsFlipped(!isFlipped)}
					>
						<div
							className="absolute w-full h-full bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 text-center"
							style={{ backfaceVisibility: "hidden" }}
						>
							<p className="text-xs font-bold text-gray-400 uppercase tracking-widest absolute top-4 left-4">
								Front
							</p>
							<p className="text-3xl font-black uppercase break-words w-full">
								{(currentItem as Flashcard).front}
							</p>
							<p className="text-[10px] font-bold mt-8 text-gray-400 animate-pulse">
								(Click to Flip)
							</p>
						</div>

						<div
							className="absolute w-full h-full bg-black text-white border border-black shadow-[8px_8px_0px_0px_#888] flex flex-col items-center justify-center p-8 text-center"
							style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
						>
							<p className="text-xs font-bold text-white/80 uppercase tracking-widest absolute top-4 left-4">
								Back
							</p>
							<p className="text-2xl font-bold font-mono break-words w-full">
								{(currentItem as Flashcard).back}
							</p>
						</div>
					</div>
				) : (
					<div className="w-full h-full bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col p-8 relative overflow-hidden">
						<div className="flex-1 overflow-y-auto my-4 pr-2 custom-scrollbar">
							<h3 className="text-3xl font-black leading-tight uppercase break-words">
								{(currentItem as QuizItem).question}
							</h3>
						</div>
						<div className="flex-none flex flex-col gap-4 mt-auto pt-4 border-t-2 border-black border-dotted">
							<input
								type="text"
								value={quizUserAnswer}
								onChange={(e) => setQuizUserAnswer(e.target.value)}
								disabled={quizStatus !== "unanswered"}
								onKeyDown={(e) =>
									e.key === "Enter" &&
									quizStatus === "unanswered" &&
									checkQuizAnswer()
								}
								className={`w-full border-2 border-black p-5 text-xl font-bold outline-none transition-all ${quizStatus === "correct" ? "bg-green-100" : quizStatus === "incorrect" ? "bg-red-50" : "bg-[#F0F0F0]"}`}
								placeholder="TYPE ANSWER HERE..."
							/>

							{quizStatus === "unanswered" ? (
								<button
									onClick={checkQuizAnswer}
									disabled={!quizUserAnswer}
									className={`${btnClass} w-full bg-black text-white px-8 py-4`}
								>
									Submit
								</button>
							) : (
								<div
									className={`p-4 border-2 ${quizStatus === "correct" ? "border-green-600 bg-green-50 text-green-800" : "border-red-600 bg-red-50 text-red-800"} font-black uppercase`}
								>
									{quizStatus === "correct"
										? "✓ Correct"
										: `✕ Incorrect. Answer: ${(currentItem as QuizItem).answer}`}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="mt-12 w-full max-w-2xl flex justify-between gap-4">
				<button
					onClick={() => setCurrentIndex((prev) => prev - 1)}
					disabled={currentIndex === 0 || mode === "quiz"}
					className={`${btnClass} flex-1 bg-white disabled:opacity-30`}
				>
					PREV
				</button>
				<button
					onClick={handleNext}
					className={`${btnClass} flex-1 bg-green-500/50 text-black`}
				>
					{currentIndex + 1 === total ? "FINISH" : "NEXT"}
				</button>
			</div>
		</div>
	);
}
