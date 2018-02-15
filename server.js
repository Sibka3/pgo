var express = require('express');
var path = require('path');
var passport = require('passport');
var bcrypt = require('bcrypt');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var flash    = require('connect-flash');

passport.use(new Strategy(
    function(username, password, cb) {
            db.tables.findByUsername(username, function(err, user) {
              if (err) { return cb(err); }
              if (!user) { return cb(null, false); }
              if (!bcrypt.compareSync(password, user.password) )
                return cb(null, false); 
              return cb(null, user);
            });
        }
  ));
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.tables.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat',
  cookie: {
    maxAge: 180*60*1000
  },
  resave: true,
  saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/personal');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/',
  function(req, res){
    res.render('index');
  });

app.get('/personal',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      res.render('personal', {user:us});
    });
  });

app.get('/outcoming',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      res.render('outcoming', {user:us});
    });
  });

app.get('/incoming',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      res.render('incoming', {user:us});
    });
  });

app.get('/settings',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      var code=req.body.code;
      if(!req.body.code)
        code=0;
      res.render('settings', {user:us, message:code});
    });
  });

app.get('/forgot-password',
  function(req, res) {
    res.render('forgot-password');
  });

app.post('/forgot-password',
  function(req, res) {
    res.redirect('/login');
  });

app.get('/register',
  function(req, res) {
    res.render('register', {message:0});
  });

app.post('/register',
  function(req, res) {
    if(req.body.password!=req.body.password1){
      res.render('register', {message:1});
    }
    else{
      db.tables.addUser(req.body.email, req.body.password, function(err, user){
        if(err==='1'){
          res.render('register', {message:2});
        }
        else if(err==='2'){
          res.render('register', {message:3});
        }
        else{
          res.redirect('/login');
        }
      });
    }
  });

app.get('/index',
  function(req, res) {
    res.redirect('/');
  });

app.post('/change_name',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      db.tables.changeName(req.body.first_name, req.body.last_name, req.session.passport.user, function(err, user){
        if(err){
          console.log(err);
          res.render('settings', {user:us, message:0});
        }
        else {
          res.render('settings', {user:us, message:user});
        }
      });
    });
  });

app.post('/change_email',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      db.tables.changeEmail(req.body.email, req.session.passport.user, function(err, user){
        if(err){
          console.log(err);
          res.render('settings', {user:us, message:0});
        }
        else {
          res.render('settings', {user:us, message:user});
        }
      });
    });
  });

app.post('/change_pswd',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    req.session.regenerate(function(err){});
    res.render('settings', {message:0});
  });

app.post('/add_wallet',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    req.session.regenerate(function(err){});
    res.render('settings', {message:0});
  });

app.post('/delete_wallet',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    req.session.regenerate(function(err){});
    res.render('settings', {message:0});
  });

app.get('/*',
  function(req, res) {
    res.redirect('/');
  });
app.post('/*',
  function(req, res) {
    res.redirect('/');
  });

app.listen(3000);
