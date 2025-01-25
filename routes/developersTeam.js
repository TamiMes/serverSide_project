const express = require('express');
const router = express.Router();

/**
 * @description This endpoint returns a list of team developers.
 * It provides the first and last names of each developer in the team.
 *
 * @route GET /api/about
 * @returns {Object[]} 200 - An array of team developers with their first and last names.
 * @returns {string} 200.first_name - The first name of the developer.
 * @returns {string} 200.last_name - The last name of the developer.
 */

router.get('/api/about', function (req, res) {
    const teamDevelopers = [
        { first_name: 'Tamara', last_name: 'Mesengiser' },
        { first_name: 'Niv', last_name: 'Neuvirth' },
    ];
    res.json(teamDevelopers);
});

module.exports = router;