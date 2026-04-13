const router = require('express').Router();
const Game = require('../models/Game');
const auth = require('../middleware/auth');

// GET /api/games/:zoneId
router.get('/:zoneId', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { zoneId: req.params.zoneId };
    if (status) filter.status = status;

    const games = await Game.find(filter).sort({ createdAt: -1 });
    res.json({ games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games/:zoneId — create game
router.post('/:zoneId', auth, async (req, res) => {
  try {
    const { type, maxPlayers } = req.body;
    const game = await Game.create({
      zoneId: req.params.zoneId,
      type,
      maxPlayers: maxPlayers || 4,
      hostId: req.user._id,
      hostName: req.user.username,
      players: [{
        userId: req.user._id.toString(),
        username: req.user.username,
        isHost: true
      }]
    });
    res.status(201).json({ game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games/:id/join
router.post('/:id/join', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });
    if (game.players.length >= game.maxPlayers) return res.status(400).json({ error: 'Game is full' });

    const alreadyIn = game.players.find(p => p.userId === req.user._id.toString());
    if (!alreadyIn) {
      game.players.push({ userId: req.user._id.toString(), username: req.user.username });
      await game.save();
    }

    res.json({ game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games/:id/start
router.post('/:id/start', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.hostId.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Only host can start game' });

    game.status = 'playing';
    await game.save();
    res.json({ game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
