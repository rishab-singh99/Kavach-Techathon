import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Mock backend responses for prototype
const mockDelay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const authAPI = {
    sendOTP: async (phoneNumber: string) => {
        await mockDelay(800);
        if (phoneNumber.length !== 10) throw { response: { data: { error: 'Invalid phone number' } } };
        return { data: { success: true, otp: '123456' } };
    },
    verifyOTP: async (phoneNumber: string, otp: string) => {
        await mockDelay(800);
        if (otp !== '123456') throw { response: { data: { error: 'Invalid OTP' } } };
        return {
            data: {
                token: 'mock-jwt-' + Date.now(),
                user: { phoneNumber, name: 'User' }
            }
        };
    }
};

export const dashboardAPI = {
    getDashboard: async () => {
        await mockDelay(600);
        return {
            data: {
                user: {
                    phoneNumber: localStorage.getItem('user')
                        ? JSON.parse(localStorage.getItem('user')!).phoneNumber
                        : '9876543210',
                    name: 'User'
                },
                stats: {
                    totalScanned: 247,
                    threatsDetected: 18,
                    safeMessages: 229,
                    highRiskThreats: 5,
                },
                recentMessages: [
                    {
                        sender: 'AD-SBIBNK',
                        body: 'Dear customer, your SBI account XXXX1234 has been credited with Rs.15,000. If not done by you, call 1800-XXX-XXX immediately.',
                        time: '2 min ago',
                        analysis: { isScam: false, threatLevel: 'low', reason: 'Legitimate bank notification' }
                    },
                    {
                        sender: '+91-98765XXXXX',
                        body: 'Congratulations! You have won Rs.50 Lakh in KBC lottery. Click this link to claim: bit.ly/kbc-win-prize. Hurry offer expires today!',
                        time: '15 min ago',
                        analysis: { isScam: true, threatLevel: 'high', reason: 'KBC lottery scam — fake prize claim with phishing link' }
                    },
                    {
                        sender: 'JM-PYTM',
                        body: 'Your Paytm UPI payment of Rs.499 to Amazon was successful. Txn ID: TXN2024XXXX. Balance: Rs.12,450.',
                        time: '1 hr ago',
                        analysis: { isScam: false, threatLevel: 'low', reason: 'Genuine payment confirmation' }
                    },
                    {
                        sender: '+91-70XXXXXXXX',
                        body: 'Your Aadhaar linked bank account will be suspended. Verify your KYC immediately by clicking: aadhaar-kyc-update.in/verify',
                        time: '2 hrs ago',
                        analysis: { isScam: true, threatLevel: 'high', reason: 'Aadhaar KYC fraud — government impersonation with phishing URL' }
                    },
                    {
                        sender: 'VM-AMZN',
                        body: 'Your Amazon order #402-1234567 has been shipped. Track: amzn.in/track/ABC123. Delivery by Feb 16.',
                        time: '3 hrs ago',
                        analysis: { isScam: false, threatLevel: 'low', reason: 'Legitimate Amazon shipping notification' }
                    },
                    {
                        sender: '+91-8889XXXXXX',
                        body: 'Attention: Your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Call our officer at +91-98XXX now.',
                        time: '4 hrs ago',
                        analysis: { isScam: true, threatLevel: 'high', reason: 'Electricity bill scam — urgency and fake support number' }
                    },
                    {
                        sender: 'BP-JIOACC',
                        body: 'Your Jio plan of Rs.666 expires in 2 days. Recharge now to get 20% cashback. Visit: jio.com/recharge',
                        time: '5 hrs ago',
                        analysis: { isScam: false, threatLevel: 'low', reason: 'Genuine telecom recharge reminder' }
                    },
                    {
                        sender: '+91-90XXXXXXXX',
                        body: 'Work from home job offer! Earn Rs.5000/day by just liking YouTube videos. No investment needed. WhatsApp: wa.me/9190XXXX',
                        time: '6 hrs ago',
                        analysis: { isScam: true, threatLevel: 'medium', reason: 'Job scam — unrealistic earnings and WhatsApp redirection' }
                    },
                    {
                        sender: 'AXIS-BANK',
                        body: 'Your credit card ending in 8899 has been approved for a limit increase. Login to mobile app to accept offer.',
                        time: 'Yesterday',
                        analysis: { isScam: false, threatLevel: 'low', reason: 'Legitimate bank promotion' }
                    },
                    {
                        sender: '+1-202-555-0199',
                        body: 'IRS Notice: You have a pending tax refund of $1,250. Click here to claim your refund before it expires: irs-gov-refund-claim.com',
                        time: 'Yesterday',
                        analysis: { isScam: true, threatLevel: 'high', reason: 'Tax refund scam — impersonating government agency' }
                    },
                    {
                        sender: 'DOMINOS',
                        body: 'Hungry? Get 50% OFF on your favorite pizzas! Use code YUM50. Order now on the app.',
                        time: 'Yesterday',
                        analysis: { isScam: false, threatLevel: 'low', reason: 'Start promotional offer' }
                    }
                ]
            }
        };
    },
    scanMessages: async () => {
        await mockDelay(2000);
        return {
            data: {
                scanned: 12,
                threats: 3,
                safe: 9
            }
        };
    }
};

export default api;
