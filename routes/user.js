// imports data models for use in post functions below

var Map = require('../models/map.js');
var User = require('../models/user.js');
var bcrypt = require("bcrypt");

// passport introduction

exports.account = function(req, res){
    Map.find({author: req.user._id}, function(error, maps) {
      if (error) { console.log(error);
              }
        else  {
      var jmaps = JSON.stringify(maps);
      User.findOne({_id: req.user._id})
      .select('_id email favourites info')
      .populate('favourites')
      .exec(function(error, user) {
        if (!error) {         
          var clientUser = JSON.stringify(user);
          res.render('account', {layout: false, maps: jmaps, clientUser: clientUser, user: req.user});
        }
      })
    } 
  })
};

exports.getlogin =  function(req, res){
  res.render('login', {layout: false, user: req.user, message: req.flash('error') });
};

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
};

exports.createaccount = function(req, res) {

var newuser = req.body.username;
var newpw = req.body.password;
if (newuser.length < 2 || newpw.length < 7 ) {
  res.send("Username must be 2 or more characters and passwords must be 6 or more characters in length")
}
else {
User.findOne({username: newuser.toUpperCase()}, function(err, user) {
      if (user) {
            res.send('Username already taken - please choose another one')
                }
      else   {

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
        // Store hash in your password DB
                new User({_id: req.body.username,
                          username: req.body.username.toUpperCase(),
                          hash: hash,
                          favourites: []
                        }).save(function(err) {
                        res.send("Thank you - account created - you can now login");
                    })
              });
            });
        }
    })
  }
}

exports.updateaccountinfo = function(req, res) {
  User.findOne({_id: req.user._id}, function(err, user) {
    user.info = req.body.info
    user.email = req.body.email
    user.save(function(err) {
      if (!err) {
        res.redirect('/account');
      }
    })                   
  })
}

exports.getPublicUser = function (req, res){
  User.findOne({_id: req.params.id})
  .select('_id email favourites info')
  .populate('favourites')    
  .exec(function(err, user) {
       if (!err){
          var publicUser = JSON.stringify(user);
          var userId = user._id;
              Map.find({author: req.params.id})
                .select('_id title loc tags')
                .exec(function(err, maps) {
              var userMaps = JSON.stringify(maps);
              res.render('user', {user: req.user, publicUser: publicUser, userId: userId, userMaps: userMaps});
        })
      }
  })
}

exports.postPublicUser = function (req, res){

if (req.body.tag) {
  var tag = req.body.tag;
  Map.ensureIndexes;
  Map.find({author: req.body.user})
  .where('tags').equals(tag)
  .where('author').equals(req.body.user)
  .exec(function(error, maps) {

      if (error) { console.log(error);
              }
        else  {  
          var jmaps = JSON.stringify(maps);
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
          Map.find({author: req.body.user}, function(err, maps) {
          res.json(maps);
      })
  }
}
