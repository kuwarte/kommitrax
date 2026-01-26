import { ToastState } from "@/lib/types";

export const btnClass =
	"border border-black px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";

export const inputClass =
	"w-full border border-black p-3 bg-white font-mono text-sm focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400";

export const rarityStyles: Record<string, string> = {
	Common: "bg-white shadow-[4px_4px_0px_0px_#888]",
	Rare: "bg-gradient-to-r from-blue-300 via-blue-200 to-blue-400 text-black font-bold shadow-[4px_4px_0px_0px_#516ba1] border-4 border-blue-800",
	Legendary:
		"bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-500 text-black font-bold shadow-[4px_4px_0px_0px_#b58e00] border-4 border-yellow-900 animate-gradient-x bg-[length:200%_200%]",
};

export const Toast = ({ toast }: { toast: ToastState }) => (
	<div
		className={`fixed bottom-6 right-6 z-50 p-4 border border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm ${
			toast.type === "success" ? "bg-[#ccffcc]" : "bg-[#ffcccc]"
		}`}
	>
		<div className="font-black uppercase text-xs mb-1 text-black font-mono">{toast.title}</div>
		<div className="text-sm text-black font-mono">{toast.msg}</div>
	</div>
);
