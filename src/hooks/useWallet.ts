import { ethers } from "ethers";
import { useState, useCallback, useEffect } from "react";

/*
 * useWallet (Hook)
 * - what it do?
 *   - connect to wallet
 *   - update balance
 */

export const useWallet = (showError: (title: string, msg: string) => void) => {
	const [address, setAddress] = useState<string>("");
	const [balance, setBalance] = useState<string>("0");
	const [connected, setConnected] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	/*
	 * Data Fetch for the Balance
	 */
	const updateBalance = useCallback(async () => {
		// ==================================================================
		try {
			// check if ethereum object is injected
			if (typeof window != "undefined" && window.ethereum) {
				// wraps raw connection to make it more unmessy and provide toolset (w/ ethers.js)
				const provider = new ethers.BrowserProvider(window.ethereum);

				// check which blockchain is used
				const network = await provider.getNetwork();

				// check if user is using Sepolia but if not then throw err
				if (Number(network.chainId) !== 11155111) {
					showError("NETWORK ERROR", "Please switch to Sepolia testnet in MetaMask");
					return;
				}

				// req logged user's object
				const signer = await provider.getSigner();

				// req user's eth address
				const userAddress = await signer.getAddress();

				// get user balance with provider with user's eth address
				const userBalance = await provider.getBalance(userAddress);

				// set values
				setAddress(userAddress);
				setBalance(ethers.formatEther(userBalance));
				setConnected(true);
			}

			// =================================================================
		} catch (error) {
			// throw err
			console.error("ERROR UPDATING BALANCE:", error);
			setConnected(false);
		}
	}, [showError]);

	/*
	 * Handles Wallet Handshake
	 **/
	const connectWallet = async () => {
		// load
		setLoading(true);

		// ================================================================
		try {
			// check if the ethereum object is not injected then throw err
			if (!window.ethereum) {
				showError("WALLET ERROR", "Please install MetaMask!");
				return;
			}

			// request the acc available (permission req)
			await window.ethereum.request({ method: "eth_requestAccounts" });

			// ============================================================
			try {
				// make the user switch to Sepolia Network Chain
				await window.ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: "0xaa36a7" }],
				});

				// ============================================================
			} catch (switchError: unknown) {
				if (
					typeof switchError === "object" &&
					switchError !== null &&
					"code" in switchError &&
					(switchError as { code: number }).code === 4902
				) {
					// if user does not have Sepolia
					// req to add Sepolia for users
					await window.ethereum.request({
						method: "wallet_addEthereumChain",
						params: [
							{
								chainId: "0xaa36a7",
								chainName: "Sepolia Testnet",
								rpcUrls: ["https://sepolia.infura.io/v3/"],
								nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
							},
						],
					});
				}
			}

			// if successfully connected then update the balance immediately
			await updateBalance();
			// ==================================================================
		} catch (error) {
			// throw err
			console.error("FAILED TO CONNECT TO WALLET:", error);

			// ==================================================================
		} finally {
			setLoading(false);
		}
	};

	/*
	 * Sync Component to Wallet When updateBalance and Wallet Changes
	 **/
	useEffect(() => {
		// 1. Capture the reference
		const { ethereum } = window;

		if (typeof window !== "undefined" && ethereum) {
			updateBalance();

			const handleAccountsChanged = (accounts: any) => {
				const accountsArray = accounts as string[];
				if (accountsArray.length > 0) updateBalance();
				else {
					setConnected(false);
					setAddress("");
				}
			};

			const handleChainChanged = () => window.location.reload();

			// 2. Use the captured reference
			ethereum.on("accountsChanged", handleAccountsChanged);
			ethereum.on("chainChanged", handleChainChanged);

			return () => {
				// 3. Cleanup using the same reference
				ethereum.removeListener("accountsChanged", handleAccountsChanged);
				ethereum.removeListener("chainChanged", handleChainChanged);
			};
		}
	}, [updateBalance]);

	/*
	 * Reusable Values and Functions
	 **/
	return {
		address,
		balance,
		connected,
		loading,
		updateBalance,
		connectWallet,
	};
};
