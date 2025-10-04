const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    predictionDate: { 
      type: Date, 
      required: true,
      default: Date.now,
      index: true
    },
    
    // Array of 7 days predictions (output from ML model)
    weeklyPredictions: [{
      date: { type: Date, required: true },
      dayOfWeek: { 
        type: String, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true 
      },
      predictedSpend: { type: Number, required: true, min: 0 }
    }],
    
    // Summary (calculated from predictions)
    totalWeeklySpend: { type: Number, default: 0, min: 0 },
    averageDailySpend: { type: Number, default: 0, min: 0 },
    
    // ML Model metadata
    modelAccuracy: { type: Number, default: 97.0, min: 0, max: 100 },
    modelVersion: { type: String, default: '2.0' },
    
    // Input data used for prediction (for tracking/debugging)
    inputData: {
      past7DayAvg: { type: Number },
      ageGroup: { type: String },
      familySize: { type: Number },
      dailyIncome: { type: Number },
      debtAmount: { type: Number },
      monthlyEMI: { type: Number }
    }
  },
  { timestamps: true }
);

// Compound index for efficient queries
predictionSchema.index({ user: 1, predictionDate: -1 });

// Pre-save hook to calculate totals
predictionSchema.pre('save', function(next) {
  if (this.weeklyPredictions && this.weeklyPredictions.length > 0) {
    this.totalWeeklySpend = this.weeklyPredictions.reduce(
      (sum, pred) => sum + pred.predictedSpend, 0
    );
    this.averageDailySpend = this.totalWeeklySpend / this.weeklyPredictions.length;
  }
  next();
});

module.exports = mongoose.model('Prediction', predictionSchema);
