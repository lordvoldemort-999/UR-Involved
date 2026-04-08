// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'systemAdmin'],
      default: 'student', 
    },
    profilePicture: {
      type: String,
      trim: true,
      default: "/images/University_of_Regina_Logo.jpg" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);