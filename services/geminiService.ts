
import { GoogleGenAI } from "@google/genai";

export const getTafsir = async (ayahText: string, surahName: string, ayahNumber: number): Promise<string> => {
  try {
    // استخدام النمط المعتمد حصرياً لتهيئة المكتبة
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بصفتك مفسرًا خبيرًا للقرآن الكريم، قدم تفسيرًا تحليليًا وميسرًا لهذه الآية:
      
      السورة: ${surahName}
      رقم الآية: ${ayahNumber}
      نص الآية: "${ayahText}"
      
      المطلوب تقديم الرد في الأقسام التالية بوضوح:
      1. المعنى العام: شرح مبسط للآية.
      2. لطائف لغوية: توضيح لجماليات بعض الكلمات.
      3. هدايات الآية: دروس عملية يمكن للمسلم تطبيقها في حياته اليومية.
      
      اجعل الأسلوب جذاباً، روحانياً، وباللغة العربية الفصحى الميسرة.`,
    });

    return response.text || "عذرًا، لم نتمكن من استخلاص التفسير حاليًا.";
  } catch (error) {
    console.error("Gemini Tafsir Error:", error);
    return "حدث خطأ أثناء محاولة جلب التفسير الذكي. يرجى التأكد من الاتصال بالإنترنت.";
  }
};
