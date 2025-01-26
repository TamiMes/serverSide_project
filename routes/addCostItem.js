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
const Report = require('../models/reports'); // Import the Report model

/**
 * POST request to add a new cost item for a user and update the reports collection.
 *
 * @route POST /api/add
 */
router.post('/api/add', async (req, res) => {
    try {
        const { description, category, userid, sum, date } = req.body;

        // Validate that required fields are provided
        if (!description || !category || !userid || !sum) {
            return res.status(400).json({ error: 'Description, category, userid, and sum are required' });
        }

        // Prepare date information
        const costDate = date ? new Date(date) : new Date();
        const year = costDate.getFullYear();
        const month = costDate.getMonth() + 1; // Months are 0-indexed in JS

        // ** Step 1: Add the cost item to the `costs` collection **
        const newCostItem = new Cost({
            description,
            category,
            userid,
            sum,
            date: costDate,
        });
        const savedCostItem = await newCostItem.save();

        const categoryKey = `years.${year}.months.${month}.categories.${category}`;

        // Step 1: Check if the path exists
        const report = await Report.findOne({ userid });
        if (!report || !report.years?.[year]?.months?.[month]?.categories?.[category]) {
            // If the path does not exist, initialize it as an array
            await Report.updateOne(
                { userid },
                {
                    $set: { [`years.${year}.months.${month}.categories.${category}`]: [] },
                },
                { upsert: true }
            );
        }

        // Step 2: Push the new cost item
        await Report.updateOne(
            { userid },
            {
                $push: { [categoryKey]: savedCostItem },
            }
        );

        // ** Step 3: Update the total costs in the `users` collection **
        await User.updateOne(
            { id: userid },
            { $inc: { total_cost: sum } },
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
    } catch (error) {
        // Handle errors gracefully
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
