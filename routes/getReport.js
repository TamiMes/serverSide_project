const express = require('express');
const router = express.Router();
const Report = require('../models/reports');
const Cost = require('../models/costs');
const User = require("../models/users");

router.get('/api/report', async (req, res) => {
    try {
        const { id, year, month } = req.query;

        // Validate query parameters
        if (!id || !year || !month ) {
            return res.status(400).json({ error: 'Missing one of the required fields: user ID, year, or month' });
        }
        if ( isNaN(id) || isNaN(year) || isNaN(month)) {
            return res.status(400).json({ error: 'Month/year/id need to be  numbers ' });
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


        //const today = new Date("Fri Feb 7 2025 20:31:42 GMT+0200");
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
    } catch (error) {
        if (error instanceof NotFoundError) {
            console.error(`Error caught: ${error.message} - query: ${JSON.stringify(req.query)}`);
            return res.status(error.errorCode).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
});

class NotFoundError extends Error {
    errorCode = 404;
    constructor(errorMessage) {
        super(errorMessage);
    }
}

// Returns the monthly report of user
async function getMonthlyReport(id, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const idAsNumber = parseInt(id)

    // Fetch user costs within the given month and year
    const reportCosts = await Cost.find({
        userid: idAsNumber,
        date: { $gte: startDate, $lt: endDate },
    });

    const categories = ["food", "education", "health", "sport", "housing"];

    // Initialize cost groups as an object
    const costGroups = {};
    categories.forEach(category => {
        costGroups[category] = [];
    });

    // Populate cost groups
    reportCosts.forEach((cost => {

            costGroups[cost.category].push({
                sum: cost.sum,
                description: cost.description,
                day: new Date(cost.date).getDate()
            });

    }))
    //console.log(costGroups);


    return {
        userid: parseInt(id),
        year: parseInt(year),
        month: parseInt(month),
        costs: costGroups
    };
}

module.exports = router;
