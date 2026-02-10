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
	X,
	Menu,
	ChevronRight,
	Wallet,
} from "lucide-react";
import AchievementGallery from "../ui/achievements";
import { getNFTContract, NFT_CONTRACT_ADDRESS } from "@/lib/contract";

export default function Header({ wallet, commitment }: HeaderProps) {
	const pathname = usePathname();
	const [showGallery, setShowGallery] = useState<boolean>(false);
	const [userBadges, setUserBadges] = useState<Badge[]>([]);
	const [loadingBadges, setLoadingBadges] = useState<boolean>(false);

	const [copied, setCopied] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

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
			const nftContract = await getNFTContract();
			if (!nftContract) {
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
					const rarity = rarityNames[achievement.rarity] as any;

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
      ${isActive ? "bg-white text-black border-white" : "text-white border-white/30 hover:border-white hover:bg-white hover:text-black"}
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
									<span className="hidden md:inline">
										On-Chain Study Commitment & Proof System
									</span>
								</span>
							</div>
						</div>

						{!wallet.connected ? (
							<button
								onClick={wallet.connectWallet}
								disabled={wallet.loading}
								className={`${btnClass} bg-green-400/30 hover:bg-green-400/20`}
							>
								{wallet.loading ? "CONNECTING..." : "CONNECT WALLET"}
							</button>
						) : (
							<div className="flex items-center gap-4">
								<div className="hidden lg:block text-right leading-none">
									<div className="text-[10px] uppercase font-bold text-gray-400">
										Balance
									</div>
									<div className="font-bold">
										{parseFloat(wallet.balance).toFixed(4)} ETH
									</div>
								</div>

								<div className="flex items-center gap-2">
									<button
										onClick={handleCopyAddress}
										className="hidden group lg:flex items-center gap-2 px-2 py-1.5 border bg-white border-black text-[10px] sm:text-xs font-bold hover:bg-black hover:text-white transition-colors"
									>
										{wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
										{copied ? (
											<Check size={12} strokeWidth={4} />
										) : (
											<Copy size={12} />
										)}
									</button>

									<button
										onClick={commitment.checkAndWithdraw}
										disabled={commitment.loading}
										className={`${btnClass} hidden lg:block bg-white py-1.5 px-4 shrink-0 text-xs`}
									>
										CLAIM
									</button>

									<button
										onClick={() => setIsMenuOpen(!isMenuOpen)}
										className="p-1.5 border border-black text-black lg:hidden shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
									>
										{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				{wallet.connected && isMenuOpen && (
					<div className="sm:hidden bg-black border-t border-black animate-in slide-in-from-top-2 duration-200">
						<nav className="flex flex-col p-4 gap-2">
							<div className="flex flex-col gap-2 bg-zinc-100 p-4">
								<div className="p-3 border border-black bg-zinc-50 flex flex-col gap-1">
									<button
										onClick={handleCopyAddress}
										className="flex items-center justify-between text-[10px] font-bold mt-1 bg-white border border-black p-1 px-2 active:bg-black active:text-white"
									>
										{wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
										{copied ? <Check size={10} /> : <Copy size={10} />}
									</button>
									<div className="flex justify-between items-center">
										<span className="text-xs font-black">
											BAL: {parseFloat(wallet.balance).toFixed(4)} ETH
										</span>
									</div>
								</div>
								<button
									onClick={commitment.checkAndWithdraw}
									className="mb-4 w-full bg-white text-black border border-black py-2 font-black uppercase tracking-widest active:translate-y-0.5 transition-all shadow-[0px_4px_0px_#000] active:shadow-none"
								>
									CLAIM
								</button>
							</div>

							<Link
								href="/"
								onClick={() => setIsMenuOpen(false)}
								className="flex border border-white/30 text-white justify-between items-center p-3  font-black uppercase text-sm active:bg-white active:text-black"
							>
								Dashboard <ChevronRight size={16} />
							</Link>
							<Link
								href="/study"
								onClick={() => setIsMenuOpen(false)}
								className="flex border border-white/30 text-white justify-between items-center p-3  font-black uppercase text-sm active:bg-white active:text-black"
							>
								Study Lab <ChevronRight size={16} />
							</Link>
							<button
								onClick={() => {
									setShowGallery(true);
									setIsMenuOpen(false);
								}}
								className="flex border border-white/30 text-white justify-between items-center p-3  font-black uppercase text-sm active:bg-white active:text-black"
							>
								<span>
									Achievements
									<span className="text-white/30"> ({userBadges.length})</span>
								</span>
								<ChevronRight size={16} />
							</button>
						</nav>
					</div>
				)}

				{wallet.connected && (
					<div className="hidden md:block w-full bg-black border-t border-black">
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
