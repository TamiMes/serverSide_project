const mongoose = require('mongoose');
const {connect} = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Ensure the id is unique
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    total_cost: { type: Number, required: true },
}, {
    timestamps: true, // Optional: Adds createdAt and updatedAt fields automatically
});

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

// Export the User model and mongoose for reuse in other parts of the app
module.exports = User;