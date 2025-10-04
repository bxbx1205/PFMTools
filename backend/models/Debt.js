const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    creditorName: { type: String },
    debtType: { type: String },
    currentBalance: { type: Number, default: 0 },
    minimumPayment: { type: Number, default: 0 },
    interestRate: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('Debt', DebtSchema);
