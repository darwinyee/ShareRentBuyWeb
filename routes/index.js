const express = require('express');
const router = express.Router();
const passport = require('passport');
const mngUsers = require('../modules/users.js');

//This file contains all routing information

//used to show home page
router.use('/', require('./home.js'));
//add item page
router.use('/addItem', require('./addItem.js'));
//backend api calls - apis are stored in api.js file
router.use('/api', require('./api.js'));
//aws file storage
router.use('/aws', require('./aws.js'));
//display items
router.use('/searchResults', require('./searchResults'));
// For getting near-by-places
router.use('/locate', require('../routes/locate.js'));
// For editing posted item
router.use('/edititem', require('../routes/editItem.js'));
// Displaying Item (By PW) (feel free to change format)
router.use('/item/:id', function (req, res, next) {
    req.id_label = req.params.id;
    next();
}, require('./displayItem.js'));
// Display login page
router.get('/login', mngUsers.data.checkNotAuthenticated, (req, res) => {res.render('login')});
// Send login request from login page
router.post('/login', mngUsers.data.checkNotAuthenticated,
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	})
);

module.exports = router;
