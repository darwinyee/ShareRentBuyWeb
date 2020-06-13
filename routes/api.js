const express = require('express');
const router = express.Router();
const pool = require('../modules/dbcon').pool;
const fetch = require('node-fetch');

//add dotenv functionality
require('dotenv').config();

//get categories
router.get('/getCategories', (req, res, next) => {
	try {
		pool.query('SELECT * FROM Categories', (err, result) => {
			if (err) {
				res.send({ err });
				return;
			}
			if (result.length == 0) {
				res.send({ categoryResults: result, msg: 'No Categories found' });
				return;
			}
			res.send({ categoryResults: result });
		});
	} catch (err) {
		res.status(500).send('categoryItems', { error: err });
		return;
	}
});

//Add new item API
router.post('/addNewItem', async (req, res) => {
	if (!req.user) {
		console.log('User not logged in');
		let message = 'User not logged in';
		res.redirect('/login', message);
	} else {
		let { name, description, price, phone, address, city, state, zip, lat, long, category, sell_type } = req.body;
		if (
			!name ||
			!description ||
			!price ||
			!phone ||
			!address ||
			!city ||
			!state ||
			!zip ||
			!category ||
			!sell_type
		) {
			res.send({ error1: 'No fields should be empty.' });
			return;
		} else {
			let addressString = address + ', ' + city + ', ' + state;
			addressString = addressString.replace(/\s/g, '+');
			await fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&key=${process.env
					.GOOGLE_API_KEY}`
			)
				.then((data) => {
					return data.json();
				})
				.then((data) => {
					lat = data.results[0].geometry.location.lat;
					long = data.results[0].geometry.location.lng;
				})
				.catch((err) => res.status(500).send({ error: { err } }));
			try {
				pool.query(
					'INSERT INTO Items (userID, catID, itemName, itemDescription, itemPrice, itemPhone, itemAddress, itemCity, ' +
						'itemState, itemZip, itemLat, itemLong, sellType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?, ?)',
					[
						req.user.id,
						category,
						name,
						description,
						price,
						phone,
						address,
						city,
						state,
						zip,
						lat,
						long,
						sell_type
					],
					(err, result) => {
						if (err) {
							res.send(err);
						}
						res.send(JSON.stringify({ insertID: result.insertId }));
					}
				);
			} catch (err) {
				res.status(500).send({ error: err });
			}
		}
	}
});

module.exports = router;
