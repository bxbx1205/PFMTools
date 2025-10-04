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

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'PFM Backend API is running!' });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists (MongoDB)
    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (MongoDB)
    const created = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: created._id.toString(), email: created.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: created._id.toString(),
        name: created.name,
        email: created.email,
        pinEnabled: created.pinEnabled,
        faceIDEnabled: created.faceIDEnabled
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user (MongoDB)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        pinEnabled: user.pinEnabled,
        faceIDEnabled: user.faceIDEnabled
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// PIN Login (separate endpoint)
app.post('/api/auth/login-pin', async (req, res) => {
  try {
    const { email, pin } = req.body;

    // Validation
    if (!email || !pin) {
      return res.status(400).json({ message: 'Email and PIN are required' });
    }

    if (pin.length !== 4) {
      return res.status(400).json({ message: 'PIN must be 4 digits' });
    }

    // Find user (MongoDB)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if PIN is enabled and exists
    if (!user.pinEnabled || !user.pin) {
      return res.status(400).json({ message: 'PIN not set for this user' });
    }

    // Verify PIN
    const isValidPin = await bcrypt.compare(pin, user.pin);
    if (!isValidPin) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'PIN login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        pinEnabled: user.pinEnabled,
        faceIDEnabled: user.faceIDEnabled
      }
    });

  } catch (error) {
    console.error('PIN login error:', error);
    res.status(500).json({ message: 'Server error during PIN login' });
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
    const debts = req.body.debts || [];
    // Remove existing debts for this user and insert new list
    await Debt.deleteMany({ user: req.user.id });
    const docs = debts.map(d => ({
      user: req.user.id,
      creditorName: d.creditorName,
      debtType: d.debtType,
      currentBalance: parseFloat(d.currentBalance) || 0,
      minimumPayment: parseFloat(d.minimumPayment) || 0,
      interestRate: parseFloat(d.interestRate) || 0,
      dueDate: d.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    let inserted = [];
    if (docs.length) {
      inserted = await Debt.insertMany(docs);
    }
    res.json({ message: 'Debts saved successfully', debts: inserted });
  } catch (error) {
    console.error('Debts save error:', error);
    res.status(500).json({ message: 'Server error saving debts' });
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
        email: user.email,
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize DB and data files on startup
connectDB().then(async () => {
  await initializeDataFiles();
  await migrateUsersFromJsonIfAny();
  await migrateProfilesAndDebtsFromJsonIfAny();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});