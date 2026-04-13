const router = require('express').Router();
const Vibe = require('../models/Vibe');
const auth = require('../middleware/auth');

// GET /api/vibes/:zoneId
router.get('/:zoneId', auth, async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const filter = { zoneId: req.params.zoneId, isActive: true };
    if (type && type !== 'all') filter.type = type;

    const vibes = await Vibe.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Mask anonymous users
    const safeVibes = vibes.map(v => {
      const obj = v.toObject();
      if (obj.isAnonymous) {
        obj.username = 'Anonymous';
        delete obj.userId;
      }
      // Add my reaction
      const myReaction = v.reactedBy.find(r => r.userId === req.user._id.toString());
      obj.myReaction = myReaction?.emoji || null;
      return obj;
    });

    res.json({ vibes: safeVibes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vibes/:zoneId
router.post('/:zoneId', auth, async (req, res) => {
  try {
    const { content, type, isAnonymous } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const vibe = await Vibe.create({
      zoneId: req.params.zoneId,
      userId: req.user._id,
      username: req.user.username,
      isAnonymous: isAnonymous || req.user.settings?.anonymousMode || false,
      content: content.trim(),
      type: type || 'vibe'
    });

    res.status(201).json({ vibe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vibes/:id/react
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const allowedEmojis = ['❤️', '😂', '👀', '🔥', '💜'];
    if (!allowedEmojis.includes(emoji)) return res.status(400).json({ error: 'Invalid emoji' });

    const vibe = await Vibe.findById(req.params.id);
    if (!vibe) return res.status(404).json({ error: 'Vibe not found' });

    const userId = req.user._id.toString();
    const existingReaction = vibe.reactedBy.find(r => r.userId === userId);

    if (existingReaction) {
      // Remove old reaction
      vibe.reactions[existingReaction.emoji] = Math.max(0, (vibe.reactions[existingReaction.emoji] || 0) - 1);
      vibe.reactedBy = vibe.reactedBy.filter(r => r.userId !== userId);

      if (existingReaction.emoji !== emoji) {
        // Add new reaction
        vibe.reactions[emoji] = (vibe.reactions[emoji] || 0) + 1;
        vibe.reactedBy.push({ userId, emoji });
      }
    } else {
      vibe.reactions[emoji] = (vibe.reactions[emoji] || 0) + 1;
      vibe.reactedBy.push({ userId, emoji });
    }

    await vibe.save();
    res.json({ reactions: vibe.reactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
