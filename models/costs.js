const mongoose = require('mongoose');

/**
 * Cost schema to define the structure of the cost data.
 *
 * @typedef {Object} Cost
 * @property {string} description - A brief description of the cost item.
 * @property {string} category - The category under which the cost falls (e.g., 'food', 'transport').
 * @property {number} userid - The unique identifier of the user associated with this cost.
 * @property {number} sum - The monetary value of the cost.
 * @property {Date} date - The date when the cost was incurred.
 */
const costSchema = new mongoose.Schema({
    description: { type: String, required: true },
    category: { type: String, required: true },
    userid: { type: Number, required: true },
    sum: { type: Number, required: true },
    date: { type: Date, required: true },
});

/**
 * Cost model for interacting with the 'costs' collection in the database.
 *
 * @type {mongoose.Model<Cost>}
 */
module.exports = mongoose.model('Cost', costSchema);
