import React from 'react';
import { Flashcard, Grade } from '../types';
import { Trophy, RefreshCcw, ArrowRight, Home } from 'lucide-react';

interface BatchSummaryProps {
  batch: Flashcard[];
  grades: Record<string, Grade>;
  onNextBatch: () => void;
  onRetryBatch: () => void;
  onHome: () => void;
  hasMoreCards: boolean;
}

const BatchSummary: React.FC<BatchSummaryProps> = ({ 
  batch, 
  grades, 
  onNextBatch, 
  onRetryBatch, 
  onHome,
  hasMoreCards 
}) => {
  
  // Calculate Stats
  const total = batch.length;
  const hardCount = Object.values(grades).filter(g => g === Grade.AGAIN || g === Grade.HARD).length;
  const easyCount = Object.values(grades).filter(g => g === Grade.GOOD || g === Grade.EASY).length;
  const accuracy = Math.round((easyCount / total) * 100);

  // Identify cards to review
  const difficultCards = batch.filter(c => grades[c.id] === Grade.AGAIN || grades[c.id] === Grade.HARD);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-6 animate-in fade-in duration-500">
      
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full text-center border border-slate-100">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-8 h-8" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Batch Complete!</h2>
        <p className="text-slate-500 mb-8">You've reviewed {total} cards.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <div className="text-3xl font-bold text-slate-800">{accuracy}%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Accuracy</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <div className="text-3xl font-bold text-orange-600">{difficultCards.length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">To Review</div>
          </div>
        </div>

        {difficultCards.length > 0 && (
          <div className="mb-8 text-left">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Knowledge Gaps</h3>
            <ul className="space-y-2">
              {difficultCards.slice(0, 3).map(card => (
                <li key={card.id} className="flex items-start gap-2 text-slate-700 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <span className="truncate">{card.front}</span>
                </li>
              ))}
              {difficultCards.length > 3 && (
                <li className="text-xs text-slate-400 pl-4">+ {difficultCards.length - 3} more</li>
              )}
            </ul>
          </div>
        )}

        <div className="space-y-3">
           {hasMoreCards && (
            <button 
              onClick={onNextBatch}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
            >
              Start Next Batch <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <button 
            onClick={onRetryBatch}
            className="w-full py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCcw className="w-5 h-5" /> Practice This Batch Again
          </button>
          
          <button 
            onClick={onHome}
            className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchSummary;
