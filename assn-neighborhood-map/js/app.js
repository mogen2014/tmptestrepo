var Model = [
	{"name": "Jiefangbei CBD", "location": {"lat": 29.557171, "lng": 106.577060}},
	{"name": "Ciqikou, Chongqing", "location": {"lat": 29.578068, "lng": 106.450593}},
	{"name": "Chaotianmen Bridge", "location": {"lat": 29.585523, "lng": 106.578911}},
	{"name": "Three Gorges Museum", "location": {"lat": 29.562055,"lng": 106.550427}},
	{"name": "Geleshan National Forest Park", "location": {"lat": 29.567654, "lng": 106.427850}},
	{"name": "Chongqing", "location": {"lat": 29.565943, "lng": 106.547296}},
	{"name": "Dazu Rock Carvings", "location": {"lat": 29.754561, "lng": 105.802660}},
	// {"name": "Jiefangbei CBD", "location": {29.557171, 106.577060}}

]


// knockout view model
function ViewModel(){
	var self = this;
	self.lists = ko.observableArray(Model);
	self.selector = function(e){
		var name = e.name;
		google.maps.event.trigger(markers[name], 'click');
	};
	self.filtertext = ko.observable("");
	self.filteredLists = ko.computed(function(){
		var filter = self.filtertext().toLowerCase();
		if (!filter) {
			return self.lists();
		}else{
			return ko.utils.arrayFilter(self.lists(), function(list){
				// return ko.utils.stringStartsWith(list.name.toLowerCase(), filter);
				return list.name.toLowerCase().indexOf(filter) !== -1;
			});
		}
	});

	self.testclick = function(){
		// console.log(self.filteredLists(), "test click");
	}

}
var viewModel = new ViewModel();



// make markers global, so viewmodel can access
var markers = {};

function initMap(){
	'use strict';

	// first set up the map
	var map = new google.maps.Map(document.getElementById("map"),{
		center:  {"lat": 29.565943, "lng": 106.547296},
		scrollwheel: false,
		zoom: 13
	});

	// use jQuery animation to toggle the left side location lists
	var toggleState = true;
	$('#showListBtn').click(function(e){
		if (toggleState) {
			$("#listContainer").animate({
				left: "-200px",
			}, 600, function(){
				//call back
				$('#showListBtn').css("background-color", "grey");
			});
		}else{
			$("#listContainer").animate({
				left: "0px",
			}, 600, function(){
				//call back
				$('#showListBtn').css("background-color", "lightblue");
			});
		}
		toggleState = !toggleState;
	});



	//create one infowindow
	var infowindow = new google.maps.InfoWindow();

	// call third party API
	function getWikiContent(marker, name){
		var wikiURL = "https://en.wikipedia.org/w/api.php?";
		wikiURL += $.param({
			"action": "query",
			"titles": name,
			"prop": "info|extracts|pageimages",
			// "prop": "info"|"extracts"|"pageimages",
			"inprop": "url",
			"pithumbsize": 300,
			"format": "json",
		});
		console.log(wikiURL);
		$.ajax({
			url: wikiURL,
			dataType: 'jsonp',
			success: function(e){
				// open info window once get the infomations
				console.log(e);
				var pages = e.query.pages[Object.keys(e.query.pages)[0]];
				var pageLink = pages.canonicalurl;
				var pageImg = pages.thumbnail.source;
				infowindow.setContent("<img src="+pageImg +">" +
									  "<br>"+
									  "<a href=" + pageLink + ">" + name + "</a>");

				//set map center to selected marker
				// map.setCenter(marker.getPosition());
				infowindow.open(map, marker);
			}
		});

	}

	// add marker and listner, then store it in array markers
	function addMarker(map,latLnt, name){
		var marker = new google.maps.Marker({
			position: latLnt, name,
			map: map
		});
		marker.addListener('click', function(e){
			// call third party API and set the infowindow content
			getWikiContent(marker, name);
		});
		markers[name] = marker;
	}

	//create a bounds variable to set fit bounds later
	var mapBounds = new google.maps.LatLngBounds();
	// iterate the data and add all markers on map
	viewModel.lists().forEach(function(data){
		var latLng = new google.maps.LatLng(data.location.lat, data.location.lng);
		addMarker(map, latLng, data.name);
		mapBounds.extend(latLng);
	});
	map.fitBounds(mapBounds);

	// binding view model
	ko.applyBindings(viewModel);

//---------------------- places api
	// //test data
	// var chongda = {lat: 29.564344, lng: 106.468293};
	// chondaLatLng = new google.maps.LatLng(chongda.lat, chongda.lng);
	// // initial place service
	// placeService = new google.maps.places.PlacesService(map);
	// request = {
	// 	location: chondaLatLng,
	// 	radius: "5000",
	// 	types: ["cafe"]
	// 	// types: ["store", "gym", "bakery", "cafe"]
	// };

	// function placesCallback(results, status){
	// 	console.log(results);

	// 	if (status == google.maps.places.PlacesServiceStatus.OK) {
	// 		handlePlacesResults(map, results, status);
	// 	}else{
	// 		console.error(status);
	// 	}
	// 	// console.log("viewModel pushed", viewModel.lists());
	// };


	// placeService.nearbySearch(request, placesCallback);

//---------------------- places api



}

//---------------------- places api
// initial data for test
// var chondaLatLng;
// // global var to store place service
// var placeService;
// var request;


// handle places request results
// function handlePlacesResults(map,results, status){
// 	results.forEach(function(result){
// 		var name = result.name;
// 		var addr = result.formatted_address;
// 		var placeId = result.id;
// 		var location = result.geometry.location;
// 		// console.log(name, addr, placeId);
// 		viewModel.lists().push({
// 			'name': name,
// 			'address': addr,
// 			'placeId': placeId,
// 		});
// 		viewModel.lists(viewModel.lists());
// 		addMarker(map, location);
// 	});
// }
//---------------------- places api





