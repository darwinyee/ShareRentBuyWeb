const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	if (!req.user) {
		var message = 'You must log in or create an account first';
		res.render('login', { message });
	} else {
		res.render('addNewItem');
	}
});

module.exports = router;
