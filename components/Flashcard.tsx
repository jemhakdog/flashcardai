import React from 'react';
import { Flashcard as FlashcardType } from '../types';
import { MousePointerClick, RotateCw } from 'lucide-react';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  return (
    <div 
      className="w-full h-full max-w-lg mx-auto cursor-pointer perspective-1000 group"
      onClick={onFlip}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden border-2 border-slate-100">
          <span className="absolute top-6 text-xs font-bold tracking-widest text-slate-400 uppercase">Question</span>
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
              {card.front}
            </h3>
          </div>
          <div className="absolute bottom-6 flex items-center text-slate-400 text-sm gap-2">
            <MousePointerClick className="w-4 h-4" />
            <span>Tap to flip</span>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full bg-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-slate-700">
          <span className="absolute top-6 text-xs font-bold tracking-widest text-slate-400 uppercase">Answer</span>
          <div className="text-center overflow-y-auto max-h-full scrollbar-hide">
            <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
              {card.back}
            </p>
          </div>
          <div className="absolute bottom-6 right-6 text-slate-500">
             <RotateCw className="w-5 h-5 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
