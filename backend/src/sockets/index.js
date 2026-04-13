const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Zone = require('../models/Zone');
const Vibe = require('../models/Vibe');
const Game = require('../models/Game');

module.exports = (io) => {
  // Auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`[Socket] User connected: ${socket.user.username} (${socket.id})`);

    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true, socketId: socket.id
    });

    // ── Zone Events ──────────────────────────────
    socket.on('zone:join', async ({ zoneId }) => {
      try {
        socket.join(`zone:${zoneId}`);
        const zone = await Zone.findById(zoneId);
        if (zone && !zone.activeUsers.includes(socket.user._id)) {
          zone.activeUsers.push(socket.user._id);
          await zone.save();
        }
        await User.findByIdAndUpdate(socket.user._id, { currentZoneId: zoneId });

        // Broadcast to zone members
        io.to(`zone:${zoneId}`).emit('zone:user_joined', {
          userId: socket.user._id,
          username: socket.user.username,
          displayName: socket.user.displayName,
          vibe: socket.user.vibe,
          isAnonymous: socket.user.settings?.anonymousMode
        });

        console.log(`[Socket] ${socket.user.username} joined zone ${zoneId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('zone:leave', async ({ zoneId }) => {
      socket.leave(`zone:${zoneId}`);
      const zone = await Zone.findById(zoneId);
      if (zone) {
        zone.activeUsers = zone.activeUsers.filter(uid => uid.toString() !== socket.user._id.toString());
        await zone.save();
      }
      await User.findByIdAndUpdate(socket.user._id, { currentZoneId: null });

      io.to(`zone:${zoneId}`).emit('zone:user_left', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    // ── Vibe Events ──────────────────────────────
    socket.on('vibe:post', async ({ zoneId, content, type, isAnonymous }) => {
      try {
        const vibe = await Vibe.create({
          zoneId,
          userId: socket.user._id,
          username: socket.user.username,
          isAnonymous: isAnonymous || socket.user.settings?.anonymousMode || false,
          content: content.trim(),
          type: type || 'vibe'
        });

        const vibeObj = vibe.toObject();
        if (vibeObj.isAnonymous) {
          vibeObj.username = 'Anonymous';
          delete vibeObj.userId;
        }

        io.to(`zone:${zoneId}`).emit('vibe:new', vibeObj);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('vibe:react', async ({ vibeId, emoji }) => {
      try {
        const vibe = await Vibe.findById(vibeId);
        if (!vibe) return;

        const userId = socket.user._id.toString();
        const existing = vibe.reactedBy.find(r => r.userId === userId);

        if (existing) {
          vibe.reactions[existing.emoji] = Math.max(0, (vibe.reactions[existing.emoji] || 0) - 1);
          vibe.reactedBy = vibe.reactedBy.filter(r => r.userId !== userId);
          if (existing.emoji !== emoji) {
            vibe.reactions[emoji] = (vibe.reactions[emoji] || 0) + 1;
            vibe.reactedBy.push({ userId, emoji });
          }
        } else {
          vibe.reactions[emoji] = (vibe.reactions[emoji] || 0) + 1;
          vibe.reactedBy.push({ userId, emoji });
        }

        await vibe.save();
        io.to(`zone:${vibe.zoneId}`).emit('vibe:reaction_update', {
          vibeId, reactions: vibe.reactions
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Game Events ──────────────────────────────
    socket.on('game:invite', ({ targetUserId, gameId }) => {
      const targetSocket = [...io.sockets.sockets.values()]
        .find(s => s.user?._id.toString() === targetUserId);

      if (targetSocket) {
        targetSocket.emit('game:invite_received', {
          gameId,
          fromUserId: socket.user._id,
          fromUsername: socket.user.username
        });
      }
    });

    socket.on('game:update', async ({ gameId, gameData }) => {
      const game = await Game.findById(gameId);
      if (!game) return;
      game.gameData = gameData;
      await game.save();
      io.to(`game:${gameId}`).emit('game:state_update', { gameId, gameData });
    });

    socket.on('game:join_room', ({ gameId }) => {
      socket.join(`game:${gameId}`);
    });

    // ── Connection Events ────────────────────────
    socket.on('connect_request', ({ targetUserId }) => {
      const targetSocket = [...io.sockets.sockets.values()]
        .find(s => s.user?._id.toString() === targetUserId);

      if (targetSocket) {
        targetSocket.emit('connect_request_received', {
          fromUserId: socket.user._id,
          fromUsername: socket.user.username,
          fromDisplayName: socket.user.displayName,
          fromVibe: socket.user.vibe
        });
      }
    });

    // ── Disconnect ───────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`[Socket] User disconnected: ${socket.user.username}`);
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false, socketId: null
      });

      // Leave all zones
      if (socket.user.currentZoneId) {
        const zone = await Zone.findById(socket.user.currentZoneId);
        if (zone) {
          zone.activeUsers = zone.activeUsers.filter(uid => uid.toString() !== socket.user._id.toString());
          await zone.save();
          io.to(`zone:${socket.user.currentZoneId}`).emit('zone:user_left', {
            userId: socket.user._id,
            username: socket.user.username
          });
        }
      }
    });
  });
};
