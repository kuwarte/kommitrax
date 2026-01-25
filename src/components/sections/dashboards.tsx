import { Commitment, StudentViewProps, VerifierTask, VerifierViewProps } from "@/lib/types";
import { btnClass, inputClass } from "../ui/brutalist";

export const StudentView = ({ goal, setGoal, verifierAddress, setVerifierAddress, hours, setHours, handleCreate, loading, commitments, onOpenProof }: StudentViewProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
    <div className="lg:col-span-1">
      <div className="bg-white border border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-28">
        <div className="bg-black text-white text-xs font-bold uppercase p-1 mb-6 text-center">New Commitment</div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase mb-2">Goal Description</label>
            <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Complete Module 5..." className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-2">Verifier Address</label>
            <input type="text" value={verifierAddress} onChange={(e) => setVerifierAddress(e.target.value)} placeholder="0x..." className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-2">Deadline (Hours)</label>
            <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass} />
          </div>
          <div className="border border-dashed border-green-900 p-3 text-xs bg-green-50">
            <div className="flex justify-between mb-1"><span>STAKE:</span><span className="font-bold">0.01 ETH</span></div>
            <div className="flex justify-between text-gray-500"><span>PLATFORM FEE:</span><span>2%</span></div>
          </div>
          <button onClick={handleCreate} disabled={loading || !goal || !verifierAddress} className={`${btnClass} w-full bg-blue-400/50 text-black border-black`}>
            {loading ? 'PROCESSING...' : 'LOCK STAKE'}
          </button>
        </div>
      </div>
    </div>

    <div className="lg:col-span-2 space-y-6">
      <h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block mb-4">Active Staking</h2>
      {commitments.length === 0 ? (
        <div className="border border-black bg-gray-100 p-12 text-center font-bold text-gray-400 uppercase tracking-widest">No active commitments</div>
      ) : (
        commitments.map((c: Commitment) => (
          <div key={c.id} className="bg-white border border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute top-0 right-0 bg-black text-white text-[10px] px-2 py-1 uppercase font-bold">{c.status}</div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight mb-2">{c.goal}</h3>
                <p className="text-xs text-gray-500 font-mono border-l-2 border-black pl-2">DEADLINE: {c.deadline}</p>
              </div>
              <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase block text-gray-500">Locked Stake</span>
                  <span className="font-black text-lg">{c.stake} ETH</span>
                </div>
                {c.rawStatus === 0 && (
                  <button onClick={() => onOpenProof(c)} className={`${btnClass} py-2 px-4 bg-white hover:bg-black hover:text-white text-xs`}>SUBMIT PROOF</button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export const VerifierView = ({ tasks, onVerify }: VerifierViewProps) => (
  <div className="max-w-4xl mx-auto space-y-8">
    <h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block">Verification Queue</h2>
    {!tasks || tasks.length === 0 ? (
      <div className="border border-black bg-gray-100 p-12 text-center font-bold text-gray-400 uppercase tracking-widest">Queue Empty</div>
    ) : (
      tasks.map((task: VerifierTask) => (
        <div key={task.id} className="bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
            <div>
              <p className="text-xs font-bold bg-blue-400/50 text-black inline-block px-1 mb-2">PROOF SUBMISSION</p>
              <h3 className="text-xl font-bold">{task.goal}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-gray-500">Verifier Fee</p>
              <p className="font-black text-lg">{(parseFloat(task.stake) * 0.01).toFixed(5)} ETH</p>
            </div>
          </div>
          <div className="bg-gray-100 border border-black p-4 mb-8 font-mono text-sm">
            <span className="text-gray-400 select-none">DESCRIPTION/LINK: </span>{task.proof}
          </div>
          <div className="flex gap-4">
            <button onClick={() => onVerify(task.id.toString(), false)} className={`${btnClass} flex-1 bg-[#ffcccc] text-red-900 border-red-900 hover:bg-red-900 hover:text-white`}>REJECT (SLASH)</button>
            <button onClick={() => onVerify(task.id.toString(), true)} className={`${btnClass} flex-1 bg-[#ccffcc] text-green-900 border-green-900 hover:bg-green-900 hover:text-white`}>APPROVE (RELEASE)</button>
          </div>
        </div>
      ))
    )}
  </div>
);
