import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'hi' | 'bn';

const translations: Record<Language, Record<string, string>> = {
    en: {
        dashboard: 'Dashboard', family: 'Family', trustedContacts: 'Trusted',
        help: 'Help', logout: 'Logout', login: 'Sign In', verifyOTP: 'Verify OTP',
        mobileNumber: 'Mobile Number', sendOTP: 'Send OTP', enterOTP: 'Enter OTP',
        mobile: 'Mobile', otp: 'OTP', autoFill: 'Auto-fill Credentials',
        welcomeBack: 'Welcome back', yourDashboard: 'Your fraud protection dashboard is active.',
        totalScanned: 'Total Scanned', threatsDetected: 'Threats Detected',
        safeMessages: 'Safe Messages', highRisk: 'High Risk',
        scanNewMessages: 'Scan Messages', scanningMessages: 'Scanning',
        tapToScan: 'Tap to check messages for fraud',
        threatDistribution: 'Threat Distribution', weeklyTrend: 'Weekly Trend',
        recentScans: 'Recent Scans', sender: 'Sender', message: 'Message',
        status: 'Status', threatLevel: 'Threat Level', time: 'Time',
        noMessages: 'No messages scanned yet. Tap the scan button above!',
        threats: 'Threats', safe: 'Safe', scam: 'Scam',
        high: 'High', medium: 'Medium', low: 'Low',
        familyProtection: 'Family Protection',
    },
    hi: {
        dashboard: 'डैशबोर्ड', family: 'परिवार', trustedContacts: 'विश्वसनीय',
        help: 'मदद', logout: 'लॉगआउट', login: 'साइन इन', verifyOTP: 'OTP सत्यापित करें',
        mobileNumber: 'मोबाइल नंबर', sendOTP: 'OTP भेजें', enterOTP: 'OTP दर्ज करें',
        mobile: 'मोबाइल', otp: 'OTP', autoFill: 'ऑटो-फिल',
        welcomeBack: 'वापसी पर स्वागत है', yourDashboard: 'आपका सुरक्षा डैशबोर्ड सक्रिय है।',
        totalScanned: 'कुल स्कैन', threatsDetected: 'खतरे पहचाने गए',
        safeMessages: 'सुरक्षित संदेश', highRisk: 'उच्च जोखिम',
        scanNewMessages: 'संदेश स्कैन करें', scanningMessages: 'स्कैन हो रहा है',
        tapToScan: 'संदेश जांचने के लिए टैप करें',
        threatDistribution: 'खतरा वितरण', weeklyTrend: 'साप्ताहिक रुझान',
        recentScans: 'हाल के स्कैन', sender: 'भेजने वाला', message: 'संदेश',
        status: 'स्थिति', threatLevel: 'खतरे का स्तर', time: 'समय',
        noMessages: 'अभी तक कोई संदेश स्कैन नहीं हुआ।',
        threats: 'खतरे', safe: 'सुरक्षित', scam: 'धोखाधड़ी',
        high: 'उच्च', medium: 'मध्यम', low: 'कम',
        familyProtection: 'परिवार सुरक्षा',
    },
    bn: {
        dashboard: 'ড্যাশবোর্ড', family: 'পরিবার', trustedContacts: 'বিশ্বস্ত',
        help: 'সাহায্য', logout: 'লগআউট', login: 'সাইন ইন', verifyOTP: 'OTP যাচাই',
        mobileNumber: 'মোবাইল নম্বর', sendOTP: 'OTP পাঠান', enterOTP: 'OTP লিখুন',
        mobile: 'মোবাইল', otp: 'OTP', autoFill: 'অটো-ফিল',
        welcomeBack: 'স্বাগতম', yourDashboard: 'আপনার সুরক্ষা ড্যাশবোর্ড সক্রিয়।',
        totalScanned: 'মোট স্ক্যান', threatsDetected: 'হুমকি সনাক্ত',
        safeMessages: 'নিরাপদ বার্তা', highRisk: 'উচ্চ ঝুঁকি',
        scanNewMessages: 'বার্তা স্ক্যান করুন', scanningMessages: 'স্ক্যান হচ্ছে',
        tapToScan: 'বার্তা পরীক্ষা করতে ট্যাপ করুন',
        threatDistribution: 'হুমকি বিতরণ', weeklyTrend: 'সাপ্তাহিক ট্রেন্ড',
        recentScans: 'সাম্প্রতিক স্ক্যান', sender: 'প্রেরক', message: 'বার্তা',
        status: 'অবস্থা', threatLevel: 'হুমকি স্তর', time: 'সময়',
        noMessages: 'এখনো কোনো বার্তা স্ক্যান হয়নি।',
        threats: 'হুমকি', safe: 'নিরাপদ', scam: 'প্রতারণা',
        high: 'উচ্চ', medium: 'মাঝারি', low: 'কম',
        familyProtection: 'পরিবার সুরক্ষা',
    }
};

interface LanguageStore {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set, get) => ({
            language: 'en',
            setLanguage: (lang: Language) => set({ language: lang }),
            t: (key: string) => {
                const lang = get().language;
                return translations[lang]?.[key] || translations.en[key] || key;
            },
        }),
        { name: 'kavach-language' }
    )
);
