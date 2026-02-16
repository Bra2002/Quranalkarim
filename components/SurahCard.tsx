import React from 'react';
import { Surah } from '../types';
import { Download, CheckCircle2, Heart } from 'lucide-react';

interface Props {
  surah: Surah;
  onClick: (surah: Surah) => void;
  isDownloaded?: boolean;
  onDownload: (e: React.MouseEvent, surah: Surah) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, surahId: number) => void;
  progress?: number; // Reading progress 0 to 1
  isDownloading?: boolean;
  downloadProgress?: number; // 0 to 100
}

const SurahCard: React.FC<Props> = ({ 
  surah, 
  onClick, 
  isDownloaded, 
  onDownload, 
  isFavorite, 
  onToggleFavorite,
  progress = 0,
  isDownloading = false,
  downloadProgress = 0
}) => {
  return (
    <div 
      onClick={() => onClick(surah)}
      className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center rounded-xl font-bold group-hover:bg-teal-600 group-hover:text-white transition-all">
            {surah.number}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{surah.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{surah.englishName} • {surah.numberOfAyahs} آية</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {onToggleFavorite && (
            <button 
              onClick={(e) => onToggleFavorite(e, surah.number)}
              className={`p-2 rounded-lg transition-all ${isFavorite ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}

          {isDownloading ? (
            <div className="relative w-9 h-9 flex items-center justify-center ml-1">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="18" cy="18" r="14"
                  className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="14"
                  className="stroke-teal-500 fill-none transition-all duration-300"
                  strokeWidth="3"
                  strokeDasharray={88}
                  strokeDashoffset={88 - (88 * (downloadProgress || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[8px] font-bold text-teal-600 dark:text-teal-400">{Math.round(downloadProgress || 0)}%</span>
            </div>
          ) : (
            <button 
              onClick={(e) => onDownload(e, surah)}
              className={`p-2 rounded-lg transition-all ${isDownloaded ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-300 hover:text-teal-600 hover:bg-teal-50'}`}
              title={isDownloaded ? "محملة أوفلاين" : "تحميل السورة"}
            >
              {isDownloaded ? <CheckCircle2 size={18} /> : <Download size={18} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 font-bold uppercase">
          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
        </div>
        {progress > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-teal-500" style={{ width: `${progress * 100}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-teal-600">{Math.round(progress * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahCard;