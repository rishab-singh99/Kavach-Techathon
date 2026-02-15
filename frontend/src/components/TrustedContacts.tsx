import { useState } from 'react';
import { useTrustedContactStore } from '../store/trustedContactStore';
import type { TrustedContact } from '../store/trustedContactStore';
import {
    ArrowLeft, Shield, Search, Plus, Phone, CheckCircle, AlertTriangle,
    X, Star, Trash2, Edit3, UserCheck, Building, Landmark, Users, User, HelpCircle
} from 'lucide-react';

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
        </div>
    );
}
