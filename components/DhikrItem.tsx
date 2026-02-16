
import React, { useState } from 'react';
import { Dhikr } from '../types';
import { RotateCcw, Check } from 'lucide-react';

interface Props {
  dhikr: Dhikr;
}

const DhikrItem: React.FC<Props> = ({ dhikr }) => {
  const [currentCount, setCurrentCount] = useState(dhikr.count);
  const isFinished = currentCount === 0;

  const handleDecrement = () => {
    if (currentCount > 0) {
      setCurrentCount(prev => prev - 1);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentCount(dhikr.count);
  };

  return (
    <div 
      onClick={handleDecrement}
      className={`p-6 rounded-2xl border transition-all duration-300 mb-4 cursor-pointer relative overflow-hidden group ${
        isFinished 
        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 opacity-60' 
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 shadow-sm active:scale-[0.98]'
      }`}
    >
      <div className="flex flex-col gap-4">
        <p className="quran-text text-2xl md:text-3xl text-right leading-loose text-slate-800 dark:text-slate-100">
          {dhikr.content}
        </p>
        
        {dhikr.description && (
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg w-fit">
            {dhikr.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">{dhikr.reference}</span>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              title="إعادة ضبط"
            >
              <RotateCcw size={16} />
            </button>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 ${
              isFinished 
              ? 'bg-emerald-500 text-white' 
              : 'bg-teal-600 dark:bg-teal-700 text-white shadow-lg shadow-teal-200 dark:shadow-none'
            }`}>
              {isFinished ? <Check size={24} /> : currentCount}
            </div>
          </div>
        </div>
      </div>
      
      {!isFinished && (
        <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      )}
    </div>
  );
};

export default DhikrItem;
