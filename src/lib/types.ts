declare global {
	interface Window {
		ethereum?: any;
	}
}

export type StudyState = "idle" | "active" | "complete";
export type QuizStatus = "unanswered" | "correct" | "incorrect";
export type StudyMode = "flashcards" | "quiz";

export interface ToastState {
	type: "success" | "error";
	title: string;
	msg: string;
}

export interface WalletState {
	connected: boolean;
	loading: boolean;
	address: string;
	balance: string;
	connectWallet: () => Promise<void>;
	updateBalance: () => Promise<void>;
}

export interface CommitmentHook {
	loading: boolean;
	commitments: Commitment[];
	verifierCommitments: VerifierTask[];
	pendingAmount: string;

	createCommitment: (goal: string, verifier: string, hours?: number) => Promise<boolean | void>;
	submitProof: (id: string, proof: string) => Promise<boolean | void>;
	loadAllCommitments: () => Promise<void>;
	loadVerifierTasks: () => Promise<void>;
	verifyTask: (id: string, approved: boolean) => Promise<void>;
	checkAndWithdraw: () => Promise<void>;
}

export interface HeaderProps {
	wallet: WalletState;
	commitment: CommitmentHook;
}

export interface ExtendedHeaderProps extends HeaderProps {
	activeTab: string;
	setActiveTab: (tab: "student" | "verifier" | "study") => void;
}

export enum CommitmentStatus {
	Active = 0,
	Submitted = 1,
	Verified = 2,
	Failed = 3,
}

export interface Commitment {
	id: number;
	student: string;
	goal: string;
	stake: string;
	deadline: string;
	status: string;
	rawStatus: CommitmentStatus;
}

export interface VerifierTask {
	id: number;
	goal: string;
	proof: string;
	stake: string;
	student: string;
}

export interface StudentViewProps {
	goal: string;
	setGoal: (val: string) => void;
	verifierAddress: string;
	setVerifierAddress: (val: string) => void;
	hours: string;
	setHours: (val: string) => void;
	handleCreate: () => Promise<void> | void;
	loading: boolean;
	commitments: Commitment[];
	onOpenProof: (commitment: Commitment) => void;
}

export interface CommitmentFormProps {
	goal: string;
	setGoal: (val: string) => void;
	verifierAddress: string;
	setVerifierAddress: (val: string) => void;
	hours: string;
	setHours: (val: string) => void;
	handleCreate: () => Promise<void> | void;
	loading: boolean;
}

export interface CommitmentCardProps {
	c: Commitment;
	onOpenProof: (Commitment: Commitment) => void;
}

export interface VerifierViewProps {
	tasks: VerifierTask[];
	onVerify: (taskId: string, approved: boolean) => Promise<void> | void;
}

export interface VerifierTaskCardProps {
	task: VerifierTask;
	onVerify: (taskId: string, approved: boolean) => Promise<void> | void;
}

export interface AchievementGalleryProps {
	badges: Badge[];
	isOpen: boolean;
	onClose: () => void;
}

export interface Badge {
	id: number;
	title: string;
	date: string;
	icon: React.ReactNode;
	rarity: "Common" | "Rare" | "Legendary";
	description: string;
	unlocked: boolean;
}

export interface Flashcard {
	id: number;
	front: string;
	back: string;
}

export interface QuizItem {
	id: number;
	question: string;
	answer: string;
}

export interface ActiveSessionProps {
	mode: StudyMode;
	items: Flashcard[] | QuizItem[];
	onFinish: (score: number) => void;
	onExit: () => void;
}

export interface SessionResultsProps {
	mode: StudyMode;
	score: number;
	total: number;
	onRestart: () => void;
	onExit: () => void;
}

export interface StudyManagerHook {
	cards: Flashcard[];
	setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
	quizzes: QuizItem[];
	setQuizzes: React.Dispatch<React.SetStateAction<QuizItem[]>>;
	studyState: StudyState;
	setStudyState: (state: StudyState) => void;
	saveItem: (mode: StudyMode, id: number | null, val1: string, val2: string) => boolean;
	deleteItem: (id: number, mode: StudyMode) => void;
}

export interface StudyEditorProps {
	study: StudyManagerHook;
	mode: StudyMode;
	setMode: (mode: StudyMode) => void;
	walletAddress: string;
}
