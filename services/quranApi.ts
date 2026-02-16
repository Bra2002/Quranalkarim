
import { Surah, Ayah, Reciter } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchSurahs = async (): Promise<Surah[]> => {
  const response = await fetch(`${BASE_URL}/surah`);
  const data = await response.json();
  return data.data;
};

export const fetchSurahDetail = async (surahNumber: number, reciterIdentifier: string = 'ar.alafasy'): Promise<{ayahs: Ayah[], surah: Surah}> => {
  // Fetch Arabic Text
  const resArabic = await fetch(`${BASE_URL}/surah/${surahNumber}`);
  const dataArabic = await resArabic.json();

  // Fetch Translation (English/Urdu/etc - defaulting to English)
  const resTranslation = await fetch(`${BASE_URL}/surah/${surahNumber}/en.sahih`);
  const dataTranslation = await resTranslation.json();

  // Fetch Audio
  const resAudio = await fetch(`${BASE_URL}/surah/${surahNumber}/${reciterIdentifier}`);
  const dataAudio = await resAudio.json();

  const ayahs = dataArabic.data.ayahs.map((ayah: any, index: number) => ({
    ...ayah,
    translation: dataTranslation.data.ayahs[index].text,
    audio: dataAudio.data.ayahs[index].audio
  }));

  return { ayahs, surah: dataArabic.data };
};

export const fetchReciters = async (): Promise<Reciter[]> => {
  const response = await fetch(`${BASE_URL}/edition?format=audio&language=ar&type=versebyverse`);
  const data = await response.json();
  return data.data;
};
