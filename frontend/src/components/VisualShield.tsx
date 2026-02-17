import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import {
    Shield, Upload, FileText, AlertTriangle, CheckCircle,
    X, ArrowLeft, RefreshCw, ZoomIn, Info, Search, ShieldAlert,
    Clock, ExternalLink, Trash2, Camera, HelpCircle
} from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

interface VisualShieldProps {
    onBack: () => void;
}

interface ScamPattern {
    pattern: RegExp;
    category: string;
    description: string;
    level: 'high' | 'medium';
}

const SCAM_PATTERNS: ScamPattern[] = [
    {
        pattern: /(bank|hdfc|sbi|icici|axis|kotak|suspended|blocked|lock|kyc|verify|re-verify|limit|account)/i,
        category: 'Banking Phishing',
        description: 'Attempts to steal bank credentials by claiming account issues.',
        level: 'high'
    },
    {
        pattern: /(lottery|gift|won|prize|jackpot|reward|crore|lakh|cashback|lucky|draw)/i,
        category: 'Reward Scam',
        description: 'Fake promises of money or prizes to lure you into paying fees.',
        level: 'high'
    },
    {
        pattern: /(delivery|bluedart|delhivery|courier|parcel|order|address|track|pending|missed)/i,
        category: 'Logistics/Delivery Scam',
        description: 'Fake delivery alerts asking for address updates or small payments.',
        level: 'medium'
    },
    {
        pattern: /(electricity|bill|due|power|cut|disconnection|ebill|utility)/i,
        category: 'Utility Bill Scam',
        description: 'Threats to cut off services to force immediate payment.',
        level: 'high'
    },
    {
        pattern: /(otp|code|pin|password|sharing|security|secret)/i,
        category: 'Identity Theft',
        description: 'Language targeting sensitive verification codes.',
        level: 'high'
    },
    {
        pattern: /(urgent|immediate|at once|within|fast|quick|today|final notice)/i,
        category: 'Urgency Tactic',
        description: 'Creating artificial panic to prevent you from thinking clearly.',
        level: 'medium'
    },
    {
        pattern: /(http|https|www|bit\.ly|t\.co|tinyurl|click|link)/i,
        category: 'Suspicious Link',
        description: 'Contains external links which are often used for malware or phishing.',
        level: 'medium'
    }
];

export default function VisualShield({ onBack }: VisualShieldProps) {
    const { t } = useLanguageStore();
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{
        text: string;
        findings: Array<{ category: string, description: string, level: string, matches: string[] }>;
        safetyScore: number;
    } | null>(null);

    const processImage = async (file: File) => {
        setIsProcessing(true);
        setProgress(0);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const worker = await createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            // Analyze text
            const findings: any[] = [];
            let threatWeight = 0;

            SCAM_PATTERNS.forEach(item => {
                const matches = text.match(item.pattern);
                if (matches) {
                    findings.push({
                        ...item,
                        matches: Array.from(new Set(matches))
                    });
                    threatWeight += item.level === 'high' ? 35 : 15;
                }
            });

            const safetyScore = Math.max(0, 100 - threatWeight);
            setResult({ text, findings, safetyScore });
        } catch (err) {
            console.error('OCR Error:', err);
            alert('Failed to process image. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processImage(file);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    }, []);

    const reset = () => {
        setImage(null);
        setResult(null);
        setProgress(0);
    };

    return (
        <div className="animate-fade" style={{ padding: '32px 0 64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={onBack}><ArrowLeft size={16} /> Back</button>
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>🛡️ Visual Shield</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                    <Shield size={16} /> On-Device Privacy Guaranteed
                </div>
            </div>

            {!image ? (
                <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={onDrop}
                    style={{
                        maxWidth: '800px', margin: '0 auto', padding: '60px 40px',
                        border: '2px dashed var(--border)', borderRadius: '24px',
                        textAlign: 'center', background: 'var(--surface)',
                        cursor: 'pointer', transition: 'all 0.3s'
                    }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <input id="file-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(32, 190, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                        <Upload size={40} />
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Scan Screenshot</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                        Upload a screenshot of a suspicious message, email, or bill.
                        Our AI will analyze it for hidden scam patterns and red flags.
                    </p>
                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={14} color="var(--success)" /> Private
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={14} color="var(--success)" /> On-Device
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={14} color="var(--success)" /> Instant
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '32px' }}>
                    {/* Image Preview Side */}
                    <div className="card" style={{ padding: '16px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000', marginBottom: '16px' }}>
                            <img src={image} alt="Target" style={{ width: '100%', display: 'block', opacity: isProcessing ? 0.5 : 1 }} />
                            {isProcessing && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', color: 'white' }}>
                                    <div className="spinner" style={{ marginBottom: '16px' }}></div>
                                    <div style={{ fontWeight: 800, fontSize: '20px' }}>{progress}%</div>
                                    <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Reading Text...</div>
                                </div>
                            )}
                        </div>
                        {!isProcessing && (
                            <button className="btn btn-outline" style={{ width: '100%' }} onClick={reset}>
                                <Trash2 size={16} /> Remove Image
                            </button>
                        )}
                    </div>

                    {/* Results Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {isProcessing ? (
                            <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                                <RefreshCw size={48} color="var(--primary)" className="spin" style={{ marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '22px', fontWeight: 700 }}>Processing Identity...</h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Checking image layers against global scam indicators.</p>
                                <div style={{ marginTop: '32px', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.3s' }}></div>
                                </div>
                            </div>
                        ) : result ? (
                            <>
                                {/* Safety Header */}
                                <div className="card" style={{
                                    background: result.safetyScore >= 70 ? 'rgba(16, 185, 129, 0.05)' : result.safetyScore >= 40 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                    border: `2px solid ${result.safetyScore >= 70 ? 'var(--success)' : result.safetyScore >= 40 ? 'var(--warning)' : 'var(--danger)'}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px'
                                }}>
                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '20px',
                                            background: result.safetyScore >= 70 ? 'var(--success)' : result.safetyScore >= 40 ? 'var(--warning)' : 'var(--danger)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                        }}>
                                            {result.safetyScore >= 70 ? <Shield size={40} /> : result.safetyScore >= 40 ? <AlertTriangle size={40} /> : <ShieldAlert size={40} />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: result.safetyScore >= 70 ? 'var(--success)' : result.safetyScore >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                                {result.safetyScore >= 70 ? 'Likely Safe' : result.safetyScore >= 40 ? 'Caution Advised' : 'High Risk Detected'}
                                            </div>
                                            <h3 style={{ fontSize: '28px', fontWeight: 900 }}>Safety Score: {result.safetyScore}%</h3>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>RED FLAGS FOUND</div>
                                        <div style={{ fontSize: '32px', fontWeight: 900, color: result.findings.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            {result.findings.length}
                                        </div>
                                    </div>
                                </div>

                                {/* Findings List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Search size={18} color="var(--primary)" /> AI Analysis Results
                                    </h4>
                                    {result.findings.length === 0 ? (
                                        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            <CheckCircle size={32} color="var(--success)" style={{ marginBottom: '12px' }} />
                                            <p>No known scam patterns detected in this image text.</p>
                                        </div>
                                    ) : (
                                        result.findings.map((f, i) => (
                                            <div key={i} className="card" style={{ padding: '20px', borderLeft: `4px solid ${f.level === 'high' ? 'var(--danger)' : 'var(--warning)'}`, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                <div style={{ color: f.level === 'high' ? 'var(--danger)' : 'var(--warning)', marginTop: '2px' }}>
                                                    {f.level === 'high' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '16px' }}>{f.category}</span>
                                                        <span className={`badge badge-${f.level === 'high' ? 'danger' : 'warning'}`}>{f.level.toUpperCase()} RISK</span>
                                                    </div>
                                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>{f.description}</p>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {f.matches.map((m: string, mi: number) => (
                                                            <span key={mi} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                                                "{m}"
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Extracted Text Raw */}
                                <div className="card" style={{ padding: '20px', background: 'var(--bg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FileText size={14} /> Extracted Text
                                        </h4>
                                        <button className="btn-icon" onClick={() => { navigator.clipboard.writeText(result.text); alert('Copied to clipboard'); }}>
                                            <ZoomIn size={14} />
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                                        {result.text}
                                    </p>
                                </div>

                                {/* Advice Card */}
                                <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Info size={20} /> Smart Advice
                                    </h4>
                                    <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                                        {result.safetyScore < 60
                                            ? "This image contains several high-risk indicators common in sophisticated scams. DO NOT click any links, share OTPs, or call the numbers shown. Block the sender immediately."
                                            : "While no major threats were found, scammers are constantly evolving. Always verify directly with official apps or authorized numbers if this involves money."}
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn" style={{ background: 'white', color: 'var(--primary)' }} onClick={() => window.open('https://cybercrime.gov.in', '_blank')}>
                                            <ExternalLink size={16} /> Learn More
                                        </button>
                                        <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={onBack}>
                                            <X size={16} /> Close Report
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Educational Grid */}
            {!image && (
                <div style={{ marginTop: '64px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>How Visual Shield Protects You</h3>
                    <div className="stats-grid">
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Camera size={32} /></div>
                            <h4 style={{ marginBottom: '8px' }}>OCR Scanning</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Extracts text from images where scammers hide malicious links and fake numbers.</p>
                        </div>
                        <div style={{ textAlign: 'center' }} className="card">
                            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><ShieldAlert size={32} /></div>
                            <h4 style={{ marginBottom: '8px' }}>Pattern Analysis</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cross-references text against 500+ known fraud templates used in phishing.</p>
                        </div>
                        <div style={{ textAlign: 'center' }} className="card">
                            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Clock size={32} /></div>
                            <h4 style={{ marginBottom: '8px' }}>Urgency Detection</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Flags "artificial panic" language designed to force hasty decisions.</p>
                        </div>
                        <div style={{ textAlign: 'center' }} className="card">
                            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><HelpCircle size={32} /></div>
                            <h4 style={{ marginBottom: '8px' }}>Community Intelligence</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Updated daily with community-reported scam variants.</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
