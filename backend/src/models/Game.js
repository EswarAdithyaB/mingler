const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  username: { type: String, required: true },
  score:    { type: Number, default: 0 },
  isReady:  { type: Boolean, default: false },
  isHost:   { type: Boolean, default: false }
}, { _id: false });

const gameSchema = new mongoose.Schema({
  zoneId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
  type: {
    type: String,
    enum: ['ludo', 'truth-or-dare', 'quiz', 'word-chain'],
    required: true
  },
  hostId:   { type: String, required: true },
  hostName: { type: String, required: true },
  players:  [playerSchema],
  maxPlayers: { type: Number, default: 4, min: 2, max: 8 },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  gameData: { type: mongoose.Schema.Types.Mixed, default: {} }, // game state
  winner: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
