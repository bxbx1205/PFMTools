#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pfm-tools';

async function checkMongoDB() {
  console.log('🔍 Checking MongoDB Connection...');
  console.log('📍 Connecting to:', MONGODB_URI);
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log('✅ MongoDB is running and accessible!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Host:', mongoose.connection.host + ':' + mongoose.connection.port);
    
    // Check existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Existing collections:', collections.length);
    
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   • ${col.name}`);
      });
    } else {
      console.log('   No collections yet (will be created when data is added)');
    }
    
    console.log('');
    console.log('🎉 Everything looks good! Your MongoDB is ready for PFM.');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting steps:');
    console.log('1. Make sure MongoDB is running:');
    console.log('   • Windows: net start MongoDB');
    console.log('   • Check Windows Services for "MongoDB Server"');
    console.log('');
    console.log('2. Open MongoDB Compass and try connecting to:');
    console.log('   • mongodb://127.0.0.1:27017');
    console.log('   • mongodb://localhost:27017');
    console.log('');
    console.log('3. Check if MongoDB service is installed and running');
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

checkMongoDB();