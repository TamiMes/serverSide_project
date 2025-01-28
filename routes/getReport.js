
const express = require('express');
const router = express.Router();
const Report = require('../models/reports'); // Import the Report model
const Cost = require('../models/costs');
const User = require("../models/users"); // Import the Cost model

/**
 * GET request to retrieve a monthly report of costs, grouped by category.
 *
 * @route GET /api/report
 * @param {string} id - The unique ID of the user.
 * @param {string} year - The year for the report (e.g., 2025).
 * @param {string} month - The month for the report (1 to 12).
 * @returns {Object} A JSON object representing grouped costs by category.
 * @throws {400} Bad request if any query parameter is missing or invalid.
 * @throws {500} Internal server error if an error occurs while fetching the report.
 */
router.get('/api/report', async (req, res) => {
    try {
        const { id, year, month } = req.query;

        // Validate query parameters
        if (!id || !year || !month) {
            return res.status(400).json({ error: 'Unfortunately one of the fields is missing: user ID , year, and month ' });
        }
        const userExists = await User.findOne({ id: id });
        if (!userExists) {
            return res.status(404).json({ error: 'Cannot return report  because the user does not exist' });
        }

        const projectionPath = `years.${year}.months.${month}.categories`;

        // Check for existing report
        let report = await Report.findOne(
            { id },
            { [projectionPath]: 1, _id: 0 }
        );

        // If the report exists, we will return it
        if (report?.years?.[year]?.months?.[month]?.categories) {
            return res.status(200).json(report.years[year].months[month].categories);
        }

        // Calculate the last day of the given month
        const lastDayOfMonth = new Date(year, month, 0); // Date for the last day of the month

        // Add 7 days to the end of the month
        const endLimit = new Date(lastDayOfMonth);
        endLimit.setDate(lastDayOfMonth.getDate() + 7);

        // Determine if the current date is past the limit period(7 days till end of the month)
        const today = new Date();

        report = await getReportForMonth(res, id, year, month)

        // Condition 2: More than 7 days have passed from the end of the month
        if (today > endLimit){
            // Update the report with the grouped data
            const updatePath = `years.${year}.months.${month}.categories`;
            await Report.updateOne(
                { id },
                { $set: { [updatePath]: report } },
                { upsert: true }
            );
        }

        return res.status(200).json(report);

    } catch (error) {
        // Handle unexpected errors
        res.status(500).json({ error: error.message });
    }
});


async function getReportForMonth(res, id, year, month) {
    const startDate = new Date(year, month - 1, 1); // Start of the month
    const endDate = new Date(year, month, 0); // End of the month

    // Fetch costs for the user and month
    const costs = await Cost.find({
        userid: id,
        date: {$gte: startDate, $lte: endDate},
    });

    if (!costs.length) {
        return res.status(404).json({error: 'Unfortunately no costs found for the specified user, year, and month'});
    }

    // Group costs by category
    return costs.reduce((acc, cost) => {
        if (!acc[cost.category]) {
            acc[cost.category] = [];
        }
        acc[cost.category].push(cost);
        return acc;
    }, {})
}

module.exports = router;
