
import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show splash for at least 2.5 seconds
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for fade animation to finish
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-700 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Islamic Pattern Placeholder */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border-[20px] border-teal-600 dark:border-teal-500 rounded-full rotate-45"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] border-[20px] border-teal-600 dark:border-teal-500 rounded-full -rotate-45"></div>
        <div className="grid grid-cols-6 gap-4 w-full h-full opacity-20">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-teal-900/10 dark:border-teal-100/10 rounded-full aspect-square"></div>
            ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8 transform transition-transform duration-1000 ease-out scale-110 animate-pulse">
            <div className="absolute inset-0 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-3xl opacity-50 scale-150"></div>
            <div className="relative bg-teal-600 dark:bg-teal-700 p-6 rounded-[2.5rem] shadow-2xl shadow-teal-200 dark:shadow-teal-950">
                <BookOpen size={64} className="text-white" strokeWidth={1.5} />
            </div>
        </div>

        {/* Text with Fade-in Effect */}
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">القرآن الكريم</h1>
            <p className="text-teal-600 dark:text-teal-400 font-medium text-lg tracking-widest uppercase opacity-70">Al-Quran Al-Kareem</p>
        </div>

        {/* Loading indicator */}
        <div className="mt-16 w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-teal-600 dark:bg-teal-500 rounded-full animate-[progress_2.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; left: 0%; }
          50% { width: 70%; left: 15%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
