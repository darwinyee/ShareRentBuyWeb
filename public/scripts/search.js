document.getElementById('input_search_button').onclick = performSearch;

function performSearch(event) {
	event.preventDefault();
	var search = document.getElementById('input_search').value;
	var lat = document.getElementById('user_lat').value;
	var long = document.getElementById('user_lon').value;

	if (!search) {
		return;
	}
	window.location.href = `/searchResults?search=${search}&lat=${lat}&long=${long}`;
}
