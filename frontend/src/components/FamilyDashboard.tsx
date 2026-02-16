import { useState } from 'react';
import { useFamilyStore } from '../store/familyStore';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Clock, Smartphone, Plus, X, ChevronRight, UserPlus } from 'lucide-react';
import type { FamilyMember } from '../store/familyStore';

interface FamilyDashboardProps {
    onBack: () => void;
}

const AVATAR_OPTIONS = ['👩', '👨', '👧', '👦', '👴', '👵', '🧑', '👶', '🧓', '👱'];
const RELATION_OPTIONS = ['Mother', 'Father', 'Sister', 'Brother', 'Grandfather', 'Grandmother', 'Son', 'Daughter', 'Spouse', 'Other'];

import { useLanguageStore } from '../store/languageStore';

const RELATION_TRANSLATIONS: Record<string, { hi: string, bn: string }> = {
    'Mother': { hi: 'माँ', bn: 'মা' },
    'Father': { hi: 'पिता', bn: 'বাবা' },
    'Sister': { hi: 'बहन', bn: 'বোন' },
    'Brother': { hi: 'भाई', bn: 'ভাই' },
    'Grandfather': { hi: 'दादा', bn: 'দাদা' },
    'Grandmother': { hi: 'दादी', bn: 'দিদা' },
    'Son': { hi: 'बेटा', bn: 'ছেলে' },
    'Daughter': { hi: 'बेटी', bn: 'মেয়ে' },
    'Spouse': { hi: 'जीवनसाथी', bn: 'স্ত্রী/স্বামী' },
    'Other': { hi: 'अन्य', bn: 'অন্যান্য' },
};

export default function FamilyDashboard({ onBack }: FamilyDashboardProps) {
    const { members, addMember, resolveAlert } = useFamilyStore();
    const { language } = useLanguageStore();
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        phone: '',
        avatar: '🧑',
        relation: 'Other',
        deviceInfo: '',
    });

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10B981';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'linear-gradient(135deg, #10B981, #059669)';
        if (score >= 50) return 'linear-gradient(135deg, #F59E0B, #D97706)';
        return 'linear-gradient(135deg, #EF4444, #DC2626)';
    };

    const handleAddMember = () => {
        if (!newMember.name.trim() || !newMember.phone.trim()) return;
        addMember({
            name: newMember.name.trim(),
            phone: newMember.phone.trim(),
            avatar: newMember.avatar,
            relation: newMember.relation,
            safetyScore: 100,
            isOnline: false,
            lastActive: 'Just added',
            threatsBlocked: 0,
            messagesScanned: 0,
            recentAlerts: [],
            deviceInfo: newMember.deviceInfo.trim() || 'Unknown Device',
            relationTranslations: RELATION_TRANSLATIONS[newMember.relation],
        });
        setNewMember({ name: '', phone: '', avatar: '🧑', relation: 'Other', deviceInfo: '' });
        setShowAddModal(false);
    };

    if (selectedMember) {
        const member = members.find(m => m.id === selectedMember.id) || selectedMember;
        return (
            <div className="family-dashboard">
                <div className="family-detail-header">
                    <button className="btn btn-outline" onClick={() => setSelectedMember(null)}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{member.avatar} {member.nameTranslations?.[language as 'hi' | 'bn'] || member.name}'s Dashboard</h2>
                </div>

                <div className="family-member-profile">
                    <div className="family-profile-left">
                        <div className="family-avatar-large" style={{ borderColor: getScoreColor(member.safetyScore) }}>
                            {member.avatar}
                            <div className="family-online-dot" style={{ background: member.isOnline ? '#10B981' : '#6B7280', width: '16px', height: '16px' }}></div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{member.nameTranslations?.[language as 'hi' | 'bn'] || member.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{member.relationTranslations?.[language as 'hi' | 'bn'] || member.relation} • {member.phone}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Smartphone size={13} /> {member.deviceInfo}
                            </p>
                        </div>
                    </div>
                    <div className="family-score-ring-large">
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                            <circle cx="60" cy="60" r="52" fill="none" stroke={getScoreColor(member.safetyScore)} strokeWidth="8"
                                strokeDasharray={`${member.safetyScore * 3.27} 327`} strokeLinecap="round"
                                transform="rotate(-90 60 60)" />
                        </svg>
                        <div className="family-score-text-large">{member.safetyScore}</div>
                    </div>
                </div>

                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-card">
                        <div className="stat-label">Messages Scanned</div>
                        <div className="stat-value" style={{ color: 'var(--primary)' }}>{member.messagesScanned}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Threats Blocked</div>
                        <div className="stat-value" style={{ color: 'var(--danger)' }}>{member.threatsBlocked}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Active Alerts</div>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>{member.recentAlerts.filter(a => !a.resolved).length}</div>
                    </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Recent Alerts</h3>
                <div className="family-alert-list">
                    {member.recentAlerts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={32} color="#10B981" />
                            <p style={{ marginTop: '8px' }}>No alerts — all clear! 🎉</p>
                        </div>
                    ) : (
                        member.recentAlerts.map(alert => (
                            <div key={alert.id} className={`family-alert-item ${alert.resolved ? 'family-alert-resolved' : ''}`} data-level={alert.severity}>
                                <div className="family-alert-indicator" style={{ background: alert.severity === 'high' ? '#EF4444' : alert.severity === 'medium' ? '#F59E0B' : '#10B981' }}></div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{alert.message}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                                        <span><Clock size={11} /> {alert.timestamp}</span>
                                        <span>Source: {alert.source}</span>
                                    </div>
                                </div>
                                {!alert.resolved && (
                                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}
                                        onClick={() => resolveAlert(member.id, alert.id)}>
                                        Resolve
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="family-dashboard">
            <div className="family-detail-header">
                <button className="btn btn-outline" onClick={onBack}>
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 style={{ fontSize: '28px', fontWeight: 800 }}>👨‍👩‍👧‍👦 Family Protection</h2>
            </div>

            <div className="family-grid">
                {members.map(member => (
                    <div key={member.id}
                        className={`family-card ${member.recentAlerts.some(a => a.severity === 'high' && !a.resolved) ? 'family-card-alert' : member.safetyScore < 60 ? 'family-card-atrisk' : ''}`}
                        onClick={() => setSelectedMember(member)}>
                        <div className="family-card-glow" style={{ background: getScoreGradient(member.safetyScore) }}></div>
                        <div className="family-card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="family-avatar" style={{ borderColor: getScoreColor(member.safetyScore) }}>
                                    {member.avatar}
                                    <div className="family-online-dot" style={{ background: member.isOnline ? '#10B981' : '#6B7280' }}></div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{member.nameTranslations?.[language as 'hi' | 'bn'] || member.name}</h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{member.relationTranslations?.[language as 'hi' | 'bn'] || member.relation} • {member.isOnline ? 'Online' : member.lastActive}</p>
                                </div>
                            </div>
                            <div className="family-score-ring">
                                <svg viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={getScoreColor(member.safetyScore)} strokeWidth="4"
                                        strokeDasharray={`${member.safetyScore * 1.26} 126`} strokeLinecap="round"
                                        transform="rotate(-90 24 24)" />
                                </svg>
                                <div className="family-score-text">{member.safetyScore}</div>
                            </div>
                        </div>

                        <div className="family-mini-stats">
                            <div>
                                <span className="family-mini-value">{member.messagesScanned}</span>
                                <span className="family-mini-label">Scanned</span>
                            </div>
                            <div>
                                <span className="family-mini-value" style={{ color: 'var(--danger)' }}>{member.threatsBlocked}</span>
                                <span className="family-mini-label">Blocked</span>
                            </div>
                            <div>
                                <span className="family-mini-value" style={{ color: member.recentAlerts.filter(a => !a.resolved).length > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                    {member.recentAlerts.filter(a => !a.resolved).length}
                                </span>
                                <span className="family-mini-label">Alerts</span>
                            </div>
                        </div>

                        <div className="family-card-footer">
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Smartphone size={13} /> {member.deviceInfo}
                            </span>
                            <ChevronRight size={16} color="var(--text-secondary)" />
                        </div>
                    </div>
                ))}

                {/* Add Member Card */}
                <div className="family-card family-card-add" onClick={() => setShowAddModal(true)}>
                    <div style={{ textAlign: 'center' }}>
                        <Plus size={32} color="var(--text-secondary)" />
                        <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Add Family Member</p>
                    </div>
                </div>
            </div>

            {/* Add Family Member Modal */}
            {showAddModal && (
                <div className="family-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="family-modal animate-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserPlus size={22} color="var(--primary)" /> Add Family Member
                            </h2>
                            <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Avatar Selector */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AVATAR</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {AVATAR_OPTIONS.map(avatar => (
                                        <button
                                            key={avatar}
                                            onClick={() => setNewMember({ ...newMember, avatar })}
                                            style={{
                                                width: '44px', height: '44px', borderRadius: '50%', fontSize: '22px',
                                                border: newMember.avatar === avatar ? '3px solid var(--primary)' : '2px solid var(--border)',
                                                background: newMember.avatar === avatar ? 'rgba(32, 190, 255, 0.1)' : 'var(--bg)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NAME</label>
                                <input
                                    value={newMember.name}
                                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                    placeholder="e.g. Mom, Dad, Brother..."
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PHONE NUMBER</label>
                                <input
                                    value={newMember.phone}
                                    onChange={e => setNewMember({ ...newMember, phone: e.target.value.replace(/\D/g, '') })}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Relation */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RELATION</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                    {RELATION_OPTIONS.map(relation => (
                                        <button
                                            key={relation}
                                            onClick={() => setNewMember({ ...newMember, relation })}
                                            style={{
                                                padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                border: newMember.relation === relation ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                background: newMember.relation === relation ? 'rgba(32, 190, 255, 0.1)' : 'transparent',
                                                color: newMember.relation === relation ? 'var(--primary)' : 'var(--text-secondary)',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                        >
                                            {RELATION_TRANSLATIONS[relation]?.[language as 'hi' | 'bn'] || relation}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Device Info */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DEVICE (OPTIONAL)</label>
                                <input
                                    value={newMember.deviceInfo}
                                    onChange={e => setNewMember({ ...newMember, deviceInfo: e.target.value })}
                                    placeholder="e.g. Samsung Galaxy A54, iPhone 15..."
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleAddMember}
                                disabled={!newMember.name.trim() || !newMember.phone.trim()}
                            >
                                <Plus size={16} /> Add Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
