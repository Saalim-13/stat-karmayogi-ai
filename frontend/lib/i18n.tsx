"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const LANGUAGES = [
  { code: "en", label: "English" }, { code: "hi", label: "हिन्दी" }, { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" }, { code: "kn", label: "ಕನ್ನಡ" }, { code: "ml", label: "മലയാളം" },
  { code: "bn", label: "বাংলা" }, { code: "mr", label: "मराठी" }, { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" }, { code: "or", label: "ଓଡ଼ିଆ" }, { code: "as", label: "অসমীয়া" },
] as const;
export type LanguageCode = typeof LANGUAGES[number]["code"];

const copy: Record<"en" | "hi" | "ta", Record<string, string>> = {
  en: {
    dashboard: "Dashboard", profile: "My AI learning profile", syllabus: "Syllabus mastery", quiz: "QuizForge",
    revision: "Revision", statbot: "STATBOT", judge: "Judge mode", welcome: "Welcome back",
    studyNow: "WHAT SHOULD I STUDY NOW?", language: "Language", twin: "Digital Twin", loop: "Closed loop",
    impact: "What changed", assessment: "Assessment", simulator: "Simulator", detective: "Data detective",
    india: "Why India", admin: "Organisation", graph: "Knowledge graph", architecture: "Architecture",
    future: "Future", faq: "Judge FAQ", igot: "iGOT layer",
  },
  hi: {
    dashboard: "डैशबोर्ड", profile: "मेरा AI लर्निंग प्रोफ़ाइल", syllabus: "पाठ्यक्रम महारत", quiz: "क्विज़फोर्ज",
    revision: "दोहराव", statbot: "स्टैटबॉट", judge: "जज मोड", welcome: "वापस आने पर स्वागत है",
    studyNow: "मुझे अभी क्या पढ़ना चाहिए?", language: "भाषा", twin: "डिजिटल ट्विन", loop: "क्लोज्ड लूप",
    impact: "क्या बदला", assessment: "आकलन", simulator: "सिमुलेटर", detective: "डेटा जाँच",
    india: "भारत क्यों", admin: "संगठन", graph: "ज्ञान ग्राफ", architecture: "आर्किटेक्चर",
    future: "भविष्य", faq: "जज FAQ", igot: "iGOT परत",
  },
  ta: {
    dashboard: "டாஷ்போர்டு", profile: "என் AI கற்றல் சுயவிவரம்", syllabus: "பாடத்திட்ட தேர்ச்சி", quiz: "வினாடி வினா",
    revision: "மறுபயிற்சி", statbot: "ஸ்டாட்பாட்", judge: "நடுவர் முறை", welcome: "மீண்டும் வரவேற்கிறோம்",
    studyNow: "இப்போது நான் என்ன படிக்க வேண்டும்?", language: "மொழி", twin: "டிஜிட்டல் இரட்டை", loop: "மூடிய சுழற்சி",
    impact: "என்ன மாறியது", assessment: "மதிப்பீடு", simulator: "உருவகப்படுத்தி", detective: "தரவு ஆய்வு",
    india: "இந்தியா ஏன்", admin: "அமைப்பு", graph: "அறிவு வரைபடம்", architecture: "கட்டமைப்பு",
    future: "எதிர்காலம்", faq: "நடுவர் FAQ", igot: "iGOT அடுக்கு",
  },
};
const STORAGE_KEY = "stat-karmayogi-language";
type I18n = { language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (key: string) => string; localized: boolean };
const I18nContext = createContext<I18n>({ language: "en", setLanguage: () => undefined, t: (key) => copy.en[key] ?? key, localized: true });
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, set] = useState<LanguageCode>("en");
  useEffect(() => { const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null; if (saved && LANGUAGES.some((item) => item.code === saved)) set(saved); }, []);
  function setLanguage(next: LanguageCode) { set(next); localStorage.setItem(STORAGE_KEY, next); }
  const dictionary = copy[language as keyof typeof copy] ?? copy.en;
  return <I18nContext.Provider value={{ language, setLanguage, t: (key) => dictionary[key] ?? copy.en[key] ?? key, localized: Boolean(copy[language as keyof typeof copy]) }}>{children}</I18nContext.Provider>;
}
export function useI18n() { return useContext(I18nContext); }
