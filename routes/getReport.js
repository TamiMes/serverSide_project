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
const Report = require('../models/reports'); // Import the Report model

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
    try {
        const { userid, year, month } = req.query;

        if (!userid || !year || !month) {
            return res.status(400).json({ error: 'userid, year, and month are required' });
        }

        const projectionPath = `years.${year}.months.${month}.categories`;

        const report = await Report.findOne(
            { userid },
            { [projectionPath]: 1, _id: 0 } // Project only the "categories" object
        );

        if (!report || !report.years?.[year]?.months?.[month]?.categories) {
            return res.status(404).json({ error: 'No data found for the specified user, year, and month' });
        }

        const categories = report.years[year].months[month].categories;

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;