
export type AppLanguage = 'en' | 'hi' | 'bn';

const LANG_MAP: Record<AppLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    bn: 'bn-IN'
};

const ALERT_MESSAGES: Record<AppLanguage, string> = {
    en: 'Threat detected!',
    hi: 'खतरे का पता चला है!',
    bn: 'হুমকি সনাক্ত করা হয়েছে!'
};

/**
 * Find the best available assistant voice for a language
 */
const getBestVoice = (langCode: string) => {
    const voices = window.speechSynthesis.getVoices();

    // Prefer "Google" voices as they sound more like Alexa/modern assistants
    const googleVoice = voices.find(v => v.lang.startsWith(langCode) && v.name.includes('Google'));
    if (googleVoice) return googleVoice;

    // Fallback to high quality voices
    const premiumVoice = voices.find(v => v.lang.startsWith(langCode) && (v.name.includes('Premium') || v.name.includes('Enhanced')));
    if (premiumVoice) return premiumVoice;

    // Universal fallback
    return voices.find(v => v.lang.startsWith(langCode));
};

export const speak = (text: string, lang: AppLanguage = 'en', onEnd?: () => void) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[lang];
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getBestVoice(utterance.lang);
    if (voice) utterance.voice = voice;

    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
};

/**
 * Play threat alert in the selected language
 */
export const speakThreatAlert = (selectedLang: AppLanguage = 'en') => {
    if (!window.speechSynthesis) return;

    // Reset synthesis
    window.speechSynthesis.cancel();

    // Get message for selected language
    const text = ALERT_MESSAGES[selectedLang] || ALERT_MESSAGES['en'];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[selectedLang] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // improved voice selection
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utterance.lang) && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Enhanced')));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
};
