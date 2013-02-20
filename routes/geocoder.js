
var geo = require('geocoder');
var Map = require('../models/map.js');

exports.test = function(req, res){

  var location = req.params.id;
  
  geo.geocode(location, function(err, data){
  if (!err) {
  var lat = data.results[0].geometry.location.lat;
  var lng = data.results[0].geometry.location.lng;
  
  res.render('map', {layout: false, user: req.user, lat: lat, lng: lng})
    }
  })
};

exports.testjson = function(req, res){
  
   var location = req.params.id;

   // distance provided in kilometres then divided by radius of earth in km to give radians
  
        geo.geocode(location, function(err, data){
        
        if (!err) {
        var distance = req.params.distance;
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var center = [];
        center.push(lng);
        center.push(lat);
        Map.ensureIndexes;
        Map.find({locTwo: {$within : {$centerSphere:[center, distance / 6378.137]}}}, function(err, maps) {

                if (err) { console.log(err);
                             }
                      else  {
                        console.log("There are " + maps.length + " routes within a " + distance + " km radius of " +  req.params.id)

                        if (maps.length === 0){
                          res.send("Apologies, there are no routes within " + distance + " km radius of " + req.params.id + ". Please feel free to try an alternative location")
                        }
                        else {
                       res.json(maps);
                     }
                 
                    }
                })
              }
            })
          }


