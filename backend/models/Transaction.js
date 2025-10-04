const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['income', 'expense'], 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    category: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'check', 'other'], 
      default: 'cash' 
    },
    tags: [{ 
      type: String, 
      trim: true 
    }],
    recurring: { 
      type: Boolean, 
      default: false 
    },
    recurringPeriod: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'yearly'], 
      default: null 
    }
  },
  { timestamps: true }
);

// Add index for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);