import { Shield, X, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface ThreatModalProps {
    message: any;
    onClose: () => void;
}

export default function ThreatModal({ message, onClose }: ThreatModalProps) {
    return (
        <div className="family-modal-overlay" onClick={onClose}>
            <div className="family-modal animate-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {message.analysis.isScam ? <AlertTriangle size={22} color="#EF4444" /> : <CheckCircle size={22} color="#10B981" />}
                        Threat Analysis
                    </h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sender</div>
                    <div style={{ fontWeight: 600 }}>{message.sender}</div>
                </div>

                <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Message Content</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.6 }}>{message.body}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <span className={`badge badge-${message.analysis.isScam ? 'danger' : 'success'}`}>
                        {message.analysis.isScam ? '🚨 SCAM' : '✅ SAFE'}
                    </span>
                    <span className={`badge badge-${message.analysis.threatLevel === 'high' ? 'danger' : message.analysis.threatLevel === 'medium' ? 'warning' : 'success'}`}>
                        {message.analysis.threatLevel.toUpperCase()} RISK
                    </span>
                </div>

                <div style={{ padding: '14px', background: message.analysis.isScam ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)', borderRadius: '12px', border: `1px solid ${message.analysis.isScam ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}` }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>AI Analysis</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message.analysis.reason}</div>
                </div>

                {message.analysis.isScam && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }}>
                            <Shield size={16} /> Report Scam
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1 }}>
                            <ExternalLink size={16} /> Block Sender
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
