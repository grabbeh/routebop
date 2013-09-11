function Map(){

    var mapwaypoints = [];
    var mapmarkers = [];
    var markerdescriptions = [];
    var update_timeout = null;
    
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

   this.returnMapWaypoints = function(maywaypoints){
        return mapwaypoints;
   }

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
        return polylineNewOptions;
     }

     this.returnMapMarker = function(i){
        return mapmarkers[i];
     }

	this.setPolyline = function(options){
		polyline = new google.maps.Polyline(options);
		polyline.setMap(gmap);
	}

	this.addWaypointsToMap = function(waypoints){
        for ( var i = 0, j = waypoints.length; i < j; i++) {
            var waypoint = new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon);
            mapwaypoints.push(waypoint);
            bounds.extend(waypoint);
        };
        gmap.fitBounds(bounds);
        this.setPolyline(this.returnPolyLineOptions());
  }

  this.addEditableWaypointsToMap = function(waypoints){
      for ( var i = 0, j = waypoints.length; i < j; i++) {
            var waypoint = new google.maps.LatLng(waypoints[i].lat, waypoints[i].lon);
            mapwaypoints = polyline.getPath();
            mapwaypoints.push(waypoint);
            bounds.extend(waypoint);
        };
      gmap.fitBounds(bounds);
  }

    this.addMarkersToMap = function(places, descriptions, draggable){
        for ( var i = 0, j = places.length; i < j; i++ ) {
            var location = new google.maps.LatLng(places[i].lat, places[i].lon);
            bounds.extend(location);
            var desc = descriptions[i];
            this.placeMarker(location, desc, draggable);
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
        this.listenerToOpenInfoWindowOnMarkerClick(marker, desc);
        mapmarkers.push(marker);
    };

    this.placeSearchMarker = function(location, desc){
        var marker = new google.maps.Marker({
            position: location,
            map: gmap,
            flat: true
        });

        this.addSearchDescriptions(location, desc);
        this.listenerToCloseAndOpenInfoWindowOnMarkerClick(marker, desc);
        this.listenersToVarySearchListeners();
        mapmarkers.push(marker);
    }

    this.addSearchDescriptions = function(location, desc){
        var that = this;
        $("<li>").html(desc + "</li>").click(function(){
            google.maps.event.clearListeners(gmap, 'idle');
            infowindow.setContent(desc);
            var index = $('.showlist li').index(this);
            infowindow.open(gmap, that.returnMapMarker(index));     
    
          }).appendTo(".showlist");
      }

    this.listenerToOpenInfoWindowOnMarkerClick = function(marker, desc){
        google.maps.event.addListener(marker, 'click', function(){
            infowindow.setContent(desc);
            infowindow.open(gmap, this);
        }); 
    }

    this.listenerToCloseAndOpenInfoWindowOnMarkerClick = function(marker, desc){

        if (infowindow.open) {
                infowindow.close();
            }
        google.maps.event.addListener(marker, 'click', function() {
            google.maps.event.clearListeners(gmap, 'idle');
            infowindow.setContent(desc);
            infowindow.open(gmap, this);   
        });
    }

    this.listenersToVarySearchListeners = function(){
        var that = this;
        google.maps.event.addListener(infowindow, 'closeclick', function(){
            if ($('#maptags').children().length === 1) {
                that.addTagListeners();
            }
            else {
                that.addMapListeners();
            }
        })
    }

    this.addDescription = function(location, desc) {
      var that = this;
    	$('.showlist').append("<li>" + desc + "</li>")
        $('.showlist li').click(function(){
            var index = $('.showlist li').index(this);
            google.maps.event.trigger(that.returnMapMarker(index), "click")
    	});
    };

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
                that.clearMarkers();
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

    this.clearMarkers = function(){

        if (mapmarkers) {
            for (i in mapmarkers) {
                mapmarkers[i].setMap(null);
        }
        mapmarkers.length = 0;
        }
    }

    this.clearMarkerClusters = function(){
      if (mc){
        mc.clearMarkers();
      }
    }

    this.clearMarkersAndClusters = function(){
       this.clearMarkers();
       this.clearMarkerClusters();
    }

    this.collectMapAndSendToServer = function(elem, url){
        var that = this;
        $(elem).click(function () {
            var tags = $('#tags').val().split(" ");
            var newtitle = $('#title').val();
            if (newtitle.length < 1) {
                alert('Please insert a title');
            return;
         }
   
        if (mapwaypoints.length < 1){
            alert('Please insert at least one waypoint')
            return;
        }   
      
         that.collectMarkerDescriptions();
         var convertedWaypoints = that.convertWaypoints(mapwaypoints.b);
         var convertedMarkers = that.convertMarkers(mapmarkers);

         var loc = that.createLoc(mapwaypoints.b[0].lat(), mapwaypoints.b[0].lng());
         var locTwo = that.createLoc(mapwaypoints.b[0].lng(), mapwaypoints.b[0].lat());
    

          if (jmap) { id = jmap._id }
            else {id = 0;}
         var postMap = {
           id: id,
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
   
        that.sendToServer(postMap, url, function (data) {
            $('#output').html(data.message); 
                  setTimeout(function() {
                   window.location.href = "/show/" + data.id;
                   }, 1000);
               })
            });
        }

    this.clearElementsOnSearch = function(){
        $('.showlist').children().remove().end();
        $('#maptags').children().remove().end();
        $('#maptaglist').addClass('hide-element');
    }

    this.processMapBounds = function(postbounds){
            boxarray = []; 
            var sw = postbounds.getSouthWest();
            var ne = postbounds.getNorthEast();
            boxarray.push(sw.lat());
            boxarray.push(sw.lng());
            boxarray.push(ne.lat());
            boxarray.push(ne.lng());
            return boxarray;
        }

    this.addInitialSearchListener = function(){
        var that = this;
        google.maps.event.addListener(gmap, "idle", function(){
            that.clearMarkersAndClusters();
            that.clearElementsOnSearch();
            var postbounds = gmap.getBounds();
            that.processMapBounds(postbounds);
            that.postBoundsToServer(boxarray);
       });


    };

    this.postBoundsToServer = function(postbounds) {
        var that = this;
        var obj = {mapbounds: boxarray};
        this.sendToServer(obj, '/search', function(data) {
                that.clearMarkersAndClusters();
                that.clearElementsOnSearch();
                that.processMapData(data);
                mc = new MarkerClusterer(gmap, mapmarkers);
            });
        };
    
    this.postBoundsAndTagToServer = function(postbounds, tag) {
        var that = this;
        var obj = {mapbounds: boxarray, tag: tag};
 
        map.sendToServer(obj, '/search', function(data) {
                that.clearMarkersAndClusters();
                that.clearElementsOnSearch();
                that.processTagData(data);
                mc = new MarkerClusterer(gmap, mapmarkers);
                $('#maptags').append("<li> " + tag + " </li>")
            })
        };

    this.addMapListeners = function(){
        var that = this;
        google.maps.event.addListener(gmap, "idle", function(){
        var postbounds = gmap.getBounds();
        that.processMapBounds(postbounds);
        that.postBoundsToServer(boxarray);
       })
    };
    
    this.addTagListeners = function(){
        var that = this;
        google.maps.event.addListener(gmap, "idle", function(){
        var newtag = $('#maptags').children().text().trim();     
        var postbounds = gmap.getBounds();
        that.processMapBounds(postbounds);
        that.postBoundsAndTagToServer(boxarray, newtag);
       });
    };

    this.processMapData = function(maps){
        var that = this;
        var tagarrays = [];
        if (maps.length > 0) {
            for (var i = 0, j = maps.length; i < j; i++) {
                var marker = new google.maps.LatLng(maps[i].loc[0], maps[i].loc[1]);
                bounds.extend(marker);
                var url = maps[i]._id;
                var fullurl = "<span class=\"markerlink\"><a href='/show/" + url + "'>View route</a></span>";
                var title = "<span class=\"marker\">" + maps[i].title + " - " + fullurl + "</span";
                that.placeSearchMarker(marker, title); 

                tagarrays.push(maps[i].tags);
        };

        $('#maptaglist').removeClass('hide-element');
        var flatarray = _.flatten(tagarrays);
        var reducedarray = _.uniq(flatarray);
        
    
        for (var i = 0, j = reducedarray.length; i < j; i++) {
            var maptag = reducedarray[i].trim();
            $('#maptags').append("<li> " + maptag + " </li>");
        }
    }
    else {
        var lat = gmap.getCenter().lat();
        var lng = gmap.getCenter().lng();
        var getparams = $.param({lat:lat, lng:lng});
        var locationurl = "Sorry - no routes for this place - maybe you'd like to add one <a href='/new?" + getparams + "'>here</a>";
        $("<li>").html(locationurl).appendTo("#showroutelist");
        }
    }


    this.processTagData = function(maps){
        var that = this;
        if (maps.length > 0) {
            for (var i = 0, j = maps.length; i < j; i++) {
                var marker = new google.maps.LatLng(maps[i].loc[0], maps[i].loc[1]);
                bounds.extend(marker);
                var url = maps[i]._id;
                var fullurl = "<span class=\"markerlink\"><a href='/show/" + url + "'>View route</a></span>";
                var title = "<span class=\"marker\">" + maps[i].title + " - " + fullurl + "</span";
                that.placeSearchMarker(marker, title); 
            };
        }
        else {
            var lat = gmap.getCenter().lat();
            var lng = gmap.getCenter().lng();
            var getparams = $.param({lat:lat, lng:lng});
            var locationurl = "Sorry, no routes - you might like to add one <a href='/new?" + getparams + "'>here</a>";
            $("<li>").html(locationurl).appendTo("#showroutelist");
        }
    }

    this.filterByTag = function(elem){
        var that = this;
            $(elem).delegate('li', 'click', function(){
            var submittag = $(this).text().trim();        
            var postbounds = gmap.getBounds();
            that.processMapBounds(postbounds);
            that.postBoundsAndTagToServer(boxarray, submittag);
            google.maps.event.clearListeners(map, 'idle');
            that.addTagListeners();
            $('#showalltagsbutton').removeClass('hide-element');
    
        })
    }

    this.removeFilterByTag = function(elem){
        var that = this;
    
        $(elem).click(function(){
            var postbounds = gmap.getBounds();
            that.processMapBounds(postbounds);
            that.postBoundsToServer(boxarray);
            google.maps.event.clearListeners(map, 'idle');
            that.addMapListeners();
            $('#showalltagsbutton').addClass('hide-element');
        })
    }

    this.addTagsToEdit = function(tags){

    // add title and description to page
    if (tags[0] === ""){
     $('#tags').append("");
    }
    else {
        var tagsString = tags.join(" ");
        $('#tags').val(tagsString);
    }

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
