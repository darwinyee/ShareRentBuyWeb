module.exports = (function() {
	var express = require('express');
	const pool = require('../modules/dbcon').pool;
	var router = express.Router();

	// queries select item
	router.get('/', function(req, res) {
		var idName = req.id_label;
		// console.log(idName);
		//NOTE: u.UserID for Select if just want email
		// var sql = 'SELECT * FROM Items i INNER JOIN Users u INNER JOIN Attachments a on i.userID = u.userID where i.itemID = ' + idName  + ' and a.itemID = ' + idName
		// var sql = 'SELECT * FROM Items i INNER JOIN Users u on i.userID = u.userID where i.itemID = ' + idName
		var sql =
			'SELECT i.*, c.*, u.*, a.attachmentID, a.attName, a.attDescr FROM Items i ' +
			'LEFT JOIN Categories c ON c.categoryId = i.catID ' +
			'LEFT JOIN Users u ON u.userID = i.userID ' +
			'LEFT JOIN Attachments a ON a.itemID = i.itemID ' +
			'WHERE i.itemID = ' +
			idName;
		pool.query(sql, (err, result) => {
			if (err) throw err;

			if (result[0].attDescr === null) {
				result[0].attDescr = '/Files/image-unavailable1.png';
			}
			// console.log(result[0].attDescr);
			// res.send('you queried the database')
			res.render('displayItem', result[0]);
		});
	});
	return router;
})();
