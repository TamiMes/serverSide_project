const express = require('express');
const router = express.Router();



router.get('/api/about', function (req, res) {
    const teamDevelopers = [
        { first_name: 'Tamara', last_name: 'Mesengiser' },
        { first_name: 'Niv', last_name: 'Neuvirth' },
    ];
    res.json(teamDevelopers);
});


module.exports = router;
