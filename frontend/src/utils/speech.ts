
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


let voicesLoaded = false;

const loadVoices = (): Promise<void> => {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            voicesLoaded = true;
            resolve();
            return;
        }

        const handler = () => {
            voicesLoaded = true;
            window.speechSynthesis.removeEventListener('voiceschanged', handler);
            resolve();
        };

        window.speechSynthesis.addEventListener('voiceschanged', handler);

        // Fallback check
        setTimeout(() => {
            if (!voicesLoaded) {
                voicesLoaded = true; // Proceed anyway with what we have
                resolve();
            }
        }, 1000);
    });
};

// Initialize voices immediately
if (typeof window !== 'undefined' && window.speechSynthesis) {
    loadVoices();
}

/**
 * Find the best available assistant voice for a language
 */
const getBestVoice = (langCode: string) => {
    const voices = window.speechSynthesis.getVoices();
    const baseLang = langCode.split('-')[0]; // e.g., 'bn' from 'bn-IN'

    // 1. Prefer "Google" voices strictly matching the requested code
    const googleVoice = voices.find(v => v.lang === langCode && v.name.includes('Google'));
    if (googleVoice) return googleVoice;

    // 2. Strict prefix match for the requested code (e.g. 'bn-IN') with quality preference
    const premiumVoice = voices.find(v => v.lang.startsWith(langCode) && (v.name.includes('Premium') || v.name.includes('Enhanced')));
    if (premiumVoice) return premiumVoice;

    // 3. Fallback: Any voice strictly matching requested code
    const exactMatch = voices.find(v => v.lang.startsWith(langCode));
    if (exactMatch) return exactMatch;

    // 4. Broader Fallback: Try matching the base language (e.g. 'bn' finding 'bn-BD')
    // Only do this if we didn't find a strict match
    const googleBaseVoice = voices.find(v => v.lang.startsWith(baseLang) && v.name.includes('Google'));
    if (googleBaseVoice) return googleBaseVoice;

    const baseVoice = voices.find(v => v.lang.startsWith(baseLang));
    if (baseVoice) return baseVoice;

    return null;
};

export const speak = async (text: string, lang: AppLanguage = 'en', onEnd?: () => void) => {
    if (!window.speechSynthesis) return;

    if (!voicesLoaded) {
        await loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredLang = LANG_MAP[lang];

    // Default settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Attempt to find the best voice
    const voice = getBestVoice(preferredLang);

    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // Important: Sync utterance lang with the actual voice found
    } else {
        utterance.lang = preferredLang;
    }

    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
};

/**
 * Play threat alert in the selected language
 */
export const speakThreatAlert = async (selectedLang: AppLanguage = 'en') => {
    if (!window.speechSynthesis) return;

    if (!voicesLoaded) {
        await loadVoices();
    }

    // Reset synthesis
    window.speechSynthesis.cancel();

    // Get message for selected language
    const text = ALERT_MESSAGES[selectedLang] || ALERT_MESSAGES['en'];

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredLang = LANG_MAP[selectedLang] || 'en-US';

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getBestVoice(preferredLang);

    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    } else {
        utterance.lang = preferredLang;
    }

    window.speechSynthesis.speak(utterance);
};

/**
 * Play welcome message on app load
 */
export const playWelcomeMessage = async (isLoggedIn: boolean) => {
    if (!window.speechSynthesis) return;

    if (!voicesLoaded) {
        await loadVoices();
    }

    const text = isLoggedIn
        ? "Welcome back to Kavach. Your digital safety shield is active."
        : "Welcome to Kavach. Secure your digital life.";

    // Small delay to allow browser interaction if possible, though on reload it might still block
    setTimeout(() => {
        speak(text, 'en');
    }, 500);
};
