const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true, unique: true },
    // Common profile fields observed; schema stays flexible
    ageGroup: { type: String },
    familySize: { type: String },
    dailyIncome: { type: String },
    debtAmount: { type: String },
    loanType: { type: String },
    interestRate: { type: String },
    loanTenureMonths: { type: String },
    remainingTenureMonths: { type: String },
    monthlyEMI: { type: String },
    notificationPreferences: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    preferredCurrency: { type: String },
    darkMode: { type: Boolean, default: false },
    occupation: { type: String },
    monthlyIncome: { type: String },
    hasExistingInvestments: { type: String },
    riskTolerance: { type: String },
    primaryGoal: { type: String },
    monthlyBudget: { type: String },
    savingsTarget: { type: String },
    investmentExperience: { type: String },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('Profile', ProfileSchema);
