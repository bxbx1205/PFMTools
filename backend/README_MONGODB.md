# PFM Backend - MongoDB Edition

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation
```bash
npm install
npm run setup-db  # Setup database indexes
npm run dev       # Start development server
```

## 📊 MongoDB Setup

### Option 1: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/pfm-tools
```

### Option 2: MongoDB Atlas
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pfm-tools
```

## 🗄️ Database Schema

**Collections:**
- **users** - Authentication & user accounts
- **profiles** - Financial profiles & preferences  
- **debts** - Debt tracking & management
- **transactions** - Financial transactions (future)

See `MONGODB_SCHEMA.md` for detailed documentation.

## 🔑 Key Features

✅ **Complete MongoDB integration with Mongoose**  
✅ **Professional schema design with validation**  
✅ **JWT + PIN authentication**  
✅ **User profiles & debt management**  
✅ **Proper relationships between collections**  
✅ **Database indexes for performance**

## 🚀 Server Status
Server runs on `http://localhost:5000` with full MongoDB support!