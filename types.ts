
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  translation?: string;
  audio?: string;
}

export interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahIndex: number;
  timestamp: number;
}

export interface HistoryItem {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahIndex: number;
  timestamp: number;
}

export interface Dhikr {
  id: number;
  content: string;
  count: number;
  description: string;
  reference: string;
}

export interface DhikrCategory {
  id: string;
  title: string;
  icon: string;
  items: Dhikr[];
  color: string;
}

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  ayahIndex: number;
}

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface CustomReminder {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
}

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface UserPrayerSettings {
  enabled: boolean;
  notifications: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
    [key: string]: boolean;
  };
  selectedAdhan: string;
  customReminders: CustomReminder[];
  quietHours: QuietHours;
}

export interface OfflineSurah {
  surah: Surah;
  ayahs: Ayah[];
  downloadedAt: number;
}

export interface SurahProgress {
  [key: number]: number; // mapping surah number to last read ayah index
}
