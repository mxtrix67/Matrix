const mongoose = require('mongoose');

const antiAbuseSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    isEnabled: { type: Boolean, default: false },
    punishment: { type: String, enum: ['ban', 'kick', 'mute'], default: 'mute' },
    abusiveWords: { type: [String], default: [] },
    autoConfigEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('AntiAbuse', antiAbuseSchema);