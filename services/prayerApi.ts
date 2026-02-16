
import { PrayerTimes } from '../types';

export const fetchPrayerTimes = async (lat: number, lon: number): Promise<PrayerTimes> => {
  try {
    const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`); // 4 is Umm Al-Qura
    const data = await response.json();
    if (data.code === 200) {
      return data.data.timings;
    }
    throw new Error('Failed to fetch prayer times');
  } catch (error) {
    console.error('Prayer API Error:', error);
    // Fallback timings for Cairo as a default if everything fails
    return {
      Fajr: "05:00",
      Dhuhr: "12:00",
      Asr: "15:30",
      Maghrib: "18:00",
      Isha: "19:30"
    };
  }
};

export const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء"
};
