const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
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
