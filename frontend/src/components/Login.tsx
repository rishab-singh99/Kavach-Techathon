import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Shield, Lock, CheckCircle, Eye, EyeOff, Fingerprint, ArrowRight, Globe, Zap, Users } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguageStore } from '../store/languageStore';
import { useThemeStore } from '../store/themeStore';

interface LoginProps {
    onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showTestCreds, setShowTestCreds] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const { t } = useLanguageStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // OTP resend timer
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.sendOTP(phoneNumber);
            console.log('OTP sent:', response.data.otp);
            setStep('otp');
            setOtpTimer(30);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.verifyOTP(phoneNumber, otp);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            onLoginSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (otpTimer > 0) return;
        setError('');
        try {
            const response = await authAPI.sendOTP(phoneNumber);
            console.log('OTP resent:', response.data.otp);
            setOtpTimer(30);
        } catch (err: any) {
            setError('Failed to resend OTP');
        }
    };

    const fillTestCredentials = () => {
        setPhoneNumber('9876543210');
    };

    const handleSocialLogin = (provider: string) => {
        setSocialLoading(provider);
        // Simulate social login
        setTimeout(() => {
            localStorage.setItem('token', `mock-${provider}-token-${Date.now()}`);
            localStorage.setItem('user', JSON.stringify({
                phoneNumber: provider === 'google' ? 'google-user' : provider === 'apple' ? 'apple-user' : 'guest-user',
                name: provider === 'google' ? 'Google User' : provider === 'apple' ? 'Apple User' : 'Guest',
            }));
            setSocialLoading(null);
            onLoginSuccess();
        }, 1500);
    };

    return (
        <div className="login-page">
            {/* Animated Background */}
            <div className="login-bg">
                <div className="login-bg-orb login-bg-orb-1"></div>
                <div className="login-bg-orb login-bg-orb-2"></div>
                <div className="login-bg-orb login-bg-orb-3"></div>
            </div>

            {/* Left Side - Branding & Features */}
            <div className="login-hero">
                <div className="login-hero-content">
                    <div className="login-hero-logo">
                        <Shield size={48} color="#20BEFF" />
                    </div>
                    <h1 className="login-hero-title">{t('appTitle')}</h1>
                    <p className="login-hero-subtitle">
                        India's most advanced fraud protection platform.
                        Powered by on-device AI.
                    </p>

                    <div className="login-hero-features">
                        <div className="login-hero-feature">
                            <div className="login-hero-feature-icon">
                                <Zap size={20} />
                            </div>
                            <div>
                                <strong>{t('totalScanned')}</strong>
                                <span>Real-time scam SMS detection</span>
                            </div>
                        </div>
                        <div className="login-hero-feature">
                            <div className="login-hero-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                                <Users size={20} />
                            </div>
                            <div>
                                <strong>{t('familyProtection')}</strong>
                                <span>Monitor & protect loved ones</span>
                            </div>
                        </div>
                        <div className="login-hero-feature">
                            <div className="login-hero-feature-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
                                <Globe size={20} />
                            </div>
                            <div>
                                <strong>3 Languages</strong>
                                <span>English, हिंदी, বাংলা</span>
                            </div>
                        </div>
                        <div className="login-hero-feature">
                            <div className="login-hero-feature-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                                <Lock size={20} />
                            </div>
                            <div>
                                <strong>100% On-Device</strong>
                                <span>Zero data leaves your phone</span>
                            </div>
                        </div>
                    </div>

                    <div className="login-hero-stats">
                        <div><strong>50K+</strong><span>Scams Blocked</span></div>
                        <div><strong>99.2%</strong><span>Accuracy</span></div>
                        <div><strong>10K+</strong><span>Families</span></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-side">
                <div className="login-card">
                    {/* Language Selector */}
                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        <LanguageSelector />
                    </div>

                    <div className="login-card-header">
                        <div className="login-card-logo-mobile">
                            <Shield size={28} color="#20BEFF" />
                            <span>{t('appTitle')}</span>
                        </div>
                        <h2>{step === 'phone' ? t('login') : t('verifyOTP')}</h2>
                        <p>
                            {step === 'phone'
                                ? 'Sign in to access your fraud protection dashboard'
                                : `Enter the OTP sent to +91 ${phoneNumber}`}
                        </p>
                    </div>

                    {step === 'phone' ? (
                        <>
                            {/* Social Login Buttons */}
                            <div className="login-social-group">
                                <button
                                    className="login-social-btn login-social-google"
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={socialLoading !== null}
                                >
                                    {socialLoading === 'google' ? (
                                        <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    )}
                                    <span>Continue with Google</span>
                                </button>

                                <button
                                    className="login-social-btn login-social-apple"
                                    onClick={() => handleSocialLogin('apple')}
                                    disabled={socialLoading !== null}
                                >
                                    {socialLoading === 'apple' ? (
                                        <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                        </svg>
                                    )}
                                    <span>Continue with Apple</span>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="login-divider">
                                <span>or continue with phone</span>
                            </div>

                            {/* Phone Form */}
                            <form onSubmit={handleSendOTP}>
                                <div className="login-input-group">
                                    <label>{t('mobileNumber')}</label>
                                    <div className="login-input-with-prefix">
                                        <span className="login-input-prefix">+91</span>
                                        <input
                                            type="tel"
                                            placeholder="Enter 10-digit number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="login-remember">
                                    <label className="login-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span className="login-checkbox-mark"></span>
                                        <span>Remember this device</span>
                                    </label>
                                </div>

                                {error && (
                                    <div className="login-error">
                                        <Shield size={14} /> {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="login-submit-btn"
                                    disabled={loading || phoneNumber.length !== 10}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                            Sending OTP...
                                        </>
                                    ) : (
                                        <>
                                            {t('sendOTP')}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Guest Access */}
                            <button
                                className="login-guest-btn"
                                onClick={() => handleSocialLogin('guest')}
                                disabled={socialLoading !== null}
                            >
                                <Fingerprint size={16} />
                                {socialLoading === 'guest' ? 'Entering...' : 'Try as Guest'}
                            </button>

                            {/* Test Credentials Toggle */}
                            <div className="login-test-toggle">
                                <button onClick={() => setShowTestCreds(!showTestCreds)}>
                                    {showTestCreds ? <EyeOff size={13} /> : <Eye size={13} />}
                                    {showTestCreds ? 'Hide' : 'Show'} Test Credentials
                                </button>
                            </div>

                            {showTestCreds && (
                                <div className="login-test-creds">
                                    <div className="login-test-creds-row">
                                        <span>{t('mobile')}:</span>
                                        <code>9876543210</code>
                                    </div>
                                    <div className="login-test-creds-row">
                                        <span>{t('otp')}:</span>
                                        <code>123456</code>
                                    </div>
                                    <button onClick={fillTestCredentials} className="login-test-fill">
                                        <Zap size={12} />
                                        {t('autoFill')}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            {/* OTP Input */}
                            <div className="login-input-group">
                                <label>{t('enterOTP')}</label>
                                <input
                                    type="text"
                                    placeholder="● ● ● ● ● ●"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    required
                                    className="login-otp-input"
                                    autoFocus
                                />
                            </div>

                            {/* Resend Timer */}
                            <div className="login-resend">
                                {otpTimer > 0 ? (
                                    <span>Resend OTP in <strong>{otpTimer}s</strong></span>
                                ) : (
                                    <button type="button" onClick={handleResendOTP} className="login-resend-btn">
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="login-error">
                                    <Shield size={14} /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-submit-btn"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        {t('verifyOTP')}
                                        <CheckCircle size={18} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="login-back-btn"
                                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                            >
                                ← Change Number
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="login-footer">
                        <p>By continuing, you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a></p>
                        <div className="login-trust-badges">
                            <span><Lock size={11} /> Encrypted</span>
                            <span><Shield size={11} /> ISO 27001</span>
                            <span><CheckCircle size={11} /> CERT-In</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
