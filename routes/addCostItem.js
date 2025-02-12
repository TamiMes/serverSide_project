const express = require('express');
const router = express.Router();
const Cost = require('../models/costs'); // Import the Cost model
const User = require('../models/users'); // Import the User model

// Define valid categories
const validCategories = ["food", "education", "health", "sport", "housing"];

/**
 * POST request to add a new cost item for a user.
 *
 * @route POST /api/add
 * @param {string} description - The description of the cost item.
 * @param {string} category - The category of the cost item.
 * @param {number} userid - The unique ID of the user who is adding the cost item.
 * @param {number} sum - The sum of the cost item.
 * @param {Date} [date] - The date of the cost item (optional, defaults to the current date).
 * @returns {Object} The newly created cost item object, including user ID, description, category, sum, date, and cost item's ID.
 * @throws {400} Bad request if required fields are missing.
 * @throws {500} Internal server error if there is an issue with saving to the database.
 */
router.post('/', async (req, res) => {
    try {
        const { description, category, userid, sum, date } = req.body;

        // Validate that required fields are provided
        if (!description || !category || !userid || !sum) {
            return res.status(400).json({ error: 'One of the fields is missing: description, category, user id, and sum are required' });
        }

        // Validate if the category is one of the valid categories
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Category not supported', invalidCategory: category });
        }

        // Check if the user exists
        const userExists = await User.findOne({ id: userid });
        if (!userExists) {
            return res.status(404).json({ error: 'Cannot add cost item because the user does not exist' });
        }

        // Parse date or use the current date
        const costDate = new Date(date || Date.now());
        const today = new Date();


        // if today is in the first 7 days of a new month, then we accept all time from prev month start until now
        // else (if today is not the first 7 days of a month), then we accept all time from month start until now
        const validFromDate = new Date(today);
        validFromDate.setDate(1)

        if(today.getDate() < 7) validFromDate.setMonth(today.getMonth() - 1)

        if(costDate < validFromDate || costDate > today)
            return res.status(400) .json({ error: 'Unfortunately The cost item date is outside the allowable time range.' });

        // Save the new cost item to the database
        const newCostItem = new Cost({
            description,
            category,
            userid,
            sum,
            date: costDate,
        });
        const savedCostItem = await newCostItem.save();

        // Update the total cost for the user
        await User.updateOne(
            { id: userid },
            { $inc: { total: sum } },
            { upsert: true }
        );

        // Send the newly created cost item as the response
        res.status(201).json({
            description: savedCostItem.description,
            category: savedCostItem.category,
            userid: savedCostItem.userid,
            sum: savedCostItem.sum,
            date: savedCostItem.date,
            _id: savedCostItem._id,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

