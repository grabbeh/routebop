
var express = require('express')
, bcrypt = require("bcrypt")
, MongoStore = require("connect-mongo")(express)
, passport = require('passport')
, flash = require('connect-flash')
, LocalStrategy = require('passport-local').Strategy
, map = require('./routes/maps')
, user = require('./routes/user')
, transloadit = require('./routes/transloadit')
, geocoder = require('./routes/geocoder')
, mongoose = require('mongoose')
, moment = require('moment')
, login = require('connect-ensure-login')
, app = express()
, User = require('./models/user.js')
, Map = require('./models/map.js')
, db = require('./config/db.js')


mongoose.connect('mongodb://' + db.details.user + ':' + db.details.pass + '@' + db.details.host + ':' + db.details.port + '/' + db.details.name );

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/login')
}

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id: id}, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      User.findOne({_id: username}, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
          bcrypt.compare(password, user.hash, function(err, res) {
            if (res){ return done(null, user)}
            else return done(null, false)
            });
        })
    });
  }
));

app.locals.user = false;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat'}));
  app.use(flash());				  
  app.use(passport.initialize());
  app.use(passport.session({ secret: 'keyboard cat', 
  store: new MongoStore({url: 'mongodb://' + db.details.user + ':' + db.details.pass + '@' + db.details.host + ':' + db.details.port + '/' + db.details.name
   })
  }));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);

});

// middleware
function removeUser(req, res, next) {
    app.locals.user = false;
    next();
}

// Routes
app.get('/test', map.test);

app.get('/transloadit', transloadit.transloadit);

app.post('/postupload', transloadit.postupload);

app.get('/', map.home);

app.get('/add', map.new);

app.post('/add', map.submitmap);

app.get('/search', map.getSearch);

app.post('/search', map.postBounds);

app.get('/show/:id.:format?', map.show);

app.post('/show', map.favourite);

app.get('/delete/:id', login.ensureLoggedIn('/login'), map.delete);

app.get('/edit/:id', login.ensureLoggedIn('/login'), map.edit);

app.get('/delfav/:id', login.ensureLoggedIn('/login'), map.delfav);

app.post('/edit', map.editupdate);

app.get('/tags/:id', map.tagged);

// Authentication

app.post('/signup', user.createaccount);

app.get('/account', login.ensureLoggedIn('/login'), user.account);

app.post('/account', login.ensureLoggedIn('/login'), user.updateaccountinfo);

app.get('/login', user.getlogin);

app.post('/login', 
  passport.authenticate('local'), 
    function(req, res){
      app.locals.user = req.user;
      res.redirect('/');
})

app.get('/logout', removeUser, user.logout);

app.get('/user/:id', user.getPublicUser);

app.post('/user', user.postPublicUser);

app.get('/places/:id', geocoder.getplace);

app.get('/api/:id/:distance?', geocoder.geocoderjson);

app.get('*', function(req, res){
  res.send('404, page not found', 404);
});

app.listen(3000);

