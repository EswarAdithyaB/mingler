const router = require('express').Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// GET /api/games/:zoneId?status=waiting
router.get('/:zoneId', auth, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('games')
      .select('*')
      .eq('zone_id', req.params.zoneId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: games, error } = await query;
    if (error) throw error;
    res.json({ games: games || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games/:zoneId — create game
router.post('/:zoneId', auth, async (req, res) => {
  try {
    const { type, maxPlayers } = req.body;

    const { data: game, error } = await supabase
      .from('games')
      .insert({
        zone_id: req.params.zoneId,
        type,
        max_players: maxPlayers || 4,
        host_id: req.user.id,
        host_name: req.user.username,
        players: [{ userId: req.user.id, username: req.user.username, isHost: true, score: 0 }],
        status: 'waiting'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games/:id/join
router.post('/:id/join', auth, async (req, res) => {
  try {
    const { data: game, error: fetchErr } = await supabase
      .from('games')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !game) return res.status(404).json({ error: 'Game not found' });
    if (game.status !== 'waiting')  return res.status(400).json({ error: 'Game already started' });
    if (game.players.length >= game.max_players) return res.status(400).json({ error: 'Game is full' });

    const already = game.players.find(p => p.userId === req.user.id);
    if (already) return res.json({ game });

    const updatedPlayers = [
      ...game.players,
      { userId: req.user.id, username: req.user.username, isHost: false, score: 0 }
    ];

    const { data: updated, error: updateErr } = await supabase
      .from('games')
      .update({ players: updatedPlayers })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    res.json({ game: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games/:id/start
router.post('/:id/start', auth, async (req, res) => {
  try {
    const { data: game } = await supabase
      .from('games')
      .select('host_id')
      .eq('id', req.params.id)
      .single();

    if (game?.host_id !== req.user.id)
      return res.status(403).json({ error: 'Only host can start game' });

    const { data: updated, error } = await supabase
      .from('games')
      .update({ status: 'playing' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ game: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
