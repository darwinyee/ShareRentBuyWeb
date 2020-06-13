let distanceFixed = function(distance) {
	return distance.toFixed(2);
};

let capitalize = function(cap) {
	console.log(cap);
	return cap.charAt(0).toUpperCase() + cap.slice(1);
};

let json = function(obj) {
	// console.log(JSON.stringify(obj), "this is")
	return JSON.stringify(obj);
};

let sellBadges = function(sellType) {
	if (sellType == 'Buy') {
		return `<span class="badge badge-pill badge-success"><strong>${sellType}</strong> </span>`;
	} else if (sellType == 'Rent') {
		return `<span class="badge badge-pill badge-danger"><strong>${sellType}</strong> </span>`;
	} else if (sellType == 'Share') {
		return `<span class="badge badge-pill badge-primary"><strong>${sellType}</strong> </span>`;
	} else {
		return `<span class="badge badge-pill badge-secondary"><strong>${sellType}</strong> </span>`;
	}
};

module.exports = { distanceFixed, capitalize, sellBadges, json };
