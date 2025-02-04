const mongoose = require('mongoose');
/**
 * User schema to define the structure of the user data.
 *
 * @typedef {Object} User
 * @property {number} id - The unique identifier for the user.
 * @property {string} first_name - The first name of the user.
 * @property {string} last_name - The last name of the user.
 * @property {number} total - The total cost incurred by the user.
 * @property {Date} createdAt - Automatically generated timestamp for when the user was created.
 * @property {Date} updatedAt - Automatically generated timestamp for when the user was last updated.
 */
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Ensure the id is unique
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    total: { type: Number, required: true },
}, {
   // Adds createdAt and updatedAt fields automatically
    timestamps: true,
});

/**
 * User model for interacting with the 'users' collection in the database.
 *
 * @type {mongoose.Model<User>}
 */


// Export the User model and mongoose for reuse in other parts of the app
module.exports = mongoose.model('User', userSchema);


