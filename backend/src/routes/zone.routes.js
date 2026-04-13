const router = require('express').Router();
const Zone = require('../models/Zone');
const auth = require('../middleware/auth');

// GET /api/zones/nearby?lat=x&lng=y&radius=z
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 500 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    const zones = await Zone.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      },
      isActive: true
    }).populate('activeUsers', 'username displayName vibe isAnonymous');

    res.json({ zones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones — create a zone
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, coverEmoji, type, lat, lng, radius } = req.body;
    const zone = await Zone.create({
      name, description, coverEmoji, type, radius,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      createdBy: req.user._id
    });
    res.status(201).json({ zone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones/:id/join
router.post('/:id/join', auth, async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });

    if (!zone.activeUsers.includes(req.user._id)) {
      zone.activeUsers.push(req.user._id);
      await zone.save();
    }
    req.user.currentZoneId = zone._id;
    await req.user.save();

    res.json({ zone, message: 'Joined zone' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones/:id/leave
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });

    zone.activeUsers = zone.activeUsers.filter(uid => uid.toString() !== req.user._id.toString());
    await zone.save();

    req.user.currentZoneId = null;
    await req.user.save();

    res.json({ message: 'Left zone' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zones/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id)
      .populate('activeUsers', 'username displayName vibe isAnonymous')
      .populate('createdBy', 'username displayName');
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    res.json({ zone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
