import { useState, useRef } from 'react';
import { useTrustedContactStore } from '../store/trustedContactStore';
import type { TrustedContact } from '../store/trustedContactStore';
import {
    ArrowLeft, Shield, Search, Plus, Phone, CheckCircle, AlertTriangle,
    X, Star, Trash2, Edit3, UserCheck, Building, Landmark, Users, User, HelpCircle, Loader, CheckSquare, Square,
    Skull, AlertCircle, Info, MessageSquare, Globe, Flag, Share2, UserX, Volume2, VolumeX
} from 'lucide-react';
import { speak, speakThreatAlert } from '../utils/speech';
import { useLanguageStore } from '../store/languageStore';

const GOOGLE_MOCK_CONTACTS = [
    { name: "Mom", phone: "+1 (555) 123-4567", type: "family" },
    { name: "Dad", phone: "+1 (555) 987-6543", type: "family" },
    { name: "Alice Smith", phone: "+1 (555) 555-0199", type: "personal" },
    { name: "Emergency Service", phone: "911", type: "government" },
    { name: "Dr. Bob", phone: "+1 (555) 555-0123", type: "personal" },
    { name: "Grandma", phone: "+1 (555) 444-5555", type: "family" },
    { name: "Work Helpline", phone: "1800-555-000", type: "business" },
    { name: "Sarah Jones", phone: "+1 (555) 234-5678", type: "personal" },
    { name: "City Bank", phone: "1800-123-456", type: "bank" },
    { name: "Tax Office", phone: "1300-TAX-HELP", type: "government" },
    { name: "Uncle John", phone: "+1 (555) 888-9999", type: "family" },
    { name: "Tech Support", phone: "+1 (800) 444-4444", type: "business" },
    { name: "Jane Doe", phone: "+1 (555) 777-1111", type: "personal" },
    { name: "Hospital Main", phone: "+1 (555) 222-3333", type: "government" },
    { name: "Pizza Place", phone: "+1 (555) 666-7777", type: "business" },
];

interface TrustedContactsProps {
    onBack: () => void;
}

export default function TrustedContacts({ onBack }: TrustedContactsProps) {
    const { contacts, addContact, removeContact, verifyNumber, getStats } = useTrustedContactStore();
    const { language } = useLanguageStore();
    const [activeTab, setActiveTab] = useState<'contacts' | 'verify'>('contacts');

    // Contacts View State
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'personal' as any, notes: '', icon: '👤', verified: true, verifiedBy: 'user' as any, trustScore: 80 });

    // Fraud Check State
    const [verifyPhone, setVerifyPhone] = useState('');
    const [verifyResult, setVerifyResult] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);

    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        isMutedRef.current = newState;

        if (newState) {
            window.speechSynthesis.cancel();
        }
    };

    // Google Import State
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [googleStep, setGoogleStep] = useState<'login' | 'loading' | 'select'>('login');
    const [googleEmail, setGoogleEmail] = useState('');
    const [googlePassword, setGooglePassword] = useState('');
    const [selectedGoogleContacts, setSelectedGoogleContacts] = useState<number[]>([]);

    const handleGoogleLogin = () => {
        if (!googleEmail || !googlePassword) return;
        setGoogleStep('loading');
        setTimeout(() => {
            setGoogleStep('select');
        }, 2000);
    };

    const toggleGoogleContact = (index: number) => {
        if (selectedGoogleContacts.includes(index)) {
            setSelectedGoogleContacts(selectedGoogleContacts.filter(i => i !== index));
        } else {
            setSelectedGoogleContacts([...selectedGoogleContacts, index]);
        }
    };

    const importGoogleContacts = () => {
        const contactsToImport = GOOGLE_MOCK_CONTACTS.filter((_, i) => selectedGoogleContacts.includes(i));
        contactsToImport.forEach(c => {
            addContact({
                name: c.name,
                phone: c.phone,
                type: c.type as any,
                notes: 'Imported from Google',
                icon: '👤',
                verified: true,
                verifiedBy: 'user',
                trustScore: 85
            });
        });
        setShowGoogleModal(false);
        setGoogleStep('login');
        setGoogleEmail('');
        setGooglePassword('');
        setSelectedGoogleContacts([]);
    };

    const stats = getStats();

    const handleVerify = () => {
        if (!verifyPhone.trim()) return;
        setIsSearching(true);

        setTimeout(() => {
            const res = verifyNumber(verifyPhone.trim());
            setVerifyResult(res);
            // Speak sequential threat alert if it's a scam and not muted (checking ref for latest state)
            if (res.isScam && !isMutedRef.current) {
                speakThreatAlert(language as any);
            }
        }, 800);
    };

    const handleAddContact = () => {
        if (!newContact.name || !newContact.phone) return;
        addContact(newContact);
        setNewContact({ name: '', phone: '', type: 'personal', notes: '', icon: '👤', verified: true, verifiedBy: 'user', trustScore: 80 });
        setShowAddModal(false);
    };

    const typeIcons: Record<string, any> = {
        bank: <Landmark size={14} />, government: <Shield size={14} />,
        family: <Users size={14} />, business: <Building size={14} />,
        personal: <User size={14} />, other: <HelpCircle size={14} />
    };

    const typeColors: Record<string, string> = {
        bank: '#3B82F6', government: '#8B5CF6', family: '#10B981',
        business: '#F59E0B', personal: '#EC4899', other: '#6B7280'
    };

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
        const matchesType = filterType === 'all' || c.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="tc-container" style={{ padding: '32px 0 64px' }}>
            {/* Header */}
            <div className="tc-header" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="btn btn-outline" onClick={onBack}><ArrowLeft size={16} /> Back</button>
                        <h2 className="tc-title" style={{ fontSize: '24px', fontWeight: 800 }}>🛡️ Trusted & Verification</h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tc-tabs" style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                    <button
                        className={`btn ${activeTab === 'contacts' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('contacts')}
                        style={{ borderRadius: '8px', minWidth: '140px' }}
                    >
                        <Users size={18} style={{ marginRight: '8px' }} /> My Contacts
                    </button>
                    <button
                        className={`btn ${activeTab === 'verify' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('verify')}
                        style={{ borderRadius: '8px', minWidth: '140px' }}
                    >
                        <Search size={18} style={{ marginRight: '8px' }} /> Check Number
                    </button>
                </div>
            </div>

            {/* TAB 1: MY CONTACTS */}
            {activeTab === 'contacts' && (
                <div className="animate-fade-in">
                    {/* Stats */}
                    <div className="tc-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                        {[
                            { label: 'Total', value: stats.total, icon: '📋', color: '#20BEFF' },
                            { label: 'Verified', value: stats.verified, icon: '✅', color: '#10B981' },
                            { label: 'Banks', value: stats.banks, icon: '🏦', color: '#3B82F6' },
                            { label: 'Family', value: stats.family, icon: '👨‍👩‍👧', color: '#EC4899' },
                        ].map((stat, i) => (
                            <div key={i} className="tc-stat-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                <div className="tc-stat-icon" style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
                                <div className="tc-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Actions Row */}
                    <div className="tc-list-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <div className="tc-search-wrap" style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                className="tc-search-input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search contacts..."
                                style={{ paddingLeft: '36px', width: '260px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowGoogleModal(true)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Import
                            </button>
                            <button className="btn btn-primary tc-add-btn" onClick={() => setShowAddModal(true)}>
                                <Plus size={16} /> Add
                            </button>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="tc-filter-pills" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {['all', 'bank', 'government', 'family', 'business', 'personal'].map(type => (
                            <button key={type} className={`tc-filter-pill ${filterType === type ? 'active' : ''}`}
                                onClick={() => setFilterType(type)}
                                style={{
                                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                    border: '1px solid var(--border)', cursor: 'pointer', textTransform: 'capitalize',
                                    background: filterType === type ? 'var(--primary)' : 'transparent',
                                    color: filterType === type ? 'white' : 'var(--text-secondary)',
                                }}>
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Contact Grid */}
                    <div className="tc-contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                        {filteredContacts.map(contact => (
                            <div key={contact.id} className="tc-contact-card" style={{
                                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
                                padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                                transition: 'all 0.2s', cursor: 'default'
                            }}>
                                <div className="tc-contact-avatar" style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: `${typeColors[contact.type]}15`, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0
                                }}>
                                    {contact.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="tc-contact-name" style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {contact.name}
                                        {contact.verified && <CheckCircle size={14} color="#10B981" />}
                                    </div>
                                    <div className="tc-contact-phone" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Phone size={11} /> {contact.phone}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span style={{
                                        padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                        background: `${typeColors[contact.type]}15`, color: typeColors[contact.type],
                                        textTransform: 'capitalize'
                                    }}>
                                        {contact.type}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        Score: {contact.trustScore}%
                                    </span>
                                </div>
                                <button className="btn-icon" onClick={() => removeContact(contact.id)} style={{ color: 'var(--text-secondary)', padding: '6px' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {filteredContacts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                            <UserCheck size={40} />
                            <p style={{ marginTop: '12px', fontWeight: 600 }}>No contacts found</p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: FRAUD CHECK / VERIFY */}
            {activeTab === 'verify' && (
                <div className="animate-fade-in card" style={{ maxWidth: '800px', margin: '20px auto', padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(32, 190, 255, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                color: 'var(--primary)'
                            }}>
                                <Shield size={40} />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Fraud Shield & Verification</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                                Scan numbers against global fraud databases and community reports.
                            </p>
                        </div>
                        <button
                            className={`btn ${isMuted ? 'btn-outline' : 'btn-primary'}`}
                            onClick={toggleMute}
                            style={{ padding: '10px' }}
                            title={isMuted ? "Unmute Alerts" : "Mute Alerts"}
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </div>

                    {/* Search Input */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                value={verifyPhone}
                                onChange={e => setVerifyPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 10-digit mobile number..."
                                style={{ paddingLeft: '48px', height: '56px', fontSize: '18px' }}
                                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleVerify}
                            disabled={!verifyPhone || isSearching}
                            style={{ padding: '0 32px', height: '56px', fontSize: '16px' }}
                        >
                            {isSearching ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <Search size={20} />}
                            Check Profile
                        </button>
                    </div>

                    {/* Verification Result */}
                    {verifyResult && (
                        <div className="animate-modal" style={{
                            marginTop: '40px', padding: '32px', borderRadius: '20px',
                            background: verifyResult.isScam ? 'rgba(239,68,68,0.05)' : verifyResult.isSafe ? 'rgba(16,185,129,0.05)' : 'var(--bg)',
                            border: `2px solid ${verifyResult.isScam ? '#EF4444' : verifyResult.isSafe ? '#10B981' : 'var(--border)'}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '16px',
                                        background: verifyResult.isScam ? '#EF4444' : verifyResult.isSafe ? '#10B981' : '#6B7280',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        {verifyResult.isScam ? <AlertTriangle size={32} /> : verifyResult.isSafe ? <CheckCircle size={32} /> : <Info size={32} />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: verifyResult.isScam ? '#EF4444' : verifyResult.isSafe ? '#10B981' : 'var(--text-secondary)' }}>
                                            {verifyResult.isScam ? 'Fraudulent Number Detected' : verifyResult.isSafe ? 'Verified Safe Caller' : 'Unknown / Unverified'}
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{verifyPhone}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Safety Score</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: verifyResult.isScam ? '#EF4444' : verifyResult.isSafe ? '#10B981' : '#F59E0B' }}>
                                        {verifyResult.isScam ? '12%' : verifyResult.isSafe ? '98%' : '50%'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                <div className="card" style={{ background: 'var(--surface)', padding: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                        <MessageSquare size={14} /> Reports
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{verifyResult.communityReports || 0}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Community Flagged</div>
                                </div>
                                <div className="card" style={{ background: 'var(--surface)', padding: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                        <Globe size={14} /> Location
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{verifyResult.isScam ? 'Multiple / VOIP' : 'India'}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Geographic Origin</div>
                                </div>
                                <div className="card" style={{ background: 'var(--surface)', padding: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                        <Flag size={14} /> Type
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{verifyResult.isScam ? 'Spam / Fraud' : 'Mobile'}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Number Category</div>
                                </div>
                            </div>

                            <div style={{ padding: '20px', background: 'var(--bg)', borderRadius: '12px', marginBottom: '24px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} /> Analysis Result
                                </div>
                                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                    {verifyResult.message}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                {verifyResult.isScam ? (
                                    <>
                                        <button className="btn btn-primary" style={{ flex: 1, background: '#EF4444' }}>
                                            <UserX size={18} /> Block & Report
                                        </button>
                                        <button className="btn btn-outline" style={{ flex: 1 }}>
                                            <Share2 size={18} /> Alert Family
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-primary" style={{ flex: 1 }}>
                                            <CheckCircle size={18} /> Add to Trusted
                                        </button>
                                        <button className="btn btn-outline" style={{ flex: 1 }}>
                                            <Phone size={18} /> Call Number
                                        </button>
                                    </>
                                )}
                                <button
                                    className={`btn ${isMuted ? 'btn-ghost' : 'btn-outline'}`}
                                    onClick={() => !isMuted && speak(verifyResult.message, language as any)}
                                    disabled={isMuted}
                                    title={isMuted ? "Unmute to hear analysis" : "Read analysis"}
                                >
                                    {isMuted ? <VolumeX size={18} color="var(--text-secondary)" /> : <Volume2 size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Recent Fraud Section - Inside Verify Tab */}
                    <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Skull size={20} color="#EF4444" />
                            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Recent Community Blacklist</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                            {[
                                { name: '1234567890', type: 'Insurance Scam', reports: '428' },
                                { name: '9999999999', type: 'Lottery Fraud', reports: '1.2k' },
                                { name: '8888888888', type: 'Tax Scam', reports: '850' }
                            ].map((fraud, i) => (
                                <div key={i} className="tc-contact-card" style={{
                                    background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '14px',
                                    padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: 'rgba(239, 68, 68, 0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0
                                    }}>
                                        🚫
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#EF4444' }}>{fraud.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{fraud.type}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>High Risk</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{fraud.reports} Reports</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals - Add Contact */}
            {showAddModal && (
                <div className="family-modal-overlay tc-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="family-modal tc-modal animate-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>➕ Add Trusted Contact</h2>
                            <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>NAME</label>
                                <input value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} placeholder="Contact name" />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>PHONE</label>
                                <input value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value.replace(/\D/g, '') })} placeholder="Phone number" />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>TYPE</label>
                                <div className="tc-type-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                    {(['bank', 'government', 'family', 'business', 'personal', 'other'] as const).map(type => (
                                        <button key={type} onClick={() => setNewContact({ ...newContact, type })}
                                            style={{
                                                padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                border: `1px solid ${newContact.type === type ? typeColors[type] : 'var(--border)'}`,
                                                background: newContact.type === type ? `${typeColors[type]}15` : 'transparent',
                                                color: newContact.type === type ? typeColors[type] : 'var(--text-secondary)',
                                                cursor: 'pointer', textTransform: 'capitalize', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                            }}>
                                            {typeIcons[type]} {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>NOTES</label>
                                <input value={newContact.notes} onChange={e => setNewContact({ ...newContact, notes: e.target.value })} placeholder="Optional notes..." />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="btn btn-outline tc-btn-cancel" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary tc-btn-save" style={{ flex: 1 }} onClick={handleAddContact} disabled={!newContact.name || !newContact.phone}>
                                <Plus size={16} /> Add Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Google Import Modal */}
            {showGoogleModal && (
                <div className="family-modal-overlay tc-modal-overlay" onClick={() => setShowGoogleModal(false)}>
                    <div className="family-modal tc-modal animate-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '0', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                                    {googleStep === 'login' ? 'Sign in with Google' : googleStep === 'loading' ? 'Authenticating...' : 'Import Contacts'}
                                </h2>
                            </div>
                            <button className="btn-icon" onClick={() => setShowGoogleModal(false)}><X size={20} /></button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            {googleStep === 'login' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        Sign in to suspect trusted contacts from your Google account.
                                    </p>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Email</label>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={googleEmail}
                                            onChange={e => setGoogleEmail(e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={googlePassword}
                                            onChange={e => setGooglePassword(e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={!googleEmail || !googlePassword}
                                        className="btn btn-primary"
                                        style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}

                            {googleStep === 'loading' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                                    <div className="animate-spin" style={{ marginBottom: '16px' }}>
                                        <Loader size={32} color="#4285F4" />
                                    </div>
                                    <p style={{ fontWeight: 600 }}>Connecting to Google Contacts...</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Please wait while we fetch your data</p>
                                </div>
                            )}

                            {googleStep === 'select' && (
                                <div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                        {GOOGLE_MOCK_CONTACTS.map((contact, index) => {
                                            const isSelected = selectedGoogleContacts.includes(index);
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => toggleGoogleContact(index)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                                                        borderRadius: '10px', border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                                        background: isSelected ? 'rgba(32, 190, 255, 0.05)' : 'var(--surface)',
                                                        cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{contact.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{contact.phone}</div>
                                                    </div>
                                                    <div style={{
                                                        padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                                                        background: 'var(--surface-hover)', textTransform: 'capitalize'
                                                    }}>
                                                        {contact.type}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-outline" onClick={() => setGoogleStep('login')} style={{ flex: 1 }}>Cancel</button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={importGoogleContacts}
                                            disabled={selectedGoogleContacts.length === 0}
                                            style={{ flex: 1 }}
                                        >
                                            Import ({selectedGoogleContacts.length})
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
