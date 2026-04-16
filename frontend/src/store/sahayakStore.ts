import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────

export type CaseStatus = 'reported' | 'in-progress' | 'digitally-resolved' | 'physically-resolved';
export type SahayakRole = 'retired-army' | 'anganwadi' | 'gram-panchayat' | 'police' | 'volunteer';

export interface SahayakProfile {
    id: string;
    name: string;
    role: SahayakRole;
    rank?: string;
    villageId: string;
    villageName: string;
    phone: string;
    joinedAt: string;
    totalResolved: number;
    trustScore: number;
    totalEarnings: number;
    isActive: boolean;
}

export interface CaseAttachment {
    id: string;
    type: 'screenshot' | 'document' | 'photo';
    url: string;
    ocrText?: string;
    uploadedAt: string;
}

export interface CaseUpdate {
    id: string;
    status: CaseStatus;
    note: string;
    updatedBy: string;
    timestamp: string;
}

export interface FraudCase {
    id: string;
    title: string;
    description: string;
    category: string;
    status: CaseStatus;
    priority: 'high' | 'medium' | 'low';
    reportedBy: string;
    reportedByPhone: string;
    assignedSahayakId: string;
    villageId: string;
    villageName: string;
    attachments: CaseAttachment[];
    updates: CaseUpdate[];
    createdAt: string;
    resolvedAt?: string;
    userSatisfied?: boolean;
    honorariumAmount?: number;
    honorariumPaid?: boolean;
    ocrExtractedData?: {
        sender?: string;
        amount?: string;
        upiId?: string;
        bankName?: string;
        suspiciousLinks?: string[];
    };
}

export interface AuditLogEntry {
    id: string;
    action: string;
    performedBy: string;
    performedByRole: SahayakRole;
    caseId?: string;
    details: string;
    timestamp: string;
    ipAddress?: string;
}

interface SahayakStore {
    // Auth
    isSahayakLoggedIn: boolean;
    currentSahayak: SahayakProfile | null;
    sahayakLogin: (phone: string, pin: string) => boolean;
    sahayakLogout: () => void;

    // Cases
    cases: FraudCase[];
    addCase: (caseData: Omit<FraudCase, 'id' | 'createdAt' | 'updates'>) => FraudCase;
    updateCaseStatus: (caseId: string, status: CaseStatus, note: string) => void;
    markUserSatisfied: (caseId: string, satisfied: boolean) => void;
    getCasesByStatus: (status: CaseStatus) => FraudCase[];
    getCaseById: (id: string) => FraudCase | undefined;

    // Incentives
    processHonorarium: (caseId: string) => boolean;
    getEligibleForPayment: () => FraudCase[];

    // Audit
    auditLog: AuditLogEntry[];
    addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

    // Stats
    getStats: () => {
        totalCases: number;
        resolved: number;
        inProgress: number;
        reported: number;
        trustScore: number;
        totalEarnings: number;
    };

    // Sahayak profiles (for demo)
    sahayakProfiles: SahayakProfile[];
}

// ─── Mock Data ───────────────────────────────────

const MOCK_SAHAYAK_PROFILES: SahayakProfile[] = [
    {
        id: 'SAH-001',
        name: 'Maj. Rajendra Singh (Retd.)',
        role: 'retired-army',
        rank: 'Major',
        villageId: 'VIL-001',
        villageName: 'Rampur Kalan',
        phone: '9876543210',
        joinedAt: '2025-06-15',
        totalResolved: 47,
        trustScore: 94,
        totalEarnings: 18500,
        isActive: true,
    },
    {
        id: 'SAH-002',
        name: 'Sunita Devi',
        role: 'anganwadi',
        villageId: 'VIL-001',
        villageName: 'Rampur Kalan',
        phone: '9988776655',
        joinedAt: '2025-08-20',
        totalResolved: 32,
        trustScore: 89,
        totalEarnings: 12000,
        isActive: true,
    },
    {
        id: 'SAH-003',
        name: 'Hav. Mohan Lal (Retd.)',
        role: 'retired-army',
        rank: 'Havildar',
        villageId: 'VIL-002',
        villageName: 'Bhopal Nagar',
        phone: '8877665544',
        joinedAt: '2025-07-10',
        totalResolved: 28,
        trustScore: 91,
        totalEarnings: 10500,
        isActive: true,
    },
];

const MOCK_CASES: FraudCase[] = [
    {
        id: 'CASE-001',
        title: 'WhatsApp KYC Scam - Elderly Victim',
        description: 'Ramu Kaka (age 72) received a WhatsApp message claiming his SBI account will be frozen. He was asked to share OTP. Lost Rs. 15,000 before family intervened.',
        category: 'Banking Phishing',
        status: 'in-progress',
        priority: 'high',
        reportedBy: 'Ramu Kaka (via family)',
        reportedByPhone: '7766554433',
        assignedSahayakId: 'SAH-001',
        villageId: 'VIL-001',
        villageName: 'Rampur Kalan',
        attachments: [
            {
                id: 'ATT-001',
                type: 'screenshot',
                url: '/mock/whatsapp-scam.png',
                ocrText: 'Dear SBI Customer, Your account will be blocked. Update KYC immediately. Click: sbi-kyc-update.in',
                uploadedAt: '2026-04-14T10:30:00',
            }
        ],
        updates: [
            { id: 'UPD-001', status: 'reported', note: 'Case reported by victim\'s grandson', updatedBy: 'SAH-001', timestamp: '2026-04-14T10:30:00' },
            { id: 'UPD-002', status: 'in-progress', note: 'Contacted SBI branch manager. Initiated dispute.', updatedBy: 'SAH-001', timestamp: '2026-04-14T14:00:00' },
        ],
        createdAt: '2026-04-14T10:30:00',
        ocrExtractedData: {
            sender: 'Unknown (+91-8899XXXXXX)',
            bankName: 'SBI',
            suspiciousLinks: ['sbi-kyc-update.in'],
        }
    },
    {
        id: 'CASE-002',
        title: 'Fake Electricity Bill Threat',
        description: 'Multiple village homes received SMS threatening power cut. Number traced to Bihar. 3 families paid Rs 500 each via UPI.',
        category: 'Utility Bill Scam',
        status: 'reported',
        priority: 'high',
        reportedBy: 'Collective Report',
        reportedByPhone: '6655443322',
        assignedSahayakId: 'SAH-002',
        villageId: 'VIL-001',
        villageName: 'Rampur Kalan',
        attachments: [
            {
                id: 'ATT-002',
                type: 'screenshot',
                url: '/mock/electricity-scam.png',
                ocrText: 'URGENT: Your electricity will be cut tonight at 9PM. Pay Rs 500 immediately. UPI: paytm-8899XXX',
                uploadedAt: '2026-04-15T08:00:00',
            }
        ],
        updates: [
            { id: 'UPD-003', status: 'reported', note: 'Multi-family report submitted. Screenshots collected.', updatedBy: 'SAH-002', timestamp: '2026-04-15T08:00:00' },
        ],
        createdAt: '2026-04-15T08:00:00',
        ocrExtractedData: {
            sender: 'Unknown (+91-7788XXXXXX)',
            amount: 'Rs 500',
            upiId: 'paytm-8899XXX',
        }
    },
    {
        id: 'CASE-003',
        title: 'Job Scam via YouTube Likes',
        description: 'Teenager Priya was lured into a fake job offer promising Rs 5000/day for liking YouTube videos. Was asked to pay Rs 2000 "registration fee".',
        category: 'Job Scam',
        status: 'digitally-resolved',
        priority: 'medium',
        reportedBy: 'Priya\'s Mother',
        reportedByPhone: '5544332211',
        assignedSahayakId: 'SAH-001',
        villageId: 'VIL-001',
        villageName: 'Rampur Kalan',
        attachments: [],
        updates: [
            { id: 'UPD-004', status: 'reported', note: 'Mother reported after Priya asked for Rs 2000', updatedBy: 'SAH-001', timestamp: '2026-04-10T09:00:00' },
            { id: 'UPD-005', status: 'in-progress', note: 'Counseled family. Blocked scam number. Filed cyber police complaint online.', updatedBy: 'SAH-001', timestamp: '2026-04-10T14:00:00' },
            { id: 'UPD-006', status: 'digitally-resolved', note: 'Complaint registered with Cyber Cell. Screenshot evidence submitted. No money was lost.', updatedBy: 'SAH-001', timestamp: '2026-04-11T10:00:00' },
        ],
        createdAt: '2026-04-10T09:00:00',
    },
    {
        id: 'CASE-004',
        title: 'Lottery Winner Scam - Senior Citizen',
        description: 'Retired teacher received call claiming he won Rs 25 Lakh in "KBC Lottery". Asked to pay Rs 5000 as processing fee. Sahayak intercepted before payment.',
        category: 'Reward Scam',
        status: 'physically-resolved',
        priority: 'high',
        reportedBy: 'Self (Ram Prasad)',
        reportedByPhone: '4433221100',
        assignedSahayakId: 'SAH-001',
        villageId: 'VIL-001',
        villageName: 'Rampur Kalan',
        attachments: [],
        updates: [
            { id: 'UPD-007', status: 'reported', note: 'Victim called Sahayak helpline before making payment', updatedBy: 'SAH-001', timestamp: '2026-04-05T10:00:00' },
            { id: 'UPD-008', status: 'in-progress', note: 'Confirmed as scam. Educated victim about lottery frauds.', updatedBy: 'SAH-001', timestamp: '2026-04-05T11:00:00' },
            { id: 'UPD-009', status: 'digitally-resolved', note: 'Scam number reported to cybercrime.gov.in', updatedBy: 'SAH-001', timestamp: '2026-04-05T15:00:00' },
            { id: 'UPD-010', status: 'physically-resolved', note: 'Conducted awareness session at village chaupal. 40+ attendees.', updatedBy: 'SAH-001', timestamp: '2026-04-06T18:00:00' },
        ],
        createdAt: '2026-04-05T10:00:00',
        resolvedAt: '2026-04-06T18:00:00',
        userSatisfied: true,
        honorariumAmount: 500,
        honorariumPaid: true,
    },
];

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
    { id: 'AUD-001', action: 'LOGIN', performedBy: 'SAH-001', performedByRole: 'retired-army', details: 'Sahayak login successful', timestamp: '2026-04-16T07:00:00' },
    { id: 'AUD-002', action: 'CASE_CREATED', performedBy: 'SAH-001', performedByRole: 'retired-army', caseId: 'CASE-001', details: 'New fraud case reported', timestamp: '2026-04-14T10:30:00' },
    { id: 'AUD-003', action: 'STATUS_UPDATE', performedBy: 'SAH-001', performedByRole: 'retired-army', caseId: 'CASE-001', details: 'Status changed to in-progress', timestamp: '2026-04-14T14:00:00' },
    { id: 'AUD-004', action: 'HONORARIUM_PAID', performedBy: 'SYSTEM', performedByRole: 'volunteer', caseId: 'CASE-004', details: 'Rs 500 honorarium processed', timestamp: '2026-04-07T10:00:00' },
];

// ─── Store ───────────────────────────────────────

export const useSahayakStore = create<SahayakStore>()(
    persist(
        (set, get) => ({
            isSahayakLoggedIn: false,
            currentSahayak: null,
            cases: MOCK_CASES,
            auditLog: MOCK_AUDIT_LOG,
            sahayakProfiles: MOCK_SAHAYAK_PROFILES,

            sahayakLogin: (phone: string, pin: string) => {
                const profile = MOCK_SAHAYAK_PROFILES.find(p => p.phone === phone);
                if (profile && pin === '1234') {
                    set({ isSahayakLoggedIn: true, currentSahayak: profile });
                    get().addAuditEntry({
                        action: 'LOGIN',
                        performedBy: profile.id,
                        performedByRole: profile.role,
                        details: `Sahayak ${profile.name} logged in`,
                    });
                    return true;
                }
                return false;
            },

            sahayakLogout: () => {
                const sahayak = get().currentSahayak;
                if (sahayak) {
                    get().addAuditEntry({
                        action: 'LOGOUT',
                        performedBy: sahayak.id,
                        performedByRole: sahayak.role,
                        details: `Sahayak ${sahayak.name} logged out`,
                    });
                }
                set({ isSahayakLoggedIn: false, currentSahayak: null });
            },

            addCase: (caseData) => {
                const newCase: FraudCase = {
                    ...caseData,
                    id: `CASE-${String(get().cases.length + 1).padStart(3, '0')}`,
                    createdAt: new Date().toISOString(),
                    updates: [{
                        id: `UPD-${Date.now()}`,
                        status: caseData.status,
                        note: 'Case created and assigned to Sahayak',
                        updatedBy: get().currentSahayak?.id || 'SYSTEM',
                        timestamp: new Date().toISOString(),
                    }],
                };
                set(state => ({ cases: [newCase, ...state.cases] }));
                const sahayak = get().currentSahayak;
                if (sahayak) {
                    get().addAuditEntry({
                        action: 'CASE_CREATED',
                        performedBy: sahayak.id,
                        performedByRole: sahayak.role,
                        caseId: newCase.id,
                        details: `New case: ${newCase.title}`,
                    });
                }
                return newCase;
            },

            updateCaseStatus: (caseId: string, status: CaseStatus, note: string) => {
                set(state => ({
                    cases: state.cases.map(c => {
                        if (c.id === caseId) {
                            const update: CaseUpdate = {
                                id: `UPD-${Date.now()}`,
                                status,
                                note,
                                updatedBy: state.currentSahayak?.id || 'SYSTEM',
                                timestamp: new Date().toISOString(),
                            };
                            return {
                                ...c,
                                status,
                                updates: [...c.updates, update],
                                resolvedAt: status === 'physically-resolved' ? new Date().toISOString() : c.resolvedAt,
                            };
                        }
                        return c;
                    }),
                }));
                const sahayak = get().currentSahayak;
                if (sahayak) {
                    get().addAuditEntry({
                        action: 'STATUS_UPDATE',
                        performedBy: sahayak.id,
                        performedByRole: sahayak.role,
                        caseId,
                        details: `Status changed to ${status}: ${note}`,
                    });
                }
            },

            markUserSatisfied: (caseId: string, satisfied: boolean) => {
                set(state => ({
                    cases: state.cases.map(c =>
                        c.id === caseId ? { ...c, userSatisfied: satisfied } : c
                    ),
                }));
            },

            getCasesByStatus: (status: CaseStatus) => {
                return get().cases.filter(c => c.status === status);
            },

            getCaseById: (id: string) => {
                return get().cases.find(c => c.id === id);
            },

            processHonorarium: (caseId: string) => {
                const c = get().cases.find(cs => cs.id === caseId);
                if (c && c.status === 'physically-resolved' && c.userSatisfied && !c.honorariumPaid) {
                    const amount = c.priority === 'high' ? 500 : c.priority === 'medium' ? 375 : 250;
                    set(state => ({
                        cases: state.cases.map(cs =>
                            cs.id === caseId ? { ...cs, honorariumAmount: amount, honorariumPaid: true } : cs
                        ),
                    }));
                    const sahayak = get().currentSahayak;
                    if (sahayak) {
                        get().addAuditEntry({
                            action: 'HONORARIUM_PAID',
                            performedBy: 'SYSTEM',
                            performedByRole: sahayak.role,
                            caseId,
                            details: `Rs ${amount} honorarium processed for case ${caseId}`,
                        });
                    }
                    return true;
                }
                return false;
            },

            getEligibleForPayment: () => {
                return get().cases.filter(c =>
                    c.status === 'physically-resolved' && c.userSatisfied && !c.honorariumPaid
                );
            },

            addAuditEntry: (entry) => {
                const newEntry: AuditLogEntry = {
                    ...entry,
                    id: `AUD-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                };
                set(state => ({ auditLog: [newEntry, ...state.auditLog] }));
            },

            getStats: () => {
                const cases = get().cases;
                const sahayak = get().currentSahayak;
                return {
                    totalCases: cases.length,
                    resolved: cases.filter(c => c.status === 'physically-resolved' || c.status === 'digitally-resolved').length,
                    inProgress: cases.filter(c => c.status === 'in-progress').length,
                    reported: cases.filter(c => c.status === 'reported').length,
                    trustScore: sahayak?.trustScore || 0,
                    totalEarnings: cases.filter(c => c.honorariumPaid).reduce((sum, c) => sum + (c.honorariumAmount || 0), 0),
                };
            },
        }),
        { name: 'kavach-sahayak' }
    )
);
