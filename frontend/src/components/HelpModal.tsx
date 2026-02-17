import { X, Shield, Phone, MessageSquare, Users, Lock, Globe, ExternalLink } from 'lucide-react';

interface HelpModalProps {
    onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
    const tips: { icon: JSX.Element; title: string; desc: string; link?: string }[] = [
        { icon: <Phone size={20} />, title: 'Never share OTP', desc: 'Banks/govt will never ask for your OTP over phone or SMS.' },
        { icon: <MessageSquare size={20} />, title: 'Check sender ID', desc: 'Legitimate messages come from verified sender IDs like AD-SBIBNK.' },
        { icon: <Shield size={20} />, title: 'Avoid suspicious links', desc: 'Don\'t click links in unexpected messages. Verify directly on official websites.' },
        { icon: <Users size={20} />, title: 'Family protection', desc: 'Add family members to monitor their safety, especially elderly parents.' },
        { icon: <Lock size={20} />, title: 'On-device privacy', desc: 'All scanning happens on your device. No data is sent to any server.' },
        { icon: <Globe size={20} />, title: 'Report scams', desc: 'Report scam numbers to 1930 (National Cyber Crime Helpline).' },
        {
            icon: <Globe size={20} />,
            title: 'Official Cyber Crime Portal',
            desc: 'File a complaint specifically for cyber fraud at cybercrime.gov.in',
            link: 'https://cybercrime.gov.in'
        },
    ];

    return (
        <div className="family-modal-overlay" onClick={onClose}>
            <div className="family-modal animate-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800 }}>🛡️ Safety Tips</h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)', border: 'none', padding: '16px', fontSize: '16px', fontWeight: 700, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                        <Globe size={20} /> Report Cyber Fraud (cybercrime.gov.in)
                    </a>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                        Official Govt of India Portal
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tips.map((tip, i) => {
                        const content = (
                            <>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: tip.link ? 'rgba(32,190,255,0.2)' : 'rgba(32,190,255,0.1)',
                                    color: '#20BEFF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {tip.icon}
                                </div>
                                <div>
                                    <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', color: tip.link ? 'var(--primary)' : 'inherit' }}>
                                        {tip.title}
                                        {tip.link && <ExternalLink size={14} />}
                                    </strong>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip.desc}</span>
                                </div>
                            </>
                        );

                        const style = {
                            display: 'flex', gap: '14px', padding: '14px',
                            background: tip.link ? 'rgba(32, 190, 255, 0.05)' : 'var(--bg)',
                            borderRadius: '12px',
                            border: tip.link ? '1px solid var(--primary)' : '1px solid var(--border)',
                            cursor: tip.link ? 'pointer' : 'default',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'transform 0.2s, background 0.2s'
                        };

                        return tip.link ? (
                            <a
                                key={i}
                                href={tip.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={style}
                                className="help-card-link"
                            >
                                {content}
                            </a>
                        ) : (
                            <div key={i} style={style}>
                                {content}
                            </div>
                        );
                    })}
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
