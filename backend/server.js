const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./db');

// Import all models (ONLY ONCE)
const User = require('./models/User');
const Profile = require('./models/Profile');
const Debt = require('./models/Debt');
const Transaction = require('./models/Transaction');
const DailyExpense = require('./models/DailyExpense');
const Otp = require('./models/Otp');
const { sendOtpSms } = require('./services/sms');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Data directory setup (still used for profiles and debts for now)
const DATA_DIR = path.join(__dirname, 'data');
const USERS_JSON_FILE = path.join(DATA_DIR, 'users.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const DEBTS_FILE = path.join(DATA_DIR, 'debts.json');

// Initialize data directory and files (no longer creates users.json)
async function initializeDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize profiles file
    try {
      await fs.access(PROFILES_FILE);
    } catch (error) {
      await fs.writeFile(PROFILES_FILE, JSON.stringify([]));
    }
    
    // Initialize debts file
    try {
      await fs.access(DEBTS_FILE);
    } catch (error) {
      await fs.writeFile(DEBTS_FILE, JSON.stringify([]));
    }
    
    console.log('Data files (profiles, debts) initialized successfully');
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}
// One-time migration: import users from JSON into MongoDB if collection is empty
async function migrateUsersFromJsonIfAny() {
  try {
    const userCount = await User.estimatedDocumentCount();
    if (userCount > 0) {
      return; // already have users, skip migration
    }

    // Check if users.json exists and has content
    await fs.access(USERS_JSON_FILE);
    const raw = await fs.readFile(USERS_JSON_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    if (!Array.isArray(arr) || arr.length === 0) return;

    // Map fields and insertMany
    const docs = arr.map(u => ({
      name: u.name,
      email: (u.email || '').toLowerCase(),
      password: u.password, // already hashed in old storage
      pin: u.pin || null,
      pinEnabled: !!u.pinEnabled,
      faceIDEnabled: !!u.faceIDEnabled,
      createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
      updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
    }));

    if (docs.length) {
      await User.insertMany(docs, { ordered: false });
      console.log(`Migrated ${docs.length} users from users.json to MongoDB`);
      // Backup old file to avoid re-import on next start
      try {
        await fs.rename(USERS_JSON_FILE, path.join(DATA_DIR, 'users.json.bak'));
      } catch (e) {
        // ignore if cannot rename
      }
    }
  } catch (e) {
    // If file doesn't exist or any error, just log and continue
    if (e && e.code !== 'ENOENT') {
      console.warn('User migration skipped due to error:', e.message);
    }
  }
}

// One-time migration: import profiles and debts from JSON into MongoDB
async function migrateProfilesAndDebtsFromJsonIfAny() {
  // Build a mapping from legacy user id to Mongo ObjectId
  let legacyUsers = [];
  try {
    const bak = await fs.readFile(path.join(DATA_DIR, 'users.json.bak'), 'utf8');
    legacyUsers = JSON.parse(bak || '[]');
  } catch (_) {
    // ignore if no bak file
  }

  const emailToMongoId = new Map();
  if (legacyUsers.length) {
    // Fetch existing Mongo users by email
    const emails = legacyUsers.map(u => (u.email || '').toLowerCase());
    const mongoUsers = await User.find({ email: { $in: emails } }, { _id: 1, email: 1 }).lean();
    const emailToId = new Map(mongoUsers.map(u => [u.email, u._id.toString()]));
    for (const u of legacyUsers) {
      const id = emailToId.get((u.email || '').toLowerCase());
      if (id) emailToMongoId.set(u.id, id);
    }
  }

  // Migrate profiles if collection empty
  try {
    const count = await Profile.estimatedDocumentCount();
    if (count === 0) {
      const profilesRaw = await fs.readFile(PROFILES_FILE, 'utf8');
      const profiles = JSON.parse(profilesRaw || '[]');
      const docs = [];
      for (const p of profiles) {
        const mongoUserId = emailToMongoId.get(p.userId);
        if (!mongoUserId) continue;
        const { id, userId, createdAt, updatedAt, ...rest } = p;
        docs.push({ user: mongoose.Types.ObjectId(mongoUserId), ...rest, createdAt, updatedAt });
      }
      if (docs.length) {
        await Profile.insertMany(docs, { ordered: false });
        console.log(`Migrated ${docs.length} profiles from profiles.json to MongoDB`);
        try { await fs.rename(PROFILES_FILE, path.join(DATA_DIR, 'profiles.json.bak')); } catch (_) {}
      }
    }
  } catch (e) {
    // ignore if file not found
  }

  // Migrate debts if collection empty
  try {
    const count = await Debt.estimatedDocumentCount();
    if (count === 0) {
      const debtsRaw = await fs.readFile(DEBTS_FILE, 'utf8');
      const debts = JSON.parse(debtsRaw || '[]');
      const docs = [];
      for (const d of debts) {
        const mongoUserId = emailToMongoId.get(d.userId);
        if (!mongoUserId) continue;
        const { id, userId, createdAt, updatedAt, ...rest } = d;
        docs.push({ user: mongoose.Types.ObjectId(mongoUserId), ...rest, createdAt, updatedAt });
      }
      if (docs.length) {
        await Debt.insertMany(docs, { ordered: false });
        console.log(`Migrated ${docs.length} debts from debts.json to MongoDB`);
        try { await fs.rename(DEBTS_FILE, path.join(DATA_DIR, 'debts.json.bak')); } catch (_) {}
      }
    }
  } catch (e) {
    // ignore if file not found
  }
}

// Helper functions for file operations
async function readDataFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function writeDataFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Phone helpers (normalize to Indian E.164: +91XXXXXXXXXX)
function normalizeIndianPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]\d{9}$/.test(digits.slice(1))) return `+91${digits.slice(1)}`;
  if (raw.startsWith('+91') && /^[+]?91[6-9]\d{9}$/.test(raw.replace(/\s/g, ''))) return raw.replace(/\s/g, '');
  return null; // invalid
}

function generateOtpCode() {
  // 6-digit numeric OTP, leading zeros allowed
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'PFM Backend API is running!' });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  return res.status(410).json({ message: 'Email/password signup is disabled. Use phone OTP login.' });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  return res.status(410).json({ message: 'Email/password login is disabled. Use phone OTP login.' });
});

// PIN Login (separate endpoint)
app.post('/api/auth/login-pin', async (req, res) => {
  return res.status(410).json({ message: 'PIN login via email is disabled. Use phone OTP login.' });
});

// OTP-based auth routes
app.post('/api/auth/otp/send', async (req, res) => {
  try {
    const { phone, name } = req.body || {};
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      return res.status(400).json({ message: 'Enter a valid Indian mobile number' });
    }

    // Throttle: prevent resend within 60 seconds
    const last = await Otp.findOne({ phone: normalized }).sort({ createdAt: -1 }).lean();
    if (last && Date.now() - new Date(last.createdAt).getTime() < 60 * 1000) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    const code = generateOtpCode();
    const codeHash = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({ phone: normalized, codeHash, expiresAt });

    // Optionally create a placeholder user name on first request (without saving yet)
    // We will set name on verification if user is created.

    // Send SMS via configured provider (mock in dev if SMS_PROVIDER unset)
    await sendOtpSms(normalized, code);

    const response = { message: 'OTP sent successfully' };
    if (process.env.NODE_ENV !== 'production') {
      response.devCode = code; // for local testing only
    }
    res.json(response);
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

app.post('/api/auth/otp/verify', async (req, res) => {
  try {
    console.log('OTP verify request:', req.body);
    const { phone, code, name } = req.body || {};
    const normalized = normalizeIndianPhone(phone);
    console.log('Normalized phone:', normalized);
    if (!normalized || !code) {
      return res.status(400).json({ message: 'Phone and OTP code are required' });
    }

    // Fetch recent non-expired OTPs (e.g., last 3) to tolerate user entering prior code
    const now = new Date();
    const recent = await Otp.find({ phone: normalized, expiresAt: { $gte: now } })
      .sort({ createdAt: -1 })
      .limit(5);
    console.log('Recent OTPs found:', recent.length);
    if (!recent || recent.length === 0) {
      return res.status(400).json({ message: 'OTP expired or not requested. Please request a new one.' });
    }

    let matched = null;
    for (const doc of recent) {
      const ok = await bcrypt.compare(String(code), doc.codeHash);
      if (ok) { matched = doc; break; }
    }
    console.log('OTP matched:', !!matched);
    if (!matched) {
      // increment attempts on the latest doc
      try { recent[0].attempts += 1; await recent[0].save(); } catch (_) {}
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP valid: find or create user (atomic upsert to avoid duplicates on rapid clicks)
    console.log('Creating/finding user for phone:', normalized);
    let user = await User.findOneAndUpdate(
      { phone: normalized },
      { $setOnInsert: { name: name || 'User', phone: normalized } },
      { new: true, upsert: true }
    );
    console.log('User found/created:', user._id);

    // Cleanup OTPs for this phone
    await Otp.deleteMany({ phone: normalized });
    console.log('OTPs cleaned up');

    const token = jwt.sign(
      { id: user._id.toString(), phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('JWT signed');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        pinEnabled: user.pinEnabled,
        faceIDEnabled: user.faceIDEnabled
      }
    });
  } catch (error) {
    // Handle duplicate key race condition explicitly (shouldn't happen with upsert, but kept as safety)
    if (error && error.code === 11000) {
      try {
        const existing = await User.findOne({ phone: (req.body?.phone && normalizeIndianPhone(req.body.phone)) || '' });
        if (existing) {
          const token = jwt.sign(
            { id: existing._id.toString(), phone: existing.phone },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            message: 'Login successful',
            token,
            user: {
              id: existing._id.toString(),
              name: existing.name,
              phone: existing.phone,
              pinEnabled: existing.pinEnabled,
              faceIDEnabled: existing.faceIDEnabled
            }
          });
        }
      } catch (_) {
        // fall through to generic handler below
      }
    }
    console.error('OTP verify error:', error?.stack || error?.message || error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Current user route for auth check
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        pinEnabled: user.pinEnabled,
        faceIDEnabled: user.faceIDEnabled,
        createdAt: user.createdAt,
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// PIN Routes
app.post('/api/auth/set-pin', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Update user in MongoDB
    const result = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { pin: hashedPin, pinEnabled: true } },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'PIN set successfully' });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ message: 'Server error setting PIN' });
  }
});

app.post('/api/auth/verify-pin', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ message: 'Invalid PIN format' });
    }

    // Find user in MongoDB
    const user = await User.findById(req.user.id);
    if (!user || !user.pinEnabled || !user.pin) {
      return res.status(400).json({ message: 'PIN not set for this user' });
    }

    // Verify PIN
    const isValidPin = await bcrypt.compare(pin, user.pin);
    if (!isValidPin) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }

    res.json({ message: 'PIN verified successfully' });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ message: 'Server error verifying PIN' });
  }
});

// Profile Routes (MongoDB)
app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profileData = req.body;
    const update = {
      ...profileData,
      updatedAt: new Date(),
    };
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: update, $setOnInsert: { user: req.user.id, createdAt: new Date() } },
      { new: true, upsert: true }
    ).lean();
    res.json({ message: 'Profile saved successfully', profile });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ message: 'Server error saving profile' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).lean();
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Debt Routes (MongoDB)
app.post('/api/debts', authenticateToken, async (req, res) => {
  try {
    // Handle single debt creation (for individual loan/debt addition)
    const debtData = {
      user: req.user.id,
      creditorName: req.body.creditorName,
      debtType: req.body.debtType,
      currentBalance: parseFloat(req.body.currentBalance) || 0,
      minimumPayment: parseFloat(req.body.minimumPayment) || 0,
      interestRate: parseFloat(req.body.interestRate) || 0,
      dueDate: req.body.dueDate,
    };

    const newDebt = new Debt(debtData);
    const savedDebt = await newDebt.save();
    
    res.json({ 
      message: 'Debt added successfully', 
      debt: savedDebt 
    });
  } catch (error) {
    console.error('Debt creation error:', error);
    res.status(500).json({ message: 'Server error adding debt' });
  }
});

app.get('/api/debts', authenticateToken, async (req, res) => {
  try {
    const userDebts = await Debt.find({ user: req.user.id }).lean();
    res.json({ debts: userDebts });
  } catch (error) {
    console.error('Debts fetch error:', error);
    res.status(500).json({ message: 'Server error fetching debts' });
  }
});

app.put('/api/debts/:debtId', authenticateToken, async (req, res) => {
  try {
    const { debtId } = req.params;
    const updateData = req.body;
    const debt = await Debt.findOneAndUpdate(
      { _id: debtId, user: req.user.id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true }
    ).lean();
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    res.json({ message: 'Debt updated successfully', debt });
  } catch (error) {
    console.error('Debt update error:', error);
    res.status(500).json({ message: 'Server error updating debt' });
  }
});

app.delete('/api/debts/:debtId', authenticateToken, async (req, res) => {
  try {
    const { debtId } = req.params;
    const result = await Debt.deleteOne({ _id: debtId, user: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    console.error('Debt delete error:', error);
    res.status(500).json({ message: 'Server error deleting debt' });
  }
});

// User management routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    // Find user in MongoDB
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        pinEnabled: user.pinEnabled,
        faceIDEnabled: user.faceIDEnabled,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Transaction Routes
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      userId: req.user.id
    });
    await transaction.save();
    res.json({
      message: 'Transaction added successfully',
      transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Server error adding transaction' });
  }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Transaction deletion error:', error);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body },
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
});

// Additional User Routes
app.post('/api/user/change-password', authenticateToken, async (req, res) => {
  return res.status(410).json({ message: 'Password is not used. Login with phone OTP only.' });
});

app.post('/api/user/setup-pin', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const hashedPin = await bcrypt.hash(pin, 10);
    user.pin = hashedPin;
    user.pinEnabled = true;
    await user.save();
    
    res.json({ message: 'PIN setup successfully' });
  } catch (error) {
    console.error('PIN setup error:', error);
    res.status(500).json({ message: 'Server error setting up PIN' });
  }
});

app.delete('/api/user/delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Profile.findOneAndDelete({ user: userId }),
      Debt.deleteMany({ user: userId }),
      Transaction.deleteMany({ userId: userId })
    ]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

// ============================================
// ML PREDICTION ROUTES
// ============================================

// ML Prediction Routes
app.post('/api/predict/daily-expense', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile and past expenses
    const profile = await Profile.findOne({ user: userId }).lean();
    const pastExpenses = await DailyExpense.find({ user: userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Calculate past 7-day average
    const recent7Days = pastExpenses.slice(0, 7);
    const past7DayAvg = recent7Days.length > 0 
      ? recent7Days.reduce((sum, exp) => sum + (exp.totalSpend || 0), 0) / recent7Days.length
      : 1000; // default

    // Prepare data for ML service
    const mlData = {
      age_group: profile?.ageGroup || '26-35',
      family_size: parseInt(profile?.familySize) || 1,
      daily_income: parseFloat(profile?.dailyIncome) || parseFloat(profile?.monthlyIncome) / 30 || 1000,
      food: recent7Days.length > 0 ? recent7Days.reduce((sum, exp) => sum + (exp.food || 0), 0) / recent7Days.length : 300,
      transport: recent7Days.length > 0 ? recent7Days.reduce((sum, exp) => sum + (exp.transport || 0), 0) / recent7Days.length : 200,
      bills: recent7Days.length > 0 ? recent7Days.reduce((sum, exp) => sum + (exp.bills || 0), 0) / recent7Days.length : 400,
      health: recent7Days.length > 0 ? recent7Days.reduce((sum, exp) => sum + (exp.health || 0), 0) / recent7Days.length : 100,
      education: recent7Days.length > 0 ? recent7Days.reduce((sum, exp) => sum + (exp.education || 0), 0) / recent7Days.length : 50,
      entertainment: recent7Days.length > 0 ? recent7Days.reduce((sum, exp) => sum + (exp.entertainment || 0), 0) / recent7Days.length : 200,
      other: recent7Days.length > 0 ? recent7Days.reduce((sum, exp) => sum + (exp.other || 0), 0) / recent7Days.length : 150,
      debt_amount: parseFloat(profile?.debtAmount) || 0,
      monthly_emi: parseFloat(profile?.monthlyEMI) || 0,
      loan_type: profile?.loanType || 'None',
      interest_rate: parseFloat(profile?.interestRate) || 0,
      past_7day_avg: past7DayAvg
    };

    // Call ML service
    try {
      const mlResponse = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlData)
      });

      if (!mlResponse.ok) {
        throw new Error('ML service unavailable');
      }

      const mlResult = await mlResponse.json();
      
      if (mlResult.success) {
        res.json({
          success: true,
          prediction: {
            predicted_spend: mlResult.predicted_spend,
            model_accuracy: mlResult.model_accuracy,
            confidence_level: 'High',
            factors: {
              historical_pattern: past7DayAvg,
              income_ratio: ((mlResult.predicted_spend / (parseFloat(profile?.dailyIncome) || 1000)) * 100).toFixed(1),
              debt_impact: parseFloat(profile?.monthlyEMI) > 0 ? 'High' : 'Low'
            },
            recommendations: generateRecommendations(mlResult.predicted_spend, mlData)
          },
          input_data: mlData,
          historical_data: {
            past_7day_avg: past7DayAvg,
            past_30day_trend: pastExpenses.length > 0 ? 'Available' : 'Limited data'
          }
        });
      } else {
        throw new Error(mlResult.error || 'Prediction failed');
      }
    } catch (mlError) {
      console.log('ML service error, using fallback prediction:', mlError.message);
      
      // Fallback prediction logic
      const fallbackPrediction = calculateFallbackPrediction(mlData, pastExpenses);
      
      res.json({
        success: true,
        prediction: {
          predicted_spend: fallbackPrediction.amount,
          model_accuracy: 85.0,
          confidence_level: 'Medium',
          factors: {
            historical_pattern: past7DayAvg,
            income_ratio: ((fallbackPrediction.amount / (parseFloat(profile?.dailyIncome) || 1000)) * 100).toFixed(1),
            debt_impact: parseFloat(profile?.monthlyEMI) > 0 ? 'High' : 'Low'
          },
          recommendations: generateRecommendations(fallbackPrediction.amount, mlData)
        },
        input_data: mlData,
        historical_data: {
          past_7day_avg: past7DayAvg,
          past_30day_trend: pastExpenses.length > 0 ? 'Available' : 'Limited data'
        },
        fallback_used: true
      });
    }

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prediction',
      error: error.message
    });
  }
});

app.post('/api/predict/weekly-expense', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile and past expenses
    const profile = await Profile.findOne({ user: userId }).lean();
    const pastExpenses = await DailyExpense.find({ user: userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Calculate past 7-day average
    const recent7Days = pastExpenses.slice(0, 7);
    const past7DayAvg = recent7Days.length > 0 
      ? recent7Days.reduce((sum, exp) => sum + (exp.totalSpend || 0), 0) / recent7Days.length
      : 1000;

    // Prepare data for ML service
    const mlData = {
      age_group: profile?.ageGroup || '26-35',
      family_size: parseInt(profile?.familySize) || 1,
      daily_income: parseFloat(profile?.dailyIncome) || parseFloat(profile?.monthlyIncome) / 30 || 1000,
      past_7day_avg: past7DayAvg
    };

    try {
      const mlResponse = await fetch('http://localhost:8000/predict-weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlData)
      });

      if (!mlResponse.ok) {
        throw new Error('ML service unavailable');
      }

      const mlResult = await mlResponse.json();
      
      if (mlResult.success) {
        res.json({
          success: true,
          weekly_predictions: mlResult.weekly_predictions,
          total_weekly_spend: mlResult.total_weekly_spend,
          model_accuracy: mlResult.model_accuracy,
          confidence_level: 'High',
          insights: {
            weekend_pattern: 'Higher spending expected on weekends',
            savings_opportunity: mlResult.total_weekly_spend * 0.1,
            budget_status: mlResult.total_weekly_spend > (parseFloat(profile?.monthlyBudget) || 10000) / 4 ? 'Over budget' : 'Within budget'
          }
        });
      } else {
        throw new Error(mlResult.error || 'Weekly prediction failed');
      }
    } catch (mlError) {
      console.log('ML service error, using fallback weekly prediction:', mlError.message);
      
      // Fallback weekly prediction
      const weeklyPredictions = generateFallbackWeeklyPrediction(past7DayAvg);
      
      res.json({
        success: true,
        weekly_predictions: weeklyPredictions.predictions,
        total_weekly_spend: weeklyPredictions.total,
        model_accuracy: 85.0,
        confidence_level: 'Medium',
        insights: {
          weekend_pattern: 'Higher spending expected on weekends',
          savings_opportunity: weeklyPredictions.total * 0.1,
          budget_status: weeklyPredictions.total > (parseFloat(profile?.monthlyBudget) || 10000) / 4 ? 'Over budget' : 'Within budget'
        },
        fallback_used: true
      });
    }

  } catch (error) {
    console.error('Weekly prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly prediction',
      error: error.message
    });
  }
});

// Helper function for fallback predictions
function calculateFallbackPrediction(userData, pastExpenses) {
  const baseSpend = userData.past_7day_avg;
  
  // Apply various factors
  let prediction = baseSpend;
  
  // Weekend factor
  const today = new Date().getDay();
  if (today === 0 || today === 6) { // Sunday or Saturday
    prediction *= 1.2;
  }
  
  // Family size factor
  prediction *= (1 + (userData.family_size - 1) * 0.1);
  
  // Income ratio factor
  const incomeRatio = prediction / userData.daily_income;
  if (incomeRatio > 0.8) {
    prediction *= 0.9; // Reduce if too high relative to income
  }
  
  // Debt EMI factor
  if (userData.monthly_emi > 0) {
    prediction *= 0.95; // Slight reduction due to debt obligations
  }
  
  return {
    amount: Math.round(prediction),
    factors_applied: ['weekend', 'family_size', 'income_ratio', 'debt_impact']
  };
}

function generateFallbackWeeklyPrediction(dailyAvg) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekendMultiplier = [1.0, 0.9, 0.85, 0.9, 1.1, 1.3, 1.2]; // Weekend higher
  
  const predictions = daysOfWeek.map((day, index) => ({
    date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_of_week: day,
    predicted_spend: Math.round(dailyAvg * weekendMultiplier[index])
  }));
  
  const total = predictions.reduce((sum, p) => sum + p.predicted_spend, 0);
  
  return { predictions, total };
}

function generateRecommendations(predictedSpend, userData) {
  const recommendations = [];
  
  // Income-based recommendations
  const incomeRatio = predictedSpend / userData.daily_income;
  if (incomeRatio > 0.7) {
    recommendations.push({
      type: 'warning',
      title: 'High Spending Alert',
      message: `Predicted spending is ${(incomeRatio * 100).toFixed(1)}% of daily income`,
      action: 'Consider reducing non-essential expenses'
    });
  }
  
  // Category-specific recommendations
  if (userData.food > userData.daily_income * 0.3) {
    recommendations.push({
      type: 'suggestion',
      title: 'Food Budget Optimization',
      message: 'Food expenses are high relative to income',
      action: 'Try meal planning and home cooking'
    });
  }
  
  if (userData.entertainment > userData.daily_income * 0.2) {
    recommendations.push({
      type: 'suggestion',
      title: 'Entertainment Spending',
      message: 'Consider balancing entertainment with savings',
      action: 'Look for free or low-cost activities'
    });
  }
  
  // Debt-related recommendations
  if (userData.monthly_emi > 0) {
    recommendations.push({
      type: 'info',
      title: 'Debt Management',
      message: 'Factor in EMI payments when planning expenses',
      action: 'Prioritize debt reduction strategies'
    });
  }
  
  // Positive reinforcement
  if (incomeRatio < 0.5) {
    recommendations.push({
      type: 'success',
      title: 'Great Spending Control!',
      message: 'Your spending is well within limits',
      action: 'Consider increasing your savings rate'
    });
  }
  
  return recommendations;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize DB and data files on startup
connectDB().then(async () => {
  // Drop problematic unique index on email if exists
  try {
    await mongoose.connection.db.collection('users').dropIndex('email_1');
    console.log('Dropped email_1 index');
  } catch (e) {
    console.log('Index drop failed or not exists:', e.message);
  }
  await initializeDataFiles();
  await migrateProfilesAndDebtsFromJsonIfAny();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ============================================
// DAILY EXPENSES ROUTES
// ============================================

// Import DailyExpense model at the top with other models


// Get all expenses for user (with limit)
app.get('/api/daily-expenses', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const expenses = await DailyExpense.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch expenses' 
    });
  }
});

// Get summary for period (week/month/year)
app.get('/api/daily-expenses/summary', authenticateToken, async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const now = new Date();
    let startDate;

    // Calculate start date based on period
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const expenses = await DailyExpense.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).lean();

    // Calculate summary
    const totalSpend = expenses.reduce((sum, exp) => sum + (exp.totalSpend || 0), 0);
    const totalSavings = expenses.reduce((sum, exp) => sum + (exp.savings || 0), 0);
    const expenseCount = expenses.length;
    const averageDaily = expenseCount > 0 ? totalSpend / expenseCount : 0;

    // Category breakdown
    const categoryBreakdown = {
      food: 0,
      transport: 0,
      bills: 0,
      health: 0,
      education: 0,
      entertainment: 0,
      other: 0
    };

    expenses.forEach(exp => {
      categoryBreakdown.food += exp.food || 0;
      categoryBreakdown.transport += exp.transport || 0;
      categoryBreakdown.bills += exp.bills || 0;
      categoryBreakdown.health += exp.health || 0;
      categoryBreakdown.education += exp.education || 0;
      categoryBreakdown.entertainment += exp.entertainment || 0;
      categoryBreakdown.other += exp.other || 0;
    });

    res.json({
      success: true,
      summary: {
        totalSpend,
        totalSavings,
        averageDaily,
        expenseCount,
        categoryBreakdown,
        period,
        startDate,
        endDate: now
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch summary' 
    });
  }
});

// Add new expense
app.post('/api/daily-expenses', authenticateToken, async (req, res) => {
  try {
    const expenseData = {
      user: req.user.id,
      date: req.body.date || new Date(),
      food: parseFloat(req.body.food) || 0,
      transport: parseFloat(req.body.transport) || 0,
      bills: parseFloat(req.body.bills) || 0,
      health: parseFloat(req.body.health) || 0,
      education: parseFloat(req.body.education) || 0,
      entertainment: parseFloat(req.body.entertainment) || 0,
      other: parseFloat(req.body.other) || 0,
      savings: parseFloat(req.body.savings) || 0,
      cashBalance: parseFloat(req.body.cashBalance) || 0,
      numTransactions: parseInt(req.body.numTransactions) || 1,
      notes: req.body.notes || ''
    };

    const expense = await DailyExpense.create(expenseData);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add expense' 
    });
  }
});

// Update expense
app.put('/api/daily-expenses/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated
    delete updateData.user;
    delete updateData._id;

    const expense = await DailyExpense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update expense' 
    });
  }
});

// Delete expense
app.delete('/api/daily-expenses/:id', authenticateToken, async (req, res) => {
  try {
    const result = await DailyExpense.deleteOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete expense' 
    });
  }
});
