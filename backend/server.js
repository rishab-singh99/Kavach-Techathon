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

// ─── SAHAYAK MODULE ────────────────────────────────

// In-memory Sahayak data (prototype)
const sahayakProfiles = new Map([
    ['9876543210', { id: 'SAH-001', name: 'Maj. Rajendra Singh (Retd.)', role: 'retired-army', rank: 'Major', villageId: 'VIL-001', villageName: 'Rampur Kalan', phone: '9876543210', pin: '1234', trustScore: 94, totalResolved: 47, totalEarnings: 18500 }],
    ['9988776655', { id: 'SAH-002', name: 'Sunita Devi', role: 'anganwadi', villageId: 'VIL-001', villageName: 'Rampur Kalan', phone: '9988776655', pin: '1234', trustScore: 89, totalResolved: 32, totalEarnings: 12000 }],
]);

const sahayakCases = [];
const sahayakAuditLog = [];

// Sahayak Auth
app.post('/api/sahayak/login', (req, res) => {
    const { phone, pin } = req.body;
    const profile = sahayakProfiles.get(phone);
    if (!profile || profile.pin !== pin) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ sahayakId: profile.id, phone, role: profile.role }, JWT_SECRET, { expiresIn: '12h' });
    sahayakAuditLog.push({ action: 'LOGIN', performedBy: profile.id, details: `${profile.name} logged in`, timestamp: new Date().toISOString() });
    const { pin: _, ...safeProfile } = profile;
    res.json({ token, profile: safeProfile });
});

// Get Sahayak Cases
app.get('/api/sahayak/cases', (req, res) => {
    res.json({ cases: sahayakCases });
});

// Create Case
app.post('/api/sahayak/cases', (req, res) => {
    const newCase = {
        id: `CASE-${String(sahayakCases.length + 1).padStart(3, '0')}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updates: [{ id: `UPD-${Date.now()}`, status: 'reported', note: 'Case created', timestamp: new Date().toISOString() }],
    };
    sahayakCases.unshift(newCase);
    sahayakAuditLog.push({ action: 'CASE_CREATED', performedBy: req.body.assignedSahayakId, caseId: newCase.id, details: `New case: ${newCase.title}`, timestamp: new Date().toISOString() });
    res.json(newCase);
});

// Update Case Status
app.patch('/api/sahayak/cases/:id/status', (req, res) => {
    const { status, note, updatedBy } = req.body;
    const c = sahayakCases.find(cs => cs.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    c.status = status;
    c.updates.push({ id: `UPD-${Date.now()}`, status, note, updatedBy, timestamp: new Date().toISOString() });
    if (status === 'physically-resolved') c.resolvedAt = new Date().toISOString();
    sahayakAuditLog.push({ action: 'STATUS_UPDATE', performedBy: updatedBy, caseId: c.id, details: `Status → ${status}: ${note}`, timestamp: new Date().toISOString() });
    res.json(c);
});

// Process Honorarium
app.post('/api/sahayak/cases/:id/honorarium', (req, res) => {
    const c = sahayakCases.find(cs => cs.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    if (c.status !== 'physically-resolved' || !c.userSatisfied) {
        return res.status(400).json({ error: 'Case must be fully resolved and user satisfied' });
    }
    const amount = c.priority === 'high' ? 500 : c.priority === 'medium' ? 375 : 250;
    c.honorariumAmount = amount;
    c.honorariumPaid = true;
    sahayakAuditLog.push({ action: 'HONORARIUM_PAID', performedBy: 'SYSTEM', caseId: c.id, details: `Rs ${amount} processed`, timestamp: new Date().toISOString() });
    res.json({ amount, caseId: c.id });
});

// Get Audit Log
app.get('/api/sahayak/audit', (req, res) => {
    res.json({ log: sahayakAuditLog });
});

app.listen(PORT, () => {
    console.log(`Kavach backend running on port ${PORT}`);
});
