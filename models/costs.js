const mongoose = require('mongoose');
const costSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    description: { type: String, required: true },
    sum: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
});

module.exports = mongoose.model('costs', costSchema);