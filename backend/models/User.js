const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    
    phone: { type: String, required: true, unique: true, trim: true }, 
    email: { type: String, default: null, lowercase: true, trim: true },
    password: { type: String, default: null },
    pin: { type: String, default: null }, 
    pinEnabled: { type: Boolean, default: false },
    faceIDEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.pin;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);