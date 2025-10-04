# 🧭 PFM with MongoDB Compass - Quick Start

## ✅ Your Setup is Ready!

Your PFM backend is now configured to work with **MongoDB Compass** on your laptop.

## 🚀 Quick Start Steps

### 1. Make Sure MongoDB is Running
```bash
# Windows (run as Administrator)
net start MongoDB

# Check if service is running
services.msc  # Look for "MongoDB Server"
```

### 2. Open MongoDB Compass
- **Connection String:** `mongodb://127.0.0.1:27017`
- **Click "Connect"**
- You should see the `pfm-tools` database

### 3. Start Your Backend
```bash
cd backend
npm start
```

**You should see:**
```
✅ Connected to MongoDB Compass
📊 Database: pfm-tools
🔗 Host: 127.0.0.1
🚪 Port: 27017
🚀 Server is running on port 5000
```

### 4. Start Your Frontend
```bash
cd frontend/my-app
npm run dev
```

## 📊 View Data in MongoDB Compass

After using your app, you'll see these collections:

### 🗂️ Collections:
- **users** - User accounts, emails, hashed passwords
- **profiles** - Financial profiles, income, goals
- **debts** - Loan information, EMIs, interest rates
- **transactions** - Future: expense tracking

### 🔍 Example Queries in Compass:
```javascript
// View all users
{}

// Find users with PIN enabled
{"pinEnabled": true}

// Find high earners
{"monthlyIncome": {"$gt": 50000}}

// Find active debts
{"status": "active"}
```

## 🛠️ Quick Commands

```bash
# Check MongoDB connection
npm run check-db

# Setup database indexes
npm run setup-db

# Start development server
npm run dev

# Start production server
npm start
```

## 💡 Development Tips

✅ **Keep Compass Open** - See data changes in real-time  
✅ **Use Compass Queries** - Debug data easily  
✅ **Export Collections** - Backup your data  
✅ **Monitor Performance** - Check query execution

## 🔧 Troubleshooting

**Connection Failed?**
1. Check if MongoDB service is running
2. Try `mongodb://localhost:27017` instead
3. Restart MongoDB service
4. Check Windows Firewall settings

**Database Empty?**
- Database and collections are created automatically
- Sign up a user in your app to create data
- Refresh Compass to see new collections

Your PFM app is now perfectly configured for MongoDB Compass! 🎉