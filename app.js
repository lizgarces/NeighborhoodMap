//model of places
var initialPlaces =[
  {
    name: 'Texas State University Round Rock Campus.',
    address: '1555 University Blvd, Round Rock, TX 78665',
    location: {
      lat: 30.567267,
      lng: -97.656215 }
  },
  {
    name: 'Round Rock Public Library.',
    address: '216 E Main St, Round Rock, TX 78664',
    location: {
      lat: 30.507947,
      lng: -97.678469 }
  },
  {
    name: 'Dell Diamond.',
    address: '3400 E Palm Valley Blvd, Round Rock, TX 78665',
    location: {
      lat:  30.526333,
      lng: -97.631381 }
  },
  {
    name: 'Round Rock Premium Outlets.',
    address: '4401 N Interstate Hwy 35, Round Rock, TX 78664',
    location: {
      lat: 30.566409,
      lng: -97.6897 }
  },
  {
    name: 'Round Rock ISD.',
    address: '1311 Round Rock Ave Round Rock, TX 78681',
    location: {
      lat:  30.510069,
      lng: -97.698366}
  }
];

var Place = function(data) {
  this.name = data.name;
  this.location = data.location;
};

// Creates the map.
var map;
var largeInfowindow;
// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
// Create a styles array to use with the map.
  var self = this;

  var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#19a0d8' }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -40 }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 }
    ]
  }];

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 30.508255, lng: -97.678896},
    zoom: 16,
    styles: styles,
    mapTypeControl: false
  });

  //infowindow
  largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // The following group uses the vm.placeList array to create an array of markers on initialize.
  //the review told me to change this because was asked 'Don't make functions within a loop
  // so I went to the discussion forum and saw that Karol, a Forum Mentor, suggested
  //for this same problem to change the loop for and Array forEach. So I changed it
  //for (var i = 0; i < vm.placeList().length; i++) {
  vm.placeList().forEach(function(place,i) {
    // Get the position from the location array.
    var title = place.name;
    var position = place.location;

    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    // Push the marker to our array of markers in the vm.
    place.marker = marker;
    markers.push(marker);

    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this);
      this.setAnimation(google.maps.Animation.BOUNCE);
      //to stop the bouncing
      setTimeout(function () {
          marker.setAnimation(null);
        }, 2100);
    });

    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  });
  //show all the markers atthe begining
  showLocationsMarkers();
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (largeInfowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    largeInfowindow.setContent('');
    largeInfowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    largeInfowindow.addListener('closeclick', function() {
      largeInfowindow.marker = null;
    });
    // we will fill the infowindow with wikipedia info. This code was made with the help of the project from the
    // course Intro to AJAX  fron this Nanodegree.
    //  Wikipedia AJAX request
    var wikiUrl='http://en.wikipedia.org/w/api.php?action=opensearch&search='+ marker.title + '&format=json&callback=wikiCallback';
    //error
    var wikiRequestTimeout = setTimeout(function(){
       largeInfowindow.setContent("failed to get wikipedia resources");
    }, 8000); //after 8 seconds passed, change the text to failed

    var articleStr;

    $.ajax({
       url: wikiUrl,
       dataType: "jsonp",
       // jsonp:"callback", //this is  redundant because it created automatically the callback to jsonp when we assign the datatype
       success: function( response ) {
           var articleList = response[1];
           for (var i = 0; i < articleList.length; i++) {
               articleStr = articleList[i];
               var url = 'http://en.wikipedia.org/wiki/' + articleStr;
               largeInfowindow.setContent('<div> '+ "Wikipedia" + '</div><div id="article"><li id="article"><a href="' + url + '" target="_blank">' + articleStr + '</a></li></div>');
           }
           clearTimeout(wikiRequestTimeout); //if its succed, stop the timeout
       }
    });
    // Open the infowindow on the correct marker.
    largeInfowindow.open(map, marker);
  }
}

// This function will loop through the markers array and display them all.
function showLocationsMarkers() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function myErrorHandling() {
    alert("Google Maps is in troubles. Please try again.");
}
// viewmodel
var ViewModel = function() {
  // we use self to refere the current viewmodel
  var self = this;
  // create an array to put all the places
  self.placeList = ko.observableArray([]);
  // passing the array of places to create them
  initialPlaces.forEach(function(placeItem) {
     self.placeList.push( new Place(placeItem) );
  });

  // using the array to display places
  self.currentPlace = ko.observable( self.placeList()[0] );

  // information from the input
  self.inputInfo = ko.observable('');

 // arrays to store the filter information and no filter information
 // the filter information will be used to show in the list.
 //the no filter information will be to hide
 // It is important to have the no filter information so we can set
 // the markers from the map as no-visible
  self.filterList = ko.observableArray([]);
  self.NoFilterList = ko.observableArray([]);
  self.inputPlaceList = ko.computed(function(){
    var input = self.inputInfo().toString().toLowerCase();
     // We use an observable to create the inputfilter
  	if(input) { //when we type something
  	   self.filterList([]);
  		 self.NoFilterList([]);
       largeInfowindow.close();
      //this was hard. I spend a lot of time. At the end, I had to use .name()
       self.placeList().forEach(function(place,i) {
  		     if ( self.placeList()[i].name.toString().toLowerCase().indexOf(input) >= 0 ) {
  		         self.filterList.push(place);
  		         place.marker.setVisible(true);
  		     }
  		     else {
  		         self.NoFilterList.push(place);
  		         place.marker.setVisible(false);
  		     }
  	  });
  	  return self.filterList();
  	}
  	else {
  	   self.NoFilterList().forEach(function(pos,i) {
  		     pos.marker.setVisible(true);
  		 });
  		 return self.placeList();
  	}
  });
  //to open the wiki info when click on a name. I was having a hard time calling the event
  //to populateInfoWindow, but my daughter remind me about triggers.I found the info
  // about this in stackoverflow
  this.clickOnMarker = function (myPlace) {
    google.maps.event.trigger(myPlace.marker, 'click');
  };
};

self.setPlace = function(clickedPlace) {
  self.currentPlace(clickedPlace);
};

//binding
var vm = new ViewModel();
ko.applyBindings(vm);
