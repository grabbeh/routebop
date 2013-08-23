
// imports data models for use in post functions below
var moment = require('moment');
var Map = require('../models/map.js');
var User = require('../models/user.js');

// tour

exports.tour = function(req, res) {
  res.render('tour', {layout: false, user: req.user});
};

// get route for home page

exports.home = function(req, res){
  Map.find({},{}, {limit: 5, sort:{favourited: -1}}, function(err, maps) {
    var jmaps = JSON.stringify(maps);
      Map.find({},{}, {limit: 5, sort:{date: -1}}, function(err, datemaps) {
        var jdatemaps = JSON.stringify(datemaps);
          
          res.render('home', {layout: false, user: req.user, maps: jmaps, datemaps: jdatemaps})
          
     })
  });
};

// get route for new map

exports.new = function(req, res){

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
}

if (isEmpty(req.query)){
  var lat = 51.50678771873268;
  var lng = -0.12717489055171427;
}

else {
  var lat = req.query.lat;
  var lng = req.query.lng;
}

	res.render('new',{layout: false, user: req.user, lat: lat, lng: lng})
};

// post map to database by taking req.body data and creating new schema

exports.submitmap = function(req, res) {
  console.log(req.body.images);
  var day = moment(new Date());
  var formattedDate = day.format("MMMM Do YYYY, h:mm:ss a");

  if (!req.user) {
    id = "guest"
  }
  else {
    id = req.user._id
  }

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
          if (err) {
              console.log('Error')
            }
          else {
              var data = {};
              data['message'] = "Route saved - thank you";
              data['id'] = map._id;
              res.json(data);
            }
          });
};


// provide map data to /map route to show markers on /GET request

exports.getmap = function(req, res) {

  var lat = 51.50678771873268;
  var lng = -0.12717489055171427;

  res.render('map', {layout: false, user: req.user, lat: lat, lng: lng});  
};

// provide map data to /map route to show markers on map following /POST request

exports.postmap = function(req, res) {
  
if (req.body.tag) {
  
  var tag = req.body.tag;
  var mapbounds = req.body.mapbounds;
  box = [[mapbounds[0], mapbounds[1]], [mapbounds[2], mapbounds[3]]];
  Map.ensureIndexes;
  Map.find({loc:{$within:{$box:box}}})
  .where('tags').equals(tag)
  .exec(function(err, maps) {
    
        if (err) { console.log(err);
              }
        else  {  
          
          switch (req.params.format) {

            case 'json':
            res.send(maps);
            break;

            default: 
            res.json(maps);  
            }  
        }       
    })
}

else {
  
  var mapbounds = req.body.mapbounds;
  box = [[mapbounds[0], mapbounds[1]], [mapbounds[2], mapbounds[3]]];
  Map.ensureIndexes;
  Map.find({loc:{$within:{$box:box}}}, function(err, maps) {

      if (err) { console.log(err);
              }
        else  {
                res.json(maps);
              }      
    })
  }
};

// Locates map on basis of ID in url before returning map, stringifying and sending to server

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
            if (err) {
              res.send("Map not found")
            }
            switch (req.params.format) {

            case 'json':
            res.send(map);
            break;

            default:
              res.render('show', {layout: false, obj: jmap, user: req.user, favourite: fav, mapid: mapid, edit: edit})
            } 
           
         })
    };

// adds map to user's favourites and increments favourite count for particular map.

exports.favourite = function(req, res) {
    Map.findOne({_id: req.body.favourite}, function(err, map){
           if (!req.user) {
                res.send("Please login to add this route to your account");
                }

              else {
              map.update({favourited: req.body.plusone}, {upsert: true}, function(err) {
                  if (err) {console.log("Error with incrementing favourite")}
                  else {
                    User.findOne({_id: req.user._id}, function(err, user) {
                          if (err) { console.log("Error finding user")}
                          else {
                          user.update({$addToSet: {favourites: req.body.favourite}}, {upsert: true}, function(err) {
                                  if (err) {console.log("Error adding to favourites")}      
                                  else { res.send("Thank you for favouriting this route")}
                                  })
                          }
                      })
                  }
            })
       }
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
               
// edit a route

exports.edit = function(req, res) {
     Map.findOne({_id: req.params.id}, function(error, map) {
          if (req.user._id === map.author) {

          var jmap = JSON.stringify(map);
          res.render('edit', {layout: false, obj: jmap, user: req.user});
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
          if (err) {
              console.log('Error')

            }
          else {
              var data = {};
              data['message'] = "Route saved - thank you";
              data['id'] = req.body.id;
              res.json(data);
              
            }
          })
        }
    })
}

exports.findfavouritesbyauthor = function (req, res) {
      var author = req.params.id;
      User.findOne({_id: author})
      .select('_id email username favourites info')
      .populate('favourites')
      .exec(function(err, user) {
         if (!err) {
          var clientUser = JSON.stringify(user);
          res.render('favourites', {layout: false, clientUser: clientUser, author: author, user: req.user});
        }
      })
}

exports.findmapsbyauthor = function(req, res) {
     user = req.query.id;
     Map.find({author: user}, function(err, maps) {

      if (err) { console.log(error);
              }
        else  {
                var jmaps = JSON.stringify(maps);
                res.render('submitted', {layout: false, maps: jmaps, author: user, user: req.user });
              }    
    })
};

exports.tagged = function(req, res) {
   
   Map.ensureIndexes;
   Map.find({ tags: req.params.id }, function(err, maps) {
   
   var tmaps = JSON.stringify(maps);
   res.render('tagged', {layout: false, user: req.user, maps: tmaps, tag: req.params.id });
   }) 
}

exports.test = function(req, res){
  res.render('test', {user: req.user})

}


