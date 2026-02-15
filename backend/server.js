require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kavach-secret-key';

app.use(cors());
app.use(express.json());

// Store OTPs (in-memory for prototype)
const otpStore = new Map();

// Send OTP
app.post('/api/auth/send-otp', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber || phoneNumber.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }
    const otp = '123456'; // Fixed for demo
    otpStore.set(phoneNumber, otp);
    setTimeout(() => otpStore.delete(phoneNumber), 5 * 60 * 1000);
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    res.json({ success: true, message: 'OTP sent', otp });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (otp !== '123456') {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
    const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { phoneNumber, name: 'User' } });
});

// Dashboard Data
app.get('/api/dashboard', (req, res) => {
    res.json({
        user: { phoneNumber: '9876543210', name: 'User' },
        stats: { totalScanned: 247, threatsDetected: 18, safeMessages: 229, highRiskThreats: 5 },
        recentMessages: []
    });
});

app.listen(PORT, () => {
    console.log(`Kavach backend running on port ${PORT}`);
});
