module.exports = function () {
    const passport = require('passport');
    const express = require('express');
    const router = express.Router();

    // Renders the login page
    function renderLogin(req, res) {
        res.render('login');
    }

    // Loggs in users
    function loginUser(req, res) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })
    }
    
    router.get('/', renderLogin);
    router.post('/', loginUser );
    
    return router;
}();