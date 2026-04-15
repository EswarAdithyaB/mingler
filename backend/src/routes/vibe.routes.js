const router = require('express').Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// GET /api/vibes/:zoneId?type=all&page=1&limit=50
router.get('/:zoneId', auth, async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('vibes')
      .select('*')
      .eq('zone_id', req.params.zoneId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (type && type !== 'all') query = query.eq('type', type);

    const { data: vibes, error } = await query;
    if (error) throw error;

    // Mask anonymous + add my reaction
    const userId = req.user.id;
    const safeVibes = (vibes || []).map(v => {
      const reactedBy = v.reacted_by || [];
      const myReaction = reactedBy.find(r => r.userId === userId)?.emoji || null;
      return {
        ...v,
        username: v.is_anonymous ? 'Anonymous' : v.username,
        user_id: v.is_anonymous ? null : v.user_id,
        myReaction
      };
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

    const anonymous = isAnonymous || req.user.settings?.anonymousMode || false;

    const { data: vibe, error } = await supabase
      .from('vibes')
      .insert({
        zone_id: req.params.zoneId,
        user_id: req.user.id,
        username: req.user.username,
        is_anonymous: anonymous,
        content: content.trim(),
        type: type || 'vibe',
        reactions: { '❤️': 0, '😂': 0, '👀': 0, '🔥': 0, '💜': 0 },
        reacted_by: []
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ vibe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vibes/:id/react
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const allowed = ['❤️', '😂', '👀', '🔥', '💜'];
    if (!allowed.includes(emoji)) return res.status(400).json({ error: 'Invalid emoji' });

    // Fetch current vibe
    const { data: vibe, error: fetchErr } = await supabase
      .from('vibes')
      .select('reactions, reacted_by')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !vibe) return res.status(404).json({ error: 'Vibe not found' });

    const userId = req.user.id;
    let reactions = { ...vibe.reactions };
    let reactedBy = [...(vibe.reacted_by || [])];
    const existing = reactedBy.find(r => r.userId === userId);

    if (existing) {
      reactions[existing.emoji] = Math.max(0, (reactions[existing.emoji] || 0) - 1);
      reactedBy = reactedBy.filter(r => r.userId !== userId);
      if (existing.emoji !== emoji) {
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        reactedBy.push({ userId, emoji });
      }
    } else {
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      reactedBy.push({ userId, emoji });
    }

    const { error: updateErr } = await supabase
      .from('vibes')
      .update({ reactions, reacted_by: reactedBy })
      .eq('id', req.params.id);

    if (updateErr) throw updateErr;
    res.json({ reactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
