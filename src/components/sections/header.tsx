"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, HeaderProps } from "@/lib/types";
import { btnClass } from "../ui/brutalist";
import { useState, useEffect } from "react";

import {
	Rocket,
	Cpu,
	Target,
	Coins,
	Star,
	Shield,
	Flame,
	Trophy,
	Crown,
	Gem,
	Zap,
	Medal,
	Scroll,
	Compass,
	BookOpen,
	GraduationCap,
	Users,
	Eye,
	Copy,
	Check,
} from "lucide-react";
import AchievementGallery from "../ui/achievements";
import { getNFTContract, NFT_CONTRACT_ADDRESS } from "@/lib/contract";

export default function Header({ wallet, commitment }: HeaderProps) {
	const pathname = usePathname();
	const [showGallery, setShowGallery] = useState<boolean>(false);
	const [userBadges, setUserBadges] = useState<Badge[]>([]);
	const [loadingBadges, setLoadingBadges] = useState<boolean>(false);

	const [copied, setCopied] = useState(false);

	const handleCopyAddress = async () => {
		if (!wallet.address) return;
		try {
			await navigator.clipboard.writeText(wallet.address);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy!", err);
		}
	};

	useEffect(() => {
		if (wallet.connected && wallet.address) {
			loadUserAchievements();
		}
	}, [wallet.connected, wallet.address]);

	const loadUserAchievements = async () => {
		if (!wallet.address) return;

		setLoadingBadges(true);
		try {
			console.log("ATTEMPTING TO GET NFT CONTRACT...");
			const nftContract = await getNFTContract();
			if (!nftContract) {
				console.log("NFT CONTRACT NOT AVAILABLE - CHECK CONTRACT ADDRESS AND NETWORK");
				setUserBadges([]);
				return;
			}

			const allTransferEvents = await nftContract.queryFilter(nftContract.filters.Transfer());

			const mintEvents = allTransferEvents.filter((event: any) => {
				const args = event.args;
				if (!args) return false;

				const from = Array.isArray(args) ? args[0] : args.from;
				const to = Array.isArray(args) ? args[1] : args.to;

				return (
					from === "0x0000000000000000000000000000000000000000" &&
					to?.toLowerCase() === wallet.address!.toLowerCase()
				);
			});

			const tokenIds = mintEvents
				.map((event: any) => {
					const args = event.args;
					return Array.isArray(args) ? args[2] : args?.tokenId;
				})
				.filter((tokenId) => tokenId !== undefined && tokenId !== null);

			if (tokenIds.length === 0) {
				setUserBadges([]);
				return;
			}

			const badges: Badge[] = [];
			for (const tokenId of tokenIds) {
				try {
					const achievement = await nftContract.achievements(tokenId);
					const rarityNames = ["Common", "Rare", "Legendary", "Mythic"];
					const rarity = rarityNames[achievement.rarity] as
						| "Common"
						| "Rare"
						| "Legendary"
						| "Mythic";

					let icon;
					switch (achievement.title) {
						case "Genesis Scholar":
							icon = <Rocket size={30} />;
							break;
						case "Getting Started":
							icon = <BookOpen size={30} />;
							break;
						case "Consistency King":
							icon = <Crown size={30} />;
							break;
						case "Week Warrior":
							icon = <Flame size={30} />;
							break;
						case "Dedicated Learner":
							icon = <GraduationCap size={30} />;
							break;
						case "Scholar":
							icon = <Scroll size={30} />;
							break;
						case "High Roller":
							icon = <Zap size={30} />;
							break;
						case "Master Scholar":
							icon = <Trophy size={30} />;
							break;
						case "Iron Will":
							icon = <Target size={30} />;
							break;
						case "Wealth of Knowledge":
							icon = <Gem size={30} />;
							break;
						case "Legendary Scholar":
							icon = <Cpu size={30} strokeWidth={2.5} />;
							break;
						case "Century Streak":
							icon = <Star size={30} />;
							break;
						case "Knowledge Baron":
							icon = <Coins size={30} />;
							break;
						case "Pioneer":
							icon = <Compass size={30} />;
							break;
						case "Mentor":
							icon = <Users size={30} />;
							break;
						case "Guardian":
							icon = <Shield size={30} />;
							break;
						case "Sage":
							icon = <Eye size={30} />;
							break;
						default:
							icon = <Medal size={30} />;
					}

					badges.push({
						id: Number(tokenId),
						title: achievement.title,
						date: new Date(Number(achievement.mintedAt) * 1000).toLocaleDateString(),
						icon: icon,
						rarity: rarity,
						description: achievement.description,
						unlocked: true,
						address: NFT_CONTRACT_ADDRESS,
					});
				} catch (error) {
					console.warn(`FAILED TO LOAD ACHIEVEMENT ${tokenId}:`, error);
				}
			}

			setUserBadges(badges);
		} catch (error) {
			console.error("FAILED TO LOAD ACHIEVEMENTS:", error);
			console.error("ERROR DETAILS:", error instanceof Error ? error.message : String(error));
			setUserBadges([]);
		} finally {
			setLoadingBadges(false);
		}
	};

	const getNavLinkClass = (href: string) => {
		const isActive = pathname === href;
		return `
      text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1
      border border-transparent transition-none flex items-center gap-2
      ${
			isActive
				? "bg-white text-black border-white"
				: "text-white border-white/30 hover:border-white hover:bg-white hover:text-black"
		}
    `;
	};

	return (
		<>
			<header className="flex flex-col bg-white border-b-2 border-black sticky top-0 z-20">
				<div className="max-w-7xl w-full mx-auto px-4 pt-5 pb-3 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-3xl cursor-default border-2 border-black">
								☐
							</div>
							<div className="flex flex-col">
								<h1 className="text-xl font-black uppercase tracking-tighter leading-none">
									KOMMITRAX
								</h1>
								<span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
									On-Chain Study Commitment & Proof System
								</span>
							</div>
						</div>

						{!wallet.connected ? (
							<button
								onClick={wallet.connectWallet}
								disabled={wallet.loading}
								className={`${btnClass} bg-white hover:bg-black hover:shadow-[2px_2px_0px_#888]! active:shadow-none! hover:text-white`}
							>
								{wallet.loading ? "CONNECTING..." : "CONNECT WALLET"}
							</button>
						) : (
							<div className="flex items-center gap-4">
								<div className="hidden sm:block text-right leading-none">
									<div className="text-[10px] uppercase font-bold text-gray-400">
										Balance
									</div>
									<div className="font-bold">
										{parseFloat(wallet.balance).toFixed(4)} ETH
									</div>
								</div>
								<button
									onClick={handleCopyAddress}
									className="group flex items-center gap-2 px-3 py-1.5 border bg-white border-black text-xs font-bold hover:bg-black hover:text-white transition-colors"
									title="Copy Wallet Address"
								>
									{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
									{copied ? (
										<Check
											size={14}
											strokeWidth={4}
											className="opacity-40 group-hover:opacity-100"
										/>
									) : (
										<Copy
											size={14}
											className="opacity-40 group-hover:opacity-100"
										/>
									)}
								</button>
								<button
									onClick={commitment.checkAndWithdraw}
									disabled={commitment.loading}
									className={`${btnClass} bg-[#ccffcc] py-2 px-4`}
								>
									CLAIM
								</button>
							</div>
						)}
					</div>
				</div>

				{wallet.connected && (
					<div className="w-full bg-black border-t border-black animate-in fade-in slide-in-from-top-1 duration-300">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<nav className="flex items-center justify-between h-8">
								<div className="flex items-center">
									<div className="w-12 mr-3 hidden sm:block"></div>
									<div className="flex gap-1">
										<Link href="/" className={getNavLinkClass("/")}>
											Dashboard
										</Link>
										<Link href="/study" className={getNavLinkClass("/study")}>
											Study Lab
										</Link>
									</div>
								</div>

								<div className="flex items-center">
									<button
										onClick={() => setShowGallery(true)}
										className={getNavLinkClass("#")}
									>
										Achievements{" "}
										<span className="opacity-50">({userBadges.length})</span>
									</button>
								</div>
							</nav>
						</div>
					</div>
				)}
			</header>
			{showGallery && (
				<AchievementGallery
					badges={userBadges}
					isOpen={showGallery}
					isLoading={loadingBadges}
					onClose={() => setShowGallery(false)}
				/>
			)}
		</>
	);
}
