const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

module.exports = (io) => {
  // ── Auth middleware ──────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, display_name, vibe, settings, current_zone_id')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);

    // Mark online
    await supabase.from('users').update({ is_online: true, socket_id: socket.id }).eq('id', socket.user.id);

    // ── Zone events ──────────────────────────────────
    socket.on('zone:join', async ({ zoneId }) => {
      socket.join(`zone:${zoneId}`);

      await supabase.from('zone_users').upsert({ zone_id: zoneId, user_id: socket.user.id });
      await supabase.from('users').update({ current_zone_id: zoneId }).eq('id', socket.user.id);

      io.to(`zone:${zoneId}`).emit('zone:user_joined', {
        userId: socket.user.id,
        username: socket.user.settings?.anonymousMode ? 'Anonymous' : socket.user.username,
        displayName: socket.user.display_name,
        vibe: socket.user.vibe,
        isAnonymous: socket.user.settings?.anonymousMode || false
      });
    });

    socket.on('zone:leave', async ({ zoneId }) => {
      socket.leave(`zone:${zoneId}`);
      await supabase.from('zone_users').delete().eq('zone_id', zoneId).eq('user_id', socket.user.id);
      await supabase.from('users').update({ current_zone_id: null }).eq('id', socket.user.id);

      io.to(`zone:${zoneId}`).emit('zone:user_left', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });

    // ── Vibe events ──────────────────────────────────
    socket.on('vibe:post', async ({ zoneId, content, type, isAnonymous }) => {
      try {
        const anonymous = isAnonymous || socket.user.settings?.anonymousMode || false;

        const { data: vibe, error } = await supabase
          .from('vibes')
          .insert({
            zone_id: zoneId,
            user_id: socket.user.id,
            username: socket.user.username,
            is_anonymous: anonymous,
            content: content.trim(),
            type: type || 'vibe',
            reactions: { '❤️': 0, '😂': 0, '👀': 0, '🔥': 0, '💜': 0 },
            reacted_by: []
          })
          .select()
          .single();

        if (error) throw error;

        io.to(`zone:${zoneId}`).emit('vibe:new', {
          ...vibe,
          username: anonymous ? 'Anonymous' : vibe.username,
          user_id: anonymous ? null : vibe.user_id
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('vibe:react', async ({ vibeId, emoji }) => {
      try {
        const { data: vibe } = await supabase.from('vibes').select('reactions, reacted_by, zone_id').eq('id', vibeId).single();
        if (!vibe) return;

        const userId = socket.user.id;
        let reactions = { ...vibe.reactions };
        let reactedBy = [...(vibe.reacted_by || [])];
        const existing = reactedBy.find(r => r.userId === userId);

        if (existing) {
          reactions[existing.emoji] = Math.max(0, (reactions[existing.emoji] || 0) - 1);
          reactedBy = reactedBy.filter(r => r.userId !== userId);
          if (existing.emoji !== emoji) { reactions[emoji] = (reactions[emoji] || 0) + 1; reactedBy.push({ userId, emoji }); }
        } else {
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          reactedBy.push({ userId, emoji });
        }

        await supabase.from('vibes').update({ reactions, reacted_by: reactedBy }).eq('id', vibeId);
        io.to(`zone:${vibe.zone_id}`).emit('vibe:reaction_update', { vibeId, reactions });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Game events ──────────────────────────────────
    socket.on('game:join_room', ({ gameId }) => socket.join(`game:${gameId}`));

    socket.on('game:invite', ({ targetUserId, gameId }) => {
      const targetSocket = [...io.sockets.sockets.values()].find(s => s.user?.id === targetUserId);
      targetSocket?.emit('game:invite_received', {
        gameId,
        fromUserId: socket.user.id,
        fromUsername: socket.user.username
      });
    });

    socket.on('game:update', async ({ gameId, gameData }) => {
      await supabase.from('games').update({ game_data: gameData }).eq('id', gameId);
      io.to(`game:${gameId}`).emit('game:state_update', { gameId, gameData });
    });

    // ── Connection request ───────────────────────────
    socket.on('connect_request', ({ targetUserId }) => {
      const target = [...io.sockets.sockets.values()].find(s => s.user?.id === targetUserId);
      target?.emit('connect_request_received', {
        fromUserId: socket.user.id,
        fromUsername: socket.user.username,
        fromDisplayName: socket.user.display_name,
        fromVibe: socket.user.vibe
      });
    });

    // ── Disconnect ───────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`[Socket] Disconnected: ${socket.user.username}`);
      await supabase.from('users').update({ is_online: false, socket_id: null }).eq('id', socket.user.id);

      if (socket.user.current_zone_id) {
        await supabase.from('zone_users').delete().eq('zone_id', socket.user.current_zone_id).eq('user_id', socket.user.id);
        io.to(`zone:${socket.user.current_zone_id}`).emit('zone:user_left', {
          userId: socket.user.id, username: socket.user.username
        });
      }
    });
  });
};
