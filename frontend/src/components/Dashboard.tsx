import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import {
    Shield, AlertTriangle, CheckCircle, Scan, LogOut, Moon, Sun, Eye,
    RotateCcw, HelpCircle, WifiOff, Lock, Users, ShieldCheck, Menu, X
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import CountUp from 'react-countup';
import ThreatModal from './ThreatModal';
import HelpModal from './HelpModal';
import FamilyDashboard from './FamilyDashboard';
import FamilyAlertPopup from './FamilyAlertPopup';
import TrustedContacts from './TrustedContacts';
import LanguageSelector from './LanguageSelector';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';

interface DashboardProps {
    onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [doneMessages, setDoneMessages] = useState<number[]>([]);
    const [showHelp, setShowHelp] = useState(false);
    const [showFamily, setShowFamily] = useState(false);
    const [showTrustedContacts, setShowTrustedContacts] = useState(false);
    const [activeView, setActiveView] = useState<'dashboard' | 'family' | 'trusted'>('dashboard');
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { theme, toggleTheme } = useThemeStore();
    const { t } = useLanguageStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await dashboardAPI.getDashboard();
            setData(response.data);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleScanMessages = async () => {
        setScanning(true);
        try {
            await dashboardAPI.scanMessages();
            await loadDashboard();
        } catch (err) {
            console.error('Scan error:', err);
        } finally {
            setScanning(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="loading">
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '16px' }}>Failed to load dashboard</p>
                    <button className="btn btn-primary" onClick={loadDashboard}><RotateCcw size={16} /> Retry</button>
                </div>
            </div>
        );
    }

    const { user, stats, recentMessages } = data;
    const CHART_COLORS = ['#EF4444', '#10B981', '#F59E0B'];

    const pieData = [
        { name: t('threats'), value: stats.threatsDetected },
        { name: t('safe'), value: stats.safeMessages },
        { name: t('highRisk'), value: stats.highRiskThreats },
    ];

    const weeklyData = [
        { day: 'Mon', scans: 32, threats: 3 }, { day: 'Tue', scans: 45, threats: 5 },
        { day: 'Wed', scans: 28, threats: 2 }, { day: 'Thu', scans: 56, threats: 8 },
        { day: 'Fri', scans: 41, threats: 4 }, { day: 'Sat', scans: 23, threats: 1 },
        { day: 'Sun', scans: 22, threats: 0 },
    ];

    return (
        <div>
            {/* Family Alert Popup — only show on dashboard view */}
            {activeView === 'dashboard' && (
                <FamilyAlertPopup onViewFamily={() => { setActiveView('family'); setShowFamily(true); }} />
            )}

            {/* Offline Banner */}
            {isOffline && (
                <div style={{ background: '#F59E0B', color: '#000', padding: '8px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <WifiOff size={16} /> You're offline — scans use on-device AI
                </div>
            )}

            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="nav-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <a href="/" className="logo">
                            <Shield size={24} style={{ display: 'inline', marginRight: '8px' }} />
                            Kavach
                        </a>
                        <button className="nav-hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle menu">
                            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <ul className={`nav-links ${mobileNavOpen ? 'nav-links-open' : ''}`}>
                            <li><a href="#" className={activeView === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('dashboard'); setShowFamily(false); setShowTrustedContacts(false); setMobileNavOpen(false); }}>{t('dashboard')}</a></li>
                            <li><a href="#" className={activeView === 'family' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('family'); setShowFamily(true); setShowTrustedContacts(false); setMobileNavOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} />{t('family')}</a></li>
                            <li><a href="#" className={activeView === 'trusted' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('trusted'); setShowTrustedContacts(true); setShowFamily(false); setMobileNavOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} />{t('trustedContacts') || 'Trusted'}</a></li>
                            <li>
                                <button
                                    onClick={() => { setShowHelp(true); setMobileNavOpen(false); }}
                                    className="btn-icon"
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                                >
                                    <HelpCircle size={18} /> {t('help')}
                                </button>
                            </li>
                        </ul>
                        <div className="nav-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <LanguageSelector />
                            <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className="btn btn-outline" onClick={onLogout} style={{ whiteSpace: 'nowrap' }}>
                                <LogOut size={16} /> {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Family Dashboard View */}
            {showFamily && (
                <div className="container">
                    <FamilyDashboard onBack={() => { setShowFamily(false); setActiveView('dashboard'); }} />
                </div>
            )}

            {/* Trusted Contacts View */}
            {showTrustedContacts && (
                <div className="container">
                    <TrustedContacts onBack={() => { setShowTrustedContacts(false); setActiveView('dashboard'); }} />
                </div>
            )}

            {/* Main Dashboard Content */}
            <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px', display: (showFamily || showTrustedContacts) ? 'none' : 'block' }}>
                {/* Header */}
                <div className="dashboard-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="dashboard-title" style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {t('welcomeBack')}, {user.phoneNumber}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{t('yourDashboard')}</p>
                    </div>
                    <div className="dashboard-privacy-badge" style={{
                        background: 'var(--surface)', padding: '8px 16px', borderRadius: '20px',
                        border: '1px solid var(--success)', color: 'var(--success)',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600
                    }} title="Your data stays on this device. No cloud uploads.">
                        <Lock size={16} /> 100% On-Device Privacy
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid" style={{ animationDelay: '0.1s' }}>
                    {[
                        { label: t('totalScanned'), value: stats.totalScanned, icon: <Scan size={20} />, color: '#20BEFF' },
                        { label: t('threatsDetected'), value: stats.threatsDetected, icon: <AlertTriangle size={20} />, color: '#EF4444' },
                        { label: t('safeMessages'), value: stats.safeMessages, icon: <CheckCircle size={20} />, color: '#10B981' },
                        { label: t('highRisk'), value: stats.highRiskThreats, icon: <Shield size={20} />, color: '#F59E0B' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="stat-label">{stat.label}</span>
                                <span style={{ color: stat.color }}>{stat.icon}</span>
                            </div>
                            <div className="stat-value" style={{ color: stat.color }}>
                                <CountUp end={stat.value} duration={1.5} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Scan Button */}
                <div className="scan-button-wrap" style={{ margin: '40px 0', textAlign: 'center' }}>
                    <button
                        className="btn btn-primary scan-btn-main"
                        onClick={handleScanMessages}
                        disabled={scanning}
                        style={{
                            fontSize: '24px', padding: '24px 64px', borderRadius: '50px',
                            boxShadow: '0 10px 25px rgba(32, 190, 255, 0.4)',
                            transition: 'all 0.3s ease',
                            transform: scanning ? 'scale(0.98)' : 'scale(1)',
                            display: 'inline-flex', alignItems: 'center', gap: '16px'
                        }}
                    >
                        {scanning ? (
                            <><div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>{t('scanningMessages')}...</>
                        ) : (
                            <><Scan size={32} />{t('scanNewMessages')}</>
                        )}
                    </button>
                    <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                        {t('tapToScan') || 'Tap big blue button to check for viruses'}
                    </p>
                </div>

                {/* Charts */}
                {stats.totalScanned > 0 && (
                    <div className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', margin: '32px 0' }}>
                        <div className="card">
                            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>{t('threatDistribution')}</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4} strokeWidth={0}>
                                        {pieData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>{t('weeklyTrend')}</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={weeklyData}>
                                    <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="scans" stroke="#20BEFF" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recent Messages */}
                <div style={{ marginTop: '32px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>{t('recentScans')}</h3>
                    {recentMessages.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                            <Scan size={40} color="var(--text-secondary)" />
                            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>{t('noMessages')}</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('sender')}</th>
                                        <th>{t('message')}</th>
                                        <th>{t('status')}</th>
                                        <th>{t('threatLevel')}</th>
                                        <th>{t('time')}</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentMessages.map((msg: any, idx: number) => (
                                        <tr key={idx} style={{ opacity: doneMessages.includes(idx) ? 0.45 : 1 }}
                                            onClick={() => setSelectedMessage(msg)}>
                                            <td style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>{msg.sender}</td>
                                            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {msg.body}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${msg.analysis.isScam ? 'danger' : 'success'}`}>
                                                    {msg.analysis.isScam ? `🚨 ${t('scam')}` : `✅ ${t('safe')}`}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${msg.analysis.threatLevel === 'high' ? 'danger' : msg.analysis.threatLevel === 'medium' ? 'warning' : 'success'}`}>
                                                    {msg.analysis.threatLevel.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{msg.time}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setSelectedMessage(msg); }} title="View Details">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setDoneMessages(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]); }}
                                                        title={doneMessages.includes(idx) ? 'Unmark' : 'Mark as Done'}
                                                        style={{ color: doneMessages.includes(idx) ? 'var(--success)' : 'var(--text-secondary)' }}>
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedMessage && <ThreatModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </div>
    );
}
