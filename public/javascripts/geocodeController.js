
function geocodeController(){

    var that = this;

    this.geocodeByUserLocation = function(elem){
        $(elem).click(function() {
            window.navigator.geolocation.getCurrentPosition(function(pos){
                 map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            }, that.geolocateError, {timeout:5000});
        });
    }

    this.geocodeByAddressOnEnter = function(elem){
        $(elem).keypress(function (e) {
            if (e.which == 13) {
                that.geocodeAddress();   
            }
        });
    }

   this.geocodeByAddressOnSubmit = function(elem){
        $(elem).click(function(){
           that.geocodeAddress();
        });
    }

    this.init = function(elemOne, elemTwo, elemThree){
        this.geocodeByUserLocation(elemOne)
        this.geocodeByAddressOnEnter(elemTwo)
        this.geocodeByAddressOnSubmit(elemThree)
    }

    this.geolocateerror = function(error){
           alert(error.code)
       }   
   
    this.geocodeAddress = function(){

        var address = $("#userlocation").val();
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address}, function(results, status){
           if (status == google.maps.GeocoderStatus.OK) {
               map.setCenter(results[0].geometry.location);
           }
           else {
               alert("Sorry, we didn't recognise this location");
           }
        });
    };
}
