function Map(){

	var gmap;
    var bounds;
    var mapwaypoints = [];
    var mapmarkers = [];

	this.createMap = function(jmap, elem, center){
	    gmap = new google.maps.Map(document.getElementById(elem), this.returnMapOptions(center));
	    bounds = new google.maps.LatLngBounds();
       
        this.addMarkersToMap(jmap);
        this.addWaypointsToMap(jmap);
        this.addFavouriteClick('#favourite');
    };

	this.sendToServer = function(postdata, posturl, completefunction){
        $.ajax({
            url: posturl,
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(postdata),
            complete: completefunction
        });
    };

     this.favouritePost = function() {
        var postdata = {
            favourite: jmap._id,
            plusone: jmap.favourited + 1
        };

        this.sendToServer(postdata, "/show", function(data){
            $('#result').append().html(data.responseText);
        });
    };

    var mapOptions = {

        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
             mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE]
        },
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        streetViewControl: true
        };

	this.returnMapOptions = function(center){
        mapOptions.center = center;
		return mapOptions;
	};

	var lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    };

    this.returnLineSymbolOptions = function(){
    	return lineSymbol;
    }

     this.returnPolyLineOptions = function(){
     	return polylineOptions;
     }

	this.setPolyline = function(){
		polyline = new google.maps.Polyline(this.returnPolyLineOptions());
		polyline.setMap(gmap);
	}

	this.addWaypointsToMap = function(jmap){
        for ( var i = 0, j = jmap.waypoints.length; i < j; i++) {
            var waypoint = new google.maps.LatLng(jmap.waypoints[i].lat, jmap.waypoints[i].lon);
            mapwaypoints.push(waypoint);
            bounds.extend(waypoint);
        };
        gmap.fitBounds(bounds);
  		this.setPolyline();
    }

    this.addMarkersToMap = function(jmap){
        for ( var i = 0, j = jmap.places.length; i < j; i++ ) {
            var location = new google.maps.LatLng(jmap.places[i].lat, jmap.places[i].lon);
            bounds.extend(location);
            var desc = jmap.markerdescs[i];

            this.placeMarker(location, desc);
            this.addDescription(location, desc);
        };
    };

    this.placeMarker = function(location, desc) {
        var marker = new google.maps.Marker({
            position: location,
            map: gmap,
            flat: true
        });

        google.maps.event.addListener(marker, 'click', function(){
			infowindow.setContent(desc);
    		infowindow.open(gmap, this);
        }); 
        mapmarkers.push(marker);
    };

    this.addDescription = function(location, desc) {
    	$('.showlist').append("<li>" + desc + "</li>")
        $('.showlist li').click(function(){
            var index = $('.showlist li').index(this);
            google.maps.event.trigger(mapmarkers[index], "click")
    	});
    };

    this.openInfoWindow = function(desc, location){

    }

    this.addFavouriteClick = function(elem){
        $(elem).click(function() { 
            this.favouritePost();
        });
    };

var polylineOptions = {
            path: mapwaypoints,
            strokeOpacity: 0.7,
            strokeWeight: 3,
            strokeColor: '#FF0000',
            icons: [{
            icon: this.returnLineSymbolOptions(),
            offset: '0',
            repeat: '150px'
         }]
     }


};