const express = require('express');
const router = express.Router();
const Cost = require('../models/costs'); // Import the Cost model

// POST request to add a new cost item
router.post('/api/add', async (req, res) => {
    try {
        const { description, category, user_id, sum, date } = req.body;

        // Validate that required fields are provided
        if (!description || !category || !user_id || !sum) {
            return res.status(400).json({ error: 'Description, category, user_id, and sum are required' });
        }

        // If no date is provided, use the current date
        const newCostItem = new Cost({
            description,
            category,
            user_id,
            sum,
            date: date || Date.now(), // Use the provided date or the current date
        });

        // Save the new cost item to the database
        const savedCostItem = await newCostItem.save();

        // Send the newly created cost item as the response
        res.status(201).json({
            user_id: savedCostItem.user_id,
            description: savedCostItem.description,
            sum: savedCostItem.sum,
            category: savedCostItem.category,
            date: savedCostItem.date,
            _id: savedCostItem._id,
        })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
