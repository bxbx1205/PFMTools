const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Using phone-based auth; keep email/password fields optional for backward compatibility
    phone: { type: String, required: true, unique: true, trim: true }, // normalized E.164 e.g., +91XXXXXXXXXX
    email: { type: String, default: null, lowercase: true, trim: true },
    password: { type: String, default: null },
    pin: { type: String, default: null }, // hashed PIN
    pinEnabled: { type: Boolean, default: false },
    faceIDEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helpful JSON transform to hide password and pin by default
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.pin;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
