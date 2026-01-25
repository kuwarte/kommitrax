"use client";

import { Badge } from "@/lib/types";
import { useState } from "react";
import { btnClass } from "./brutalist";

interface AchievementGalleryProps {
  badges: Badge[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementGallery({ badges, isOpen, onClose }: AchievementGalleryProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (!isOpen) return null;

  const rarityStyles: Record<string, string> = {
    Common: "bg-white",
    Rare: "bg-blue-200",
    Legendary: "bg-yellow-400",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[16px_16px_0px_#000] flex flex-col relative animate-in zoom-in-95 duration-200 min-h-[85vh]">
        
        <div className="p-4 border-b-4 border-black bg-black text-white flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Achievement Vault</h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Proofs (Fake NFT Sample Only)</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 text-2xl text-white flex items-center justify-center hover:text-gray-300 transition-colors"
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[#f0f0f0] custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => badge.unlocked && setSelectedBadge(badge)}
                className={`
                  aspect-square border-2 border-black p-1 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${badge.unlocked 
                    ? `${rarityStyles[badge.rarity] || 'bg-white'} hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` 
                    : "bg-gray-200 grayscale opacity-40 cursor-not-allowed"}
                `}
              >
                <span className="text-xl mb-0.5">{badge.icon}</span>
                <span className="text-[8px] font-black uppercase text-center leading-none truncate w-full px-0.5">
                  {badge.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {selectedBadge && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-white/95 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-full max-w-xs border-4 border-black p-6 space-y-4 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className={`w-20 h-20 mx-auto border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${rarityStyles[selectedBadge.rarity]}`}>
                {selectedBadge.icon}
              </div>
              
              <div>
                <h3 className="text-xl font-black uppercase leading-tight">{selectedBadge.title}</h3>
                <div className="inline-block px-2 py-0.5 border-2 border-black text-[8px] font-black uppercase bg-black text-white mt-1">
                  {selectedBadge.rarity}
                </div>
              </div>

              <p className="text-xs font-bold italic text-gray-600 px-2 leading-relaxed">
                {selectedBadge.description}
              </p>
              
              <div className="text-[9px] font-bold text-gray-400 uppercase">Minted: {selectedBadge.date}</div>

              <button 
                onClick={() => setSelectedBadge(null)}
                className={`${btnClass} w-full bg-black text-white py-2 text-xs hover:bg-red-500`}
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
