const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, trim: true, lowercase: true,
    minlength: 3, maxlength: 24
  },
  displayName: { type: String, required: true, trim: true, maxlength: 40 },
  email: {
    type: String, required: true, unique: true, trim: true, lowercase: true
  },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, maxlength: 160, default: '' },
  vibe: {
    type: String,
    enum: ['chill', 'social', 'creative', 'gamer', 'mysterious'],
    default: 'chill'
  },
  isAnonymous: { type: Boolean, default: false },
  currentZoneId: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
  socketId: { type: String, default: null },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  settings: {
    anonymousMode:    { type: Boolean, default: false },
    locationSharing:  { type: Boolean, default: true },
    vibeVisibility:   { type: String, enum: ['Everyone', 'Zone-Only', 'Nobody'], default: 'Everyone' },
    zoneAlerts:       { type: Boolean, default: true },
    gameInvites:      { type: Boolean, default: true },
    newConfessions:   { type: Boolean, default: false },
    nearbyPlayers:    { type: Boolean, default: true },
    detectionRadius:  { type: Number, default: 200 }
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.socketId;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
