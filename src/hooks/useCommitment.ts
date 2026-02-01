import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "@/lib/contract";
import { Commitment, VerifierTask, CommitmentHook } from "@/lib/types";

export const useCommitment = (
	address: string,
	updateBalance: () => Promise<void> | void,
	showSuccess: (title: string, msg: string) => void,
	showError: (title: string, msg: string) => void
): CommitmentHook => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [commitments, setCommitments] = useState<Commitment[]>([]);
	const [verifierCommitments, setVerifierCommitments] = useState<VerifierTask[]>([]);
	const [pendingAmount, setPendingAmount] = useState<string>("0");

	/*
	 * For My Testing Purposes
	 * */
	const checkIsOwner = useCallback(async () => {
		if (!address) return;
		try {
			const contract = await getContract();
			if (!contract) return;
			const owner = await contract.owner();
			setIsOwner(owner.toLowerCase() === address.toLowerCase());
		} catch (error) {
			console.error("FAILED TO CHECK OWNER:", error);
		}
	}, [address]);

	useEffect(() => {
		checkIsOwner();
	}, [checkIsOwner]);

	const STATUS_MAP = ["Active", "Submitted", "Verified", "Failed"];

	/*
	 * Create Commitment Function
	 * - what it do?
	 *   - take @params (goal, verifier, hours which is converted to sec)
	 *   - connect to contract the pay with 0.001 eth
	 */
	const createCommitment = async (goal: string, verifier: string, hours: number = 24) => {
		if (!goal || !verifier) return showError("VALIDATION", "Fill all the fields");

		setLoading(true);

		try {
			const contract = await getContract();
			if (!contract) return;

			const durationSeconds = hours * 3600;
			const tx = await contract.createCommitment(goal, verifier, durationSeconds, {
				value: ethers.parseEther("0.01"),
			});
			await tx.wait();
			showSuccess("SUCCESS", "Commitment locked on-chain!");
			await updateBalance();
			return true;
		} catch (error) {
			const e = error as { reason?: string };
			showError("CONTRACT ERROR", e.reason || "Transaction Failed");
		} finally {
			setLoading(false);
		}
	};

	/*
	 * Submit Proof Function
	 * - what it do?
	 *   - take @params (id, proof)
	 *   - submit the proof to the verifier
	 */
	const submitProof = async (id: string, proof: string) => {
		setLoading(true);

		try {
			const contract = await getContract();
			if (!contract) return;

			const tx = await contract.submitProof(BigInt(id), proof);
			await tx.wait();
			showSuccess("SUCCESS", "Proof submitted for review");
			return true;
		} catch (error) {
			const e = error as { reason?: string };
			showError("SUBMISSION ERROR", e.reason || "Check if deadline passed");
		} finally {
			setLoading(false);
		}
	};

	/*
	 * Load All Commitments Function
	 * - what it do?
	 *   - take @params (none)
	 *   - iterate not deleted and existing commitments
	 */
	const loadAllCommitments = useCallback(async () => {
		if (loading) return;

		try {
			const contract = await getContract();
			if (!contract) return;

			const countResult = await contract.commitmentCount();
			const count = Number(countResult);

			if (count === 0) {
				setCommitments([]);
				return;
			}

			const list = [];
			for (let i = 0; i < count; i++) {
				try {
					const c = await contract.getCommitment(i);
					list.push({
						id: i,
						student: c.student,
						goal: c.goal,
						stake: ethers.formatEther(c.stake),
						deadline: new Date(Number(c.deadline) * 1000).toLocaleString(),
						status: STATUS_MAP[Number(c.status)],
						rawStatus: Number(c.status),
					});
				} catch (innerError) {
					console.warn(`FAILED TO FETCH ID ${i}`);
					continue;
				}
			}
			setCommitments(list.reverse());
		} catch (error) {
			console.error("CONTRACT CALL FAILED. ARE YOU ON THE RIGHT NETWORK?", error);
		}
	}, [address]);

	/*
	 * Load All Verifier Task Function
	 * - what it do?
	 *   - take @params (none)
	 *   - iterate not deleted and existing proofs with Status.Submitted
	 */
	const loadVerifierTasks = async () => {
		setLoading(true);

		try {
			const contract = await getContract();
			if (!contract) return;

			const count = Number(await contract.commitmentCount());
			const tasks = [];

			for (let i = 0; i < count; i++) {
				try {
					const c = await contract.getCommitment(i);
					if (
						c.verifier.toLowerCase() === address.toLowerCase() &&
						Number(c.status) === 1
					) {
						tasks.push({
							id: i,
							goal: c.goal,
							proof: c.proof,
							stake: ethers.formatEther(c.stake),
							student: c.student,
						});
					}
				} catch (e) {
					continue;
				}
			}
			setVerifierCommitments(tasks);
		} finally {
			setLoading(false);
		}
	};

	/*
	 * Verify Proofs Function
	 * - what it do?
	 *   - take @params (id, approved => the decision)
	 *   - approves or rejects will be sent here
	 */
	const verifyTask = async (id: string, approved: boolean) => {
		setLoading(true);
		try {
			const contract = await getContract();
			if (!contract) return;
			const tx = await contract.verifyCommitment(id, approved);
			await tx.wait();
			showSuccess("VERIFIED", approved ? "Stake released to student" : "Student penalized");
			await loadVerifierTasks();
		} catch (error) {
			const e = error as { reason?: string };
			showError("VERIFICATION ERROR", e.reason || "Action failed");
		} finally {
			setLoading(false);
		}
	};

	/*
	 * Withdraw Pending Function
	 * - what it do?
	 *   - take @params (none)
	 *   - pending returns (due to failure of transac) that can be withdraw
	 */
	const checkAndWithdraw = async () => {
		setLoading(true);
		try {
			const contract = await getContract();
			if (!contract) return;

			const amount = await contract.pendingWithdrawals(address);
			if (!amount || BigInt(amount) === BigInt(0)) {
				showError("EMPTY", "No pending funds to withdraw");
				return;
			}

			const tx = await contract.withdrawPending();
			await tx.wait();
			showSuccess("WITHDRAWN", `${ethers.formatEther(amount)} ETH sent to your wallet`);
			await updateBalance();
		} catch (error) {
			const e = error as { reason?: string };
			showError("WITHDRAW ERROR", e.reason || "Failed to claim");
		} finally {
			setLoading(false);
		}
	};

	const adminMint = async (to: string, title: string, description: string, rarity: number) => {
		setLoading(true);
		try {
			const contract = await getContract();
			if (!contract) return;
			const tx = await contract.adminMint(to, title, description, rarity);
			await tx.wait();
			showSuccess(
				"MINTED - RESTART YOUR BROWSER TO LOAD!",
				`NFT: "${title}" minted successfully!`
			);
		} catch (error) {
			const e = error as { reason?: string };
			showError("MINT ERROR", e.reason || "Failed to mint NFT");
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		commitments,
		verifierCommitments,
		pendingAmount,
		isOwner,
		createCommitment,
		submitProof,
		loadAllCommitments,
		loadVerifierTasks,
		verifyTask,
		checkAndWithdraw,
		adminMint,
	};
};
