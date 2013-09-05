
var geo = require('geocoder');
var Map = require('../models/map.js');

exports.getplace = function(req, res){
  var location = req.params.id;
    geo.geocode(location, function(err, data){
    res.locals.lat = data.results[0].geometry.location.lat;
    res.locals.lng = data.results[0].geometry.location.lng;
    res.render('search')
  })
};

exports.geocoderjson = function(req, res){

  var location = req.params.id;
    geo.geocode(location, function(err, data){
      var distance = req.params.distance;
      var lat = data.results[0].geometry.location.lat;
      var lng = data.results[0].geometry.location.lng;
      var center = [];
      center.push(lng);
      center.push(lat);
      Map.ensureIndexes;
      // distance provided in kilometres then divided by radius of earth in km to give radians
      Map.find({locTwo: {$within : {$centerSphere:[center, distance / 6378.137]}}}, function(err, maps) {
        if (maps.length === 0){
          res.send("Apologies, there are no routes within " + distance + " km radius of " + req.params.id + ". Please feel free to try an alternative location")
          }
          else { res.json(maps); }
          })
        })
      }


