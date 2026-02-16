import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrustedContact {
    id: string;
    name: string;
    phone: string;
    type: 'bank' | 'government' | 'family' | 'business' | 'personal' | 'other';
    verified: boolean;
    verifiedBy: 'user' | 'community' | 'system';
    trustScore: number;
    addedAt: string;
    lastSeen: string;
    notes: string;
    icon: string;
}

export interface VerificationResult {
    found: boolean;
    contact?: TrustedContact;
    isSafe: boolean;
    isScam: boolean;
    communityReports: number;
    message: string;
}

const MOCK_CONTACTS: TrustedContact[] = [
    { id: '1', name: 'State Bank of India', phone: '1800111210', type: 'bank', verified: true, verifiedBy: 'system', trustScore: 98, addedAt: '2024-01-15', lastSeen: '2024-02-14', notes: 'Official SBI helpline', icon: '🏦' },
    { id: '2', name: 'HDFC Bank', phone: '18002026161', type: 'bank', verified: true, verifiedBy: 'system', trustScore: 96, addedAt: '2024-01-20', lastSeen: '2024-02-13', notes: 'HDFC customer care', icon: '🏦' },
    { id: '3', name: 'Cyber Crime Helpline', phone: '1930', type: 'government', verified: true, verifiedBy: 'system', trustScore: 100, addedAt: '2024-01-01', lastSeen: '2024-02-14', notes: 'National cyber crime reporting', icon: '🛡️' },
    { id: '4', name: 'Mom', phone: '9876500001', type: 'family', verified: true, verifiedBy: 'user', trustScore: 100, addedAt: '2024-01-01', lastSeen: '2024-02-14', notes: 'Family', icon: '👩' },
    { id: '5', name: 'Dad', phone: '9876500002', type: 'family', verified: true, verifiedBy: 'user', trustScore: 100, addedAt: '2024-01-01', lastSeen: '2024-02-14', notes: 'Family', icon: '👨' },
    { id: '6', name: 'Flipkart Support', phone: '18002089898', type: 'business', verified: true, verifiedBy: 'community', trustScore: 88, addedAt: '2024-02-01', lastSeen: '2024-02-10', notes: 'E-commerce support', icon: '🛒' },
];

const KNOWN_SAFE: Record<string, string> = {
    '1800111210': 'SBI Helpline', '18002026161': 'HDFC Bank', '1930': 'Cyber Crime Helpline',
    '112': 'Emergency', '100': 'Police', '108': 'Ambulance',
};

const KNOWN_SCAM: Record<string, string> = {
    '9999999999': 'Fake Lottery - "You won 1 Crore!"',
    '8888888888': 'IRS Scam - "Tax Refund Pending"',
    '7777777777': 'Tech Support - "Your computer has a virus"',
    '6666666666': 'Bank Fraud - "KYC Update Required"',
    '5555555555': 'Job Offer - "Part-time work from home"',
};

interface TrustedContactStore {
    contacts: TrustedContact[];
    recentVerifications: VerificationResult[];
    addContact: (contact: Omit<TrustedContact, 'id' | 'addedAt' | 'lastSeen'>) => void;
    removeContact: (id: string) => void;
    updateContact: (id: string, updates: Partial<TrustedContact>) => void;
    verifyNumber: (phone: string) => VerificationResult;
    getStats: () => { total: number; verified: number; banks: number; family: number; avgTrust: number };
}

export const useTrustedContactStore = create<TrustedContactStore>()(
    persist(
        (set, get) => ({
            contacts: MOCK_CONTACTS,
            recentVerifications: [],
            addContact: (contact) => {
                const newContact: TrustedContact = {
                    ...contact,
                    id: Date.now().toString(),
                    addedAt: new Date().toISOString().split('T')[0],
                    lastSeen: new Date().toISOString().split('T')[0],
                };
                set((state) => ({ contacts: [...state.contacts, newContact] }));
            },
            removeContact: (id) => set((state) => ({ contacts: state.contacts.filter(c => c.id !== id) })),
            updateContact: (id, updates) => set((state) => ({
                contacts: state.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
            })),
            verifyNumber: (phone: string): VerificationResult => {
                const contacts = get().contacts;
                const found = contacts.find(c => c.phone === phone);
                if (found) {
                    const result: VerificationResult = { found: true, contact: found, isSafe: true, isScam: false, communityReports: 0, message: `✅ "${found.name}" is in your trusted contacts.` };
                    set(s => ({ recentVerifications: [result, ...s.recentVerifications].slice(0, 10) }));
                    return result;
                }
                if (KNOWN_SAFE[phone]) {
                    const result: VerificationResult = { found: false, isSafe: true, isScam: false, communityReports: 0, message: `✅ Known safe number: ${KNOWN_SAFE[phone]}` };
                    set(s => ({ recentVerifications: [result, ...s.recentVerifications].slice(0, 10) }));
                    return result;
                }
                if (KNOWN_SCAM[phone]) {
                    const reports = Math.floor(Math.random() * 500) + 50;
                    const result: VerificationResult = {
                        found: false,
                        isSafe: false,
                        isScam: true,
                        communityReports: reports,
                        message: `🚨 SCAM ALERT: ${KNOWN_SCAM[phone]} (Reported by ${reports} users)`
                    };
                    set(s => ({ recentVerifications: [result, ...s.recentVerifications].slice(0, 10) }));
                    return result;
                }
                const result: VerificationResult = { found: false, isSafe: false, isScam: false, communityReports: 0, message: `⚠️ Unknown number. Not in your trusted contacts.` };
                set(s => ({ recentVerifications: [result, ...s.recentVerifications].slice(0, 10) }));
                return result;
            },
            getStats: () => {
                const contacts = get().contacts;
                return {
                    total: contacts.length,
                    verified: contacts.filter(c => c.verified).length,
                    banks: contacts.filter(c => c.type === 'bank').length,
                    family: contacts.filter(c => c.type === 'family').length,
                    avgTrust: Math.round(contacts.reduce((sum, c) => sum + c.trustScore, 0) / (contacts.length || 1)),
                };
            },
        }),
        { name: 'trusted-contacts-storage' }
    )
);
