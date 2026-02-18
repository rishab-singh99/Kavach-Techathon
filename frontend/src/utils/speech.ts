
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
        let attempts = 0;
        const maxAttempts = 10;

        const checkVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Check if we have ANY Bengali voice, or ANY voice at all
            const hasBengali = voices.some(v => v.lang.includes('bn'));

            if (voices.length > 0 && (hasBengali || attempts >= maxAttempts)) {
                console.groupCollapsed('🗣️ Kavach Voice Check');
                console.log(`Total Voices: ${voices.length}`);

                // Log all voices for debugging
                console.table(voices.map(v => ({ name: v.name, lang: v.lang, service: v.localService ? 'Local' : 'Network' })));

                const bengaliVoices = voices.filter(v => v.lang.includes('bn'));
                if (bengaliVoices.length > 0) {
                    console.log('✅ Bengali Voices Found:', bengaliVoices);
                } else {
                    console.warn('⚠️ NO BENGALI VOICES DETECTED ON THIS OS/BROWSER.');
                }
                console.groupEnd();

                voicesLoaded = true;
                resolve();
            } else {
                attempts++;
                setTimeout(checkVoices, 100);
            }
        };

        checkVoices();

        // Also listen for the event just in case
        window.speechSynthesis.onvoiceschanged = () => {
            // If the event fires, we might have new voices, check immediately
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                voicesLoaded = true;
                resolve();
            }
        };
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
            score += 200; // Boosted base language match
        }
        else {
            return -1; // Not a match for this language at all
        }

        // 2. Provider Preference (Google/Apple/Microsoft usually imply better quality)
        // Heavily favor Google as they are standard on Chrome/Android and usually high quality
        if (voice.name.includes('Google')) score += 100;
        if (voice.name.includes('Apple')) score += 50;

        // 3. Gender/Quality Hints
        // Explicitly prefer "Female" or known female voices
        const lowerName = voice.name.toLowerCase();
        if (lowerName.includes('female') || lowerName.includes('samantha') || lowerName.includes('zira')) {
            score += 50;
        }

        if (lowerName.includes('premium') || lowerName.includes('enhanced') || lowerName.includes('natural')) {
            score += 30;
        }

        // 4. Deprioritize explicitly Male voices if we generally prefer Female for "Assistant" feel
        if (lowerName.includes('male') || lowerName.includes('david') || lowerName.includes('ravi')) {
            score -= 50;
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

// Helper to safely speak with fallback
const speakSafe = (utterance: SpeechSynthesisUtterance, text: string, originalLang: string, onEnd?: () => void) => {
    // If the browser throws an error (e.g. language not supported), catch it
    utterance.onerror = (e) => {
        console.warn(`Speech synthesis error for ${originalLang}, falling back to English:`, e);

        // Only fallback if we weren't already trying English
        if (originalLang !== 'en-US' && originalLang !== 'en') {
            // Cancel current (failed) speech
            window.speechSynthesis.cancel();

            const fallbackUtterance = new SpeechSynthesisUtterance(text);
            fallbackUtterance.lang = 'en-US'; // Force English

            // Try enabling English voice specifically if available
            const enVoice = getBestVoice('en-US');
            if (enVoice) fallbackUtterance.voice = enVoice;

            if (onEnd) fallbackUtterance.onend = onEnd;
            window.speechSynthesis.speak(fallbackUtterance);
        }
    };

    // Also set a timeout watchdog - if onstart doesn't fire in 2s, assume failure and force fallback
    // This handles cases where the browser doesn't throw an error but just hangs on missing voices
    const watchdog = setTimeout(() => {
        if (originalLang !== 'en-US' && originalLang !== 'en') {
            console.warn(`Speech synthesis timeout for ${originalLang}, forcing fallback`);
            window.speechSynthesis.cancel();
            const fallbackUtterance = new SpeechSynthesisUtterance(text);
            fallbackUtterance.lang = 'en-US';
            const enVoice = getBestVoice('en-US');
            if (enVoice) fallbackUtterance.voice = enVoice;
            if (onEnd) fallbackUtterance.onend = onEnd;
            window.speechSynthesis.speak(fallbackUtterance);
        }
    }, 2000);

    utterance.onstart = () => clearTimeout(watchdog);

    if (onEnd) utterance.onend = () => {
        clearTimeout(watchdog);
        onEnd();
    };

    window.speechSynthesis.speak(utterance);
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
        utterance.lang = voice.lang;
    } else {
        utterance.lang = preferredLang;
    }

    speakSafe(utterance, text, preferredLang, onEnd);
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
    const preferredLang = LANG_MAP[selectedLang] || 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
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

    // Use specific threat alert fallback logic if different from generic speak
    const fallbackText = ALERT_MESSAGES['en'];

    utterance.onerror = (e) => {
        console.warn('Threat alert speech error, falling back:', e);
        if (selectedLang !== 'en') {
            window.speechSynthesis.cancel();
            const fallbackUtterance = new SpeechSynthesisUtterance(fallbackText);
            fallbackUtterance.lang = 'en-US';
            const enVoice = getBestVoice('en-US');
            if (enVoice) fallbackUtterance.voice = enVoice;
            window.speechSynthesis.speak(fallbackUtterance);
        }
    };

    window.speechSynthesis.speak(utterance);
};


/**
 * Play welcome message on app load
 */
export const speakWelcomeMessage = async (isLoggedIn: boolean) => {
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
