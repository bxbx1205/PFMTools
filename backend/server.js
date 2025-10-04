const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pfm-auth';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  pin: {
    type: String,
    length: 4
  },
  pinEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pinEnabled: user.pinEnabled
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pinEnabled: user.pinEnabled
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Protected route example
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Set PIN
app.post('/api/auth/set-pin', verifyToken, async (req, res) => {
  try {
    const { pin } = req.body;

    // Validation
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Update user with PIN
    await User.findByIdAndUpdate(req.user.userId, {
      pin: hashedPin,
      pinEnabled: true
    });

    res.json({ message: 'PIN set successfully' });

  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login with PIN
app.post('/api/auth/login-pin', async (req, res) => {
  try {
    const { email, pin } = req.body;

    // Validation
    if (!email || !pin) {
      return res.status(400).json({ message: 'Email and PIN are required' });
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.pinEnabled) {
      return res.status(400).json({ message: 'Invalid email or PIN not set' });
    }

    // Check PIN
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'PIN login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pinEnabled: user.pinEnabled
      }
    });

  } catch (error) {
    console.error('PIN login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Disable PIN
app.post('/api/auth/disable-pin', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      pin: null,
      pinEnabled: false
    });

    res.json({ message: 'PIN disabled successfully' });

  } catch (error) {
    console.error('Disable PIN error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});