// Simple test to check if user has daily expense data
const mongoose = require('mongoose');
const DailyExpense = require('./backend/models/DailyExpense');
const User = require('./backend/models/User');

require('dotenv').config();

async function checkUserData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pfm');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).lean();
    console.log(`📊 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      
      // Get their daily expenses
      const expenses = await DailyExpense.find({ user: user._id }).sort({ date: -1 }).limit(10).lean();
      console.log(`   📝 Daily expenses: ${expenses.length}`);
      
      if (expenses.length > 0) {
        const recent = expenses[0];
        console.log(`   💰 Most recent expense (${new Date(recent.date).toDateString()}):`);
        console.log(`      Food: ₹${recent.food || 0}`);
        console.log(`      Transport: ₹${recent.transport || 0}`);
        console.log(`      Entertainment: ₹${recent.entertainment || 0}`);
        console.log(`      Bills: ₹${recent.bills || 0}`);
        console.log(`      Health: ₹${recent.health || 0}`);
        console.log(`      Education: ₹${recent.education || 0}`);
        console.log(`      Other: ₹${recent.other || 0}`);
        console.log(`      Total: ₹${recent.totalSpend || 0}`);
      } else {
        console.log(`   ⚠️  No daily expense data found for this user`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkUserData();