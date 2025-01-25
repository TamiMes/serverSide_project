// const express = require('express');
// const router = express.Router();
// const Cost = require('../models/costs'); // Import the Cost model
//
// // POST request to add a new cost item
// router.post('/api/add', async (req, res) => {
//     try {
//         const { description, category, user_id, sum, date } = req.body;
//
//         // Validate that required fields are provided
//         if (!description || !category || !user_id || !sum) {
//             return res.status(400).json({ error: 'Description, category, user_id, and sum are required' });
//         }
//
//         // If no date is provided, use the current date
//         const newCostItem = new Cost({
//             description,
//             category,
//             user_id,
//             sum,
//             date: date || Date.now(), // Use the provided date or the current date
//         });
//
//         // Save the new cost item to the database
//         const savedCostItem = await newCostItem.save();
//
//         // Send the newly created cost item as the response
//         res.status(201).json({
//             user_id: savedCostItem.user_id,
//             description: savedCostItem.description,
//             sum: savedCostItem.sum,
//             category: savedCostItem.category,
//             date: savedCostItem.date,
//             _id: savedCostItem._id,
//         })
//
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
//
// module.exports = router;

const express = require('express');
const router = express.Router();
const Cost = require('../models/costs'); // Import the Cost model
const User = require('../models/users'); // Import the User model

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
router.post('/api/add', async (req, res) => {
    try {
        const { description, category, userid, sum, date } = req.body;

        // Validate that required fields are provided
        if (!description || !category || !userid || !sum) {
            return res.status(400).json({ error: 'Description, category, user_id, and sum are required' });
        }

        // If no date is provided, use the current date
        const newCostItem = new Cost({
            description,
            category,
            userid, // Save user_id as an Int32 (no need to convert)
            sum,
            date: date || Date.now(), // Use the provided date or the current date
        });

        // Save the new cost item to the database
        const savedCostItem = await newCostItem.save();

        // Update the total cost for the user
        await User.updateOne(
            { id: userid }, // Search by user_id as an Int32
            { $inc: { total_cost: sum } }, // Increment the totalCosts field by the sum of the new cost item
            { upsert: true } // Ensure the operation succeeds even if the user document doesn't exist
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

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
