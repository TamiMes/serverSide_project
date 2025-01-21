const express = require('express');
const router = express.Router();
const user = require('../models/users'); // Assuming this is a Mongoose model

router.get('/api/users/:id', async function (req, res) {
    try {
        // // Validate the ID (assuming it's a MongoDB ObjectId)
        // if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        //     return res.status(400).json({ error: 'Invalid user ID format' });
        // }

        // Parse the ID as an integer
        const userId = parseInt(req.params.id, 10);

        // Validate the ID
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        // Fetch user data
        const getUser = await user.findOne({ id: userId });
        if (!getUser) return res.status(404).json({ error: 'User not found' });

        // Format response
        const userData = {
            first_name: getUser.first_name,
            last_name: getUser.last_name,
            id: getUser.id,
            total: getUser.total_cost,
        };

        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
