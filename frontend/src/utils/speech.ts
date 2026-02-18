
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

    // Helper to check if a voice matches our criteria and assign it a score
    const getScore = (voice: SpeechSynthesisVoice) => {
        let score = 0;

        // 1. Language Match (Highest Priority)
        // Check strict match (e.g., 'en-US' vs 'en-US') or normalized match
        if (voice.lang === langCode) {
            score += 1000;
        }
        // Check looser match (e.g., 'en-US' matching 'en-GB' if requested 'en') - relying on startsWith
        // Note: voices often have lang as 'en_US' or 'en-US', normalize? 
        else if (voice.lang.replace('_', '-').startsWith(langCode)) {
            score += 500;
        }
        // Check base language match (e.g. 'bn-BD' for 'bn-IN' request fallback)
        else if (voice.lang.replace('_', '-').startsWith(baseLang)) {
            score += 100;
        }
        else {
            return -1; // Not a match for this language at all
        }

        // 2. Provider Preference (Google/Apple/Microsoft usually imply better quality)
        if (voice.name.includes('Google')) score += 50;
        if (voice.name.includes('Apple')) score += 10; // Siri voices

        // 3. Gender/Quality Hints
        // Explicitly prefer "Female" or known female voices
        const lowerName = voice.name.toLowerCase();
        if (lowerName.includes('female') || lowerName.includes('samantha') || lowerName.includes('zira')) {
            score += 30;
        }

        if (lowerName.includes('premium') || lowerName.includes('enhanced') || lowerName.includes('natural')) {
            score += 20;
        }

        // 4. Deprioritize explicitly Male voices if we generally prefer Female for "Assistant" feel
        if (lowerName.includes('male') || lowerName.includes('david')) {
            score -= 20;
        }

        return score;
    };

    // Sort voices by score descending
    const sortedVoices = voices
        .map(v => ({ voice: v, score: getScore(v) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    return sortedVoices.length > 0 ? sortedVoices[0].voice : null;
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
