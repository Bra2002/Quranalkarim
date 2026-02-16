
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2, Mic2, User } from 'lucide-react';
import { Ayah } from '../types';

interface Props {
  currentAyah: Ayah | null;
  onNext: () => void;
  onPrevious: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  repeat: boolean;
  setRepeat: (repeat: boolean) => void;
  currentReciterName: string;
  onChangeReciter: () => void;
  autoPlayNext?: boolean;
}

const AudioPlayer: React.FC<Props> = ({ 
  currentAyah, 
  onNext, 
  onPrevious, 
  isPlaying, 
  setIsPlaying,
  repeat,
  setRepeat,
  currentReciterName,
  onChangeReciter,
  autoPlayNext = true
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && currentAyah?.audio) {
      audioRef.current.src = currentAyah.audio;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentAyah]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleEnded = () => {
    if (repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (autoPlayNext) {
      onNext();
    } else {
      setIsPlaying(false);
    }
  };

  if (!currentAyah) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 md:px-12 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <div className="bg-teal-600 dark:bg-teal-700 p-2 rounded-full text-white">
            <Volume2 size={20} />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800 dark:text-white truncate">آية {currentAyah.numberInSurah}</p>
              <button 
                onClick={onChangeReciter}
                className="flex items-center gap-1 text-[10px] bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full hover:bg-teal-600 hover:text-white transition-all font-bold"
              >
                <User size={10} />
                {currentReciterName}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate quran-text">{currentAyah.text.substring(0, 50)}...</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onPrevious}
            className="text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <SkipForward size={24} />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-teal-600 dark:bg-teal-700 text-white rounded-full flex items-center justify-center hover:bg-teal-700 dark:hover:bg-teal-600 shadow-lg transition-transform active:scale-90"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" className="mr-[-2px]" />}
          </button>

          <button 
            onClick={onNext}
            className="text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <SkipBack size={24} />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-1/3 justify-end">
          <button 
            onClick={() => setRepeat(!repeat)}
            className={`p-2 rounded-lg transition-colors ${repeat ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="تكرار الآية"
          >
            <Repeat size={20} />
          </button>
        </div>

        <audio 
          ref={audioRef} 
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
