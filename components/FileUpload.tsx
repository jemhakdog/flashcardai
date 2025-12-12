import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Loader2, File, X, FileType } from 'lucide-react';

interface FileUploadProps {
  onGenerate: (text: string, files: File[]) => Promise<void>;
  isGenerating: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onGenerate, isGenerating }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && files.length === 0) return;
    
    await onGenerate(text, files);
  };

  const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-purple-500" />;
      if (file.type === 'application/pdf') return <FileType className="w-4 h-4 text-red-500" />;
      return <FileText className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                Smart Flashcards
            </h1>
            <p className="text-slate-500 text-lg">
                Upload notes, PDFs, or images, and let AI build your study deck.
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

            {/* File Upload */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <File className="w-4 h-4" /> Upload Documents (PDF, Images, Text)
                </label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group"
                >
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*,application/pdf,text/plain" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-indigo-600">Click to upload files</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, Images, & Text</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {getFileIcon(file)}
                                    <span className="text-sm text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(0)}kb)</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-slate-400 hover:text-red-500 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isGenerating || (!text && files.length === 0)}
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