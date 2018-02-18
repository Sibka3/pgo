var express = require('express');
var path = require('path');
var passport = require('passport');
var bcrypt = require('bcrypt');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var flash    = require('connect-flash');
const url = require('url');  
var nodemailer = require('nodemailer');

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

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'privateglobaloffshore@gmail.com',
        pass: 'Vf5dVKTR7t7k6Ce5VBLTt89'
    }
});

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
    var message = req.query.message;
    if(!message)
      message=0;
    res.render('login', {message:message});
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
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.get('/personal',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      res.render('personal', {user:us});
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.get('/outcoming',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      res.render('outcoming', {user:us});
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.get('/incoming',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      res.render('incoming', {user:us});
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.get('/settings',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    //req.session.regenerate(function(err){});
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      db.tables.displayBtcWallets(req.session.passport.user,
       function (err, us1){
        var code=req.query.message;
        if(!code)
          code=0;
        res.render('settings', {user:us, message:code, wallet:us1});
      });
    });
  });

app.get('/forgot-password',
  function(req, res) {
    var message=req.query.key;
    res.render('forgot-password');
  });

app.post('/forgot-password',
  function(req, res) {
    db.tables.addRecoveryKey(req.body.email, function(err, user){
      if(user===0)
        res.render('forgot-password',{message:0}); //пустое пооле
      else if(user===1)
        res.render('forgot-password',{message:1}); //нет емейла в базе
      else{
        transporter.sendMail({
          from: 'privateglobaloffshore@gmail.com', // sender address
          to: req.body.email, // list of receivers
          subject: 'Please reset your password', // Subject line
          html: '<a href="http://localhost:3000/restorepass?key='+user+'">Сброс пароля</a>'// plain text body\
          }, function (err, info) {
          if(err)
            console.log(err)
        });
        res.redirect(url.format({
         pathname:"/login",
         query: {
            "message": 2
          }
        }));
      }
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.get('/register',
  function(req, res) {
    res.render('register', {message:0});
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.post('/register',
  function(req, res) {
    if(req.body.password!=req.body.password1){
      res.render('register', {message:1});
    }
    else{
      db.tables.addConfirmKey(req.body.username, req.body.password,
       function(err, user){
        if(user===0){
          res.render('register', {message:2});
        }
        else if(user===2){
          res.render('register', {message:3});
        }
        else{
          transporter.sendMail({
            from: 'privateglobaloffshore@gmail.com', // sender address
            to: req.body.username, // list of receivers
            subject: 'Please confirm your email address', // Subject line
            html: '<a href="http://localhost:3000/confirmemail?key='+user+'">Подтвердить регистрацию</a>'// plain text body\
            }, function (err, info) {
            if(err)
              console.log(err)
          });
          res.redirect(url.format({
             pathname:"/login",
             query: {
                "message": 1
              }
            }));
        }
      });
    }
  });


app.get('/index',
  function(req, res) {
    res.redirect('/');
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.post('/change_name',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      db.tables.displayBtcWallets(req.session.passport.user,
       function (err, us1){
        db.tables.changeName(req.body.first_name, req.body.last_name,
         req.session.passport.user, function(err, user){
          if(err){
            console.log(err);
            res.render('settings', {user:us, message:0});
          }
          else {
            res.redirect(url.format({
             pathname:"/settings",
             query: {
                "message": user
              }
            }));
          }
        });
      });
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.post('/change_email',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    db.tables.displayUser(req.session.passport.user,function (err, us) {
      db.tables.displayBtcWallets(req.session.passport.user,
       function (err, us1){
        db.tables.changeEmail(req.body.email, req.session.passport.user,
         function(err, user){
          if(err){
            console.log(err);
            res.render('settings', {user:us, message:0});
          }
          else {
            res.redirect(url.format({
             pathname:"/settings",
             query: {
                "message": user
              }
            }));
          }
        });
      });
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.post('/change_pswd',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    db.tables.displayUser(req.session.passport.user, function (err, us) {
      db.tables.displayBtcWallets(req.session.passport.user,
       function (err, us1){
        db.tables.changePassword(req.body.old_pswd, req.body.new_pswd,
         req.session.passport.user, function(err, user){
          if(err){
            console.log(err);
            res.render('settings', {user:us, message:0});
          }
          else {
            res.redirect(url.format({
             pathname:"/settings",
             query: {
                "message": user
              }
            }));
          }
        });
      });
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.post('/add_wallet',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    db.tables.displayUser(req.session.passport.user, function (err, us) {
      db.tables.displayBtcWallets(req.session.passport.user,
       function (err, us1){
        db.tables.addBtcWallet(req.body.wallet, req.session.passport.user,
         function(err, user){
          if(err){
            console.log(err);
            res.render('settings', {user:us, message:0});
          }
          else {
            res.redirect(url.format({
             pathname:"/settings",
             query: {
                "message": user
              }
            }));
          }
        });
      });
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.post('/delete_wallet',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    db.tables.displayUser(req.session.passport.user, function (err, us) {
      db.tables.displayBtcWallets(req.session.passport.user,
       function (err, us1){
        db.tables.deleteBtcWallet(us1[req.body.wallet], function(err, user){
          if(err){
            console.log(err);
            res.render('settings', {user:us, message:0});
          }
          else {
            res.redirect(url.format({
             pathname:"/settings",
             query: {
                "message": user
              }
            }));
          }
        });
      });
    });
  });
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.get('/confirmemail', function(req, res){
  //res.redirect('/');
  var key=req.query.key;
  if(!key){
    res.redirect('/');
  }
  else{
    db.tables.addUser(key, function(err, user){
      if(user===1)
        res.redirect('/');
      else
        res.redirect('/login');
    });
  }
  //res.render('settings', {user:us, message:code, wallet:us1});
});
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
app.get('/restorepass', function(req, res){
  //res.redirect('/');
  var key=req.query.key;
  if(!key){
    res.redirect('/');
  }
  else{
    db.tables.generateNewPass(key, function(err, user){
      if(user===1)
        res.redirect('/');
      else{
        transporter.sendMail({
          from: 'privateglobaloffshore@gmail.com', // sender address
          to: err, // list of receivers
          subject: 'Your new password', // Subject line
          html: '<p> '+user+'</p>'// plain text body\
          }, function (err, info) {
          if(err)
            console.log(err)
        });
        res.redirect(url.format({
           pathname:"/login",
           query: {
              "message": 2
            }
          }));
      }
    });
  }
  //res.render('settings', {user:us, message:code, wallet:us1});
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
