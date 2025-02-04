/**
 * Express module
 * @const express
 */
const express = require('express');
/**
 * Express router to mount report-related functions
 * @const router
 */
const router = express.Router();
const Report = require('../models/reports');
const Cost = require('../models/costs');
const User = require("../models/users");

/**
 * Handles GET requests to fetch a user's monthly report.
 * @name GET /api/report
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.id - User ID
 * @param {string} req.query.year - Year of the report
 * @param {string} req.query.month - Month of the report
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the report data or error message
 */
router.get('/api/report', async (req, res) => {
    try {
        const { id, year, month } = req.query;

        // Validate query parameters
        if (!id || !year || !month ) {
            return res.status(400).json({ error: 'Missing one of the required fields: user ID, year, or month' });
        }
        if ( isNaN(id) || isNaN(year) || isNaN(month)) {
            return res.status(400).json({ error: 'Month/year/id must be Integers' });
        }

        const monthInt = parseInt(month);
        if (monthInt < 1 || monthInt > 12) {
            return res.status(400).json({ error: 'Month must be between 1 and 12' });
        }

        // Check if user exists
        const userExists = await User.findOne({ id: id });
        if (!userExists) {
            return res.status(404).json({ error: 'User does not exist' });
        }

        // Check if report exists in DB
        let report = await Report.findOne({ userid: id });

        if (report?.years?.[year]?.months?.[month]) {
            return res.status(200).json({
                userid: report.userid,
                year: parseInt(year),
                month: parseInt(month),
                costs: report.years[year].months[month].costs
            });
        }

        // Calculate last day of the month and 7-day extension
        const lastDayOfMonth = new Date(year, month, 0);
        const endLimit = new Date(lastDayOfMonth);
        endLimit.setDate(lastDayOfMonth.getDate() + 7);

        const today = new Date();

        // Generate monthly report
        const monthlyReport = await getMonthlyReport(id, year, month);

        // Store in DB only after the allowed period
        if (today > endLimit) {
            await Report.updateOne(
                { userid: id },
                { $set: { [`years.${year}.months.${month}`]: { costs: monthlyReport.costs } } },
                { upsert: true }
            );
        }

        return res.status(200).json(monthlyReport);
    }
    catch (error) {
        if (error instanceof NotFoundError) {
            console.error(`Error caught: ${error.message} - query: ${JSON.stringify(req.query)}`);
            return res.status(error.errorCode).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
});

/**
 * Custom error class for not found errors
 * @class NotFoundError
 * @extends Error
 */
class NotFoundError extends Error {
    /**
     * HTTP status code for not found error
     * @type {number}
     */
    errorCode = 404;

    /**
     * Creates a NotFoundError instance
     * @param {string} errorMessage - Error message
     */
    constructor(errorMessage) {
        super(errorMessage);
    }
}

/**
 * Retrieves the monthly cost report for a given user.
 * @async
 * @function getMonthlyReport
 * @param {string} id - User ID
 * @param {string} year - Year of the report
 * @param {string} month - Month of the report
 * @returns {Promise<Object>} A report object containing user ID, year, month, and categorized costs
 */
async function getMonthlyReport(id, year, month) {
    //First day of month
    const startDate = new Date(year, month - 1, 1);
    //Last day of month
    const endDate = new Date(year, month, 1);
    const idAsNumber = parseInt(id);

    // Fetch user costs within the given month and year
    const reportCosts = await Cost.find({
        userid: idAsNumber,
        date: { $gte: startDate, $lt: endDate },
    });

    const categories = ["food", "education", "health", "sport", "housing"];

    // Initialize cost groups
    const costGroups = {};
    categories.forEach(category => {
        costGroups[category] = [];
    });

    // Populate cost groups
    reportCosts.forEach(cost => {
        costGroups[cost.category].push({
            sum: cost.sum,
            description: cost.description,
            day: new Date(cost.date).getDate()
        });
    });

    return {
        userid: parseInt(id),
        year: parseInt(year),
        month: parseInt(month),
        costs: costGroups
    };
}

module.exports = router;


