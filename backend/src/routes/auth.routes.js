const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, displayName, email, password, vibe } = req.body;
    if (!username || !email || !password || !displayName)
      return res.status(400).json({ error: 'All fields required' });

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username.toLowerCase()}`)
      .maybeSingle();

    if (existing) return res.status(409).json({ error: 'Username or email already taken' });

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: username.toLowerCase(),
        display_name: displayName,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        vibe: vibe || 'chill',
        is_online: true
      })
      .select('id, username, display_name, email, vibe, is_anonymous, settings, created_at')
      .single();

    if (error) throw error;

    const token = signToken(user.id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Update online status
    await supabase.from('users').update({ is_online: true }).eq('id', user.id);

    const token = signToken(user.id);
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', auth, async (req, res) => {
  await supabase
    .from('users')
    .update({ is_online: false, socket_id: null, current_zone_id: null })
    .eq('id', req.user.id);
  res.json({ message: 'Logged out' });
});

// PATCH /api/auth/settings
router.patch('/settings', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ settings: req.body })
      .eq('id', req.user.id)
      .select('settings')
      .single();

    if (error) throw error;
    res.json({ settings: data.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
