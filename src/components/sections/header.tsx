"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderProps } from "@/lib/types";
import { btnClass } from "../ui/brutalist";
import { useState } from "react";
import { Rocket, Beaker, Cpu } from "lucide-react";
import AchievementGallery from "../ui/achievements";

export default function Header({ wallet, commitment }: HeaderProps) {
  const pathname = usePathname();
  const [showGallery, setShowGallery] = useState<boolean>(false);

  const userBadges = [
  { 
    id: 1, 
    title: "Genesis User", 
    date: "Jan 20, 2026", 
    icon: <Rocket size={30} strokeWidth={2.5} />, 
    rarity: "Common", 
    description: "Successfully initialized the Kommitrax protocol.", 
    unlocked: true 
  },
  { 
    id: 2, 
    title: "Perfect Logic", 
    date: "Jan 22, 2026", 
    icon: <Cpu size={30} strokeWidth={2.5} />, 
    rarity: "Legendary", 
    description: "Calculated a 100% precision score on a lab module.", 
    unlocked: true 
  },
  { 
    id: 3, 
    title: "Lab Rat", 
    date: "---", 
    icon: <Beaker size={30} strokeWidth={2.5} />, 
    rarity: "Rare", 
    description: "Experimented in the Study Lab for over 10 hours.", 
    unlocked: true
  },
];
  const getNavLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `
      text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1
      border border-transparent transition-none flex items-center gap-2
      ${isActive 
        ? "bg-white text-black border-white" 
        : "text-white border-white/30 hover:border-white hover:bg-white hover:text-black"}
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
              className={`${btnClass} bg-white hover:bg-black hover:text-white`}
            >
              {wallet.loading ? "CONNECTING..." : "CONNECT WALLET"}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right leading-none">
                <div className="text-[10px] uppercase font-bold text-gray-400">Balance</div>
                <div className="font-bold">{parseFloat(wallet.balance).toFixed(4)} ETH</div>
              </div>
              <div className="px-3 py-1.5 border bg-white border-black text-xs font-bold">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
              <button
                onClick={commitment.checkAndWithdraw}
                disabled={commitment.loading}
                className={`${btnClass} bg-[#ccffcc] py-2 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]`}
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
                    Achievements <span className="opacity-50">[NFT]</span>
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
    onClose={() => setShowGallery(false)} 
  />
)}
      </>
  );
}
