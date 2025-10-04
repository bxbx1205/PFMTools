# PFM Backend

# PFM Tools Backend

A comprehensive backend API for Personal Finance Management with MongoDB Atlas integration.

## Features

- 🔐 **User Authentication** (JWT + PIN Login)
- 👤 **User Profile Management** 
- 💳 **Debt Tracking & Management**
- 📊 **Financial Health Dashboard**
- 🎯 **Onboarding Flow**
- 🔒 **Secure Password & PIN Storage**

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB Atlas** (Cloud Database)
- **Mongoose** (ODM)
- **JWT** (Authentication)
- **bcryptjs** (Password Hashing)
- **CORS** (Cross-Origin Support)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your MongoDB Atlas credentials
```

### 3. MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Setup database user and network access
4. Get connection string and update `.env`

### 4. Start Development Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/login-pin` - Login with PIN
- `GET /api/auth/me` - Get current user
- `POST /api/auth/set-pin` - Set PIN for quick login

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
```

### Database Collections
- **users** - User accounts and auth data
- **userprofiles** - Personal and financial profile data  
- **debtinfos** - Debt and loan information

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

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running on your local machine, or update the `MONGODB_URI` in `.env` file.

3. Update the `.env` file with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/pfm-auth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (protected route)

## Usage

The server will run on `http://localhost:5000` by default.

Make sure your frontend is configured to make requests to this URL.