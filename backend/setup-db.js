#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pfm-tools';

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to local MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Host:', mongoose.connection.host + ':' + mongoose.connection.port);

    // Create indexes for better performance
    const db = mongoose.connection.db;
    
    console.log('🔄 Creating database indexes...');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created unique index on users.email');
    
    // Profiles collection indexes
    await db.collection('profiles').createIndex({ userId: 1 }, { unique: true });
    console.log('✅ Created unique index on profiles.userId');
    
    // Debts collection indexes
    await db.collection('debts').createIndex({ userId: 1 });
    console.log('✅ Created index on debts.userId');
    
    // Transactions collection indexes (for future use)
    await db.collection('transactions').createIndex({ userId: 1 });
    await db.collection('transactions').createIndex({ date: -1 });
    await db.collection('transactions').createIndex({ type: 1 });
    console.log('✅ Created indexes on transactions collection');
    
    console.log('');
    console.log('🎉 Local MongoDB setup completed successfully!');
    console.log('📊 Database:', db.databaseName);
    console.log('🧭 Open MongoDB Compass and connect to:', MONGODB_URI);
    console.log('');
    console.log('✅ Your PFM application is ready!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('🔧 MongoDB Connection Issue:');
      console.log('   Make sure MongoDB is running on your laptop:');
      console.log('   • Windows: net start MongoDB');
      console.log('   • macOS: brew services start mongodb-community');
      console.log('   • Linux: sudo systemctl start mongod');
      console.log('');
      console.log('🧭 MongoDB Compass:');
      console.log('   • Open MongoDB Compass');
      console.log('   • Connect to: mongodb://127.0.0.1:27017');
      console.log('   • Check if MongoDB service is running');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;