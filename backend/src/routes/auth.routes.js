const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// ── Tiny logger helpers ──────────────────────────────────────────────────────
const tag  = (label) => `[Auth:${label}]`;
const ok   = (label, msg) => console.log(`✅ ${tag(label)} ${msg}`);
const info = (label, msg) => console.log(`ℹ️  ${tag(label)} ${msg}`);
const warn = (label, msg) => console.warn(`⚠️  ${tag(label)} ${msg}`);
const fail = (label, msg) => console.error(`❌ ${tag(label)} ${msg}`);

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, displayName, email, password, vibe } = req.body;
  info('register', `Request received — username="${username}" email="${email}" vibe="${vibe}"`);

  try {
    if (!username || !email || !password || !displayName) {
      warn('register', 'Validation failed — missing required fields');
      return res.status(400).json({ error: 'All fields required' });
    }

    // 1 — duplicate check
    info('register', 'Checking for existing username / email...');
    const { data: existing, error: lookupErr } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username.toLowerCase()}`)
      .maybeSingle();

    if (lookupErr) {
      fail('register', `Supabase lookup error: ${lookupErr.message}`);
      throw lookupErr;
    }

    if (existing) {
      warn('register', 'Duplicate found — username or email already taken');
      return res.status(409).json({ error: 'Username or email already taken' });
    }
    ok('register', 'No duplicate found');

    // 2 — hash password
    info('register', 'Hashing password (bcrypt cost=12)...');
    const passwordHash = await bcrypt.hash(password, 12);
    ok('register', 'Password hashed');

    // 3 — insert user
    info('register', 'Inserting user into Supabase...');
    const { data: user, error: insertErr } = await supabase
      .from('users')
      .insert({
        username:      username.toLowerCase(),
        display_name:  displayName,
        email:         email.toLowerCase(),
        password_hash: passwordHash,
        vibe:          vibe || 'chill',
        is_online:     true
      })
      .select('id, username, display_name, email, vibe, is_anonymous, settings, created_at')
      .single();

    if (insertErr) {
      fail('register', `Supabase insert error: ${insertErr.message}`);
      throw insertErr;
    }
    ok('register', `User created — id=${user.id}`);

    // 4 — sign JWT
    const token = signToken(user.id);
    ok('register', `JWT signed — responding 201`);
    return res.status(201).json({ token, user });

  } catch (err) {
    fail('register', `Unhandled error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  info('login', `Request received — username="${username}"`);

  try {
    if (!username || !password) {
      warn('login', 'Validation failed — missing username or password');
      return res.status(400).json({ error: 'Username and password required' });
    }

    // 1 — fetch user
    info('login', 'Looking up user in Supabase...');
    const { data: user, error: lookupErr } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (lookupErr) {
      fail('login', `Supabase lookup error: ${lookupErr.message}`);
      throw lookupErr;
    }
    if (!user) {
      warn('login', 'No user found with that username');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    ok('login', `User found — id=${user.id}`);

    // 2 — verify password
    info('login', 'Comparing password hash...');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      warn('login', 'Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    ok('login', 'Password valid');

    // 3 — mark online
    info('login', 'Updating is_online flag...');
    const { error: updateErr } = await supabase
      .from('users')
      .update({ is_online: true })
      .eq('id', user.id);
    if (updateErr) warn('login', `Could not update is_online: ${updateErr.message}`);

    // 4 — respond
    const token = signToken(user.id);
    const { password_hash, ...safeUser } = user;
    ok('login', `Login successful — responding 200`);
    return res.json({ token, user: safeUser });

  } catch (err) {
    fail('login', `Unhandled error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', auth, (req, res) => {
  info('me', `Returning user id=${req.user.id}`);
  res.json({ user: req.user });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', auth, async (req, res) => {
  info('logout', `User id=${req.user.id} logging out`);
  const { error } = await supabase
    .from('users')
    .update({ is_online: false, socket_id: null, current_zone_id: null })
    .eq('id', req.user.id);
  if (error) warn('logout', `Could not clear online status: ${error.message}`);
  ok('logout', 'Done');
  res.json({ message: 'Logged out' });
});

// ── PATCH /api/auth/settings ─────────────────────────────────────────────────
router.patch('/settings', auth, async (req, res) => {
  info('settings', `Update for user id=${req.user.id}`);
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ settings: req.body })
      .eq('id', req.user.id)
      .select('settings')
      .single();

    if (error) { fail('settings', error.message); throw error; }
    ok('settings', 'Settings updated');
    res.json({ settings: data.settings });
  } catch (err) {
    fail('settings', `Unhandled error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
