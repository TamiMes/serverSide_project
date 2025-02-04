const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Assuming this is a Mongoose model

/**
 * @route GET /api/users/:id
 * @description Retrieves user information by user ID.
 * @param {express.Request} req - The request object containing the user ID as a route parameter.
 * @param {express.Response} res - The response object used to return the user data or error messages.
 * @returns {Object} The user's details if found, or an error message.
 */
router.get('/api/users/:id', async function (req, res) {
    try {
        // Parse the ID as an integer
        const userId = parseInt(req.params.id, 10);

        // Validate the ID
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        // Fetch user data
        const getUser = await User.findOne({ id: userId });
        if (!getUser) return res.status(404).json({ error: 'User not found' });

        // Format response
        const userData = {
            first_name: getUser.first_name,
            last_name: getUser.last_name,
            id: getUser.id,
            total: getUser.total,
        };

        res.json(userData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




