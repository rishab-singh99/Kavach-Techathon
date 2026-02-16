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
        familyAlert: 'Family Alert', familyAlert_plural: 'Family Alerts', view: 'View', call: 'Call', dismiss: 'Dismiss',
        threatAnalysis: 'Threat Analysis', messageContent: 'Message Content',
        risk: 'RISK', aiAnalysis: 'AI Analysis', reportScam: 'Report Scam', blockSender: 'Block Sender',
        offlineMessage: "You're offline — scans use on-device AI", loadingDashboard: 'Loading your dashboard...',
        failedLoad: 'Failed to load dashboard', retry: 'Retry', tapToScanDesc: 'Tap big blue button to check for viruses',
        appName: 'Kavach', appTitle: 'Cyber-Kavach',
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
        familyAlert: 'परिवार चेतावनी', familyAlert_plural: 'परिवार चेतावनी', view: 'देखें', call: 'कॉल करें', dismiss: 'खारिज करें',
        threatAnalysis: 'खतरा विश्लेषण', messageContent: 'संदेश सामग्री',
        risk: 'जोखिम', aiAnalysis: 'AI विश्लेषण', reportScam: 'घोटाले की रिपोर्ट करें', blockSender: 'प्रेषक को ब्लॉक करें',
        offlineMessage: 'आप ऑफ़लाइन हैं — स्कैन ऑन-डिवाइस AI का उपयोग करते हैं', loadingDashboard: 'आपका डैशबोर्ड लोड हो रहा है...',
        failedLoad: 'डैशबोर्ड लोड करने में विफल', retry: 'पुनः प्रयास करें', tapToScanDesc: 'वायरस की जांच के लिए बड़े नीले बटन पर टैप करें',
        appName: 'कवच', appTitle: 'साइबर-कवच',
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
        familyAlert: 'পারিবারিক সতর্কতা', familyAlert_plural: 'পারিবারিক সতর্কতা', view: 'দেখুন', call: 'কল করুন', dismiss: 'বাতিল করুন',
        threatAnalysis: 'হুমকি বিশ্লেষণ', messageContent: 'বার্তা বিষয়বস্তু',
        risk: 'ঝুঁকি', aiAnalysis: 'AI বিশ্লেষণ', reportScam: 'স্ক্যাম রিপোর্ট করুন', blockSender: 'প্রেরককে ব্লক করুন',
        offlineMessage: 'আপনি অফলাইনে আছেন — স্ক্যান অন-ডিভাইস AI ব্যবহার করে', loadingDashboard: 'আপনার ড্যাশবোর্ড লোড হচ্ছে...',
        failedLoad: 'ড্যাশবোর্ড লোড করতে ব্যর্থ', retry: 'পুনরায় চেষ্টা করুন', tapToScanDesc: 'ভাইরাস পরীক্ষা করতে বড় নীল বোতামে ট্যাপ করুন',
        appName: 'কবচ', appTitle: 'সাইবার-কবচ',
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
