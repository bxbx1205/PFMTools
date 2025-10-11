const mongoose = require('mongoose');

const dailyExpenseSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    date: { 
      type: Date, 
      required: true,
      index: true,
      default: Date.now 
    },

    food: { type: Number, default: 0, min: 0 },
    transport: { type: Number, default: 0, min: 0 },
    bills: { type: Number, default: 0, min: 0 },
    health: { type: Number, default: 0, min: 0 },
    education: { type: Number, default: 0, min: 0 },
    entertainment: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 },

    totalSpend: { type: Number},

    savings: { type: Number, default: 0 },
    cashBalance: { type: Number, default: 0 },
    numTransactions: { type: Number, default: 1 },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

dailyExpenseSchema.index({ user: 1, date: -1 });

dailyExpenseSchema.pre('save', function(next) {
  this.totalSpend = this.food + this.transport + this.bills + 
                   this.health + this.education + this.entertainment + this.other;
  next();
});

module.exports = mongoose.model('DailyExpense', dailyExpenseSchema);