function Map(){

	var gmap;
    var bounds;
    var mapwaypoints = [];
    var mapmarkers = [];
    var markerdescriptions = [];
    var poly;
    
    this.setCenter = function(center){
        gmap.setCenter(center);
    }


	this.createMap = function(elem, center, options, jmap){
	    gmap = new google.maps.Map(document.getElementById(elem), options);
	    bounds = new google.maps.LatLngBounds();
        infowindow = new google.maps.InfoWindow();
    };

	this.sendToServer = function(postdata, posturl, completefunction){
        $.ajax({
            url: posturl,
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(postdata),
            success: completefunction
        });
    };

     this.favouritePost = function() {
        var postdata = {
            favourite: jmap._id,
            plusone: jmap.favourited + 1
        };

        this.sendToServer(postdata, "/show", function(data){
            $('#result').html(data.message);
        });
    };

    this.returnShowMapOptions = function(center){
        showMapOptions.center = center;
		return showMapOptions;
	};

    this.returnNewMapOptions = function(center){
        newMapOptions.center = center;
        return newMapOptions;
    }

	this.returnLineSymbolOptions = function(){
    	return lineSymbol;
    }

     this.returnPolyLineOptions = function(){
     	return polylineOptions;
     }

     this.returnPolyLineNewOptions = function(){
        return polylineNewOptions
     }

     this.returnMapMarker = function(i){
        return mapmarkers[i]
     }

	this.setPolyline = function(options){
		polyline = new google.maps.Polyline(options);
		polyline.setMap(gmap);
	}

	this.addWaypointsToMap = function(jmap){
        for ( var i = 0, j = jmap.waypoints.length; i < j; i++) {
            var waypoint = new google.maps.LatLng(jmap.waypoints[i].lat, jmap.waypoints[i].lon);
            mapwaypoints.push(waypoint);
            bounds.extend(waypoint);
        };
        gmap.fitBounds(bounds);
  		this.setPolyline(this.returnPolyLineOptions());
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

    this.placeMarker = function(location, desc, draggable) {
        var marker = new google.maps.Marker({
            position: location,
            map: gmap,
            flat: true,
            draggable: draggable
        });

        google.maps.event.addListener(marker, 'click', function(){
			infowindow.setContent(desc);
    		infowindow.open(gmap, this);
        }); 
        mapmarkers.push(marker);
    };

    this.addDescription = function(location, desc) {
        var that = this;
    	$('.showlist').append("<li>" + desc + "</li>")
        $('.showlist li').click(function(){
            var index = $('.showlist li').index(this);
            google.maps.event.trigger(that.returnMapMarker(index), "click")
    	});
    };

    this.openInfoWindow = function(desc, location){

    }

    this.addFavouriteClick = function(elem){
        var that = this;
        $(elem).click(function() { 
            that.favouritePost();
        });
    };

    this.addDescToPlaceObj = function(descriptions, mapmarkers){
      descriptions.forEach(function(desc){
          mapmarkers.forEach(function(place){
              place['desc'] = desc;
          })
      })
      return mapmarkers;
   }

    this.collectMarkerDescriptions = function() {
        $('.markerdescription').each(function(i){
           var description = $(this).val();
           markerdescriptions.push(description);
       })
   };
      
   this.convertWaypoints = function(mapwaypoints) {
       if (!mapwaypoints){
         alert('Please provide some waypoints');
       }
       convertedWaypoints = [];
       for(var i = 0; i < mapwaypoints.length; i++) {
            var o = {};
            o['lat'] = mapwaypoints[i].lat();
            o['lon'] = mapwaypoints[i].lng();
            convertedWaypoints.push(o);
       }
       return convertedWaypoints; 
   };    
   
   this.convertMarkers = function(mapmarkers) {
   
     var convertedMarkers = [];
     for (var i = 0; i < mapmarkers.length; i++) {
          var o = {};
          var latlng = mapmarkers[i].getPosition();
          o['lat'] = latlng.lat();
          o['lon'] = latlng.lng();
          convertedMarkers.push(o);
     };
      return convertedMarkers;
   }

    this.createLoc = function(lat, lon){
      var loc = [];
      loc[0] = lat;
      loc[1] = lon;
      return loc;
    }


    this.addWaypointOnClick = function(){
      google.maps.event.addListener(gmap, 'click', function(event) {
            update_timeout = setTimeout(function(){
            mapwaypoints = polyline.getPath(); 
            mapwaypoints.push(event.latLng);
            var distance = polyline.inKm().toFixed(2);
            $('#lengthparent').text("Distance").append("<p>"+ distance + " km" + "</p>");
            }, 400);
        });
    }
    
    this.addMarkerOnDblClick = function(){
        var that = this;
        google.maps.event.addListener(gmap,'dblclick', function(event) {
           clearTimeout(update_timeout);
           that.placeMarker(event.latLng, null, true);
           $('#newcontentparent').append('<p><input class="markerdescription" type="text"></p>')
        });
    }   
   
    this.addMarkerOnPolyLineClick = function(){
       var that = this;
       google.maps.event.addListener(polyline, 'click', function(event) {
           that.placeMarker(event.latLng, null, true);
           $('#newcontentparent').append('<p><input class="markerdescription" type="text"></p>')
       });
    }

    this.addGmapListeners = function(){
        this.addWaypointOnClick();
        this.addMarkerOnDblClick();
        this.addMarkerOnPolyLineClick();
    }

    this.addMarkerAndPolylineEdit = function(){
        var that = this;
        $("#removeall").click(function() {
            $('#newcontentparent').children().remove().end();
                that.clearOverlays();
                mapwaypoints.clear(); 
                mapmarkers.splice(0, mapmarkers.length);
           });
   
        $("#removelastmarker").click(function(){
            var lastmarker = _.last(mapmarkers);
            lastmarker.setMap(null);

            mapmarkers.pop();
            $('#newcontentparent').children().last().remove().end();
        });
   
        $('#removelastline').click(function(){
            mapwaypoints.pop(); 
        });
    }

    this.clearOverlays = function(){
        if (mapmarkers) {
            for (i in mapmarkers) {
                mapmarkers[i].setMap(null);
        }
        mapmarkers.length = 0;
        }
    }
    this.collectMapAndSendToServer = function(elem){
        var that = this;
        $(elem).click(function () {
            var tags = $('#tags').val().split(" ");
            var newtitle = $('#title').val();
            if (newtitle.length < 1) {
                alert('Please insert a title');
            return;
         }
   
        if (mapwaypoints.b.length < 1){
                alert('Please insert at least one waypoint')
                return;
        }   
      
         that.collectMarkerDescriptions();
         var convertedWaypoints = that.convertWaypoints(mapwaypoints.b);
         var convertedMarkers = that.convertMarkers(mapmarkers);

         var loc = that.createLoc(mapwaypoints.b[0].lat(), mapwaypoints.b[0].lng());
         var locTwo = that.createLoc(mapwaypoints.b[0].lng(), mapwaypoints.b[0].lat());
    
         var postMap = {
           images: imageCtrl.returnImages(),
           loc: loc,
           locTwo: locTwo,
           waypoints: convertedWaypoints,
           places: convertedMarkers,
           title: $('#title').val(),
           description: $('#description').val(),
           tags: tags,
           markerdescs: markerdescriptions,
           distance: polyline.inKm().toFixed(2)
           };
   
        that.sendToServer(postMap, '/new', function (data) {
            $('#output').html(data.message); 
                  setTimeout(function() {
                   window.location.href = "/show/" + data.id;
                   }, 1000);
               })
       });
}


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

     var polylineNewOptions = {

          icons: [{
           icon: lineSymbol,
           offset: '0',
           repeat: '100px'
         }],
         strokeOpacity: 0.5,
         strokeWeight: 3,
         strokeColor: "#FF0000",
         editable: true
     }

    var lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    };

    var showMapOptions = {
        zoom: 13,
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

    var newMapOptions = {
           
           zoom: 13,
           mapTypeId: google.maps.MapTypeId.ROADMAP,
           mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE]
                   },
           disableDoubleClickZoom: true,
           panControl: false,
           zoomControl: false,
           scaleControl: false,
           zoomControl: true,
           draggableCursor: "default",
           zoomControlOptions: {
             style: google.maps.ZoomControlStyle.SMALL
           },
           streetViewControl: false
           };


};