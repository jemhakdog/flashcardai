import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onGenerate: (text: string, images: File[]) => Promise<void>;
  isGenerating: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onGenerate, isGenerating }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && images.length === 0) return;
    
    await onGenerate(text, images);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                Smart Flashcards
            </h1>
            <p className="text-slate-500 text-lg">
                Upload notes or images, and let AI build your study deck.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100">
            
            {/* Text Area */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Paste Text / Notes
                </label>
                <textarea
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                    placeholder="Paste your study notes, article, or topic here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            {/* Image Upload */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Upload Images (Optional)
                </label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group"
                >
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                    </div>
                    {images.length > 0 ? (
                        <p className="text-sm font-medium text-indigo-600">{images.length} image(s) selected</p>
                    ) : (
                        <p className="text-sm text-slate-400">Click to upload diagrams or slides</p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isGenerating || (!text && images.length === 0)}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isGenerating
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:-translate-y-0.5'
                }`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating Cards...
                    </>
                ) : (
                    'Create Flashcards'
                )}
            </button>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Powered by Gemini 2.5</p>
        </div>
    </div>
  );
};

export default FileUpload;