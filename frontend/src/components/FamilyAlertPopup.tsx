import { useState, useEffect } from 'react';
import { useFamilyStore } from '../store/familyStore';
import { useLanguageStore } from '../store/languageStore';
import { X, Phone, Eye, AlertTriangle, Bell, BellOff } from 'lucide-react';
import type { FamilyAlert, FamilyMember } from '../store/familyStore';

interface FamilyAlertPopupProps {
    onViewFamily: () => void;
}

export default function FamilyAlertPopup({ onViewFamily }: FamilyAlertPopupProps) {
    const { members, resolveAlert } = useFamilyStore();
    const { t, language } = useLanguageStore();
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [muted, setMuted] = useState(false);

    const activeAlerts: (FamilyAlert & { member: FamilyMember })[] = [];
    members.forEach(member => {
        member.recentAlerts
            .filter(a => !a.resolved && !dismissed.has(a.id) && (a.severity === 'high' || a.severity === 'medium'))
            .forEach(alert => {
                activeAlerts.push({ ...alert, member });
            });
    });

    if (muted || activeAlerts.length === 0) return null;

    return (
        <div className="family-alert-popup-container">
            <div className="family-alert-popup-header">
                <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={14} /> {activeAlerts.length} {activeAlerts.length > 1 ? t('familyAlert_plural') : t('familyAlert')}
                </span>
                <button onClick={() => setMuted(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                    <BellOff size={14} />
                </button>
            </div>

            {activeAlerts.slice(0, 2).map(alert => (
                <div key={alert.id} className={`family-alert-popup ${alert.severity === 'high' ? 'family-alert-popup-high' : 'family-alert-popup-medium'}`}>
                    <div className="family-alert-popup-stripe" style={{ background: alert.severity === 'high' ? '#EF4444' : '#F59E0B' }}></div>
                    <div className="family-alert-popup-content">
                        <div className="family-alert-popup-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                <div className="family-alert-popup-avatar">{alert.member.avatar}</div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                                        {alert.member.nameTranslations?.[language as 'hi' | 'bn'] || alert.member.name}
                                        {alert.severity === 'high' && <AlertTriangle size={14} color="#EF4444" style={{ marginLeft: '6px', verticalAlign: 'middle' }} />}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{alert.timestamp}</div>
                                </div>
                            </div>
                            <button className="family-alert-popup-close" onClick={() => setDismissed(prev => new Set(prev).add(alert.id))}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="family-alert-popup-message">{alert.message}</div>
                        <div className="family-alert-popup-actions">
                            <button className="family-alert-popup-btn family-alert-popup-btn-primary" onClick={onViewFamily}>
                                <Eye size={13} /> {t('view')}
                            </button>
                            <button className="family-alert-popup-btn family-alert-popup-btn-call">
                                <Phone size={13} /> {t('call')} {alert.member.nameTranslations?.[language as 'hi' | 'bn'] || alert.member.name}
                            </button>
                            <button className="family-alert-popup-btn family-alert-popup-btn-dismiss"
                                onClick={() => resolveAlert(alert.member.id, alert.id)}>
                                {t('dismiss')}
                            </button>
                        </div>
                        <div className="family-alert-popup-timer">
                            <div className="family-alert-popup-timer-bar" style={{ background: alert.severity === 'high' ? '#EF4444' : '#F59E0B' }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
