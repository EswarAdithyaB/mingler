const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  description: { type: String, maxlength: 200, default: '' },
  coverEmoji: { type: String, default: '✨' },
  type: {
    type: String,
    enum: ['cafe', 'bar', 'park', 'custom'],
    default: 'cafe'
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  radius: { type: Number, default: 100, min: 10, max: 1000 }, // meters
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Geospatial index
zoneSchema.index({ location: '2dsphere' });

zoneSchema.virtual('activeUserCount').get(function() {
  return this.activeUsers.length;
});

module.exports = mongoose.model('Zone', zoneSchema);
