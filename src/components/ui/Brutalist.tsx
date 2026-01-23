export const btnClass = "border border-black px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";

export const inputClass = "w-full border border-black p-3 bg-white font-mono text-sm focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400";

export const Toast = ({ toast }: { toast: any }) => (
  <div className={`fixed bottom-6 right-6 z-50 p-4 border border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm ${
    toast.type === 'success' ? 'bg-[#ccffcc]' : 'bg-[#ffcccc]'
  }`}>
    <div className="font-black uppercase text-xs mb-1">{toast.title}</div>
    <div className="text-sm">{toast.msg}</div>
  </div>
);
