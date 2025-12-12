import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import StudySession from './components/StudySession';
import Library from './components/Library';
import { generateFlashcards } from './services/geminiService';
import { Deck, Flashcard } from './types';
import { BrainCircuit, Book, Plus } from 'lucide-react';

const LIBRARY_STORAGE_KEY = 'smart_flashcards_library';
const LEGACY_STORAGE_KEY = 'smart_flashcards_deck';

type ViewState = 'upload' | 'library' | 'study';

const App: React.FC = () => {
  const [library, setLibrary] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<ViewState>('upload');

  // Load from local storage on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem(LIBRARY_STORAGE_KEY);
    
    if (savedLibrary) {
      try {
        const parsedLibrary = JSON.parse(savedLibrary);
        if (Array.isArray(parsedLibrary) && parsedLibrary.length > 0) {
            setLibrary(parsedLibrary);
            setView('library'); // Default to library if decks exist
            return;
        }
      } catch (e) {
        console.error("Failed to parse library", e);
      }
    }

    // Migration Check: If no library, check for legacy single deck
    const legacyDeck = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyDeck) {
        try {
            const parsedDeck = JSON.parse(legacyDeck);
            if (parsedDeck && parsedDeck.cards) {
                const newLibrary = [parsedDeck];
                setLibrary(newLibrary);
                saveLibrary(newLibrary);
                setView('library');
                // Optional: localStorage.removeItem(LEGACY_STORAGE_KEY);
            }
        } catch (e) {
            console.error("Failed to migrate legacy deck", e);
        }
    }
  }, []);

  const saveLibrary = (decks: Deck[]) => {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(decks));
  };

  const handleGenerate = async (text: string, images: File[], apiKey: string) => {
    setIsGenerating(true);
    try {
      const newDeck = await generateFlashcards(text, images, apiKey);
      
      // Add to library at the beginning
      const updatedLibrary = [newDeck, ...library];
      setLibrary(updatedLibrary);
      saveLibrary(updatedLibrary);
      
      // Start studying immediately
      setActiveDeck(newDeck);
      setView('study');
    } catch (error) {
      console.error(error);
      alert("Failed to generate flashcards. Please check your API Key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionComplete = (updatedCards: Flashcard[]) => {
    if (!activeDeck) return;

    // Merge updated cards back into the active deck
    const updatedMap = new Map(updatedCards.map(c => [c.id, c]));
    const newCards = activeDeck.cards.map(original => 
        updatedMap.has(original.id) ? updatedMap.get(original.id)! : original
    );

    const updatedDeck = { ...activeDeck, cards: newCards };
    setActiveDeck(updatedDeck);

    // Update the deck in the library
    const updatedLibrary = library.map(d => d.id === updatedDeck.id ? updatedDeck : d);
    setLibrary(updatedLibrary);
    saveLibrary(updatedLibrary);
  };

  const handleDeleteDeck = (id: string) => {
      if (confirm("Are you sure you want to delete this deck?")) {
          const updatedLibrary = library.filter(d => d.id !== id);
          setLibrary(updatedLibrary);
          saveLibrary(updatedLibrary);
      }
  };

  const handleSelectDeck = (deck: Deck) => {
      setActiveDeck(deck);
      setView('study');
  };

  const handleExitStudy = () => {
    setView('library');
    setActiveDeck(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navigation Bar (Visible in Library and Upload views) */}
      {view !== 'study' && (
        <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-30">
            <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
                <div 
                    onClick={() => setView('library')}
                    className="flex items-center gap-2 text-indigo-600 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <BrainCircuit className="w-7 h-7" />
                    <span className="font-bold text-xl tracking-tight text-slate-900">FlashAI</span>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2">
                    <button 
                        onClick={() => setView('library')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${view === 'library' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Book className="w-4 h-4" /> <span className="hidden md:inline">Library</span>
                    </button>
                    <button 
                        onClick={() => setView('upload')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${view === 'upload' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden md:inline">Create</span>
                    </button>
                </div>
            </div>
        </nav>
      )}

      <main className="flex-1">
        {view === 'upload' && (
            <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
                <FileUpload onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>
        )}

        {view === 'library' && (
            <Library 
                decks={library} 
                onSelectDeck={handleSelectDeck}
                onDeleteDeck={handleDeleteDeck}
                onCreateNew={() => setView('upload')}
            />
        )}

        {view === 'study' && activeDeck && (
            <StudySession 
                deck={activeDeck.cards}
                onSessionComplete={handleSessionComplete}
                onExit={handleExitStudy}
            />
        )}
      </main>
    </div>
  );
};

export default App;