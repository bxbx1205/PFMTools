const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Data directory setup
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const DEBTS_FILE = path.join(DATA_DIR, 'debts.json');

// Initialize data directory and files
async function initializeDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize users file
    try {
      await fs.access(USERS_FILE);
    } catch (error) {
      await fs.writeFile(USERS_FILE, JSON.stringify([]));
    }
    
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
    
    console.log('Data files initialized successfully');
  } catch (error) {
    console.error('Error initializing data files:', error);
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

    // Read existing users
    const users = await readDataFile(USERS_FILE);

    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      pin: null,
      pinEnabled: false,
      faceIDEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add user to array and save
    users.push(newUser);
    await writeDataFile(USERS_FILE, users);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        pinEnabled: newUser.pinEnabled,
        faceIDEnabled: newUser.faceIDEnabled
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

    // Read users
    const users = await readDataFile(USERS_FILE);

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
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
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
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

// PIN Routes
app.post('/api/auth/set-pin', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Read users
    const users = await readDataFile(USERS_FILE);
    
    // Find and update user
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);
    
    users[userIndex].pin = hashedPin;
    users[userIndex].pinEnabled = true;
    users[userIndex].updatedAt = new Date().toISOString();
    
    await writeDataFile(USERS_FILE, users);

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

    // Read users
    const users = await readDataFile(USERS_FILE);
    
    // Find user
    const user = users.find(u => u.id === req.user.id);
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

// Profile Routes
app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const {
      dateOfBirth,
      phoneNumber,
      occupation,
      monthlyIncome,
      financialGoals,
      riskTolerance,
      preferredNotifications
    } = req.body;

    // Read existing profiles
    const profiles = await readDataFile(PROFILES_FILE);

    // Check if profile already exists for this user
    const existingProfileIndex = profiles.findIndex(p => p.userId === req.user.id);

    const profileData = {
      userId: req.user.id,
      dateOfBirth,
      phoneNumber,
      occupation,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      financialGoals: financialGoals || [],
      riskTolerance,
      preferredNotifications: preferredNotifications || [],
      updatedAt: new Date().toISOString()
    };

    if (existingProfileIndex !== -1) {
      // Update existing profile
      profiles[existingProfileIndex] = { ...profiles[existingProfileIndex], ...profileData };
    } else {
      // Create new profile
      profileData.id = generateId();
      profileData.createdAt = new Date().toISOString();
      profiles.push(profileData);
    }

    await writeDataFile(PROFILES_FILE, profiles);

    res.json({
      message: 'Profile saved successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ message: 'Server error saving profile' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    // Read profiles
    const profiles = await readDataFile(PROFILES_FILE);
    
    // Find user's profile
    const profile = profiles.find(p => p.userId === req.user.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Debt Routes
app.post('/api/debts', authenticateToken, async (req, res) => {
  try {
    const debts = req.body.debts || [];

    // Read existing debts
    const allDebts = await readDataFile(DEBTS_FILE);

    // Remove existing debts for this user
    const filteredDebts = allDebts.filter(debt => debt.userId !== req.user.id);

    // Add new debts
    const userDebts = debts.map(debt => ({
      id: generateId(),
      userId: req.user.id,
      creditorName: debt.creditorName,
      debtType: debt.debtType,
      currentBalance: parseFloat(debt.currentBalance) || 0,
      minimumPayment: parseFloat(debt.minimumPayment) || 0,
      interestRate: parseFloat(debt.interestRate) || 0,
      dueDate: debt.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const updatedDebts = [...filteredDebts, ...userDebts];
    await writeDataFile(DEBTS_FILE, updatedDebts);

    res.json({
      message: 'Debts saved successfully',
      debts: userDebts
    });

  } catch (error) {
    console.error('Debts save error:', error);
    res.status(500).json({ message: 'Server error saving debts' });
  }
});

app.get('/api/debts', authenticateToken, async (req, res) => {
  try {
    // Read debts
    const allDebts = await readDataFile(DEBTS_FILE);
    
    // Find user's debts
    const userDebts = allDebts.filter(debt => debt.userId === req.user.id);
    
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

    // Read debts
    const allDebts = await readDataFile(DEBTS_FILE);
    
    // Find and update debt
    const debtIndex = allDebts.findIndex(debt => debt.id === debtId && debt.userId === req.user.id);
    
    if (debtIndex === -1) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    allDebts[debtIndex] = {
      ...allDebts[debtIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await writeDataFile(DEBTS_FILE, allDebts);

    res.json({
      message: 'Debt updated successfully',
      debt: allDebts[debtIndex]
    });

  } catch (error) {
    console.error('Debt update error:', error);
    res.status(500).json({ message: 'Server error updating debt' });
  }
});

app.delete('/api/debts/:debtId', authenticateToken, async (req, res) => {
  try {
    const { debtId } = req.params;

    // Read debts
    const allDebts = await readDataFile(DEBTS_FILE);
    
    // Find debt
    const debtIndex = allDebts.findIndex(debt => debt.id === debtId && debt.userId === req.user.id);
    
    if (debtIndex === -1) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    // Remove debt
    allDebts.splice(debtIndex, 1);
    await writeDataFile(DEBTS_FILE, allDebts);

    res.json({ message: 'Debt deleted successfully' });

  } catch (error) {
    console.error('Debt delete error:', error);
    res.status(500).json({ message: 'Server error deleting debt' });
  }
});

// User management routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    // Read users
    const users = await readDataFile(USERS_FILE);
    
    // Find user
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
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

// Initialize data files on startup
initializeDataFiles();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});