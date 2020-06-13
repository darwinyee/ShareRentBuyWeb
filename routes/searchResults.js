const express = require('express');
const router = express.Router();
const pool = require('../modules/dbcon').pool;

router.get('/', (req, res) => {
	try {
		closestItemSearchFunc(res, req);
	} catch (err) {
		res.status(500).render('displayItems', { error: err });
		return;
	}
});

closestItemSearchFunc = (res, req) => {
	let { search, lat, long } = req.query;
	let searchItemName = search;
	pool.query(
		'SELECT i.*, ST_DISTANCE_SPHERE(POINT(?,?),POINT(i.itemLong,i.itemLat)) * .000621371192 as distance, a.attachmentID, a.attName, a.attDescr FROM Items i LEFT JOIN Attachments a ON a.itemID = i.itemID WHERE ST_DISTANCE_SPHERE(POINT(?,?),POINT(i.itemLong,i.itemLat))* .000621371192 < 50 AND i.itemName COLLATE UTF8_GENERAL_CI LIKE ? GROUP BY i.itemID ORDER BY DISTANCE ASC LIMIT 1',
		[ long, lat, long, lat, `%${searchItemName}%` ],
		(err, result) => {
			if (err) {
				res.render('displayItems', { err });
				return;
			}
			if (result.length == 0) {
				res.render('displayItems', {
					searchResult: null,
					searchName: searchItemName,
					empty: 'No items within 50 miles'
				});
				return;
			}
			let closestItemFound = result[0];
			allFoundItemsFunc(closestItemFound, searchItemName, res, lat, long);
		}
	);
};

allFoundItemsFunc = (closeItem, searchTerm, res, BaseLat, BaseLong) => { 
	pool.query(
		'SELECT i.*, a.attachmentID, a.attName, a.attDescr, ST_DISTANCE_SPHERE(POINT(?,?),POINT(i.itemLong,i.itemLat)) * .000621371192 as distanceFromSearch,ST_DISTANCE_SPHERE(POINT(?,?),POINT(i.itemLong,i.itemLat)) * .000621371192 as distanceItemToItem FROM Items i LEFT JOIN Attachments a ON a.itemID = i.itemID WHERE ST_DISTANCE_SPHERE(POINT(?,?),POINT(i.itemLong,i.itemLat))* .000621371192 < 10 AND i.itemName COLLATE UTF8_GENERAL_CI LIKE ? GROUP BY i.itemID ORDER BY distanceFromSearch ASC',
		[
			BaseLong,
			BaseLat,
			closeItem.itemLong,
			closeItem.itemLat,
			closeItem.itemLong,
			closeItem.itemLat,
			`%${searchTerm}%`
		],
		(err2, allFoundItems) => {
			if (err2) {
				res.render('displayItems', { err2, msg: 'Error' });
				return;
			}

			if (allFoundItems.length == 0) {
				res.render('displayItems', {
					searchResult: allFoundItems,
					searchName: searchTerm,
					empty: 'No items found'
				});
				return;
			}
			//add image unavailable link to null attachment
			for(var row in allFoundItems){
				allFoundItems[row].attDescr = (allFoundItems[row].attDescr === null) ? "./Files/image-unavailable1.png" : allFoundItems[row].attDescr;
			}
			res.render('displayItems', { searchResult: allFoundItems, searchName: searchTerm });
			return;
		}
	);
};

module.exports = router;
