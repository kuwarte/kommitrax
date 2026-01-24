declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface ToastState {
  type: 'success' | 'error';
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

export enum CommitmentStatus {
  Active = 0,
  Submitted = 1,
  Verified = 2,
  Failed = 3
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

export interface VerifierViewProps {
  tasks: VerifierTask[];
  onVerify: (taskId: string, approved: boolean) => Promise<void> | void;
}
