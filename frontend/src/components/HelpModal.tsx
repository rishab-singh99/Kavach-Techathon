import { X, Shield, Phone, MessageSquare, Users, Lock, Globe } from 'lucide-react';

interface HelpModalProps {
    onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
    const tips = [
        { icon: <Phone size={20} />, title: 'Never share OTP', desc: 'Banks/govt will never ask for your OTP over phone or SMS.' },
        { icon: <MessageSquare size={20} />, title: 'Check sender ID', desc: 'Legitimate messages come from verified sender IDs like AD-SBIBNK.' },
        { icon: <Shield size={20} />, title: 'Avoid suspicious links', desc: 'Don\'t click links in unexpected messages. Verify directly on official websites.' },
        { icon: <Users size={20} />, title: 'Family protection', desc: 'Add family members to monitor their safety, especially elderly parents.' },
        { icon: <Lock size={20} />, title: 'On-device privacy', desc: 'All scanning happens on your device. No data is sent to any server.' },
        { icon: <Globe size={20} />, title: 'Report scams', desc: 'Report scam numbers to 1930 (National Cyber Crime Helpline).' },
    ];

    return (
        <div className="family-modal-overlay" onClick={onClose}>
            <div className="family-modal animate-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800 }}>🛡️ Safety Tips</h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tips.map((tip, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: '14px', padding: '14px',
                            background: 'var(--bg)', borderRadius: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: 'rgba(32,190,255,0.1)', color: '#20BEFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                {tip.icon}
                            </div>
                            <div>
                                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>{tip.title}</strong>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Emergency? Call <strong>1930</strong> (Cyber Crime) or <strong>112</strong> (Emergency)
                    </p>
                </div>
            </div>
        </div>
    );
}
