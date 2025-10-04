# PFM Tools Backend

A backend API for Personal Finance Management using MongoDB, now with phone OTP-only authentication. Users authenticate via Indian mobile number OTP; email/password is disabled.

## Features

- 🔐 **User Authentication** (JWT + Phone OTP)
- 📲 **SMS Gateway** integration (Twilio or MSG91) with mock mode for dev
- 👤 **User Profile Management** 
- 💳 **Debt Tracking & Management**
- 📊 **Financial Health Dashboard**
- 🎯 **Onboarding Flow**
- 🔒 **Secure Password & PIN Storage**

## Tech Stack

- Node.js + Express.js
- MongoDB (local) + Mongoose
- JWT (Authentication)
- bcryptjs (Password Hashing)
- CORS
 - axios (SMS provider calls)

## Quick Start

### 1) Install dependencies
```powershell
npm install
```

### 2) Configure environment
```powershell
Copy-Item .env.example .env
# Edit .env if needed; default is local MongoDB: mongodb://127.0.0.1:27017/pfmtools
```

### 3) Start MongoDB locally
- Install MongoDB Community Server if you don't have it.
- Start the MongoDB service (Windows Services) or run mongod.
- Open MongoDB Compass and connect to: `mongodb://127.0.0.1:27017`.

### 4) Run the server
```powershell
npm run dev
```

By default it listens on port 5000. You can override with the `PORT` env.

## API Endpoints

### Authentication
- `POST /api/auth/otp/send` - Send OTP to Indian mobile (+91)
- `POST /api/auth/otp/verify` - Verify OTP, sign-in and create account if new
- `GET /api/auth/me` - Get current user (JWT)
- `POST /api/auth/set-pin` - Set 4-digit PIN (optional quick unlock inside app)
  
Legacy endpoints `/api/auth/signup`, `/api/auth/login`, and `/api/auth/login-pin` return 410 (disabled).

### Profile Management
- `POST /api/profile/save` - Save user profile data
- `GET /api/profile` - Get user profile
- `POST /api/profile/complete-onboarding` - Mark onboarding complete

### Debt Management
- `POST /api/debt/save` - Save debt information
- `GET /api/debt` - Get all user debts
- `DELETE /api/debt/:id` - Delete specific debt

### Dashboard
- `GET /api/dashboard/summary` - Get financial summary

## Data Models

### User Profile
- Personal info (age, family size, income)
- Financial goals and preferences
- Investment experience and risk tolerance
- Notification settings

### Debt Information
- Multiple loan types (Personal, Home, Vehicle, etc.)
- Interest rates and tenure tracking
- EMI calculations
- Lender details

## Security Features

- 🔐 **Password Hashing** with bcryptjs
- 🎯 **JWT Token Authentication**
- 🔢 **4-Digit PIN** for quick access
- 🛡️ **Input Validation**
- 🚫 **CORS Protection**

## Development

### Project Structure
```
backend/
├── server.js              # Main application file
├── package.json            # Dependencies and scripts
├── .env.example           # Environment template
├── API_DOCUMENTATION.md   # Detailed API docs
└── README.md              # This file
```

### Environment Variables
```env
MONGODB_URI=mongodb+srv://...  # MongoDB Atlas connection
JWT_SECRET=your-secret-key     # JWT signing secret
PORT=5000                      # Server port
NODE_ENV=development           # Environment

# SMS Gateway
SMS_PROVIDER=mock              # mock | twilio | msg91

# Twilio
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_FROM=+1XXXXXXXXXX

# MSG91
# MSG91_AUTH_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# MSG91_TEMPLATE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Database Collections
- users - User accounts and auth data (MongoDB)
- profiles.json - Personal and financial profile data (file)
- debts.json - Debt and loan information (file)

## Production Deployment

1. **Environment Setup**
   ```env
   NODE_ENV=production
   JWT_SECRET=strong-random-secret
   MONGODB_URI=your-production-mongodb-uri
   ```

2. **Security Considerations**
   - Use strong JWT secret
   - Configure proper CORS origins
   - Set up MongoDB IP whitelist
   - Use HTTPS in production

3. **Deployment Platforms**
   - **Heroku** - Easy deployment with MongoDB Atlas
   - **Vercel** - Serverless functions
   - **Railway** - Full-stack deployment
   - **DigitalOcean** - VPS hosting

## API Documentation

See `API_DOCUMENTATION.md` for complete endpoint documentation with request/response examples.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Notes
- OTPs are logged to the console only in non-production when using mock provider or when NODE_ENV != production (devCode returned to client). In production, OTPs are not exposed in responses.