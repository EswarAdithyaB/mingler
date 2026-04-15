const router = require('express').Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// GET /api/zones/nearby?lat=x&lng=y&radius=z
// Uses PostGIS ST_DWithin for geo queries
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 500 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    // PostGIS query via RPC function (defined in database.sql)
    const { data: zones, error } = await supabase.rpc('get_nearby_zones', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_meters: parseInt(radius)
    });

    if (error) throw error;
    res.json({ zones: zones || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zones/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: zone, error } = await supabase
      .from('zones')
      .select(`
        *,
        zone_users ( user_id, users ( id, username, display_name, vibe, is_anonymous ) )
      `)
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error || !zone) return res.status(404).json({ error: 'Zone not found' });
    res.json({ zone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones — create a zone
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, coverEmoji, type, lat, lng, radius } = req.body;

    const { data: zone, error } = await supabase
      .from('zones')
      .insert({
        name,
        description: description || '',
        cover_emoji: coverEmoji || '✨',
        type: type || 'cafe',
        radius: radius || 100,
        // PostGIS geography point
        location: `POINT(${parseFloat(lng)} ${parseFloat(lat)})`,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ zone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones/:id/join
router.post('/:id/join', auth, async (req, res) => {
  try {
    // Add to zone_users (upsert — safe if already joined)
    const { error: joinError } = await supabase
      .from('zone_users')
      .upsert({ zone_id: req.params.id, user_id: req.user.id });

    if (joinError) throw joinError;

    // Update user's current zone
    await supabase
      .from('users')
      .update({ current_zone_id: req.params.id })
      .eq('id', req.user.id);

    const { data: zone } = await supabase
      .from('zones')
      .select('*, zone_users(count)')
      .eq('id', req.params.id)
      .single();

    res.json({ zone, message: 'Joined zone' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones/:id/leave
router.post('/:id/leave', auth, async (req, res) => {
  try {
    await supabase
      .from('zone_users')
      .delete()
      .eq('zone_id', req.params.id)
      .eq('user_id', req.user.id);

    await supabase
      .from('users')
      .update({ current_zone_id: null })
      .eq('id', req.user.id);

    res.json({ message: 'Left zone' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
