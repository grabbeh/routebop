
var express = require('express')
, tls = require("tls")
, fs = require("fs")
, bcrypt = require("bcrypt")
, MongoStore = require("connect-mongo")(express)
, passport = require('passport')
, flash = require('connect-flash')
, util = require('util')
, LocalStrategy = require('passport-local').Strategy
, routes = require('./routes/maps')
, user = require('./routes/user')
, blog = require('./routes/blog')
, test = require('./routes/test')
, geocoder = require('./routes/geocoder')
, mongoose = require('mongoose')
, moment = require('moment')
, mongoosatic = require('mongoosastic')
, login = require('connect-ensure-login')
, app = express()
, User = require('./models/user.js')
, Map = require('./models/map.js')
, db = require('./config/db.js')


mongoose.connect('mongodb://' + db.details.user + ':' + db.details.pass + '@' + db.details.host + ':' + db.details.port + '/' + db.details.name );

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login', {layout:false})
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
        if (err) { return done(null, false, { message: 'Invalid password' }); }

            return done(null, user);
             
            });
      })
    });
  }
));

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(pjax());
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

// Routes

app.get('/transloadit', test.transloadit);

app.post('/postupload', test.postupload);

app.get('/blog', blog.showAll);

app.get('/blog/new', login.ensureLoggedIn('/login'), blog.newBlog);

app.post('/blog/new', blog.post);

app.get('/blog/admin', login.ensureLoggedIn('/login'), blog.admin);

app.get('/blog/edit/:id?', blog.edit);

app.post('/blog/edit/:id?', blog.postEdit);

app.get('/blog/:id?', blog.showOne);

app.get('/blog/delete/:id?', blog.delete);

app.get('/tour', routes.tour);

app.get('/', routes.home);

app.get('/new', routes.new);

app.post('/new', routes.submitmap);

app.get('/map', routes.getmap);

app.post('/map.:format?', routes.postmap);

app.get('/show/:id.:format?', routes.show);

app.post('/show', routes.favourite);

app.get('/delete/:id', login.ensureLoggedIn('/login'), routes.delete);

app.get('/edit/:id', login.ensureLoggedIn('/login'), routes.edit);

app.get('/delfav/:id', login.ensureLoggedIn('/login'), routes.delfav);

app.post('/edit', routes.editupdate);

app.get('/tags/:id', routes.tagged);

// Authentication

app.post('/signup', user.createaccount);

app.get('/account', login.ensureLoggedIn('/login'), user.account);

app.post('/account', login.ensureLoggedIn('/login'), user.updateaccountinfo);

app.get('/login', user.getlogin);

app.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login'
    })
  );
app.get('/logout', user.logout);

app.get('/user/:id', user.getPublicUser);

app.post('/user', user.postPublicUser);

app.get('/user/:id/favourites', routes.findfavouritesbyauthor);

app.get('/places/:id', geocoder.test);

app.post('/places', routes.postmap);

app.get('/places/:id/:distance', geocoder.testjson);

app.get('*', function(req, res){
  res.send('404, page not found', 404);
});

app.listen(3000);
/*
var options = {
  key: fs.readFileSync('server-key.pem'),
  cert: [fs.readFileSync('intermediatecert.pem'), fs.readFileSync('finalcert.pem')]
};

tls.createServer(options, function (s) {
  s.write("welcome!\n");
  s.pipe(s);
})
*/
