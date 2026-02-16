
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, BookOpen, Settings, Menu, X, ChevronRight, Moon, Sun, History as HistoryIcon, ArrowLeft, Type, ShieldCheck, Sunrise, CloudMoon, Bookmark as BookmarkIcon, Trash2, Clock, Bell, MapPin, Download, DownloadCloud, FileDown, PlayCircle, Heart, Star, Mic2, User, ChevronDown, Volume2, VolumeX, Info, Check } from 'lucide-react';
import { Surah, Ayah, Reciter, LastRead, DhikrCategory, Bookmark, HistoryItem, PrayerTimes, UserPrayerSettings, CustomReminder, OfflineSurah, SurahProgress } from './types';
import { fetchSurahs, fetchSurahDetail, fetchReciters } from './services/quranApi';
import { fetchPrayerTimes, PRAYER_NAMES_AR } from './services/prayerApi';
import { ADHKAR_DATA } from './services/adhkarData';
import SurahCard from './components/SurahCard';
import AyahItem from './components/AyahItem';
import DhikrItem from './components/DhikrItem';
import AudioPlayer from './components/AudioPlayer';
import Loading from './components/Loading';
import SplashScreen from './components/SplashScreen';

const FONT_OPTIONS = [
  { name: 'الأميري (Amiri)', value: "'Amiri', serif" },
  { name: 'تجوال (Tajawal)', value: "'Tajawal', sans-serif" },
  { name: 'كايرو (Cairo)', value: "'Cairo', sans-serif" },
  { name: 'المراعي (Almarai)', value: "'Almarai', sans-serif" },
  { name: 'نوتو (Noto Sans Arabic)', value: "'Noto Sans Arabic', sans-serif" },
  { name: 'كوفي (Reem Kufi)', value: "'Reem Kufi', sans-serif" },
];

const ADHAN_OPTIONS = [
  { id: 'makkah', name: 'أذان مكة المكرمة', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'madinah', name: 'أذان المدينة المنورة', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'abdulbasit', name: 'أذان عبد الباسط عبد الصمد', url: 'https://www.islamcan.com/audio/adhan/azan21.mp3' },
  { id: 'alafasy', name: 'أذان مشاري العفاسي', url: 'https://www.islamcan.com/audio/adhan/azan15.mp3' },
  { id: 'aqsa', name: 'أذان المسجد الأقصى', url: 'https://www.islamcan.com/audio/adhan/azan20.mp3' },
];

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'quran' | 'adhkar' | 'bookmarks' | 'history' | 'prayers' | 'downloads' | 'favoriteSurahs'>('quran');
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || "'Amiri', serif");
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 32);
  const [autoPlay, setAutoPlay] = useState(() => localStorage.getItem('autoPlay') === 'true' || true);

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>(() => localStorage.getItem('selectedReciter') || 'ar.alafasy');
  
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [lastRead, setLastRead] = useState<LastRead | null>(() => {
    const saved = localStorage.getItem('lastRead');
    return saved ? JSON.parse(saved) : null;
  });

  const [surahProgress, setSurahProgress] = useState<SurahProgress>(() => {
    const saved = localStorage.getItem('surah_progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [favoriteSurahIds, setFavoriteSurahIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorite_surah_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('reading_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [offlineSurahs, setOfflineSurahs] = useState<OfflineSurah[]>(() => {
    const saved = localStorage.getItem('offline_surahs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [prayerSettings, setPrayerSettings] = useState<UserPrayerSettings>(() => {
    const saved = localStorage.getItem('prayer_settings');
    if (saved) return JSON.parse(saved);
    return {
      enabled: true,
      notifications: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
      selectedAdhan: 'makkah',
      customReminders: [],
      quietHours: { enabled: false, start: '22:00', end: '06:00' }
    };
  });

  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [activeAdhanName, setActiveAdhanName] = useState('');
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);

  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('fontSize', fontSize.toString());
    localStorage.setItem('autoPlay', String(autoPlay));
    localStorage.setItem('favorite_surah_ids', JSON.stringify(favoriteSurahIds));
    localStorage.setItem('surah_progress', JSON.stringify(surahProgress));
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('reading_history', JSON.stringify(history));
    localStorage.setItem('prayer_settings', JSON.stringify(prayerSettings));
    localStorage.setItem('selectedReciter', selectedReciter);
    localStorage.setItem('offline_surahs', JSON.stringify(offlineSurahs));
  }, [fontFamily, fontSize, autoPlay, favoriteSurahIds, surahProgress, bookmarks, history, prayerSettings, selectedReciter, offlineSurahs]);

  useEffect(() => {
    const init = async () => {
      try {
        const [surahList, reciterList] = await Promise.all([fetchSurahs(), fetchReciters()]);
        setSurahs(surahList);
        setFilteredSurahs(surahList);
        setReciters(reciterList);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    init();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const times = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
          setPrayerTimes(times);
        },
        async () => {
          const times = await fetchPrayerTimes(30.0444, 31.2357);
          setPrayerTimes(times);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredSurahs(surahs.filter(s => 
        s.name.toLowerCase().includes(lowerSearch) || 
        s.englishName.toLowerCase().includes(lowerSearch) ||
        s.number.toString() === searchTerm
      ));
    }
  }, [searchTerm, surahs]);

  useEffect(() => {
    const checkTime = () => {
      if (!prayerTimes || !prayerSettings.enabled || isAdhanPlaying) return;
      const now = new Date();
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      Object.entries(PRAYER_NAMES_AR).forEach(([key, name]) => {
        if (prayerTimes[key] === currentTimeStr && prayerSettings.notifications[key]) {
          triggerAdhan(name);
        }
      });
    };
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes, prayerSettings, isAdhanPlaying]);

  const triggerAdhan = (prayerName: string) => {
    const adhan = ADHAN_OPTIONS.find(a => a.id === prayerSettings.selectedAdhan) || ADHAN_OPTIONS[0];
    if (adhanAudioRef.current) {
      adhanAudioRef.current.src = adhan.url;
      adhanAudioRef.current.play().catch(e => console.log("Auto-play blocked"));
      setIsAdhanPlaying(true);
      setActiveAdhanName(prayerName);
      setIsPlaying(false); // Stop Quran if Adhan starts
    }
  };

  const stopAdhan = () => {
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
      adhanAudioRef.current.currentTime = 0;
    }
    setIsAdhanPlaying(false);
  };

  const handleSurahClick = async (surah: Surah, initialAyahIndex?: number) => {
    const resumeIndex = initialAyahIndex !== undefined ? initialAyahIndex : (surahProgress[surah.number] || 0);
    setLoading(true);
    try {
      const { ayahs, surah: detail } = await fetchSurahDetail(surah.number, selectedReciter);
      setAyahs(ayahs);
      setCurrentSurah(detail);
      setCurrentAyahIndex(resumeIndex);
      setReading(true);
      setIsPlaying(false);
      
      const newItem: HistoryItem = {
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumber: resumeIndex + 1,
        ayahIndex: resumeIndex,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev.filter(i => i.surahNumber !== surah.number)].slice(0, 50));
      setLastRead({
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumber: resumeIndex + 1,
        ayahIndex: resumeIndex,
        timestamp: Date.now()
      });
    } catch (error) {}
    setLoading(false);
  };

  const toggleBookmark = (ayah: Ayah) => {
    if (!currentSurah) return;
    const isBookmarked = bookmarks.some(b => b.surahNumber === currentSurah.number && b.ayahNumber === ayah.numberInSurah);
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => !(b.surahNumber === currentSurah.number && b.ayahNumber === ayah.numberInSurah)));
    } else {
      const newBookmark: Bookmark = {
        surahNumber: currentSurah.number,
        surahName: currentSurah.name,
        ayahNumber: ayah.numberInSurah,
        ayahText: ayah.text,
        ayahIndex: ayahs.indexOf(ayah)
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  };

  const togglePrayerNotification = (prayerKey: string) => {
    setPrayerSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [prayerKey]: !prev.notifications[prayerKey]
      }
    }));
  };

  const nextPrayerInfo = useMemo(() => {
    if (!prayerTimes) return null;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const prayers = Object.entries(PRAYER_NAMES_AR).map(([key, name]) => {
      const [h, m] = prayerTimes[key].split(':').map(Number);
      return { key, name, min: h * 60 + m, time: prayerTimes[key] };
    }).sort((a, b) => a.min - b.min);
    return prayers.find(p => p.min > currentMin) || prayers[0];
  }, [prayerTimes]);

  const currentReciterName = useMemo(() => reciters.find(r => r.identifier === selectedReciter)?.name || 'مشاري العفاسي', [reciters, selectedReciter]);

  return (
    <>
      <SplashScreen onComplete={() => setShowSplash(false)} />
      {!showSplash && (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          
          {/* Adhan Overlay */}
          {isAdhanPlaying && (
            <div className="fixed inset-0 z-[100] bg-teal-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 animate-in fade-in zoom-in duration-500">
              <div className="relative text-center space-y-8 max-w-md w-full">
                <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center animate-pulse mx-auto">
                  <Sunrise size={80} className="text-teal-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold opacity-80 uppercase tracking-widest">حي على الصلاة</h2>
                  <p className="text-6xl font-black">صلاة {activeAdhanName}</p>
                </div>
                <button onClick={stopAdhan} className="w-full bg-white text-teal-900 py-5 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all">إيقاف صوت الأذان</button>
              </div>
            </div>
          )}

          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 h-16 flex items-center px-4">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                  <Menu size={24} />
                </button>
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-500 cursor-pointer" onClick={() => { setReading(false); setView('quran'); }}>
                  <BookOpen size={28} />
                  <h1 className="text-xl font-black hidden sm:block">القرآن الكريم</h1>
                </div>
              </div>
              <div className="flex-1 max-w-md mx-4">
                {!reading && view === 'quran' && (
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="ابحث عن سورة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pr-10 pl-4 py-2 outline-none dark:text-white focus:ring-2 focus:ring-teal-500" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                </button>
                <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <Settings size={22} />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 pb-40">
            {loading ? <Loading /> : (
              <>
                {reading && currentSurah ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col gap-4 mb-8">
                      <button onClick={() => setReading(false)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-teal-600 font-bold w-fit transition-all group">
                         <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl group-hover:bg-teal-50"><ArrowLeft size={18} /></div>
                         العودة لقائمة السور
                      </button>
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5"><BookOpen size={100} /></div>
                          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">{currentSurah.name}</h2>
                          <div className="flex items-center justify-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                             <span>{currentSurah.englishName}</span>
                             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                             <span>{currentSurah.numberOfAyahs} آية</span>
                             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                             <span>{currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                          </div>
                      </div>
                    </div>

                    {currentSurah.number !== 1 && currentSurah.number !== 9 && (
                      <div className="text-center mb-12">
                         <p className="quran-text text-5xl text-slate-800 dark:text-slate-100 py-6">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                      </div>
                    )}

                    <div className="space-y-4">
                       {ayahs.map((ayah, index) => (
                         <AyahItem 
                           key={ayah.number}
                           ayah={ayah}
                           surahName={currentSurah.name}
                           isActive={currentAyahIndex === index}
                           onPlay={() => { setCurrentAyahIndex(index); setIsPlaying(true); }}
                           isPlaying={isPlaying}
                           isBookmarked={bookmarks.some(b => b.surahNumber === currentSurah.number && b.ayahNumber === ayah.numberInSurah)}
                           onBookmarkToggle={() => toggleBookmark(ayah)}
                           fontFamily={fontFamily}
                           fontSize={fontSize}
                         />
                       ))}
                    </div>
                  </div>
                ) : view === 'quran' ? (
                  <div className="space-y-6">
                    {lastRead && (
                      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm group">
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><HistoryIcon size={32} /></div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">واصل القراءة</h3>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">سورة {lastRead.surahName}</p>
                            <p className="text-teal-600 font-bold">الآية {lastRead.ayahNumber}</p>
                          </div>
                        </div>
                        <button onClick={() => { const s = surahs.find(su => su.number === lastRead.surahNumber); if(s) handleSurahClick(s, lastRead.ayahIndex); }} className="bg-teal-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-teal-700 hover:shadow-xl transition-all">استكمال الآن</button>
                      </div>
                    )}
                    
                    {nextPrayerInfo && (
                       <div className="p-6 bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                          <div className="flex items-center gap-6 relative z-10">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><Clock size={40} /></div>
                            <div>
                              <h2 className="text-xl font-bold opacity-90">الصلاة القادمة</h2>
                              <p className="text-4xl font-black">{nextPrayerInfo.name}</p>
                            </div>
                          </div>
                          <div className="text-center md:text-right relative z-10">
                             <div className="flex items-center gap-2 justify-center md:justify-end">
                                <span className="text-5xl font-black">{nextPrayerInfo.time}</span>
                                {prayerSettings.notifications[nextPrayerInfo.key] && <Bell size={24} className="text-teal-300 animate-bounce" />}
                             </div>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSurahs.map(s => (
                        <SurahCard 
                          key={s.number} 
                          surah={s} 
                          onClick={handleSurahClick} 
                          isDownloaded={offlineSurahs.some(o => o.surah.number === s.number)}
                          onDownload={(e, su) => {}}
                          isFavorite={favoriteSurahIds.includes(s.number)}
                          onToggleFavorite={(e, id) => {}}
                          progress={surahProgress[s.number] !== undefined ? (surahProgress[s.number] + 1) / s.numberOfAyahs : 0}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </main>

          {reading && currentSurah && (
            <AudioPlayer 
              currentAyah={ayahs[currentAyahIndex] || null} 
              onNext={() => {
                if (currentAyahIndex < ayahs.length - 1) {
                  setCurrentAyahIndex(prev => prev + 1);
                } else {
                  setIsPlaying(false);
                }
              }} 
              onPrevious={() => setCurrentAyahIndex(prev => Math.max(0, prev - 1))} 
              isPlaying={isPlaying} 
              setIsPlaying={setIsPlaying} 
              repeat={repeat} 
              setRepeat={setRepeat} 
              currentReciterName={currentReciterName}
              onChangeReciter={() => setSidebarOpen(true)}
              autoPlayNext={autoPlay}
            />
          )}

          {/* Sidebar Settings */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-[60]">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)}></div>
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-3"><Settings size={28} className="text-teal-600" /> الإعدادات</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all dark:text-slate-400"><X size={24} /></button>
                </div>

                <div className="space-y-10">
                  {/* Prayer Notification Customization */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-5 tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">تنبيهات مواقيت الصلاة</h3>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Bell size={20} className="text-teal-600" />
                            <span className="text-sm font-bold dark:text-slate-200">تفعيل الأذان التلقائي</span>
                          </div>
                          <button 
                            onClick={() => setPrayerSettings(prev => ({ ...prev, enabled: !prev.enabled }))} 
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${prayerSettings.enabled ? 'bg-teal-600 shadow-inner shadow-teal-900/20' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${prayerSettings.enabled ? 'translate-x-6' : 'translate-x-0 shadow-md'}`}></div>
                          </button>
                       </div>
                       
                       {prayerSettings.enabled && (
                         <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2">
                           <p className="text-[10px] font-bold text-slate-400 mb-1">اختر الصلوات التي ترغب في سماع أذانها:</p>
                           {Object.entries(PRAYER_NAMES_AR).map(([key, name]) => (
                             <button 
                                key={key}
                                onClick={() => togglePrayerNotification(key)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${prayerSettings.notifications[key] ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                             >
                               <span className="text-sm font-bold">{name}</span>
                               <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${prayerSettings.notifications[key] ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'}`}>
                                 {prayerSettings.notifications[key] && <Check size={12} strokeWidth={4} />}
                               </div>
                             </button>
                           ))}
                         </div>
                       )}

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">صوت المؤذن</label>
                          <select 
                            value={prayerSettings.selectedAdhan} 
                            onChange={(e) => setPrayerSettings({...prayerSettings, selectedAdhan: e.target.value})} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                          >
                            {ADHAN_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                       </div>
                    </div>
                  </div>

                  {/* Font Customization */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-5 tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">تخصيص القراءة</h3>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">نوع الخط</label>
                          <select 
                            value={fontFamily} 
                            onChange={(e) => setFontFamily(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                          >
                            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                          </select>
                       </div>
                       
                       <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">حجم الخط</label>
                            <span className="text-xs font-black text-teal-600">{fontSize}px</span>
                          </div>
                          <input 
                            type="range" min="16" max="64" step="2" 
                            value={fontSize} 
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                          />
                       </div>
                    </div>
                  </div>

                  {/* Reciter Customization */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-5 tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">القارئ المفضل</h3>
                    <div className="space-y-4">
                       <select 
                          value={selectedReciter} 
                          onChange={(e) => setSelectedReciter(e.target.value)} 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                       >
                          {reciters.map(r => <option key={r.identifier} value={r.identifier}>{r.name}</option>)}
                       </select>
                       <p className="text-[10px] text-slate-400 leading-relaxed italic">سيتم استخدام تلاوة القارئ المختار عند تشغيل الملفات الصوتية للآيات.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <audio ref={adhanAudioRef} onEnded={() => setIsAdhanPlaying(false)} />
        </div>
      )}
    </>
  );
};

export default App;
