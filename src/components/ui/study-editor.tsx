"use client";
import { useState } from "react";
import Link from "next/link";
import { btnClass, inputClass } from "@/components/ui/brutalist";
import { Flashcard, QuizItem, StudyEditorProps } from "@/lib/types";

const limitText = (text: string, limit: number) =>
	text && text.length > limit ? text.substring(0, limit) + "..." : text;

export default function StudyEditor({ study, mode, setMode, walletAddress }: StudyEditorProps) {
	const [input1, setInput1] = useState("");
	const [input2, setInput2] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);

	const [showEntry, setShowEntry] = useState(false);

	const handleSave = () => {
		const success = study.saveItem(mode, editingId, input1, input2);
		if (success) {
			setInput1("");
			setInput2("");
			setEditingId(null);
		}
	};

	const handleEditStart = (id: number, v1: string, v2: string) => {
		setEditingId(id);
		setInput1(v1);
		setInput2(v2);
		setShowEntry(true);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-[#F0F0F0] font-mono text-black px-4 py-10">
			<div className="max-w-7xl mx-auto border border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
				<div className="flex flex-row justify-between items-start md:items-center bg-black text-white p-6 md:py-4 border-black">
					<div>
						<h1 className="text-4xl md:text-5xl font-bold font-mono uppercase tracking-wider leading-none">
							Study Lab
						</h1>
						<p className="flex items-center text-xs border border-black font-bold font-mono px-3 py-1 text-zinc-500">
							<span className=" mr-2">USR:</span>
							<span className="hidden md:inline">
								{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
							</span>
							<span className="inline md:hidden">
								{walletAddress.slice(0, 3)}...{walletAddress.slice(-4)}
							</span>
						</p>
					</div>
					<Link
						href="/"
						className="mt-4 md:mt-0 group flex items-center gap-2 text-xs font-bold uppercase self-start text-gray-300 hover:text-gray-400"
					>
						<span>{"<- Dashboard"}</span>
					</Link>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-zinc-50 border-b-2 border-black p-4 gap-4">
					<div>
						<div className="flex gap-3 items-center">
							<button
								onClick={() => setShowEntry(!showEntry)}
								className="flex items-center text-xs border border-black font-bold font-mono hover:bg-black hover:text-white px-3 py-1 uppercase bg-white"
							>
								<span>{showEntry ? "[ - ] Hide Entry" : "[ + ] New Entry"}</span>
							</button>
						</div>
					</div>
					<div className="flex gap-4">
						{(["flashcards", "quiz"] as const).map((m) => (
							<button
								key={m}
								onClick={() => {
									setMode(m);
									setEditingId(null);
									setInput1("");
									setInput2("");
								}}
								className={`text-sm font-bold uppercase tracking-widest px-6 py-3 border border-black transition-all ${
									mode === m
										? "bg-black text-white shadow-[4px_4px_0px_0px_#888]"
										: "bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
								}`}
							>
								<span className="hidden md:block">{m}</span>
								<span className="block md:hidden">{`${
									m === "flashcards" ? "card" : "quiz"
								}`}</span>
							</button>
						))}
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gray-300 md:p-6 transition-all duration-300 ease-in-out">
					{showEntry && (
						<div className="lg:col-span-5 h-fit bg-white border border-black p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sticky top-8 animate-in fade-in slide-in-from-left-4 duration-200 z-20">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-2xl font-black uppercase underline decoration-black decoration-4 underline-offset-4">
									{editingId ? "Edit Item" : "Data Entry"}
								</h3>

								<div className="flex items-center gap-4">
									{editingId && (
										<button
											onClick={() => {
												setEditingId(null);
												setInput1("");
												setInput2("");
											}}
											className="text-xs font-bold font-mono text-red-500 uppercase hover:underline"
										>
											[ Cancel Edit ]
										</button>
									)}

									<button
										onClick={() => setShowEntry(false)}
										className="lg:hidden text-xs font-bold font-mono text-red-500 uppercase hover:underline"
									>
										[ Close ]
									</button>
								</div>
							</div>{" "}
							<div className="space-y-4">
								<div>
									<label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">
										{mode === "flashcards" ? "Front Side" : "Question"}
									</label>
									<input
										value={input1}
										onChange={(e) => setInput1(e.target.value)}
										className={`${inputClass} w-full border border-black p-4 font-bold bg-[#F0F0F0] focus:bg-white outline-none`}
										placeholder="INPUT DATA..."
									/>
								</div>
								<div>
									<label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">
										{mode === "flashcards" ? "Back Side" : "Answer"}
									</label>
									<textarea
										value={input2}
										onChange={(e) => setInput2(e.target.value)}
										className={`${inputClass} w-full border border-black p-4 font-bold bg-[#F0F0F0] focus:bg-white outline-none h-40 resize-none`}
										placeholder="INPUT DATA..."
									/>
								</div>
								<button
									onClick={handleSave}
									className={`${btnClass} w-full py-4 text-black bg-blue-400/50 active:bg-blue-300/50 border border-black font-black uppercase`}
								>
									{editingId ? "UPDATE ITEM" : "ADD TO STACK"}
								</button>
							</div>
						</div>
					)}

					<div
						className={`${
							showEntry ? "lg:col-span-7" : "lg:col-span-12"
						} flex flex-col gap-4 transition-all duration-300`}
					>
						<div className="bg-blue-400/50 border border-black p-6 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
							<div>
								<h4 className="font-black uppercase text-xl">Ready to Learn?</h4>
								<p className="text-xs font-bold uppercase">
									Buffer:{" "}
									{mode === "flashcards"
										? study.cards.length
										: study.quizzes.length}{" "}
									items
								</p>
							</div>
							<button
								onClick={() => study.setStudyState("active")}
								disabled={
									(mode === "flashcards"
										? study.cards.length
										: study.quizzes.length) === 0
								}
								className="bg-white text-black px-6 py-2 font-bold uppercase hover:bg-black hover:text-white border border-black disabled:opacity-50 disabled:pointer-events-none"
							>
								Start Session
							</button>
						</div>

						<div className="max-h-125 overflow-y-auto pr-2 custom-scrollbar border border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
							{mode === "flashcards"
								? study.cards.map((c: Flashcard) => (
										<div
											key={c.id}
											className={`group bg-white border border-black p-4 flex justify-between items-center hover:bg-gray-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all ${
												editingId === c.id && showEntry
													? "bg-gray-200 border-l-8 border-l-black"
													: ""
											}`}
										>
											<div className="flex-1 min-w-0 mr-4">
												<p className="font-black text-sm uppercase">
													{limitText(c.front, 40)}
												</p>
												<p className="text-xs text-gray-500 truncate">
													{limitText(c.back, 30)}
												</p>
											</div>
											<div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() =>
														handleEditStart(c.id, c.front, c.back)
													}
													className="text-[10px] font-black uppercase hover:bg-black hover:text-white px-2 py-1 border border-black"
												>
													EDIT
												</button>
												<button
													onClick={() =>
														study.deleteItem(c.id, "flashcards")
													}
													className="text-[10px] font-black uppercase hover:bg-red-500 hover:text-white px-2 py-1 border border-black"
												>
													X
												</button>
											</div>
										</div>
									))
								: study.quizzes.map((q: QuizItem) => (
										<div
											key={q.id}
											className={`group bg-white border border-black p-4 flex justify-between items-center hover:bg-gray-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all ${
												editingId === q.id && showEntry
													? "bg-gray-200 border-l-8 border-l-black"
													: ""
											}`}
										>
											<div className="flex-1 min-w-0 mr-4">
												<p className="font-black text-sm italic truncate">
													Q: {limitText(q.question, 40)}
												</p>
												<p className="text-xs text-green-600 font-bold truncate">
													A: {limitText(q.answer, 30)}
												</p>
											</div>
											<div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() =>
														handleEditStart(q.id, q.question, q.answer)
													}
													className="text-[10px] font-black uppercase hover:bg-black hover:text-white px-2 py-1 border border-black"
												>
													EDIT
												</button>
												<button
													onClick={() => study.deleteItem(q.id, "quiz")}
													className="text-[10px] font-black uppercase hover:bg-red-500 hover:text-white px-2 py-1 border border-black"
												>
													X
												</button>
											</div>
										</div>
									))}
							{(mode === "flashcards" ? study.cards.length : study.quizzes.length) ===
								0 && (
								<div className="border border-dotted border-gray-300 p-20 text-center font-black uppercase tracking-[0.5em] text-gray-300 text-xl">
									Buffer Empty
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
