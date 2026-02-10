"use client";

import { AchievementGalleryProps, Badge } from "@/lib/types";
import { useState, useMemo } from "react";
import { btnClass, rarityStyles } from "./brutalist";

const RARITY_ORDER: Record<string, number> = {
	Mythic: 4,
	Legendary: 3,
	Rare: 2,
	Common: 1,
};

export default function AchievementGallery({
	badges,
	isOpen,
	onClose,
	isLoading,
}: AchievementGalleryProps) {
	const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
	const [sortByRarity, setSortByRarity] = useState<boolean>(true);

	const sortedBadges = useMemo(() => {
		const list = [...badges];
		if (sortByRarity) {
			return list.sort(
				(a, b) => (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0)
			);
		}
		return list.sort((a, b) => b.id - a.id);
	}, [badges, sortByRarity]);

	const TOTAL_SLOTS = 30;
	const emptySlotsCount = Math.max(0, TOTAL_SLOTS - sortedBadges.length);
	const emptySlots = Array(emptySlotsCount).fill(null);

	if (!isOpen) return null;

	return (
		<div
			className="
    fixed inset-0 z-100 
    flex items-end sm:items-center justify-center 
    md:p-0 
    bg-black/40 backdrop-blur-md 
    transition-all duration-300
    animate-in fade-in p-6
  "
		>
			<div className="w-full max-w-2xl bg-white border-4 border-black shadow-[16px_16px_0px_#000] flex flex-col relative animate-in zoom-in-95 duration-200 md:h-[80vh] h-full">
				<div className="p-4 border-b-4 border-black bg-black text-white flex justify-between items-center shrink-0">
					<div className="flex flex-col">
						<h2 className="text-xl font-black uppercase tracking-tighter leading-none">
							Achievement Vault
						</h2>
						<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
							{isLoading
								? "Fetching Blockchain Data..."
								: "Soulbound Achievement NFTs (TestNet Only)"}
						</span>{" "}
					</div>
					<button
						onClick={onClose}
						className="w-10 h-10 text-2xl text-white flex items-center justify-center hover:text-gray-300 transition-colors"
					>
						X
					</button>
				</div>

				<div className="flex-1 overflow-y-auto m-2 p-2 sm:m-4 sm:p-4 border-2 bg-gray-300 border-dashed border-gray-400 custom-scrollbar">
					{isLoading && (
						<div className="absolute inset-0 z-50 bg-gray-300/80 flex flex-col items-center justify-center">
							<div className="w-12 h-12 border-4 animate-spin mb-4 bg-gray-600 text-gray-100 flex items-center justify-center font-black text-3xl cursor-default border-gray-800">
								☐
							</div>
							<p className="text-xs font-black uppercase tracking-widest animate-pulse">
								Syncing with Contract...
							</p>
						</div>
					)}
					<div className="grid grid-cols-5 md:grid-cols-6 gap-2">
						{sortedBadges.map((badge) => (
							<div
								key={badge.id}
								onClick={() => badge.unlocked && setSelectedBadge(badge)}
								className={`
          aspect-square border-2 border-black p-1 flex flex-col items-center justify-center cursor-pointer transition-all
          ${
				badge.unlocked
					? `${rarityStyles[badge.rarity] || "bg-white"} hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
					: "bg-gray-200 grayscale opacity-40 cursor-not-allowed"
			}
        `}
							>
								<span
									className={`${
										badge.rarity === "Legendary"
											? "text-yellow-900"
											: badge.rarity === "Mythic"
												? "text-white"
												: badge.rarity === "Rare"
													? "text-blue-900"
													: ""
									} text-2xl mb-0.5`}
								>
									{badge.icon}
								</span>
								<span
									className={`${
										badge.rarity === "Legendary"
											? "text-yellow-900"
											: badge.rarity === "Mythic"
												? "text-white"
												: badge.rarity === "Rare"
													? "text-blue-950"
													: ""
									} text-[7px] font-black font-mono uppercase text-center`}
								>
									{badge.title}
								</span>{" "}
							</div>
						))}
						{emptySlots.map((_, index) => (
							<div
								key={`empty-${index}`}
								className="aspect-square border-2 border-black/10 border-dashed flex items-center justify-center bg-gray-400/20"
							>
								<div className="w-4 h-4 border border-black/5 rotate-45" />
							</div>
						))}
					</div>
				</div>
				{selectedBadge && (
					<div
						className={`absolute inset-0 z-30 flex items-center justify-center p-4 bg-gray-200 animate-in slide-in-from-bottom-4 duration-300 ${selectedBadge.rarity === "Legendary" ? "bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-500 border-none!" : selectedBadge.rarity === "Mythic" ? "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-800 border-none!" : ""}`}
					>
						<div
							className={`w-full max-w-xs border-4 border-black p-6 space-y-4 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${rarityStyles[selectedBadge.rarity]}`}
						>
							<div
								className={`
		w-20 h-20 mx-auto border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
		${rarityStyles[selectedBadge.rarity]} 
		${
			selectedBadge.rarity === "Mythic"
				? "text-white"
				: selectedBadge.rarity === "Legendary"
					? "text-yellow-900"
					: selectedBadge.rarity === "Rare"
						? "text-blue-900"
						: ""
		}
	`}
							>
								{selectedBadge.icon}
							</div>

							<div>
								<h3
									className={`text-xl font-black uppercase leading-tight ${
										selectedBadge.rarity === "Mythic"
											? "text-white"
											: selectedBadge.rarity === "Legendary"
												? "text-yellow-900"
												: selectedBadge.rarity === "Rare"
													? "text-blue-900"
													: ""
									}`}
								>
									{selectedBadge.title}
								</h3>
								<div
									className={`text-[9px] font-bold text-gray-600 uppercase italic ${selectedBadge.rarity === "Mythic" ? "text-white opacity-80" : ""}`}
								>
									{selectedBadge.address}
								</div>
								<div
									className={`
		inline-block px-2 py-0.5 text-[8px] font-black uppercase mt-1 transition-all
		${
			selectedBadge.rarity === "Mythic"
				? "bg-purple-800 text-white border-none!"
				: selectedBadge.rarity === "Legendary"
					? "bg-yellow-600 text-yellow-950 border-none!"
					: selectedBadge.rarity === "Rare"
						? "bg-blue-800 text-white border-none!"
						: selectedBadge.rarity === "Common"
							? "bg-black text-white border-2 border-black"
							: ""
		}
	`}
								>
									{selectedBadge.rarity}
								</div>{" "}
							</div>

							<p className="text-xs font-bold italic text-gray-800 px-2 leading-relaxed">
								{selectedBadge.description}
							</p>

							<div className="text-[9px] font-bold text-gray-600 uppercase">
								Minted: {selectedBadge.date}
							</div>

							<button
								onClick={() => setSelectedBadge(null)}
								className={`
        ${btnClass} w-full py-2 text-xs text-white transition-colors
        ${
			selectedBadge.rarity === "Mythic"
				? "bg-purple-900 hover:bg-purple-600"
				: selectedBadge.rarity === "Legendary"
					? "bg-yellow-900 hover:bg-yellow-600"
					: selectedBadge.rarity === "Rare"
						? "bg-blue-900 hover:bg-blue-600"
						: "bg-gray-600 hover:bg-gray-500"
		}
    `}
							>
								Return to Gallery
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
