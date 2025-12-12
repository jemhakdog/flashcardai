import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, Grade } from '../types';
import FlashcardComponent from './Flashcard';
import BatchSummary from './BatchSummary';
import { calculateNextReview } from '../services/srsService';
import { X } from 'lucide-react';

interface StudySessionProps {
  deck: Flashcard[];
  onSessionComplete: (updatedCards: Flashcard[]) => void;
  onExit: () => void;
}

const BATCH_SIZE = 10;

const StudySession: React.FC<StudySessionProps> = ({ deck, onSessionComplete, onExit }) => {
  // --- State ---
  // The full working copy of the deck for this session (updated as we go)
  const [workingDeck, setWorkingDeck] = useState<Flashcard[]>(deck);
  
  // The subset of cards we are currently studying
  const [batchQueue, setBatchQueue] = useState<Flashcard[]>([]);
  
  // Index in the CURRENT BATCH (0 to 9)
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // UI States
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionGrades, setSessionGrades] = useState<Record<string, Grade>>({});

  // --- Initialization ---
  useEffect(() => {
    // Determine due cards or simply take the first N unreviewed/due cards
    // For simplicity of this PRD implementation, we just take the first N cards of the passed deck
    // In a real app, we would sort by `nextReviewDate` first.
    startNewBatch(deck);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const startNewBatch = (sourceDeck: Flashcard[]) => {
    // Find up to 10 cards that need reviewing.
    // Ideally sort by date, but assuming 'deck' is already relevant.
    const nextBatch = sourceDeck.slice(0, BATCH_SIZE);
    
    setBatchQueue(nextBatch);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setSessionGrades({});
  };

  // --- Handlers ---

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = useCallback((grade: Grade) => {
    const currentCard = batchQueue[currentIndex];
    if (!currentCard) return;

    // 1. Calculate SRS update
    const updatedCard = calculateNextReview(currentCard, grade);

    // 2. Update local state maps
    setSessionGrades(prev => ({ ...prev, [currentCard.id]: grade }));

    // 3. Update the Master Deck with the new card data
    const updatedFullDeck = workingDeck.map(c => c.id === updatedCard.id ? updatedCard : c);
    setWorkingDeck(updatedFullDeck);

    // 4. Move to next card or Finish
    if (currentIndex < batchQueue.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // slight delay for feel
    } else {
        // Batch Complete
        // Notify parent of progress so far (optional, but good for safety)
        onSessionComplete(updatedFullDeck);
        setShowSummary(true);
    }
  }, [batchQueue, currentIndex, workingDeck, onSessionComplete]);


  const handleNextBatch = () => {
    // Remove the cards we just finished from the 'queue' perspective to find new ones
    // We filter the workingDeck to find cards NOT in the previous batch (or handled appropriately)
    // Simplified: Just slice the next 10 items from the master array that haven't been touched in this session?
    // Actually, better logic: Remove the finished cards from the "ToDo" pile.
    // Since 'workingDeck' preserves order, let's just shift the window.
    
    // In this simple implementation: remove the completed batch from the top of the deck list 
    // passed to the state logic, assuming the parent handles deck persistence.
    // However, since we track `workingDeck`, let's just find the next set of cards that match the criteria.
    
    // Let's assume we proceed linearly through the deck for this session.
    const currentBatchIds = new Set(batchQueue.map(c => c.id));
    const remainingCards = workingDeck.filter(c => !currentBatchIds.has(c.id));
    
    if (remainingCards.length === 0) {
        // No more cards at all
        onExit(); 
        return;
    }
    
    startNewBatch(remainingCards);
  };

  const handleRetryBatch = () => {
    // Reset the current batch for immediate review (cram mode)
    // We don't change the cards, just reset UI state
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setSessionGrades({});
  };

  // --- Rendering ---

  if (batchQueue.length === 0 && !showSummary) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading Batch...</div>;
  }

  if (showSummary) {
    const currentBatchIds = new Set(batchQueue.map(c => c.id));
    const remainingCards = workingDeck.filter(c => !currentBatchIds.has(c.id));
    
    return (
      <BatchSummary 
        batch={batchQueue}
        grades={sessionGrades}
        onNextBatch={handleNextBatch}
        onRetryBatch={handleRetryBatch}
        onHome={onExit}
        hasMoreCards={remainingCards.length > 0}
      />
    );
  }

  const currentCard = batchQueue[currentIndex];
  const progress = ((currentIndex + 1) / batchQueue.length) * 100;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 relative overflow-hidden">
        
      {/* --- Header --- */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-end gap-1 w-full max-w-xs ml-auto">
            <div className="flex justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Batch Progress</span>
                <span>{currentIndex + 1} / {batchQueue.length}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
      </header>

      {/* --- Stage --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
         <FlashcardComponent 
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
         />
      </main>

      {/* --- Controls --- */}
      <footer className="w-full bg-white border-t border-slate-100 p-6 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-20">
        <div className="max-w-lg mx-auto min-h-[80px] flex items-center">
            {!isFlipped ? (
                 <button 
                    onClick={handleFlip}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-lg tracking-wide shadow-lg shadow-indigo-200 transition-all"
                 >
                    Reveal Answer
                 </button>
            ) : (
                <div className="grid grid-cols-4 gap-3 w-full">
                    <RatingButton 
                        label="Again" 
                        sub="< 1m" 
                        color="bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                        onClick={() => handleRate(Grade.AGAIN)} 
                    />
                    <RatingButton 
                        label="Hard" 
                        sub="1d" 
                        color="bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100" 
                        onClick={() => handleRate(Grade.HARD)} 
                    />
                    <RatingButton 
                        label="Good" 
                        sub="3d" 
                        color="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" 
                        onClick={() => handleRate(Grade.GOOD)} 
                    />
                    <RatingButton 
                        label="Easy" 
                        sub="7d" 
                        color="bg-green-50 text-green-600 border-green-100 hover:bg-green-100" 
                        onClick={() => handleRate(Grade.EASY)} 
                    />
                </div>
            )}
        </div>
      </footer>
    </div>
  );
};

// Helper sub-component for buttons
const RatingButton = ({ label, sub, color, onClick }: { label: string, sub: string, color: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all active:scale-95 ${color}`}
    >
        <span className="font-bold text-sm md:text-base">{label}</span>
        <span className="text-[10px] font-medium opacity-60 uppercase">{sub}</span>
    </button>
);

export default StudySession;
