# PFM Tools Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## User Authentication

### 1. Sign Up
**POST** `/api/auth/signup`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "pinEnabled": false
  }
}
```

### 2. Sign In
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. PIN Login
**POST** `/api/auth/login-pin`

**Body:**
```json
{
  "email": "john@example.com",
  "pin": "1234"
}
```

---

## User Profile Management

### 1. Save Profile Data
**POST** `/api/profile/save` (Protected)

**Body:**
```json
{
  "ageGroup": "26-35",
  "familySize": 4,
  "dailyIncome": 2000,
  "monthlyIncome": 60000,
  "occupation": "Software Developer",
  "hasExistingInvestments": "yes",
  "riskTolerance": "medium",
  "primaryGoal": "investing",
  "monthlyBudget": 45000,
  "savingsTarget": 500000,
  "investmentExperience": "intermediate",
  "notificationPreferences": {
    "email": true,
    "push": true,
    "sms": false
  },
  "preferredCurrency": "INR",
  "darkMode": true
}
```

### 2. Get Profile Data
**GET** `/api/profile` (Protected)

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "isFirstTimeUser": false,
    "onboardingCompleted": true
  },
  "profile": {
    "ageGroup": "26-35",
    "familySize": 4,
    "dailyIncome": 2000,
    "monthlyIncome": 60000,
    "occupation": "Software Developer",
    // ... other profile fields
  }
}
```

---

## Debt Management

### 1. Save Debt Information
**POST** `/api/debt/save` (Protected)

**Body:**
```json
{
  "loanType": "Personal",
  "debtAmount": 500000,
  "interestRate": 12.5,
  "loanTenureMonths": 60,
  "remainingTenureMonths": 45,
  "monthlyEMI": 11122,
  "lenderName": "ABC Bank",
  "accountNumber": "123456789",
  "startDate": "2023-01-15",
  "notes": "Used for home renovation"
}
```

**Loan Types:**
- `None` - No loan (clears all debt data)
- `Personal` - Personal Loan
- `Home` - Home Loan
- `Vehicle` - Vehicle Loan
- `Education` - Education Loan
- `Business` - Business Loan
- `Gold` - Gold Loan
- `Credit Card` - Credit Card Debt
- `Other` - Other types

### 2. Get All Debt Information
**GET** `/api/debt` (Protected)

**Response:**
```json
{
  "debtInfo": [
    {
      "_id": "debt-id",
      "userId": "user-id",
      "loanType": "Personal",
      "debtAmount": 500000,
      "interestRate": 12.5,
      "loanTenureMonths": 60,
      "remainingTenureMonths": 45,
      "monthlyEMI": 11122,
      "lenderName": "ABC Bank",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Delete Specific Debt
**DELETE** `/api/debt/:id` (Protected)

---

## Onboarding

### Complete Onboarding
**POST** `/api/profile/complete-onboarding` (Protected)

**Response:**
```json
{
  "message": "Onboarding completed successfully"
}
```

---

## Dashboard

### Get Dashboard Summary
**GET** `/api/dashboard/summary` (Protected)

**Response:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "isFirstTimeUser": false,
    "onboardingCompleted": true
  },
  "summary": {
    "totalDebt": 500000,
    "totalMonthlyEMI": 11122,
    "activeLoans": 1,
    "monthlyIncome": 60000,
    "dailyIncome": 2000,
    "healthScore": 85
  },
  "hasProfile": true,
  "hasDebts": true
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## MongoDB Atlas Setup Instructions

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Build a Database"
   - Select "FREE" shared cluster
   - Choose your cloud provider and region
   - Name your cluster (e.g., "pfm-cluster")

3. **Setup Database User**
   - Go to "Database Access"
   - Add a new user with username and password
   - Give it "Read and write to any database" permission

4. **Configure Network Access**
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allow from anywhere) for development
   - For production, add only your server's IP

5. **Get Connection String**
   - Go to "Databases" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your connection string
   - Update `JWT_SECRET` with a secure random string

**Example `.env` file:**
```env
MONGODB_URI=mongodb+srv://pfmuser:mypassword123@pfm-cluster.abc123.mongodb.net/pfm-tools?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
PORT=5000
NODE_ENV=development
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  pin: String (hashed, optional),
  pinEnabled: Boolean,
  isFirstTimeUser: Boolean,
  onboardingCompleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### User Profiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  ageGroup: String,
  familySize: Number,
  dailyIncome: Number,
  monthlyIncome: Number,
  occupation: String,
  hasExistingInvestments: String,
  riskTolerance: String,
  primaryGoal: String,
  monthlyBudget: Number,
  savingsTarget: Number,
  investmentExperience: String,
  notificationPreferences: {
    email: Boolean,
    push: Boolean,
    sms: Boolean
  },
  preferredCurrency: String,
  darkMode: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Debt Information Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  loanType: String,
  debtAmount: Number,
  interestRate: Number,
  loanTenureMonths: Number,
  remainingTenureMonths: Number,
  monthlyEMI: Number,
  lenderName: String,
  accountNumber: String,
  startDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```