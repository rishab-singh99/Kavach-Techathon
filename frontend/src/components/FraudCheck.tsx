import { useState } from 'react';
import { useTrustedContactStore } from '../store/trustedContactStore';
import {
    Search, Shield, AlertTriangle, CheckCircle, Info, ArrowLeft,
    MessageSquare, Phone, Globe, UserX, Share2, Flag, Volume2, VolumeX
} from 'lucide-react';
import { speak, speakThreatAlert } from '../utils/speech';
import { useLanguageStore } from '../store/languageStore';

interface FraudCheckProps {
    onBack: () => void;
}

export default function FraudCheck({ onBack }: FraudCheckProps) {
    const { verifyNumber } = useTrustedContactStore();
    const { language, t } = useLanguageStore();
    const [phone, setPhone] = useState('');
    const [result, setResult] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const handleCheck = () => {
        if (!phone.trim()) return;
        setIsSearching(true);

        // Add a slight delay for "searching" effect
        setTimeout(() => {
            const res = verifyNumber(phone.trim());
            setResult(res);
            setIsSearching(false);

            // Speak sequential threat alert if it's a scam and not muted
            if (res.isScam && !isMuted) {
                speakThreatAlert();
            }
        }, 800);
    };

    return (
        <div className="tc-container" style={{ padding: '32px 0 64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={onBack}><ArrowLeft size={16} /> Back</button>
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>🔍 Fraud Number Check</h2>
                </div>
                <button
                    className={`btn ${isMuted ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ padding: '10px' }}
                    title={isMuted ? "Unmute Alerts" : "Mute Alerts"}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(32, 190, 255, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        color: 'var(--primary)'
                    }}>
                        <Shield size={40} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Verify Caller Identity</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                        Check numbers against our global fraud database and community reporting system to stay safe from scams.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit mobile number..."
                            style={{ paddingLeft: '48px', height: '56px', fontSize: '18px' }}
                            onKeyDown={e => e.key === 'Enter' && handleCheck()}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleCheck}
                        disabled={!phone || isSearching}
                        style={{ padding: '0 32px', height: '56px', fontSize: '16px' }}
                    >
                        {isSearching ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <Search size={20} />}
                        Check Profile
                    </button>
                </div>

                {result && (
                    <div className="animate-modal" style={{
                        marginTop: '40px', padding: '32px', borderRadius: '20px',
                        background: result.isScam ? 'rgba(239,68,68,0.05)' : result.isSafe ? 'rgba(16,185,129,0.05)' : 'var(--bg)',
                        border: `2px solid ${result.isScam ? '#EF4444' : result.isSafe ? '#10B981' : 'var(--border)'}`,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '16px',
                                    background: result.isScam ? '#EF4444' : result.isSafe ? '#10B981' : '#6B7280',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    {result.isScam ? <AlertTriangle size={32} /> : result.isSafe ? <CheckCircle size={32} /> : <Info size={32} />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: result.isScam ? '#EF4444' : result.isSafe ? '#10B981' : 'var(--text-secondary)' }}>
                                        {result.isScam ? 'Fraudulent Number Detected' : result.isSafe ? 'Verified Safe Caller' : 'Unknown / Unverified'}
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{phone}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Safety Score</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: result.isScam ? '#EF4444' : result.isSafe ? '#10B981' : '#F59E0B' }}>
                                    {result.isScam ? '12%' : result.isSafe ? '98%' : '50%'}
                                </div>
                            </div>
                        </div>

                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div className="card" style={{ background: 'var(--surface)', padding: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    <MessageSquare size={14} /> Reports
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 700 }}>{result.communityReports || 0}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Community Flagged</div>
                            </div>
                            <div className="card" style={{ background: 'var(--surface)', padding: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    <Globe size={14} /> Location
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 700 }}>{result.isScam ? 'Multiple / VOIP' : 'India'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Geographic Origin</div>
                            </div>
                            <div className="card" style={{ background: 'var(--surface)', padding: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    <Flag size={14} /> Type
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 700 }}>{result.isScam ? 'Spam / Fraud' : 'Mobile'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Number Category</div>
                            </div>
                        </div>

                        <div style={{ padding: '20px', background: 'var(--bg)', borderRadius: '12px', marginBottom: '24px' }}>
                            <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={16} /> Analysis Result
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                {result.message}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {result.isScam ? (
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
                            <button className="btn btn-outline" onClick={() => speak(result.message, language as any)}>
                                <Volume2 size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
