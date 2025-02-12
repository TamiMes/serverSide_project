 const express = require('express');
 const router = express.Router();

 /* GET home page. */
 router.get('/', function(req, res, next) {
   res.render('index', { title: 'The Server-Side Final Project HIT Course' });
});

 module.exports = router;
