import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },

  role: {
  type: String,
  enum: ['user', 'admin'], // Restrict to only these two values
  default: 'user'         // All new users are 'user' by default
},

  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
}, {
  timestamps: true,
});

// Middleware to hash password before saving the user document
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);