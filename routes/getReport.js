// const express = require('express');
// const router = express.Router();
// const Cost = require('../models/costs');
//
// // GET /api/report - Get monthly report
// router.get('/api/report', async (req, res) => {
//     const { id, year, month } = req.query;
//
//     // Validate query parameters
//     if (!id || !year || !month) {
//         return res.status(400).json({ error: "Missing required query parameters: id, year, month" });
//     }
//
//     try {
//         // Parse year and month to numbers
//         const yearNum = parseInt(year, 10);
//         const monthNum = parseInt(month, 10);
//
//         // Validate year and month
//         if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
//             return res.status(400).json({ error: "Invalid year or month" });
//         }
//
//         // Calculate the date range for the given month
//         const startDate = new Date(yearNum, monthNum - 1, 1); // First day of the month
//         const endDate = new Date(yearNum, monthNum, 1); // First day of the next month
//
//         // Query the database
//         const costs = await Cost.find({
//             user_id: id,
//             date: {
//                 $gte: startDate,
//                 $lt: endDate
//             }
//         });
//
//         // Return the costs
//         res.json(costs);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "An error occurred while fetching the report" });
//     }
// });
//
// module.exports = router;

const express = require('express');
const router = express.Router();
const Cost = require('../models/costs');
const user = require("../models/users");

/**
 * GET request to retrieve a monthly report of costs, grouped by category.
 *
 * @route GET /api/report
 * @param {string} id - The unique ID of the user.
 * @param {string} year - The year for the report (e.g., 2025).
 * @param {string} month - The month for the report (1 to 12).
 * @returns {Object[]} An array of objects representing grouped costs, each containing a category and the associated cost items.
 * @throws {400} Bad request if any query parameter is missing or invalid.
 * @throws {404} Not found if the user with the provided ID is not found.
 * @throws {500} Internal server error if an error occurs while fetching the report.
 */
router.get('/api/report', async (req, res) => {
    const { id, year, month } = req.query;

    // Validate query parameters
    if (!id) {
        return res.status(400).json({ error: "Missing required query parameter: id" });
    }
    if (!year) {
        return res.status(400).json({ error: "Missing required query parameter: year" });
    }
    if (!month) {
        return res.status(400).json({ error: "Missing required query parameter: month" });
    }

    try {

        const userId = parseInt(id, 10);
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        const getUser = await user.findOne({ id: userId });
        if (!getUser) return res.status(404).json({ error: 'User not found' });

        if (isNaN(yearNum)) {
            return res.status(400).json({ error: "Invalid Year" });
        }

        // Validate year and month
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: "Invalid Month" });
        }

        // Calculate the date range for the given month
        const startDate = new Date(yearNum, monthNum - 1, 1); // First day of the month
        const endDate = new Date(yearNum, monthNum, 1); // First day of the next month

        // Aggregate data to group by category
        const costs = await Cost.aggregate([
            {
                $match: {
                    userid: userId,
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: "$category", // Group by the "category" field
                    //totalCost: { $sum: "$amount" }, // Sum the "amount" field for each category
                    items: { $push: "$$ROOT" } // Include all items in the group
                }
            }
        ]);

        // Format the response
        const response = costs.map(group => ({
            category: group._id,
            //totalCost: group.totalCost,
            items: group.items
        }));

        // Return the grouped costs
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the report" });
    }
});

module.exports = router;