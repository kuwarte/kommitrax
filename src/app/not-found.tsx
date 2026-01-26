import Link from "next/link";
import { btnClass } from "@/components/ui/brutalist";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-[#F0F0F0] font-mono flex items-center justify-center p-6">
			<div className="relative max-w-sm w-full">
				<div className="absolute inset-0 translate-x-3 translate-y-3 bg-black" />

				<div className="relative bg-white border-2 border-black p-8 flex flex-col items-center">
					<div className="w-full border-b-2 border-black pb-6 mb-6">
						<h1 className="text-7xl font-black text-black italic leading-none tracking-tighter">
							404
						</h1>
						<p className="text-xs font-black uppercase bg-black text-white inline-block px-2 py-1 mt-2">
							NOT FOUND
						</p>
					</div>

					<div className="mb-8">
						<p className="font-bold uppercase text-xs leading-relaxed text-zinc-800">
							The requested resource is missing or has been moved to a restricted
							sector.
						</p>
					</div>

					<Link
						href="/"
						className={`${btnClass} w-full text-white py-4 text-center bg-gray-800 hover:bg-red-500 active:bg-red-400/50 hover:text-white transition-all uppercase font-black text-sm`}
					>
						Return to Home
					</Link>

					<div className="mt-6 w-full flex justify-between items-center opacity-30">
						<span className="text-[8px] font-bold uppercase">Err_Code: 0x00404</span>
						<div className="flex-1 border-t border-black border-dotted mx-2" />
						<span className="text-[8px] font-bold uppercase">KOMMITRAX</span>
					</div>
				</div>
			</div>
		</div>
	);
}
