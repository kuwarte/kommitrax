"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { btnClass, Toast } from "@/components/ui/brutalist";
import { Flashcard, QuizItem, ToastState } from "@/lib/types"; 
import Link from "next/link";



type StudyState = "idle" | "active" | "complete";
type QuizStatus = "unanswered" | "correct" | "incorrect";

export default function StudyPage() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showSuccess = useCallback((title: string, msg: string) => {
    setToast({ type: 'success', title, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const showError = useCallback((title: string, msg: string) => {
    setToast({ type: 'error', title, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const wallet = useWallet(showError);
  const walletAddress = wallet.address;

  const [mode, setMode] = useState<"flashcards" | "quiz">("flashcards");
  const [studyState, setStudyState] = useState<StudyState>("idle");
  
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0); 
  
  const [isFlipped, setIsFlipped] = useState(false); 

  const [quizUserAnswer, setQuizUserAnswer] = useState("");
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("unanswered");

  useEffect(() => {
    if (typeof window === "undefined" || !walletAddress) return;
    const savedData = localStorage.getItem(`kommitrax_${walletAddress}`);
    if (savedData) {
      try {
        const { savedCards, savedQuizzes } = JSON.parse(savedData);
        if (savedCards) setCards(savedCards);
        if (savedQuizzes) setQuizzes(savedQuizzes);
      } catch (e) { console.error("Storage parse error", e); }
    }
    setIsLoaded(true);
  }, [walletAddress]);

  useEffect(() => {
    if (!isLoaded || !walletAddress) return;
    const data = JSON.stringify({ savedCards: cards, savedQuizzes: quizzes });
    localStorage.setItem(`kommitrax_${walletAddress}`, data);
  }, [cards, quizzes, walletAddress, isLoaded]);

  const handleSaveItem = () => {
    if (!input1 || !input2) {
      showError("Validation Error", "Both fields are required.");
      return;
    }
    const timestamp = Date.now();

    if (editingId) {
      if (mode === "flashcards") {
        setCards(prev => prev.map(item => item.id === editingId ? { ...item, front: input1, back: input2 } : item));
      } else {
        setQuizzes(prev => prev.map(item => item.id === editingId ? { ...item, question: input1, answer: input2 } : item));
      }
      setEditingId(null);
      showSuccess("Updated", "Item modified successfully.");
    } else {
      if (mode === "flashcards") {
        setCards(prev => [...prev, { id: timestamp, front: input1, back: input2 }]);
      } else {
        setQuizzes(prev => [...prev, { id: timestamp, question: input1, answer: input2 }]);
      }
      showSuccess("Added", "New item added to stack.");
    }
    setInput1(""); setInput2("");
  };

  const handleEdit = (id: number, val1: string, val2: string) => {
    setEditingId(id);
    setInput1(val1);
    setInput2(val2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setInput1("");
    setInput2("");
  }

  const startStudy = () => {
    if ((mode === "flashcards" && cards.length === 0) || (mode === "quiz" && quizzes.length === 0)) return;
    setStudyState("active");
    setCurrentIndex(0);
    setScore(0); 
    resetCardState();
  };

  const resetCardState = () => {
    setIsFlipped(false);
    setQuizUserAnswer("");
    setQuizStatus("unanswered");
  };

  const nextItem = () => {
    const total = mode === "flashcards" ? cards.length : quizzes.length;
    if (currentIndex + 1 >= total) {
      setStudyState("complete");
    } else {
      setCurrentIndex(prev => prev + 1);
      resetCardState();
    }
  };

  const checkQuizAnswer = () => {
    const currentQuiz = quizzes[currentIndex];
    if (!currentQuiz) return;
    
    const isCorrect = quizUserAnswer.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase();
    
    if (isCorrect) {
        setScore(prev => prev + 1);
        setQuizStatus("correct");
    } else {
        setQuizStatus("incorrect");
    }
  };

  const exitStudy = () => {
    setStudyState("idle");
    setCurrentIndex(0);
    setScore(0);
    resetCardState();
  };


  if (!wallet.connected) {
    return (
      <>
        {toast && <Toast toast={toast} />}
        <LockedState connect={wallet.connectWallet} />
      </>
    );
  }

  if (studyState === "active") {
    const total = mode === "flashcards" ? cards.length : quizzes.length;
    const progress = ((currentIndex + 1) / total) * 100;
    const currentCard = cards[currentIndex];
    const currentQuiz = quizzes[currentIndex];

    return (
      <div className="min-h-screen bg-[#F0F0F0] font-mono text-black flex flex-col items-center justify-center p-4 relative">
        {toast && <Toast toast={toast} />}
        <div className="absolute top-0 left-0 w-full h-4 bg-white border-b border-black">
          <div className="h-full bg-green-400/50 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="w-full max-w-2xl flex justify-between items-center mb-8">
          <div className="text-xs font-black uppercase tracking-widest bg-black text-white p-2">
            {mode === "flashcards" ? "Flashcard Mode" : "Quiz Mode"}
          </div>
          <div className="flex gap-4 items-center">
            <div className="font-black text-xl">
                {currentIndex + 1} / {total}
            </div>
          </div>
          <button onClick={exitStudy} className="text-xs font-bold uppercase underline hover:text-zinc-500 px-2">
            Exit Session
          </button>
        </div>

        <div className="w-full max-w-2xl h-[450px] relative" style={{ perspective: "1000px" }}>
          
          {mode === "flashcards" ? (
            <div 
              className="relative w-full h-full transition-transform duration-500 cursor-pointer"
              style={{ 
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className="absolute w-full h-full bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest absolute top-4 left-4">Front</p>
                <p className="text-3xl font-black uppercase break-words w-full">{currentCard?.front}</p>
                <p className="text-[10px] font-bold mt-8 text-gray-400 animate-pulse">(Click to Flip)</p>
              </div>

              <div 
                className="absolute w-full h-full bg-black text-white border border-black shadow-[8px_8px_0px_0px_#888] flex flex-col items-center justify-center p-8 text-center"
                style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)" 
                }}
              >
                <p className="text-xs font-bold text-white/80 uppercase tracking-widest absolute top-4 left-4">Back</p>
                <p className="text-2xl font-bold font-mono break-words w-full">{currentCard?.back}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col p-8 relative overflow-hidden">
      
              <div className="flex justify-between items-start gap-4 mb-2 flex-none">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Question
                </p>
                <span className="text-[10px] font-black uppercase bg-green-400/50 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                  Score: {score}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto my-4 pr-2 custom-scrollbar">
                <h3 className="text-3xl font-black leading-tight uppercase break-words">
                  {currentQuiz?.question}
                </h3>
              </div>

              <div className="flex-none flex flex-col gap-4 mt-auto pt-4 border-t-2 border-black border-dotted">
                
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest">Your Answer:</p>
                  <input
                    type="text"
                    value={quizUserAnswer}
                    onChange={(e) => setQuizUserAnswer(e.target.value)}
                    disabled={quizStatus !== "unanswered"}
                    onKeyDown={(e) => e.key === 'Enter' && quizStatus === "unanswered" && checkQuizAnswer()}
                    className={`w-full border-2 border-black p-5 text-xl font-bold outline-none transition-all
                      ${quizStatus === "correct" ? "bg-green-100 border-green-600 text-green-800" : ""}
                      ${quizStatus === "incorrect" ? "bg-red-50 border-red-600 text-red-800" : "bg-[#F0F0F0] focus:bg-white focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}
                    `}
                    placeholder="TYPE ANSWER HERE..."
                  />
                </div>

                <div className="flex flex-col">
                  {quizStatus === "unanswered" ? (
                    <button
                      onClick={checkQuizAnswer}
                      disabled={!quizUserAnswer}
                      className={`${btnClass} w-full bg-black text-white px-8 py-4 font-black uppercase shadow-[4px_4px_0px_#888]! hover:shadow-[2px_2px_0px_#888]! active:shadow-[0px_0px_0px_#888]! disabled:opacity-50 transition-all hover:bg-green-500 hover:text-black`}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className={`p-5 border-4 ${quizStatus === 'correct' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'} animate-in zoom-in-95 duration-200`}>
                      {quizStatus === "correct" ? (
                        <div className="flex items-center gap-3 text-green-700 font-black uppercase">
                          <span className="text-2xl font-black">✓</span>
                          <div className="flex flex-col">
                            <span className="text-[10px] tracking-widest leading-none">Status</span>
                            <span className="text-xl font-black">Correct</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3 text-red-600 font-black uppercase mb-2">
                            <span className="text-2xl font-black">✕</span>
                            <span className="text-xl font-black">Incorrect</span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Correct Answer:</p>
                          <p className="text-lg font-black text-black bg-white border-2 border-black px-2 py-1 inline-block self-start">
                            {currentQuiz?.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>     
          )}
        </div>

        <div className="mt-12 w-full max-w-2xl flex justify-between gap-4">
           <button 
             onClick={() => {
                if(currentIndex > 0) {
                    setCurrentIndex(prev => prev - 1); 
                    resetCardState();
                }
             }}
             disabled={currentIndex === 0 || mode === "quiz"}
             className={`${btnClass} flex-1 bg-white disabled:opacity-30 disabled:cursor-not-allowed`}
           >
             PREV
           </button>
           
           <button 
             onClick={nextItem}
             className={`${btnClass} flex-1 bg-green-500/50 text-black`}
           >
             {currentIndex + 1 === total ? "FINISH" : "NEXT"}
           </button>
        </div>
      </div>
    );
  }

  if (studyState === "complete") {
     const total = mode === "flashcards" ? cards.length : quizzes.length;
     const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

     return (
        <div className="min-h-screen bg-[#F0F0F0] font-mono flex items-center justify-center p-4">
           {toast && <Toast toast={toast} />}
           <div className="bg-white border border-black p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
              <h2 className="text-4xl text-gray-900 font-extrabold uppercase mb-8 italic">Session Complete</h2>
              
              {mode === "quiz" ? (
                  <div className="mb-8 border border-black p-4 bg-gray-50">
                      <p className="text-xs font-bold uppercase text-gray-900 mb-2">Final Analysis</p>
                      <p className="text-5xl font-black text-green-800 mb-1">{score} / {total}</p>
                      <p className="text-sm font-bold text-black uppercase tracking-widest">({percentage}% Accuracy)</p>
                  </div>
              ) : (
                  <p className="mb-8 font-bold text-gray-900 border border-black p-4 bg-gray-50 uppercase">
                    Reviewed {total} cards
                  </p>
              )}

              <div className="flex flex-col gap-4">
                  <button onClick={() => startStudy()} className={`${btnClass} bg-red-400/50 text-black`}>RESTART SESSION</button>
                  <button onClick={exitStudy} className={`${btnClass} bg-white text-black`}>RETURN TO EDITOR</button>
              </div>
           </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-mono text-black selection:bg-black selection:text-white">
      {toast && <Toast toast={toast} />}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 pb-24">
        
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-black pb-6 gap-6">
          <div>
            <Link href="/" className="text-xs font-bold uppercase underline hover:text-zinc-500 mb-2 block">{"To Dashboard"}</Link>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-[0.9]">
              Study Lab
            </h1>
            <p className="text-xs border border-black font-bold mt-2 font-mono bg-white text-black inline-block px-2 py-1">
              USR: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          
          <div className="flex gap-4">
            {(["flashcards", "quiz"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                   setMode(m);
                   setEditingId(null);
                   setInput1("");
                   setInput2("");
                }}
                className={`text-sm font-bold uppercase tracking-widest px-6 py-3 border border-black transition-all ${
                  mode === m 
                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_#888] translate-x-[-2px] translate-y-[-2px]' 
                    : 'bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 h-fit bg-white border border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black uppercase underline decoration-black decoration-4 underline-offset-4">
                {editingId ? "Edit Item" : "Data Entry"}
                </h3>
                {editingId && (
                    <button onClick={handleCancelEdit} className="text-xs font-bold text-red-500 uppercase hover:underline">[ CANCEL EDIT ]</button>
                )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">
                  {mode === "flashcards" ? "Front Side" : "Question"}
                </label>
                <input 
                  value={input1} 
                  onChange={(e) => setInput1(e.target.value)}
                  className="w-full border border-black p-4 font-bold bg-[#F0F0F0] focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all" 
                  placeholder="INPUT DATA..." 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">
                  {mode === "flashcards" ? "Back Side" : "Answer"}
                </label>
                <textarea 
                  value={input2} 
                  onChange={(e) => setInput2(e.target.value)}
                  className="w-full border border-black p-4 font-bold bg-[#F0F0F0] focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none h-40 resize-none transition-all" 
                  placeholder="INPUT DATA..." 
                />
              </div>
              <button 
                onClick={handleSaveItem} 
                className={`${btnClass} w-full py-4 bg-black text-white border border-black shadow-[4px_4px_0px_0px_#888]! hover:shadow-[2px_2px_0px_0px_#000]! active:shadow-none! hover:bg-blue-400/50 hover:text-black`}
              >
                {editingId ? "UPDATE ITEM" : "ADD TO STACK"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-blue-400/50 border border-black p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                    <h4 className="font-black uppercase text-xl">Ready to Learn?</h4>
                    <p className="text-xs font-bold uppercase">Buffer: {mode === "flashcards" ? cards.length : quizzes.length} items</p>
                </div>
                <button 
                    onClick={startStudy}
                    disabled={(mode === "flashcards" ? cards.length : quizzes.length) === 0}
                    className="bg-white text-black px-6 py-2 font-bold uppercase hover:bg-black hover:text-white border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Session
                </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {mode === "flashcards" ? (
                cards.map(c => (
                    <CardItemPreview 
                        key={c.id} 
                        card={c} 
                        isEditing={editingId === c.id}
                        onDelete={(id) => {
                          setCards(prev => prev.filter(x => x.id !== id));
                          showSuccess("Deleted", "Card removed from stack.");
                        }} 
                        onEdit={(id, f, b) => handleEdit(id, f, b)}
                    />
                ))
              ) : (
                quizzes.map(q => (
                    <QuizItemPreview 
                        key={q.id} 
                        quiz={q} 
                        isEditing={editingId === q.id}
                        onDelete={(id) => {
                          setQuizzes(prev => prev.filter(x => x.id !== id));
                          showSuccess("Deleted", "Quiz item removed from stack.");
                        }} 
                        onEdit={(id, q, a) => handleEdit(id, q, a)}
                    />
                ))
              )}
              
              {cards.length === 0 && quizzes.length === 0 && (
                <div className="border border-dotted border-gray-300 p-20 text-center select-none">
                   <p className="font-black uppercase tracking-[0.5em] text-gray-300 text-xl">Buffer Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedState({ connect }: { connect: () => void }) {
  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center p-6 font-mono selection:bg-black selection:text-white">
      <div className="border border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full">

        <h2 className="text-6xl font-black text-black  uppercase mb-6 tracking-tighter leading-[0.9]">
          Access <br/>Denied
        </h2>

        <div className="h-1 bg-black w-full mb-8" />

        <p className="font-bold italic text-gray-800 mb-10 uppercase text-xs tracking-widest leading-relaxed">
          The lab is currently encrypted. <br />
          Connect to Sepolia to decrypt.
        </p>

        <button 
          onClick={connect} 
          className={`
            ${btnClass} 
            w-full py-5 text-xl font-black
            bg-blue-400/50 text-black border-2 border-black
            transition-all active:bg-black active:text-white
          `}
        >
          INITIALIZE CONNECTION
        </button>
      </div>
    </div>
  );
}

const limitText = (text: string, limit: number) => {
  if (!text) return ""; 
  return text.length > limit ? text.substring(0, limit) + "..." : text;
};

function CardItemPreview({ card, onDelete, onEdit, isEditing }: { card: Flashcard, isEditing: boolean, onDelete: (id: number) => void, onEdit: (id: number, f: string, b: string) => void }) {
  return (
    <div className={`group bg-white border-b border-black p-4 flex justify-between items-center transition-colors duration-200 
        ${isEditing ? 'bg-gray-200 border-l-4 border-l-black' : 'hover:bg-gray-200'}
    `}>
    <div className="flex-1 min-w-0 mr-4">
          <p className="font-black text-sm uppercase">{limitText(card.front, 40)}</p>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">{limitText(card.back, 30)}</p>
      </div>
      
      <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(card.id, card.front, card.back)} className="text-[10px] font-black uppercase hover:bg-black hover:text-white px-2 py-1 border border-black transition-colors">
            EDIT
        </button>
        <button onClick={() => onDelete(card.id)} className="text-[10px] font-black uppercase hover:bg-red-500 hover:text-white px-2 py-1 border border-black transition-colors">
            X
        </button>
      </div>
    </div>
  );
}

function QuizItemPreview({ quiz, onDelete, onEdit, isEditing }: { quiz: QuizItem, isEditing: boolean, onDelete: (id: number) => void, onEdit: (id: number, q: string, a: string) => void }) {
  return (
    <div className={`group bg-white border-b-2 border-black p-4 flex justify-between items-center transition-colors duration-200 
        ${isEditing ? 'bg-gray-200 border-l-8 border-l-black' : 'hover:bg-gray-100'}
    `}>
      <div className="flex-1 min-w-0 mr-4">
          <p className="font-black text-sm italic truncate">
            Q: {limitText(quiz.question, 40)}
          </p>
          <p className="text-xs text-green-600 font-bold truncate">
            A: {limitText(quiz.answer, 30)}
          </p>
      </div>

      <div className="flex flex-shrink-0 gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(quiz.id, quiz.question, quiz.answer)} className="text-[10px] font-black uppercase hover:bg-black hover:text-white px-2 py-1 border border-black transition-colors">
            EDIT
        </button>
        <button onClick={() => onDelete(quiz.id)} className="text-[10px] font-black uppercase hover:bg-red-500 hover:text-white px-2 py-1 border border-black transition-colors">
            X
        </button>
      </div>
    </div>
  );
}
