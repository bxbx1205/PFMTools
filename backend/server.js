const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./db');

const User = require('./models/User');
const Profile = require('./models/Profile');
const Debt = require('./models/Debt');
const Transaction = require('./models/Transaction');
const DailyExpense = require('./models/DailyExpense');
const Otp = require('./models/Otp');
const { sendOtpSms } = require('./services/sms');
const { sendWeeklyReport, testEmailConnection } = require('./services/email');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const USERS_JSON_FILE = path.join(DATA_DIR, 'users.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const DEBTS_FILE = path.join(DATA_DIR, 'debts.json');

async function initializeDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      await fs.access(PROFILES_FILE);
    } catch (error) {
      await fs.writeFile(PROFILES_FILE, JSON.stringify([]));
    }

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

async function migrateUsersFromJsonIfAny() {
  try {
    const userCount = await User.estimatedDocumentCount();
    if (userCount > 0) {
      return; 
    }

    await fs.access(USERS_JSON_FILE);
    const raw = await fs.readFile(USERS_JSON_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    if (!Array.isArray(arr) || arr.length === 0) return;

    const docs = arr.map(u => ({
      name: u.name,
      email: (u.email || '').toLowerCase(),
      password: u.password, 
      pin: u.pin || null,
      pinEnabled: !!u.pinEnabled,
      faceIDEnabled: !!u.faceIDEnabled,
      createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
      updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
    }));

    if (docs.length) {
      await User.insertMany(docs, { ordered: false });
      console.log(`Migrated ${docs.length} users from users.json to MongoDB`);
      
      try {
        await fs.rename(USERS_JSON_FILE, path.join(DATA_DIR, 'users.json.bak'));
      } catch (e) {
        
      }
    }
  } catch (e) {
    
    if (e && e.code !== 'ENOENT') {
      console.warn('User migration skipped due to error:', e.message);
    }
  }
}

async function migrateProfilesAndDebtsFromJsonIfAny() {
  
  let legacyUsers = [];
  try {
    const bak = await fs.readFile(path.join(DATA_DIR, 'users.json.bak'), 'utf8');
    legacyUsers = JSON.parse(bak || '[]');
  } catch (_) {
    
  }

  const emailToMongoId = new Map();
  if (legacyUsers.length) {
    
    const emails = legacyUsers.map(u => (u.email || '').toLowerCase());
    const mongoUsers = await User.find({ email: { $in: emails } }, { _id: 1, email: 1 }).lean();
    const emailToId = new Map(mongoUsers.map(u => [u.email, u._id.toString()]));
    for (const u of legacyUsers) {
      const id = emailToId.get((u.email || '').toLowerCase());
      if (id) emailToMongoId.set(u.id, id);
    }
  }

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
    
  }

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
    
  }
}

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

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

function normalizeIndianPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]\d{9}$/.test(digits.slice(1))) return `+91${digits.slice(1)}`;
  if (raw.startsWith('+91') && /^[+]?91[6-9]\d{9}$/.test(raw.replace(/\s/g, ''))) return raw.replace(/\s/g, '');
  return null; 
}

function generateOtpCode() {
  
  return String(Math.floor(100000 + Math.random() * 900000));
}

app.get('/', (req, res) => {
  res.json({ message: 'PFM Backend API is running!' });
});

app.post('/api/auth/signup', async (req, res) => {
  return res.status(410).json({ message: 'Email/password signup is disabled. Use phone OTP login.' });
});

app.post('/api/auth/login', async (req, res) => {
  return res.status(410).json({ message: 'Email/password login is disabled. Use phone OTP login.' });
});

app.post('/api/auth/login-pin', async (req, res) => {
  return res.status(410).json({ message: 'PIN login via email is disabled. Use phone OTP login.' });
});

app.post('/api/auth/otp/send', async (req, res) => {
  try {
    const { phone, name } = req.body || {};
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      return res.status(400).json({ message: 'Enter a valid Indian mobile number' });
    }

    const last = await Otp.findOne({ phone: normalized }).sort({ createdAt: -1 }).lean();
    if (last && Date.now() - new Date(last.createdAt).getTime() < 60 * 1000) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    const code = generateOtpCode();
    const codeHash = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    await Otp.create({ phone: normalized, codeHash, expiresAt });

    await sendOtpSms(normalized, code);

    const response = { message: 'OTP sent successfully' };
    if (process.env.NODE_ENV !== 'production') {
      response.devCode = code; 
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
      
      try { recent[0].attempts += 1; await recent[0].save(); } catch (_) {}
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    console.log('Creating/finding user for phone:', normalized);
    let user = await User.findOneAndUpdate(
      { phone: normalized },
      { $setOnInsert: { name: name || 'User', phone: normalized } },
      { new: true, upsert: true }
    );
    console.log('User found/created:', user._id);

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
        
      }
    }
    console.error('OTP verify error:', error?.stack || error?.message || error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

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

app.post('/api/auth/set-pin', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

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

    const user = await User.findById(req.user.id);
    if (!user || !user.pinEnabled || !user.pin) {
      return res.status(400).json({ message: 'PIN not set for this user' });
    }

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

app.post('/api/debts', authenticateToken, async (req, res) => {
  try {
    
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

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    
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

app.get('/api/test-ml', async (req, res) => {
  try {
    console.log('Testing ML service connection...');

    const healthResponse = await fetch('http://localhost:8000/health');
    console.log('Health response status:', healthResponse.status);
    
    if (!healthResponse.ok) {
      return res.json({
        status: 'ML service unreachable',
        error: `Health check failed with status ${healthResponse.status}`
      });
    }
    
    const healthData = await healthResponse.json();
    console.log('Health data:', healthData);

    const testData = {
      age_group: '26-35',
      family_size: 2,
      daily_income: 2000,
      past_7day_avg: 1500,
      
      food: 450,
      transport: 250,
      bills: 600,
      health: 80,
      education: 50,
      entertainment: 120,
      other: 100,
      debt_amount: 50000,
      monthly_emi: 5000,
      loan_type: 'Personal',
      interest_rate: 12.5
    };
    
    console.log('Testing prediction with ACTUAL data:', testData);

    const dataTestResponse = await fetch('http://localhost:8000/test-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    let dataTestResult = null;
    if (dataTestResponse.ok) {
      dataTestResult = await dataTestResponse.json();
      console.log('Data test result:', dataTestResult);
    }

    const predictionResponse = await fetch('http://localhost:8000/predict-weekly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Prediction response status:', predictionResponse.status);
    
    if (!predictionResponse.ok) {
      const errorText = await predictionResponse.text();
      console.log('Prediction error:', errorText);
      return res.json({
        status: 'ML prediction failed',
        health: healthData,
        data_test: dataTestResult,
        prediction_error: errorText
      });
    }
    
    const predictionData = await predictionResponse.json();
    console.log('Prediction data received:', predictionData);
    
    res.json({
      status: 'ML service working with real data',
      health: healthData,
      data_test: dataTestResult,
      sample_prediction: predictionData,
      test_data_sent: testData
    });
    
  } catch (error) {
    console.error('ML test error:', error);
    res.json({
      status: 'ML service connection error',
      error: error.message
    });
  }
});

app.post('/api/predict/weekly-expense', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Prediction request for user:', userId);

    const profile = await Profile.findOne({ user: userId }).lean();
    const pastExpenses = await DailyExpense.find({ user: userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    console.log('Profile found:', !!profile);
    console.log('Past expenses count:', pastExpenses.length);

    if (pastExpenses.length < 7) {
      return res.json({
        success: false,
        message: 'Insufficient data for predictions',
        error: `Please track your expenses for at least 7 days to get AI predictions. You have tracked ${pastExpenses.length} days so far.`,
        required_days: 7,
        current_days: pastExpenses.length,
        days_remaining: 7 - pastExpenses.length
      });
    }

    const recent7Days = pastExpenses.slice(0, 7);
    const past7DayAvg = recent7Days.reduce((sum, exp) => sum + (exp.totalSpend || 0), 0) / recent7Days.length;

    const categoryAverages = {
      food: recent7Days.reduce((sum, exp) => sum + (exp.food || 0), 0) / recent7Days.length,
      transport: recent7Days.reduce((sum, exp) => sum + (exp.transport || 0), 0) / recent7Days.length,
      bills: recent7Days.reduce((sum, exp) => sum + (exp.bills || 0), 0) / recent7Days.length,
      health: recent7Days.reduce((sum, exp) => sum + (exp.health || 0), 0) / recent7Days.length,
      education: recent7Days.reduce((sum, exp) => sum + (exp.education || 0), 0) / recent7Days.length,
      entertainment: recent7Days.reduce((sum, exp) => sum + (exp.entertainment || 0), 0) / recent7Days.length,
      other: recent7Days.reduce((sum, exp) => sum + (exp.other || 0), 0) / recent7Days.length
    };

    console.log('Past 7-day average:', past7DayAvg);
    console.log('Category averages from actual expenses:', categoryAverages);

    const totalCategorySpend = Object.values(categoryAverages).reduce((sum, val) => sum + val, 0);
    if (totalCategorySpend === 0) {
      return res.json({
        success: false,
        message: 'No expense data found',
        error: 'Please enter actual expense amounts in your daily tracking to get predictions.',
        required_days: 7,
        current_days: pastExpenses.length,
        has_data: false
      });
    }

    const userDebts = await Debt.find({ user: userId }).lean();
    const totalDebtAmount = userDebts.reduce((sum, debt) => sum + (debt.totalAmount || 0), 0);
    const monthlyEMI = userDebts.reduce((sum, debt) => sum + (debt.monthlyEMI || 0), 0);
    const primaryLoanType = userDebts.length > 0 ? userDebts[0].loanType || 'None' : 'None';
    const avgInterestRate = userDebts.length > 0 
      ? userDebts.reduce((sum, debt) => sum + (debt.interestRate || 0), 0) / userDebts.length 
      : 0;

    const mlData = {
      age_group: profile?.ageGroup || '26-35',
      family_size: parseInt(profile?.familySize) || 1,
      daily_income: parseFloat(profile?.dailyIncome) || parseFloat(profile?.monthlyIncome) / 30 || 1000,
      past_7day_avg: past7DayAvg,
      
      food: categoryAverages.food,
      transport: categoryAverages.transport,
      bills: categoryAverages.bills,
      health: categoryAverages.health,
      education: categoryAverages.education,
      entertainment: categoryAverages.entertainment,
      other: categoryAverages.other,
      
      debt_amount: totalDebtAmount,
      monthly_emi: monthlyEMI,
      loan_type: primaryLoanType,
      interest_rate: avgInterestRate
    };

    console.log('ML Data prepared:', mlData);

    try {
      console.log('Calling ML service at http://localhost:8000/predict-weekly');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 
      
      const mlResponse = await fetch('http://localhost:8000/predict-weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('ML Response status:', mlResponse.status, mlResponse.ok);

      if (!mlResponse.ok) {
        const errorText = await mlResponse.text();
        console.log('ML Response error:', errorText);
        throw new Error(`ML service unavailable - Status: ${mlResponse.status}`);
      }

      const mlResult = await mlResponse.json();
      console.log('ML Result:', mlResult);
      
      if (mlResult.success) {
        const response = {
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
        };
        console.log('Sending successful response:', response);
        res.json(response);
      } else {
        throw new Error(mlResult.error || 'Weekly prediction failed');
      }
    } catch (mlError) {
      console.log('ML service error, using fallback weekly prediction:', mlError.message);

      const weeklyPredictions = generateFallbackWeeklyPrediction(past7DayAvg, categoryAverages);
      
      const fallbackResponse = {
        success: true,
        weekly_predictions: weeklyPredictions.predictions,
        total_weekly_spend: weeklyPredictions.total,
        model_accuracy: 75.0,
        confidence_level: 'Medium',
        insights: {
          weekend_pattern: 'Higher spending expected on weekends',
          savings_opportunity: weeklyPredictions.total * 0.1,
          budget_status: weeklyPredictions.total > (parseFloat(profile?.monthlyBudget) || 10000) / 4 ? 'Over budget' : 'Within budget'
        },
        fallback_used: true
      };
      
      console.log('Sending fallback response:', fallbackResponse);
      res.json(fallbackResponse);
    }

  } catch (error) {
    console.error('Weekly prediction error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly prediction',
      error: error.message
    });
  }
});

function calculateFallbackPrediction(userData, pastExpenses) {
  const baseSpend = userData.past_7day_avg;

  let prediction = baseSpend;

  const today = new Date().getDay();
  if (today === 0 || today === 6) { 
    prediction *= 1.2;
  }

  prediction *= (1 + (userData.family_size - 1) * 0.1);

  const incomeRatio = prediction / userData.daily_income;
  if (incomeRatio > 0.8) {
    prediction *= 0.9; 
  }

  if (userData.monthly_emi > 0) {
    prediction *= 0.95; 
  }
  
  return {
    amount: Math.round(prediction),
    factors_applied: ['weekend', 'family_size', 'income_ratio', 'debt_impact']
  };
}

function generateFallbackWeeklyPrediction(dailyAvg, categoryAverages = null) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const today = new Date();
  const daysUntilMonday = (7 - today.getDay() + 1) % 7 || 7; 
  const nextMonday = new Date(today.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  
  const predictions = daysOfWeek.map((day, index) => {
    let dayPrediction = dailyAvg;

    if (categoryAverages) {
      const isWeekend = day === 'Saturday' || day === 'Sunday';

      if (isWeekend) {
        
        dayPrediction = 
          categoryAverages.food * 1.2 +
          categoryAverages.transport * 0.7 +
          categoryAverages.entertainment * 1.4 +
          categoryAverages.bills +
          categoryAverages.health +
          categoryAverages.education +
          categoryAverages.other * 1.1;
      } else {
        
        dayPrediction = 
          categoryAverages.food * 1.0 +
          categoryAverages.transport * 1.2 +
          categoryAverages.entertainment * 0.8 +
          categoryAverages.bills +
          categoryAverages.health +
          categoryAverages.education +
          categoryAverages.other;
      }
    } else {
      
      const weekendMultiplier = [1.0, 0.9, 0.85, 0.9, 1.1, 1.3, 1.2]; 
      dayPrediction = dailyAvg * weekendMultiplier[index];
    }

    const predictionDate = new Date(nextMonday.getTime() + index * 24 * 60 * 60 * 1000);
    
    return {
      date: predictionDate.toISOString().split('T')[0],
      day_of_week: day,
      predicted_spend: Math.round(dayPrediction)
    };
  });
  
  const total = predictions.reduce((sum, p) => sum + p.predicted_spend, 0);
  
  return { predictions, total };
}

function generateRecommendations(predictedSpend, userData) {
  const recommendations = [];

  const incomeRatio = predictedSpend / userData.daily_income;
  if (incomeRatio > 0.7) {
    recommendations.push({
      type: 'warning',
      title: 'High Spending Alert',
      message: `Predicted spending is ${(incomeRatio * 100).toFixed(1)}% of daily income`,
      action: 'Consider reducing non-essential expenses'
    });
  }

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

  if (userData.monthly_emi > 0) {
    recommendations.push({
      type: 'info',
      title: 'Debt Management',
      message: 'Factor in EMI payments when planning expenses',
      action: 'Prioritize debt reduction strategies'
    });
  }

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

app.get('/api/email/test', async (req, res) => {
  try {
    const result = await testEmailConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/email/weekly-report', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    console.log('Weekly email report request for user:', userId, 'to email:', email);

    const user = await User.findById(userId).lean();
    const profile = await Profile.findOne({ user: userId }).lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyExpenses = await DailyExpense.find({
      user: userId,
      date: { $gte: oneWeekAgo }
    }).sort({ date: -1 }).lean();

    console.log('Found', weeklyExpenses.length, 'expenses from past week');

    const totalSpent = weeklyExpenses.reduce((sum, exp) => sum + (exp.totalSpend || 0), 0);
    
    const categoryBreakdown = {
      'Food & Dining': weeklyExpenses.reduce((sum, exp) => sum + (exp.food || 0), 0),
      'Transportation': weeklyExpenses.reduce((sum, exp) => sum + (exp.transport || 0), 0),
      'Bills & Utilities': weeklyExpenses.reduce((sum, exp) => sum + (exp.bills || 0), 0),
      'Health & Medical': weeklyExpenses.reduce((sum, exp) => sum + (exp.health || 0), 0),
      'Education': weeklyExpenses.reduce((sum, exp) => sum + (exp.education || 0), 0),
      'Entertainment': weeklyExpenses.reduce((sum, exp) => sum + (exp.entertainment || 0), 0),
      'Other': weeklyExpenses.reduce((sum, exp) => sum + (exp.other || 0), 0)
    };

    let weeklyPredictions = [];
    let totalPredicted = 0;

    try {
      console.log('Calling prediction API for email report...');

      if (weeklyExpenses.length >= 7) {
        const past7DayAvg = weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.totalSpend || 0), 0) / 7;

        const categoryAverages = {
          food: weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.food || 0), 0) / 7,
          transport: weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.transport || 0), 0) / 7,
          bills: weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.bills || 0), 0) / 7,
          health: weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.health || 0), 0) / 7,
          education: weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.education || 0), 0) / 7,
          entertainment: weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.entertainment || 0), 0) / 7,
          other: weeklyExpenses.slice(0, 7).reduce((sum, exp) => sum + (exp.other || 0), 0) / 7
        };

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const today = new Date();
        const daysUntilMonday = (7 - today.getDay() + 1) % 7 || 7;
        const nextMonday = new Date(today.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
        
        weeklyPredictions = daysOfWeek.map((day, index) => {
          let dayPrediction = past7DayAvg;
          const isWeekend = day === 'Saturday' || day === 'Sunday';
          
          if (isWeekend) {
            dayPrediction = categoryAverages.food * 1.2 +
                          categoryAverages.transport * 0.7 +
                          categoryAverages.entertainment * 1.4 +
                          categoryAverages.bills +
                          categoryAverages.health +
                          categoryAverages.education +
                          categoryAverages.other * 1.1;
          } else {
            dayPrediction = categoryAverages.food * 1.0 +
                          categoryAverages.transport * 1.2 +
                          categoryAverages.entertainment * 0.8 +
                          categoryAverages.bills +
                          categoryAverages.health +
                          categoryAverages.education +
                          categoryAverages.other;
          }
          
          const predictionDate = new Date(nextMonday.getTime() + index * 24 * 60 * 60 * 1000);
          
          return {
            date: predictionDate.toISOString().split('T')[0],
            day_of_week: day,
            predicted_spend: Math.round(dayPrediction)
          };
        });

        totalPredicted = weeklyPredictions.reduce((sum, p) => sum + p.predicted_spend, 0);
        console.log('Generated predictions for', weeklyPredictions.length, 'days, total:', totalPredicted);
      }
    } catch (predictionError) {
      console.error('Prediction error for email:', predictionError);
      
    }

    const insights = [];
    
    if (totalSpent > 0) {
      const dailyAvg = totalSpent / Math.max(weeklyExpenses.length, 1);
      const monthlyProjection = dailyAvg * 30;
      
      insights.push(`Your average daily spending this week was ${formatCurrency(dailyAvg)}`);
      
      if (profile?.monthlyIncome) {
        const spendingRatio = (monthlyProjection / profile.monthlyIncome) * 100;
        if (spendingRatio > 80) {
          insights.push(`⚠️ Your projected monthly spending (${spendingRatio.toFixed(1)}%) is high relative to income`);
        } else if (spendingRatio < 60) {
          insights.push(`✅ Great job! Your spending is well within your income (${spendingRatio.toFixed(1)}% of monthly income)`);
        }
      }

      const topCategory = Object.entries(categoryBreakdown).reduce((a, b) => categoryBreakdown[a[0]] > categoryBreakdown[b[0]] ? a : b);
      if (topCategory[1] > 0) {
        insights.push(`Your highest expense category this week was ${topCategory[0]} (${formatCurrency(topCategory[1])})`);
      }
      
      if (totalPredicted > totalSpent) {
        insights.push(`📈 Next week's spending is predicted to be ${formatCurrency(totalPredicted - totalSpent)} higher`);
      } else if (totalPredicted < totalSpent) {
        insights.push(`📉 Next week's spending is predicted to be ${formatCurrency(totalSpent - totalPredicted)} lower`);
      }
    } else {
      insights.push('Start tracking your daily expenses to get personalized insights and predictions!');
    }

    const emailData = {
      userName: user.name,
      weeklyExpenses: weeklyExpenses.map(exp => ({
        date: exp.date,
        amount: exp.totalSpend || 0
      })),
      weeklyPredictions,
      totalSpent,
      totalPredicted,
      categoryBreakdown,
      insights
    };

    console.log('Sending email with data:', {
      userName: emailData.userName,
      expenseCount: emailData.weeklyExpenses.length,
      predictionCount: emailData.weeklyPredictions.length,
      totalSpent: emailData.totalSpent,
      totalPredicted: emailData.totalPredicted
    });

    const emailResult = await sendWeeklyReport(email, emailData);

    if (emailResult.success) {
      let message = 'Weekly report sent successfully to your email!';
      if (emailResult.simulation && emailResult.networkFallback) {
        message = 'Weekly report generated successfully! (Network issue - check console for details)';
      } else if (emailResult.simulation) {
        message = 'Weekly report generated successfully! (Email simulation mode - check console)';
      }
      
      res.json({
        success: true,
        message: message,
        emailSent: !emailResult.simulation,
        simulation: emailResult.simulation,
        networkFallback: emailResult.networkFallback,
        reportData: {
          totalSpent,
          totalPredicted,
          expenseCount: weeklyExpenses.length,
          predictionCount: weeklyPredictions.length,
          simulation: emailResult.simulation
        }
      });
    } else {
      throw new Error(emailResult.error);
    }

  } catch (error) {
    console.error('Weekly email report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send weekly report',
      error: error.message
    });
  }
});

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

connectDB().then(async () => {
  
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

app.get('/api/daily-expenses/summary', authenticateToken, async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const now = new Date();
    let startDate;

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

    const totalSpend = expenses.reduce((sum, exp) => sum + (exp.totalSpend || 0), 0);
    const totalSavings = expenses.reduce((sum, exp) => sum + (exp.savings || 0), 0);
    const expenseCount = expenses.length;
    const averageDaily = expenseCount > 0 ? totalSpend / expenseCount : 0;

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

app.put('/api/daily-expenses/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

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