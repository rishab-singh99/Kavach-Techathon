import { create } from 'zustand';

export interface FamilyMember {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    relation: string;
    safetyScore: number;
    isOnline: boolean;
    lastActive: string;
    threatsBlocked: number;
    messagesScanned: number;
    recentAlerts: FamilyAlert[];
    deviceInfo: string;
    nameTranslations?: { hi: string; bn: string };
    relationTranslations?: { hi: string; bn: string };
}

export interface FamilyAlert {
    id: string;
    type: 'scam_sms' | 'phishing_link' | 'suspicious_call' | 'malware' | 'data_breach';
    severity: 'high' | 'medium' | 'low';
    message: string;
    timestamp: string;
    resolved: boolean;
    source: string;
}

const MOCK_FAMILY: FamilyMember[] = [
    {
        id: '1', name: 'Mom', phone: '9876500001', avatar: '👩', relation: 'Mother',
        safetyScore: 72, isOnline: true, lastActive: '2 min ago',
        threatsBlocked: 8, messagesScanned: 156,
        deviceInfo: 'Samsung Galaxy A54',
        nameTranslations: { hi: 'माँ', bn: 'মা' },
        relationTranslations: { hi: 'माँ', bn: 'মা' },
        recentAlerts: [
            { id: 'a1', type: 'scam_sms', severity: 'high', message: 'KBC lottery scam SMS received', timestamp: '10 min ago', resolved: false, source: '+91-98XXXXXXXX' },
            { id: 'a2', type: 'phishing_link', severity: 'medium', message: 'Clicked suspicious link from WhatsApp', timestamp: '2 hrs ago', resolved: true, source: 'WhatsApp' },
        ]
    },
    {
        id: '2', name: 'Dad', phone: '9876500002', avatar: '👨', relation: 'Father',
        safetyScore: 85, isOnline: false, lastActive: '1 hr ago',
        threatsBlocked: 3, messagesScanned: 89,
        deviceInfo: 'Redmi Note 12',
        nameTranslations: { hi: 'पिताजी', bn: 'বাবা' },
        relationTranslations: { hi: 'पिता', bn: 'বাবা' },
        recentAlerts: [
            { id: 'a3', type: 'suspicious_call', severity: 'low', message: 'Call from unknown international number', timestamp: '5 hrs ago', resolved: true, source: '+44-XXXXXXXXXX' },
        ]
    },
    {
        id: '3', name: 'Sister', phone: '9876500003', avatar: '👧', relation: 'Sister',
        safetyScore: 94, isOnline: true, lastActive: 'Just now',
        threatsBlocked: 1, messagesScanned: 67,
        deviceInfo: 'iPhone 15',
        nameTranslations: { hi: 'बहन', bn: 'বোন' },
        relationTranslations: { hi: 'बहन', bn: 'বোন' },
        recentAlerts: []
    },
    {
        id: '4', name: 'Grandpa', phone: '9876500004', avatar: '👴', relation: 'Grandfather',
        safetyScore: 45, isOnline: true, lastActive: '30 min ago',
        threatsBlocked: 15, messagesScanned: 203,
        deviceInfo: 'Realme 11',
        nameTranslations: { hi: 'दादाजी', bn: 'দাদু' },
        relationTranslations: { hi: 'दादा', bn: 'দাদা' },
        recentAlerts: [
            { id: 'a4', type: 'scam_sms', severity: 'high', message: 'Aadhaar KYC fraud SMS received & clicked link!', timestamp: '20 min ago', resolved: false, source: '+91-70XXXXXXXX' },
            { id: 'a5', type: 'suspicious_call', severity: 'high', message: 'Answered call claiming to be from bank', timestamp: '1 hr ago', resolved: false, source: '+91-88XXXXXXXX' },
            { id: 'a6', type: 'phishing_link', severity: 'medium', message: 'Visited fake SBI website', timestamp: '3 hrs ago', resolved: true, source: 'sbi-update.fake.in' },
        ]
    },
    {
        id: '5', name: 'Brother', phone: '9876500005', avatar: '👦', relation: 'Brother',
        safetyScore: 90, isOnline: true, lastActive: '5 min ago',
        threatsBlocked: 5, messagesScanned: 412,
        deviceInfo: 'OnePlus 11R',
        nameTranslations: { hi: 'भाई', bn: 'ভাই' },
        relationTranslations: { hi: 'भाई', bn: 'ভাই' },
        recentAlerts: [
            { id: 'a7', type: 'data_breach', severity: 'medium', message: 'Email found in recent data breach', timestamp: '1 day ago', resolved: false, source: 'System Monitor' }
        ]
    },
    {
        id: '6', name: 'Grandma', phone: '9876500006', avatar: '👵', relation: 'Grandmother',
        safetyScore: 68, isOnline: false, lastActive: '4 hrs ago',
        threatsBlocked: 12, messagesScanned: 130,
        deviceInfo: 'Moto G54',
        nameTranslations: { hi: 'दादीजी', bn: 'দিদা' },
        relationTranslations: { hi: 'दादी', bn: 'দিদা' },
        recentAlerts: [
            { id: 'a8', type: 'suspicious_call', severity: 'medium', message: 'Blocked high-frequency spam caller', timestamp: 'Yesterday', resolved: true, source: 'Community Blacklist' },
            { id: 'a9', type: 'scam_sms', severity: 'high', message: 'Received fake electricity bill disconnection warning', timestamp: 'Yesterday', resolved: false, source: '+91-1111111111' }
        ]
    }
];

interface FamilyStore {
    members: FamilyMember[];
    addMember: (member: Omit<FamilyMember, 'id'>) => void;
    removeMember: (id: string) => void;
    resolveAlert: (memberId: string, alertId: string) => void;
}

export const useFamilyStore = create<FamilyStore>((set) => ({
    members: MOCK_FAMILY,
    addMember: (member) => set((s) => ({
        members: [...s.members, { ...member, id: Date.now().toString() }]
    })),
    removeMember: (id) => set((s) => ({
        members: s.members.filter(m => m.id !== id)
    })),
    resolveAlert: (memberId, alertId) => set((s) => ({
        members: s.members.map(m =>
            m.id === memberId
                ? { ...m, recentAlerts: m.recentAlerts.map(a => a.id === alertId ? { ...a, resolved: true } : a) }
                : m
        )
    })),
}));
