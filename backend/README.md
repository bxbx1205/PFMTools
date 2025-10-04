# PFM Tools Backend

A backend API for Personal Finance Management now using local MongoDB (works with MongoDB Compass). Users are stored in MongoDB with a Mongoose schema; profiles and debts continue using JSON files for now.

## Features

- 🔐 **User Authentication** (JWT + PIN Login)
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

## Notes on migration from JSON
- On first start, if the MongoDB users collection is empty and a `data/users.json` file exists, the server will import those users into MongoDB and rename the file to `users.json.bak`.
- After migration, user creation/login only use MongoDB.