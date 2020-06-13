module.exports = function () {
    var express = require('express');
    const fetch = require("node-fetch");
    var router = express.Router();

	//Gets the distance and time from user to the listed item
	function getCoord(req, res, next) {
		
		var g_url =
			'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' +
			req.body.userLat +
			',' +
			req.body.userLon +
			'&destinations=' +
			req.body.destLat +
			'%2C' +
			req.body.destLon +
			'&key=' +
			process.env.GOOGLE_API_KEY;

		var getData = async (url) => {
			try {
				var response = await fetch(url);
				var coord = await response.json();
				var dist1 = coord.rows[0].elements[0].distance.text;
				var dist2 = coord.rows[0].elements[0].distance.value;
				var dur1 = coord.rows[0].elements[0].duration.text;
				var dur2 = coord.rows[0].elements[0].duration.value;
				context = {
					distText: dist1,
					distVal: dist2,
					durText: dur1,
					durVal: dur2
				};
				res.send(JSON.stringify(context));
			} catch (error) {
				console.log(error);
			}
		};
		getData(g_url);
	}

	// Gets user's city and nearby cities
	function getNearbyPl(req, res, next) {
		var url =
			'http://api.geonames.org/findNearbyPlaceNameJSON?lat=' +
			req.body.lat +
			'&lng=' +
			req.body.lon +
			'&cities=cities5000&radius=200&username=cs361dq2020';

		var getData = async (url) => {
			try {
				var response = await fetch(url);
				var cities = await response.json();
				res.send(JSON.stringify(cities));
			} catch (error) {
				console.log(error);
			}
		};
		getData(url);
	}

	/* The routes for homepage */
	router.post('/', getCoord);
	router.post('/get-near-places', getNearbyPl);
	return router; //Branch test II
}();
