import { useState, useRef, useCallback } from 'react';
import {
    Shield, ArrowLeft, LogIn, User, MapPin, Phone, Award, FileText,
    Upload, Camera, AlertTriangle, CheckCircle, Clock, ChevronRight,
    Star, IndianRupee, Eye, X, Plus, Search, Filter, TrendingUp,
    Users, Lock, History, ShieldCheck, BadgeCheck, Clipboard, LogOut,
    ChevronDown, MessageSquare, Zap, Flag, Hash, Activity
} from 'lucide-react';
import CountUp from 'react-countup';
import { useLanguageStore } from '../store/languageStore';
import { useSahayakStore, CaseStatus, FraudCase, SahayakRole } from '../store/sahayakStore';
import SpotlightCard from './SpotlightCard';

interface SahayakDashboardProps {
    onBack: () => void;
}

// ─── Scam OCR Patterns (reuse from VisualShield) ─
const SCAM_PATTERNS = [
    { pattern: /(bank|hdfc|sbi|icici|axis|kotak|suspended|blocked|lock|kyc|verify|re-verify|limit|account)/i, category: 'Banking Phishing', level: 'high' as const },
    { pattern: /(lottery|gift|won|prize|jackpot|reward|crore|lakh|cashback|lucky|draw)/i, category: 'Reward Scam', level: 'high' as const },
    { pattern: /(delivery|bluedart|delhivery|courier|parcel|order|address|track|pending|missed)/i, category: 'Logistics Scam', level: 'medium' as const },
    { pattern: /(electricity|bill|due|power|cut|disconnection|ebill|utility)/i, category: 'Utility Bill Scam', level: 'high' as const },
    { pattern: /(otp|code|pin|password|sharing|security|secret)/i, category: 'Identity Theft', level: 'high' as const },
    { pattern: /(urgent|immediate|at once|within|fast|quick|today|final notice)/i, category: 'Urgency Tactic', level: 'medium' as const },
    { pattern: /(http|https|www|bit\.ly|t\.co|tinyurl|click|link|update-now|verify-link)/i, category: 'Suspicious Link', level: 'medium' as const },
    { pattern: /(job|work from home|part time|earn|easy money|whatsapp message|youtube likes|salary)/i, category: 'Job Scam', level: 'high' as const },
    { pattern: /(tax|irs|refund pending|income tax|pan|aadhaar|deactivated|block)/i, category: 'Govt Impersonation', level: 'high' as const },
];

// ─── Helper ─────────────────────────────────────

const STATUS_FLOW: CaseStatus[] = ['reported', 'in-progress', 'digitally-resolved', 'physically-resolved'];

const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; icon: any; bg: string }> = {
    'reported': { label: 'Reported', color: '#EF4444', icon: Flag, bg: 'rgba(239,68,68,0.1)' },
    'in-progress': { label: 'In Progress', color: '#F59E0B', icon: Clock, bg: 'rgba(245,158,11,0.1)' },
    'digitally-resolved': { label: 'Digitally Resolved', color: '#3B82F6', icon: ShieldCheck, bg: 'rgba(59,130,246,0.1)' },
    'physically-resolved': { label: 'Fully Resolved', color: '#10B981', icon: CheckCircle, bg: 'rgba(16,185,129,0.1)' },
};

const ROLE_LABELS: Record<SahayakRole, string> = {
    'retired-army': '🎖️ Retired Armed Forces',
    'anganwadi': '👩‍⚕️ Anganwadi Worker',
    'gram-panchayat': '🏛️ Gram Panchayat',
    'police': '👮 Police (Retd.)',
    'volunteer': '🤝 Community Volunteer',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function SahayakDashboard({ onBack }: SahayakDashboardProps) {
    const { t } = useLanguageStore();
    const store = useSahayakStore();

    // If not logged in, show login
    if (!store.isSahayakLoggedIn) {
        return <SahayakLogin onBack={onBack} />;
    }

    return <SahayakAdminPanel onBack={onBack} />;
}

// ═══════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════

function SahayakLogin({ onBack }: { onBack: () => void }) {
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const store = useSahayakStore();

    const handleLogin = async () => {
        setError('');
        if (phone.length !== 10) { setError('Enter valid 10-digit phone number'); return; }
        if (pin.length !== 4) { setError('Enter 4-digit PIN'); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        const success = store.sahayakLogin(phone, pin);
        setLoading(false);
        if (!success) setError('Invalid credentials. Use demo: 9876543210 / PIN: 1234');
    };

    return (
        <div className="animate-fade" style={{ padding: '32px 0 64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <button className="btn btn-outline" onClick={onBack}><ArrowLeft size={16} /> Back</button>
                <h2 style={{ fontSize: '28px', fontWeight: 800 }}>🛡️ Sahayak — Gram Admin Portal</h2>
            </div>

            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                <div className="sahayak-login-card" style={{
                    background: 'var(--surface)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)',
                    borderRadius: '24px', padding: '48px 40px', boxShadow: 'var(--glass-shadow)',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
                        }}>
                            <Shield size={40} color="white" />
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Sahayak Login</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                            Secure portal for Gram Admins — Retired Officers & Anganwadi Workers
                        </p>
                    </div>

                    {/* Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} /> Phone Number
                            </label>
                            <input
                                type="tel" maxLength={10} placeholder="Enter registered phone"
                                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                style={{ fontSize: '18px', padding: '14px 16px', letterSpacing: '0.1em', fontWeight: 600 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} /> 4-Digit PIN
                            </label>
                            <input
                                type="password" maxLength={4} placeholder="● ● ● ●"
                                value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                style={{ fontSize: '24px', padding: '14px 16px', letterSpacing: '0.3em', fontWeight: 800, textAlign: 'center' }}
                            />
                        </div>
                        {error && (
                            <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 600, background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}
                        <button
                            className="btn btn-primary" onClick={handleLogin} disabled={loading}
                            style={{ padding: '16px', fontSize: '16px', fontWeight: 800, borderRadius: '14px', marginTop: '8px' }}
                        >
                            {loading ? <><div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div> Authenticating...</> : <><LogIn size={20} /> Secure Login</>}
                        </button>
                    </div>

                    {/* Demo Hint */}
                    <div style={{
                        marginTop: '28px', padding: '16px', background: 'rgba(59,130,246,0.08)',
                        borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)',
                    }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                            Demo Credentials
                        </p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 700 }}>
                            <span>📱 9876543210</span>
                            <span>🔑 PIN: 1234</span>
                        </div>
                    </div>
                </div>

                {/* Trust Badge */}
                <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> Edge AI Privacy</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12} /> Audit Logged</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12} /> Transparent</span>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// ADMIN PANEL (after login)
// ═══════════════════════════════════════════════════

function SahayakAdminPanel({ onBack }: { onBack: () => void }) {
    const store = useSahayakStore();
    const sahayak = store.currentSahayak!;
    const stats = store.getStats();

    const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'new-case' | 'audit' | 'incentives'>('overview');
    const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
    const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

    const filteredCases = statusFilter === 'all' ? store.cases : store.getCasesByStatus(statusFilter);

    const handleLogout = () => {
        store.sahayakLogout();
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'cases', label: 'Cases', icon: Clipboard },
        { id: 'new-case', label: 'Report', icon: Plus },
        { id: 'incentives', label: 'Incentives', icon: IndianRupee },
        { id: 'audit', label: 'Audit Log', icon: History },
    ] as const;

    return (
        <div className="animate-fade" style={{ padding: '32px 0 64px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={onBack}><ArrowLeft size={16} /> Dashboard</button>
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>🛡️ Sahayak Admin</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Profile Badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px',
                        background: 'var(--surface)', border: '1px solid var(--glass-border)',
                        borderRadius: '12px', fontSize: '13px',
                    }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px',
                        }}>
                            {sahayak.name.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{sahayak.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{ROLE_LABELS[sahayak.role]}</div>
                        </div>
                    </div>
                    <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '10px 16px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '4px', padding: '4px', background: 'var(--surface)',
                borderRadius: '14px', border: '1px solid var(--glass-border)', marginBottom: '28px',
                overflowX: 'auto',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSelectedCase(null); }}
                        style={{
                            flex: 1, padding: '12px 16px', borderRadius: '10px', border: 'none',
                            background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab stats={stats} sahayak={sahayak} cases={store.cases} onViewCase={(c) => { setSelectedCase(c); setActiveTab('cases'); }} />}
            {activeTab === 'cases' && (
                selectedCase
                    ? <CaseDetail caseData={selectedCase} onBack={() => setSelectedCase(null)} />
                    : <CasesTab cases={filteredCases} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onSelectCase={setSelectedCase} />
            )}
            {activeTab === 'new-case' && <NewCaseTab onCreated={() => setActiveTab('cases')} />}
            {activeTab === 'incentives' && <IncentivesTab />}
            {activeTab === 'audit' && <AuditTab />}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════

function OverviewTab({ stats, sahayak, cases, onViewCase }: {
    stats: { totalCases: number; resolved: number; inProgress: number; reported: number; trustScore: number; totalEarnings: number };
    sahayak: { name: string; role: SahayakRole; villageName: string; trustScore: number };
    cases: FraudCase[];
    onViewCase: (c: FraudCase) => void;
}) {
    const recentCases = cases.slice(0, 3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Impact Banner */}
            <div className="sahayak-impact-banner" style={{
                background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
                borderRadius: '20px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                Sahayak Impact Report
                            </div>
                            <h3 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '4px' }}>{sahayak.name}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                {ROLE_LABELS[sahayak.role]} • 📍 {sahayak.villageName}
                            </p>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 24px',
                            textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>Trust Score</div>
                            <div style={{ fontSize: '36px', fontWeight: 900, color: '#10B981' }}>
                                <CountUp end={stats.trustScore} duration={1.5} />%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Total Cases', value: stats.totalCases, icon: <FileText size={20} />, color: '#3B82F6' },
                    { label: 'Resolved', value: stats.resolved, icon: <CheckCircle size={20} />, color: '#10B981' },
                    { label: 'In Progress', value: stats.inProgress, icon: <Clock size={20} />, color: '#F59E0B' },
                    { label: 'Total Earnings', value: stats.totalEarnings, icon: <IndianRupee size={20} />, color: '#8B5CF6', prefix: '₹' },
                ].map((stat, i) => (
                    <SpotlightCard key={i} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="stat-label">{stat.label}</span>
                            <span style={{ color: stat.color }}>{stat.icon}</span>
                        </div>
                        <div className="stat-value" style={{ color: stat.color }}>
                            {stat.prefix || ''}<CountUp end={stat.value} duration={1.5} separator="," />
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            {/* Resolution Pipeline */}
            <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} color="var(--primary)" /> Resolution Pipeline
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {STATUS_FLOW.map((status, i) => {
                        const config = STATUS_CONFIG[status];
                        const count = cases.filter(c => c.status === status).length;
                        const Icon = config.icon;
                        return (
                            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '120px' }}>
                                <div style={{
                                    flex: 1, padding: '16px', borderRadius: '12px', background: config.bg,
                                    border: `1px solid ${config.color}30`, textAlign: 'center',
                                }}>
                                    <Icon size={20} color={config.color} style={{ marginBottom: '6px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: config.color }}>{count}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>{config.label}</div>
                                </div>
                                {i < STATUS_FLOW.length - 1 && <ChevronRight size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Cases */}
            <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clipboard size={20} color="var(--primary)" /> Recent Cases
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentCases.map(c => {
                        const sc = STATUS_CONFIG[c.status];
                        const Icon = sc.icon;
                        return (
                            <div key={c.id} onClick={() => onViewCase(c)} style={{
                                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                                background: 'var(--bg)', borderRadius: '12px', cursor: 'pointer',
                                border: '1px solid var(--border)', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px', background: sc.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Icon size={18} color={sc.color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <span>{c.category}</span>
                                        <span>•</span>
                                        <span>{timeAgo(c.createdAt)}</span>
                                    </div>
                                </div>
                                <span className={`badge badge-${c.priority === 'high' ? 'danger' : c.priority === 'medium' ? 'warning' : 'success'}`}>
                                    {c.priority.toUpperCase()}
                                </span>
                                <ChevronRight size={16} color="var(--text-secondary)" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TAB: Cases List
// ═══════════════════════════════════════════════════

function CasesTab({ cases, statusFilter, setStatusFilter, onSelectCase }: {
    cases: FraudCase[];
    statusFilter: CaseStatus | 'all';
    setStatusFilter: (f: CaseStatus | 'all') => void;
    onSelectCase: (c: FraudCase) => void;
}) {
    const [search, setSearch] = useState('');
    const filtered = cases.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '36px' }} />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(['all', ...STATUS_FLOW] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            style={{
                                padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                                background: statusFilter === s ? 'var(--primary)' : 'transparent',
                                color: statusFilter === s ? 'white' : 'var(--text-secondary)',
                                fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Case List */}
            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <Search size={40} color="var(--text-secondary)" />
                    <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>No cases found</p>
                </div>
            ) : (
                filtered.map(c => {
                    const sc = STATUS_CONFIG[c.status];
                    const Icon = sc.icon;
                    return (
                        <div key={c.id} className="card" onClick={() => onSelectCase(c)} style={{
                            cursor: 'pointer', borderLeft: `4px solid ${sc.color}`, padding: '20px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 600, fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{c.id}</span>
                                        <span className={`badge badge-${c.priority === 'high' ? 'danger' : c.priority === 'medium' ? 'warning' : 'success'}`}>{c.priority.toUpperCase()}</span>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                            background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: '4px',
                                        }}>
                                            <Icon size={12} /> {sc.label}
                                        </span>
                                    </div>
                                    <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>{c.title}</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {c.description}
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {c.reportedBy}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {c.villageName}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {timeAgo(c.createdAt)}</span>
                                        {c.attachments.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Camera size={12} /> {c.attachments.length} files</span>}
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--text-secondary)" />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// Case Detail View
// ═══════════════════════════════════════════════════

function CaseDetail({ caseData, onBack }: { caseData: FraudCase; onBack: () => void }) {
    const store = useSahayakStore();
    const [note, setNote] = useState('');
    const [showAdvance, setShowAdvance] = useState(false);
    const freshCase = store.getCaseById(caseData.id) || caseData;
    const sc = STATUS_CONFIG[freshCase.status];

    const currentIdx = STATUS_FLOW.indexOf(freshCase.status);
    const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

    const handleAdvance = () => {
        if (!nextStatus || !note.trim()) return;
        store.updateCaseStatus(freshCase.id, nextStatus, note.trim());
        setNote('');
        setShowAdvance(false);
    };

    const handleSatisfied = (val: boolean) => {
        store.markUserSatisfied(freshCase.id, val);
        if (val && freshCase.status === 'physically-resolved') {
            store.processHonorarium(freshCase.id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button className="btn btn-outline" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
                <ArrowLeft size={16} /> Back to Cases
            </button>

            {/* Case Header */}
            <div className="card" style={{ borderLeft: `4px solid ${sc.color}`, padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px' }}>{freshCase.id}</span>
                            <span className={`badge badge-${freshCase.priority === 'high' ? 'danger' : freshCase.priority === 'medium' ? 'warning' : 'success'}`}>{freshCase.priority.toUpperCase()} PRIORITY</span>
                        </div>
                        <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>{freshCase.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{freshCase.description}</p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {freshCase.reportedBy}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {freshCase.reportedByPhone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {freshCase.villageName}</span>
                        </div>
                    </div>
                    <div style={{ padding: '14px 20px', borderRadius: '12px', background: sc.bg, border: `1px solid ${sc.color}30`, textAlign: 'center' }}>
                        <sc.icon size={24} color={sc.color} />
                        <div style={{ fontSize: '12px', fontWeight: 800, color: sc.color, marginTop: '4px' }}>{sc.label}</div>
                    </div>
                </div>
            </div>

            {/* Status Pipeline */}
            <div className="card">
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="var(--primary)" /> Resolution Progress
                </h4>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {STATUS_FLOW.map((s, i) => {
                        const cfg = STATUS_CONFIG[s];
                        const isActive = s === freshCase.status;
                        const isPassed = STATUS_FLOW.indexOf(s) < currentIdx;
                        return (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                                <div style={{
                                    flex: 1, padding: '12px 8px', borderRadius: '10px', textAlign: 'center',
                                    background: isActive ? cfg.bg : isPassed ? 'rgba(16,185,129,0.05)' : 'var(--bg)',
                                    border: `2px solid ${isActive ? cfg.color : isPassed ? '#10B981' : 'var(--border)'}`,
                                    opacity: isPassed || isActive ? 1 : 0.4,
                                }}>
                                    {isPassed ? <CheckCircle size={16} color="#10B981" /> : <cfg.icon size={16} color={isActive ? cfg.color : 'var(--text-secondary)'} />}
                                    <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px', color: isActive ? cfg.color : 'var(--text-secondary)' }}>{cfg.label}</div>
                                </div>
                                {i < STATUS_FLOW.length - 1 && <ChevronRight size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />}
                            </div>
                        );
                    })}
                </div>

                {/* Advance Button */}
                {nextStatus && (
                    <div style={{ marginTop: '16px' }}>
                        {!showAdvance ? (
                            <button className="btn btn-primary" onClick={() => setShowAdvance(true)} style={{ width: '100%' }}>
                                <ChevronRight size={16} /> Advance to: {STATUS_CONFIG[nextStatus].label}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
                                <textarea
                                    placeholder="Describe what action was taken..."
                                    value={note} onChange={e => setNote(e.target.value)}
                                    rows={3} style={{ resize: 'vertical' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary" onClick={handleAdvance} disabled={!note.trim()} style={{ flex: 1 }}>
                                        <CheckCircle size={16} /> Confirm Update
                                    </button>
                                    <button className="btn btn-outline" onClick={() => setShowAdvance(false)}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* User Satisfied Toggle */}
                {freshCase.status === 'physically-resolved' && (
                    <div style={{
                        marginTop: '16px', padding: '16px', borderRadius: '12px',
                        background: freshCase.userSatisfied ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                        border: `1px solid ${freshCase.userSatisfied ? '#10B981' : '#F59E0B'}30`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
                    }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>
                                {freshCase.userSatisfied ? '✅ User Satisfied' : '⏳ Awaiting User Feedback'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                Honorarium is released only after user confirmation
                            </div>
                        </div>
                        {!freshCase.userSatisfied && (
                            <button className="btn btn-primary" onClick={() => handleSatisfied(true)} style={{ fontSize: '13px' }}>
                                <BadgeCheck size={16} /> Mark Satisfied
                            </button>
                        )}
                        {freshCase.honorariumPaid && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 800, fontSize: '14px' }}>
                                <IndianRupee size={16} /> ₹{freshCase.honorariumAmount} Paid
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* OCR Extracted Data */}
            {freshCase.ocrExtractedData && (
                <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} color="var(--warning)" /> OCR Extracted Intel
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {freshCase.ocrExtractedData.sender && (
                            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sender</div>
                                <div style={{ fontWeight: 700, marginTop: '4px', fontSize: '14px' }}>{freshCase.ocrExtractedData.sender}</div>
                            </div>
                        )}
                        {freshCase.ocrExtractedData.amount && (
                            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amount</div>
                                <div style={{ fontWeight: 700, marginTop: '4px', fontSize: '14px', color: 'var(--danger)' }}>{freshCase.ocrExtractedData.amount}</div>
                            </div>
                        )}
                        {freshCase.ocrExtractedData.upiId && (
                            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>UPI ID</div>
                                <div style={{ fontWeight: 700, marginTop: '4px', fontSize: '14px', color: 'var(--danger)' }}>{freshCase.ocrExtractedData.upiId}</div>
                            </div>
                        )}
                        {freshCase.ocrExtractedData.bankName && (
                            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Bank</div>
                                <div style={{ fontWeight: 700, marginTop: '4px', fontSize: '14px' }}>{freshCase.ocrExtractedData.bankName}</div>
                            </div>
                        )}
                        {freshCase.ocrExtractedData.suspiciousLinks && freshCase.ocrExtractedData.suspiciousLinks.length > 0 && (
                            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>⚠️ Suspicious Links</div>
                                <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {freshCase.ocrExtractedData.suspiciousLinks.map((link, i) => (
                                        <span key={i} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '6px', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                                            {link}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Attachments */}
            {freshCase.attachments.length > 0 && (
                <div className="card">
                    <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Camera size={18} color="var(--primary)" /> Evidence ({freshCase.attachments.length})
                    </h4>
                    {freshCase.attachments.map(att => (
                        <div key={att.id} style={{
                            padding: '14px', background: 'var(--bg)', borderRadius: '10px', marginBottom: '8px',
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: att.ocrText ? '10px' : 0 }}>
                                <span style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileText size={14} /> {att.type.toUpperCase()} • {timeAgo(att.uploadedAt)}
                                </span>
                            </div>
                            {att.ocrText && (
                                <div style={{
                                    padding: '10px 12px', background: 'rgba(245,158,11,0.05)', borderRadius: '8px',
                                    borderLeft: '3px solid var(--warning)', fontSize: '13px', lineHeight: 1.6,
                                    color: 'var(--text-secondary)', fontStyle: 'italic',
                                }}>
                                    "{att.ocrText}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Timeline */}
            <div className="card">
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={18} color="var(--primary)" /> Case Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {freshCase.updates.map((upd, i) => {
                        const updSc = STATUS_CONFIG[upd.status];
                        return (
                            <div key={upd.id} style={{ display: 'flex', gap: '14px', paddingBottom: i < freshCase.updates.length - 1 ? '20px' : '0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', background: updSc.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        border: `2px solid ${updSc.color}`,
                                    }}>
                                        <updSc.icon size={14} color={updSc.color} />
                                    </div>
                                    {i < freshCase.updates.length - 1 && (
                                        <div style={{ width: '2px', flex: 1, background: 'var(--border)', marginTop: '4px' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, paddingTop: '4px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: updSc.color }}>{updSc.label}</div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>{upd.note}</p>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'monospace' }}>
                                        {new Date(upd.timestamp).toLocaleString()} • {upd.updatedBy}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TAB: New Case (with OCR)
// ═══════════════════════════════════════════════════

function NewCaseTab({ onCreated }: { onCreated: () => void }) {
    const store = useSahayakStore();
    const sahayak = store.currentSahayak!;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Banking Phishing');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
    const [reportedBy, setReportedBy] = useState('');
    const [reportedByPhone, setReportedByPhone] = useState('');
    const [ocrText, setOcrText] = useState('');
    const [ocrFindings, setOcrFindings] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const categories = ['Banking Phishing', 'Reward Scam', 'Utility Bill Scam', 'Job Scam', 'Logistics Scam', 'Identity Theft', 'Govt Impersonation', 'Other'];

    const processImage = useCallback(async (file: File) => {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);

        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            setOcrText(text);

            // Auto-detect category
            const findings: string[] = [];
            SCAM_PATTERNS.forEach(p => {
                const matches = text.match(p.pattern);
                if (matches) {
                    findings.push(p.category);
                    setCategory(p.category);
                }
            });
            setOcrFindings(findings);

            // Auto-fill title if empty
            if (!title) {
                const firstLine = text.split('\n').find(l => l.trim().length > 10) || 'Screenshot Evidence';
                setTitle(`Scam Report: ${firstLine.substring(0, 50).trim()}`);
            }
            if (!description) {
                setDescription(`OCR extracted content from uploaded screenshot:\n"${text.substring(0, 300)}"`);
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setOcrText('OCR processing failed. Please describe the incident manually.');
        } finally {
            setIsProcessing(false);
        }
    }, [title, description]);

    const handleSubmit = () => {
        if (!title.trim() || !description.trim() || !reportedBy.trim()) return;

        const attachments = imagePreview ? [{
            id: `ATT-${Date.now()}`,
            type: 'screenshot' as const,
            url: imagePreview,
            ocrText: ocrText || undefined,
            uploadedAt: new Date().toISOString(),
        }] : [];

        const ocrExtractedData: FraudCase['ocrExtractedData'] = ocrText ? {
            sender: ocrText.match(/(?:from|sender|by)[\s:]+([^\n]+)/i)?.[1],
            amount: ocrText.match(/(?:rs\.?|₹|inr)\s*[\d,]+/i)?.[0],
            upiId: ocrText.match(/[\w.-]+@[\w]+/)?.[0],
            suspiciousLinks: ocrText.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[\w-]+\.(?:in|com|co|org)[^\s]*)/gi) || undefined,
        } : undefined;

        store.addCase({
            title: title.trim(),
            description: description.trim(),
            category,
            status: 'reported',
            priority,
            reportedBy: reportedBy.trim(),
            reportedByPhone: reportedByPhone.trim(),
            assignedSahayakId: sahayak.id,
            villageId: sahayak.villageId,
            villageName: sahayak.villageName,
            attachments,
            ocrExtractedData,
        });

        onCreated();
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={22} color="var(--primary)" /> Report New Incident
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                    Upload a screenshot for OCR auto-fill or manually enter incident details
                </p>

                {/* Upload Area */}
                <div
                    style={{
                        padding: imagePreview ? '16px' : '40px', border: '2px dashed var(--border)', borderRadius: '16px',
                        textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', marginBottom: '24px',
                        background: imagePreview ? 'var(--bg)' : 'transparent',
                    }}
                    onClick={() => fileRef.current?.click()}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <input ref={fileRef} type="file" hidden accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) processImage(f); }} />
                    {isProcessing ? (
                        <div>
                            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                            <p style={{ fontWeight: 700 }}>Processing screenshot with OCR...</p>
                        </div>
                    ) : imagePreview ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={imagePreview} alt="Evidence" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--success)' }}>✅ Screenshot uploaded</div>
                                {ocrFindings.length > 0 && (
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                        {ocrFindings.map((f, i) => (
                                            <span key={i} style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '4px', fontWeight: 700 }}>
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Click to replace</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
                            <h4 style={{ fontWeight: 800, marginBottom: '6px' }}>Upload Incident Screenshot</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                WhatsApp scam, fake bill, phishing link — OCR will auto-extract details
                            </p>
                        </>
                    )}
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                            Incident Title *
                        </label>
                        <input placeholder="e.g., WhatsApp KYC scam targeting elderly" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                            Detailed Description *
                        </label>
                        <textarea placeholder="Describe what happened..." value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                                Category
                            </label>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                                Priority
                            </label>
                            <select value={priority} onChange={e => setPriority(e.target.value as any)}>
                                <option value="high">🔴 High</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="low">🟢 Low</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                                Reported By *
                            </label>
                            <input placeholder="Victim / Family name" value={reportedBy} onChange={e => setReportedBy(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                                Contact Number
                            </label>
                            <input type="tel" maxLength={10} placeholder="Phone number" value={reportedByPhone} onChange={e => setReportedByPhone(e.target.value.replace(/\D/g, ''))} />
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleSubmit}
                        disabled={!title.trim() || !description.trim() || !reportedBy.trim()}
                        style={{ padding: '16px', fontSize: '16px', fontWeight: 800, borderRadius: '14px', marginTop: '8px' }}
                    >
                        <Flag size={18} /> Submit Incident Report
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TAB: Incentives
// ═══════════════════════════════════════════════════

function IncentivesTab() {
    const store = useSahayakStore();
    const eligible = store.getEligibleForPayment();
    const paidCases = store.cases.filter(c => c.honorariumPaid);
    const totalEarned = paidCases.reduce((sum, c) => sum + (c.honorariumAmount || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Summary */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
                border: '1px solid rgba(139,92,246,0.2)', padding: '28px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Earned</div>
                        <div style={{ fontSize: '40px', fontWeight: 900, color: '#8B5CF6', marginTop: '4px' }}>
                            ₹<CountUp end={totalEarned} duration={1.5} separator="," />
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            From {paidCases.length} resolved cases
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Award size={48} color="#8B5CF6" />
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6', marginTop: '4px' }}>Community Hero</div>
                    </div>
                </div>
            </div>

            {/* Payment Rule */}
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IndianRupee size={18} color="var(--primary)" /> Honorarium Policy
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    ₹250 – ₹500 per case, paid only when the case is <strong>"Fully Resolved"</strong> AND the victim confirms <strong>"User Satisfied"</strong>. High priority = ₹500, Medium = ₹375, Low = ₹250.
                </p>
            </div>

            {/* Eligible for Payment */}
            {eligible.length > 0 && (
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: 'var(--success)' }}>
                        ⏳ Ready for Payment ({eligible.length})
                    </h4>
                    {eligible.map(c => (
                        <div key={c.id} className="card" style={{ padding: '16px', marginBottom: '8px', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{c.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.id} • {c.category}</div>
                                </div>
                                <button className="btn btn-primary" onClick={() => store.processHonorarium(c.id)} style={{ fontSize: '13px' }}>
                                    <IndianRupee size={14} /> Process Payment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paid History */}
            <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>💰 Payment History</h4>
                {paidCases.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        No payments processed yet
                    </div>
                ) : (
                    paidCases.map(c => (
                        <div key={c.id} className="card" style={{ padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{c.title}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {c.id} • Resolved {c.resolvedAt ? timeAgo(c.resolvedAt) : '-'}
                                </div>
                            </div>
                            <div style={{ fontWeight: 900, color: '#10B981', fontSize: '16px' }}>
                                ₹{c.honorariumAmount}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TAB: Audit Log
// ═══════════════════════════════════════════════════

function AuditTab() {
    const store = useSahayakStore();
    const [filter, setFilter] = useState('all');

    const actionColors: Record<string, string> = {
        'LOGIN': '#3B82F6',
        'LOGOUT': '#6B7280',
        'CASE_CREATED': '#10B981',
        'STATUS_UPDATE': '#F59E0B',
        'HONORARIUM_PAID': '#8B5CF6',
    };

    const filtered = filter === 'all' ? store.auditLog : store.auditLog.filter(e => e.action === filter);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Lock size={16} color="var(--primary)" />
                    <h4 style={{ fontWeight: 800, fontSize: '14px' }}>Transparency Log — Edge AI Privacy</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    All Sahayak actions are immutably logged. Case data stays private within the village admin cluster unless legal reporting is triggered.
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all', 'LOGIN', 'CASE_CREATED', 'STATUS_UPDATE', 'HONORARIUM_PAID'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)',
                        background: filter === f ? 'var(--primary)' : 'transparent',
                        color: filter === f ? 'white' : 'var(--text-secondary)',
                        fontSize: '11px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                    }}>
                        {f === 'all' ? 'All' : f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Log Entries */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Details</th>
                            <th>By</th>
                            <th>Case</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(entry => (
                            <tr key={entry.id} style={{ cursor: 'default' }}>
                                <td>
                                    <span style={{
                                        padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800,
                                        background: `${actionColors[entry.action] || '#6B7280'}20`,
                                        color: actionColors[entry.action] || '#6B7280',
                                        fontFamily: 'monospace',
                                    }}>
                                        {entry.action}
                                    </span>
                                </td>
                                <td style={{ fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.details}</td>
                                <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>{entry.performedBy}</td>
                                <td style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--primary)' }}>{entry.caseId || '—'}</td>
                                <td style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(entry.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
