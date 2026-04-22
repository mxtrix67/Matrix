const mongoose = require('mongoose');

const afkSchema = new mongoose.Schema({
    Guild: { type: String, required: true },
    Member: { type: String, required: true, unique: true }, // Ensure each user has only one AFK entry
    Reason: { type: String, default: "I'm AFK :)" },
    Time: { type: Number, default: Date.now }
});

module.exports = mongoose.model('AFK', afkSchema);
