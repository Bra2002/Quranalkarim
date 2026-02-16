
import React, { useState, useEffect, useRef } from 'react';
import { Ayah } from '../types';
import { Sparkles, Info, Play, Pause, Copy, Check, ChevronDown, ChevronUp, Languages, Bookmark } from 'lucide-react';
import { getTafsir } from '../services/geminiService';

interface Props {
  ayah: Ayah;
  surahName: string;
  isActive: boolean;
  onPlay: () => void;
  isPlaying: boolean;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  fontFamily?: string;
  fontSize?: number;
}

const AyahItem: React.FC<Props> = ({ 
  ayah, 
  surahName, 
  isActive, 
  onPlay, 
  isPlaying,
  isBookmarked,
  onBookmarkToggle,
  fontFamily = 'Amiri',
  fontSize = 36
}) => {
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [copied, setCopied] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isActive]);

  const handleTafsirToggle = async () => {
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }
    
    setShowTafsir(true);
    if (!tafsir) {
      setLoadingTafsir(true);
      const result = await getTafsir(ayah.text, surahName, ayah.numberInSurah);
      setTafsir(result);
      setLoadingTafsir(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ayah.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Improved, more compact button styles
  const btnBaseClass = "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border active:scale-95";
  const btnDefaultClass = "bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-teal-500/30 hover:text-teal-600 hover:bg-white dark:hover:bg-slate-800";
  const iconSize = 15;

  return (
    <div 
      ref={itemRef}
      className={`p-6 rounded-2xl border transition-all duration-700 mb-6 relative overflow-hidden ${
        isActive 
          ? 'border-teal-500 bg-white dark:bg-slate-900 shadow-2xl shadow-teal-200/40 dark:shadow-none scale-[1.02] -translate-y-1 z-10' 
          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm translate-y-0 scale-100'
      }`}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute top-0 right-0 w-1.5 h-full bg-teal-500 animate-pulse"></div>
      )}

      {/* Subtle Background Pattern for Active Ayah */}
      {isActive && (
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent"></div>
        </div>
      )}

      <div className="flex flex-col gap-6 relative z-10">
        {/* Compact Header Actions */}
        <div className="flex justify-between items-center h-8">
           <div className="flex items-center gap-1.5">
             <button 
              onClick={onPlay}
              className={`${btnBaseClass} ${isActive && isPlaying ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-none' : btnDefaultClass}`}
              title={isActive && isPlaying ? "إيقاف" : "تشغيل"}
             >
              {isActive && isPlaying ? <Pause size={iconSize} /> : <Play size={iconSize} fill="currentColor" />}
             </button>
             
             <button 
              onClick={handleCopy}
              className={`${btnBaseClass} ${copied ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : btnDefaultClass}`}
              title="نسخ الآية"
             >
              {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
             </button>

             <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`${btnBaseClass} ${showTranslation ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : btnDefaultClass}`}
              title="عرض الترجمة"
             >
              <Languages size={iconSize} />
             </button>

             <button 
              onClick={onBookmarkToggle}
              className={`${btnBaseClass} ${isBookmarked ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' : btnDefaultClass}`}
              title={isBookmarked ? "إزالة من المحفوظات" : "إضافة للمحفوظات"}
             >
              <Bookmark size={iconSize} fill={isBookmarked ? "currentColor" : "none"} />
             </button>
           </div>

           <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">آية</span>
             <div className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-[13px] transition-all border ${isActive ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
              {ayah.numberInSurah}
             </div>
           </div>
        </div>

        {/* Ayah Text Container with subtle internal parallax shift */}
        <div className={`transition-transform duration-700 ${isActive ? 'translate-x-1' : 'translate-x-0'}`}>
          <p 
            className={`quran-text text-right leading-loose transition-all duration-500 ${isActive ? 'text-slate-900 dark:text-white drop-shadow-sm' : 'text-slate-800 dark:text-slate-300'}`} 
            dir="rtl"
            style={{ fontFamily: fontFamily, fontSize: `${fontSize}px` }}
          >
            {ayah.text}
          </p>
        </div>

        {/* Collapsible Translation */}
        {showTranslation && (
          <div className="bg-slate-50/80 dark:bg-slate-800/30 p-4 rounded-xl border-r-4 border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
              <Languages size={14} />
              <span className="text-xs font-bold uppercase">الترجمة (English)</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              {ayah.translation}
            </p>
          </div>
        )}

        {/* AI Explanation Toggle Button */}
        <button 
          onClick={handleTafsirToggle}
          className={`flex items-center justify-between w-full p-3.5 rounded-xl border transition-all duration-300 group ${
            showTafsir 
            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 shadow-sm' 
            : 'bg-slate-50/30 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-amber-200 dark:hover:border-amber-800 hover:text-amber-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg transition-colors ${showTafsir ? 'bg-amber-100 dark:bg-amber-800 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-amber-50'}`}>
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-sm">تفسير الآية بالذكاء الاصطناعي</span>
          </div>
          {showTafsir ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* AI Explanation Content */}
        {showTafsir && (
          <div className="bg-white dark:bg-slate-950/40 rounded-xl border border-amber-100 dark:border-amber-900/30 p-6 shadow-inner animate-in fade-in slide-in-from-top-4 duration-500">
            {loadingTafsir ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium animate-pulse">جاري صياغة التفسير بعناية...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-loose text-base whitespace-pre-line">
                  {tafsir}
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-50">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Powered by Gemini 3 AI</span>
                  <Info size={12} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AyahItem;
