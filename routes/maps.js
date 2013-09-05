
// imports data models for use in post functions below
var moment = require('moment');
var Map = require('../models/map.js');
var User = require('../models/user.js');

// get route for home page

exports.home = function(req, res){
  Map.find()
    .sort('-favourited')
    .limit(5)
    .select('_id title')
    .exec(function(err, fmaps) {
       var fmaps = fmaps;
       Map.find()
          .sort('-date')
          .limit(5)
          .select('_id title')
          .exec(function(err, dmaps) {
            var dmaps = dmaps;
            res.render('home', { fmaps: fmaps, dmaps: dmaps})
     })
  });
};

// get route for new map - providing default values if no queries are available

exports.new = function(req, res){
  if (req.query.lat === undefined) {
    res.locals.coords = {lat: 51.50678771873268, lng: -0.12717489055171427}
  }
else { 
    res.locals.coords = {lat: req.query.lat, lng: req.query.lng};
  }
  res.render('new')
};

// saves map following post data from /new

exports.submitmap = function(req, res) {
  var day = moment(new Date());
  var formattedDate = day.format("MMMM Do YYYY, h:mm:ss a");
  if (!req.user) { id = "guest" }
  else { id = req.user._id }
  new Map({
          author: id,
          images: req.body.images,
          formatteddate: formattedDate,
	        favourited: 0,
          loc: req.body.loc,
		      locTwo: req.body.locTwo,
          waypoints: req.body.waypoints, 
          places: req.body.places, 
          title: req.body.title,
          description: req.body.description,
          markerdescs: req.body.markerdescs,
          distance: req.body.distance,
          tags: req.body.tags,
          }).save(function(err, map) {
              var data = {};
              data['message'] = "Route saved - thank you";
              data['id'] = map._id;
              res.json(data);
          });
};

// renders basic map which when created posts bounds to obtain actual map data

exports.getSearch = function(req, res) {
  res.render('search');  
};

// provide map data to /map route to show markers on map following /POST request
// filtered by tags if tag is sent up with post request

exports.postBounds = function(req, res) {
  
if (req.body.tag) {
  
  var tag = req.body.tag;
  var mapbounds = req.body.mapbounds;
  box = [[mapbounds[0], mapbounds[1]], [mapbounds[2], mapbounds[3]]];
  Map.ensureIndexes;
  Map.find({loc:{$within:{$box:box}}})
    .where('tags').equals(tag)
    .select('_id title loc tags')
    .exec(function(err, maps) {
      res.json(maps);  
  })
}

else {
  
  var mapbounds = req.body.mapbounds;
  box = [[mapbounds[0], mapbounds[1]], [mapbounds[2], mapbounds[3]]];
  Map.ensureIndexes;
  Map.find({loc:{$within:{$box:box}}})
  .select('_id title loc tags')
  .exec(function(err, maps) {
       res.json(maps);     
    })
  }
};

// Locates individual map on basis of ID in url before returning map, stringifying and sending to server

exports.show = function(req, res) {
    var mapid = req.params.id;
    var fav = false;
    var edit = false;
    var usermap = false;
    Map.findOne({_id: req.params.id}, function(err, map) {
        var mapid = map._id;
        var jmap = JSON.stringify(map);
            if (req.user) {
                  for (var i = 0; i < req.user.favourites.length; i++) {
                        if (req.user.favourites[i].id == mapid) {
                            fav = true;
                            break;            
                      }
                   }
                if (req.user._id === map.author){
                      edit = true;
                }
              }
            if (!err)
            switch (req.params.format) {

            case 'json':
            res.send(map);
            break;

            default:
              console.log(map.images);
              res.render('show', {map : map, jmap: jmap, fav: fav, edit: edit})
            } 
           
         })
    };

// adds map to user's favourites and increments favourite count for particular map.

exports.favourite = function(req, res) {
    Map.findOne({_id: req.body.favourite}, function(err, map){
        if (!req.user) {res.send("Please login to add this route to your account");}
            map.update({favourited: req.body.plusone}, {upsert: true}, function(err) {
              User.findOne({_id: req.user._id}, function(err, user) {
                  user.update({$addToSet: {favourites: req.body.favourite}}, {upsert: true}, function(err) {
                       res.send("Thank you for favouriting this route")
                      })
                  })    
               })
            })
         }

// delete a route

exports.delete = function(req, res) {
     Map.findOne({_id: req.params.id}, function(err, map) {
        if (req.user._id === map.author) {
          map.remove();
          res.redirect('/account');
          }
        else {res.send("Please login to delete this route")}  
    })
  };

// delete a favourite

exports.delfav = function(req, res) {
    var uid = req.params.id;
    if (req.user) {
    User.update({_id: req.user.id}, {$pull: {favourites: uid}}, function(err, user) {
         if (!err) {
              res.redirect('/account');
          }      
    })   
  }
}
               
// provide route for GET request for /edit 

exports.edit = function(req, res) {
     Map.findOne({_id: req.params.id}, function(error, map) {
          if (req.user._id === map.author) {
              var map = JSON.stringify(map);
              res.render('edit', {map: map});
            }
          else {
            res.redirect('/account');
          }
    })
};

// post an updated route

exports.editupdate = function(req, res) {
 
   Map.findById(req.body.id, function(err, map) {
      if (!err)
         {
          map.loc = req.body.loc;
          map.images = req.body.images;
		      map.twoLoc = req.body.locTwo;
          map.waypoints = req.body.waypoints; 
          map.places = req.body.places;
          map.title = req.body.title;
          map.description = req.body.description;
          map.markerdescs = req.body.markerdescs;
          map.distance = req.body.distance;
          map.tags = req.body.tags;
          map.save(function(err) {
              var data = {};
              data['message'] = "Route saved - thank you";
              data['id'] = req.body.id;
              res.json(data);
          })
        }
    })
}

exports.tagged = function(req, res) {
   
   Map.ensureIndexes;
   Map.find({ tags: req.params.id }, function(err, maps) {
   
   var maps = JSON.stringify(maps);
   res.render('tagged', {maps: maps, tag: req.params.id });
   }) 
}

exports.test = function(req, res){
  res.render('test')

}


