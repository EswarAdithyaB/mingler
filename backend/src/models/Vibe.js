const mongoose = require('mongoose');

const vibeSchema = new mongoose.Schema({
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  content: { type: String, required: true, maxlength: 280 },
  type: {
    type: String,
    enum: ['vibe', 'confession', 'shoutout', 'question'],
    default: 'vibe'
  },
  reactions: {
    '❤️': { type: Number, default: 0 },
    '😂': { type: Number, default: 0 },
    '👀': { type: Number, default: 0 },
    '🔥': { type: Number, default: 0 },
    '💜': { type: Number, default: 0 }
  },
  reactedBy: [{ userId: String, emoji: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Vibe', vibeSchema);
