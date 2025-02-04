const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose schema for storing user reports.
 *
 * @typedef {Object} reportSchema
 * @property {number} userid - The unique identifier for the user.
 * @property {Object} years - An object containing yearly report data, where each key is a year.
 */
const reportSchema = new Schema({
    userid: { type: Number, required: true, unique: true }, // Unique user ID
    years: {
        type: Object,
        default: {}, // Default as an empty object for storing yearly data
    },
});

module.exports = mongoose.model('Report', reportSchema);



