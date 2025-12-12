import React from 'react';
import { X, Key, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" /> API Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            To generate flashcards, this application requires a <strong>Google Gemini API Key</strong>.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h3 className="text-amber-800 font-semibold text-sm mb-1">Security Notice</h3>
            <p className="text-amber-700 text-xs">
              For your security, API keys must be configured via environment variables and cannot be entered directly in the browser.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">How to configure:</p>
            <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
              <code className="text-xs font-mono text-green-400">
                # Create a .env file in project root<br/>
                API_KEY=your_gemini_api_key_here
              </code>
            </div>
          </div>

          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-medium text-sm transition-colors"
          >
            Get API Key <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-sm font-medium">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;