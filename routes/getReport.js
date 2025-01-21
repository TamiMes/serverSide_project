const express = require('express');
const router = express.Router();
const Cost = require('../models/costs');

// GET /api/report - Get monthly report
router.get('/api/report', async (req, res) => {
    const { id, year, month } = req.query;

    // Validate query parameters
    if (!id || !year || !month) {
        return res.status(400).json({ error: "Missing required query parameters: id, year, month" });
    }

    try {
        // Parse year and month to numbers
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        // Validate year and month
        if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: "Invalid year or month" });
        }

        // Calculate the date range for the given month
        const startDate = new Date(yearNum, monthNum - 1, 1); // First day of the month
        const endDate = new Date(yearNum, monthNum, 1); // First day of the next month

        // Query the database
        const costs = await Cost.find({
            user_id: id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });

        // Return the costs
        res.json(costs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the report" });
    }
});

module.exports = router;
