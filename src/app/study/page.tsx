"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useStudyManager } from "@/hooks/useStudyManager";
import { Toast } from "@/components/ui/brutalist";
import LockedState from "@/components/ui/locked-state";
import ActiveSession from "@/components/ui/active-session";
import SessionResults from "@/components/ui/session-results";
import StudyEditor from "@/components/ui/study-editor";
import { useToast } from "@/hooks/useToast";
import LoadingState from "@/components/ui/loading";

export default function StudyPage() {
	const [mode, setMode] = useState<"flashcards" | "quiz">("flashcards");
	const [lastScore, setLastScore] = useState(0);
	const { toast, showSuccess, showError } = useToast();
	const wallet = useWallet(showError);
	const study = useStudyManager(wallet.address, showError, showSuccess);

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
		</>
	);
}
