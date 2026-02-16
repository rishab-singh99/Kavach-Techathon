import { useState } from 'react';
import { useTrustedContactStore } from '../store/trustedContactStore';
import type { TrustedContact } from '../store/trustedContactStore';
import {
    ArrowLeft, Shield, Search, Plus, Phone, CheckCircle, AlertTriangle,
    X, Star, Trash2, Edit3, UserCheck, Building, Landmark, Users, User, HelpCircle, Loader, CheckSquare, Square
} from 'lucide-react';

const GOOGLE_MOCK_CONTACTS = [
    { name: "Mom", phone: "+1 (555) 123-4567", type: "family" },
    { name: "Dad", phone: "+1 (555) 987-6543", type: "family" },
    { name: "Alice Smith", phone: "+1 (555) 555-0199", type: "personal" },
    { name: "Emergency Service", phone: "911", type: "government" },
    { name: "Dr. Bob", phone: "+1 (555) 555-0123", type: "personal" }
];

interface TrustedContactsProps {
    onBack: () => void;
}

export default function TrustedContacts({ onBack }: TrustedContactsProps) {
    const { contacts, addContact, removeContact, verifyNumber, recentVerifications, getStats } = useTrustedContactStore();
    const [verifyPhone, setVerifyPhone] = useState('');
    const [verifyResult, setVerifyResult] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'personal' as any, notes: '', icon: '👤', verified: true, verifiedBy: 'user' as any, trustScore: 80 });

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
        const result = verifyNumber(verifyPhone.trim());
        setVerifyResult(result);
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
            <div className="tc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={onBack}><ArrowLeft size={16} /> Back</button>
                    <h2 className="tc-title" style={{ fontSize: '24px', fontWeight: 800 }}>🛡️ Trusted Contacts</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowGoogleModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Import from Google
                    </button>
                    <button className="btn btn-primary tc-add-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Add Contact
                    </button>
                </div>
            </div>

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

            {/* Verify Section */}
            <div className="tc-verify-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <h3 className="tc-verify-title" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={18} color="#20BEFF" /> Verify a Number
                </h3>
                <div className="tc-verify-input-row" style={{ display: 'flex', gap: '10px' }}>
                    <input
                        value={verifyPhone}
                        onChange={e => setVerifyPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter phone number..."
                        style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" onClick={handleVerify} disabled={!verifyPhone.trim()}>
                        <Search size={16} /> Verify
                    </button>
                </div>
                {verifyResult && (
                    <div style={{
                        marginTop: '12px', padding: '12px 16px', borderRadius: '10px',
                        background: verifyResult.isScam ? 'rgba(239,68,68,0.08)' : verifyResult.isSafe ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                        border: `1px solid ${verifyResult.isScam ? 'rgba(239,68,68,0.2)' : verifyResult.isSafe ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        fontSize: '14px', fontWeight: 600
                    }}>
                        {verifyResult.message}
                    </div>
                )}
            </div>

            {/* Filters & Search */}
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
                <div className="tc-filter-pills" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                                Trust: {contact.trustScore}%
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

            {/* Add Contact Modal */}
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
