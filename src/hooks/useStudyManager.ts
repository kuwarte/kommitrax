import { useState, useEffect } from "react";
import { Flashcard, QuizItem, StudyState, StudyManagerHook } from "@/lib/types";

export function useStudyManager(
	walletAddress: string | undefined,
	showError: (title: string, msg: string) => void,
	showSuccess: (title: string, msg: string) => void
): StudyManagerHook {
	const [cards, setCards] = useState<Flashcard[]>([]);
	const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
	const [studyState, setStudyState] = useState<StudyState>("idle");
	const [isLoaded, setIsLoaded] = useState(false);

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;

		if (!walletAddress) {
			const connectionGracePeriod = setTimeout(() => {
				setCards([]);
				setQuizzes([]);
				setIsLoaded(false);
				setIsLoading(false);
			}, 2000);

			return () => clearTimeout(connectionGracePeriod);
		}

		const savedData = localStorage.getItem(`kommitrax_${walletAddress}`);
		if (savedData) {
			try {
				const parsed = JSON.parse(savedData) as {
					savedCards?: Flashcard[];
					savedQuizzes?: QuizItem[];
				};
				setCards(parsed.savedCards || []);
				setQuizzes(parsed.savedQuizzes || []);
			} catch (e) {
				console.error("Storage Parse Error:", e);
			}
		}

		setIsLoaded(true);

		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, [walletAddress]);

	useEffect(() => {
		if (isLoaded && walletAddress) {
			localStorage.setItem(
				`kommitrax_${walletAddress}`,
				JSON.stringify({ savedCards: cards, savedQuizzes: quizzes })
			);
		}
	}, [cards, quizzes, isLoaded, walletAddress]);

	const saveItem = (
		mode: "flashcards" | "quiz",
		id: number | null,
		val1: string,
		val2: string
	) => {
		if (!val1 || !val2) {
			showError("Validation Error", "Both fields are required.");
			return false;
		}

		const timestamp = Date.now();
		if (id) {
			if (mode === "flashcards") {
				setCards((prev) =>
					prev.map((i) => (i.id === id ? { ...i, front: val1, back: val2 } : i))
				);
			} else {
				setQuizzes((prev) =>
					prev.map((i) => (i.id === id ? { ...i, question: val1, answer: val2 } : i))
				);
			}
			showSuccess("Updated", "Item modified successfully.");
		} else {
			if (mode === "flashcards") {
				setCards((prev) => [...prev, { id: timestamp, front: val1, back: val2 }]);
			} else {
				setQuizzes((prev) => [...prev, { id: timestamp, question: val1, answer: val2 }]);
			}
			showSuccess("Added", "New item added.");
		}
		return true;
	};

	const deleteItem = (id: number, mode: "flashcards" | "quiz") => {
		if (mode === "flashcards") setCards((prev) => prev.filter((c) => c.id !== id));
		else setQuizzes((prev) => prev.filter((q) => q.id !== id));
		showSuccess("Deleted", "Item removed.");
	};

	return {
		cards,
		setCards,
		quizzes,
		setQuizzes,
		studyState,
		setStudyState,
		saveItem,
		deleteItem,
		isLoading,
	};
}
