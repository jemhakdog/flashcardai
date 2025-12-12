import React from 'react';
import { Deck } from '../types';
import { Book, Trash2, Plus, Play, Calendar } from 'lucide-react';

interface LibraryProps {
  decks: Deck[];
  onSelectDeck: (deck: Deck) => void;
  onDeleteDeck: (id: string) => void;
  onCreateNew: () => void;
}

const Library: React.FC<LibraryProps> = ({ decks, onSelectDeck, onDeleteDeck, onCreateNew }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Library</h1>
                <p className="text-slate-500 mt-2">Manage your flashcard decks</p>
            </div>
            <button 
                onClick={onCreateNew}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-100"
            >
                <Plus className="w-4 h-4" /> Create New Deck
            </button>
        </div>

        {decks.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Book className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No decks yet</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload notes or images to generate your first set of flashcards.</p>
                <button 
                    onClick={onCreateNew}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                >
                    Create Deck
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mobile Create Button */}
                <button 
                    onClick={onCreateNew}
                    className="md:hidden flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-indigo-300 transition-all group min-h-[200px]"
                >
                     <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-slate-600">Create New Deck</span>
                </button>

                {decks.map(deck => (
                    <div key={deck.id} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between min-h-[200px]">
                        <div>
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Book className="w-6 h-6" />
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteDeck(deck.id); }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Delete Deck"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{deck.name}</h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Book className="w-3 h-3" /> {deck.cards.length} Cards</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(deck.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => onSelectDeck(deck)}
                            className="mt-6 w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                        >
                            <Play className="w-4 h-4" /> Study Now
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default Library;
