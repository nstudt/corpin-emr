const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const dbFuncs = require("@root/dbFuncs");
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
const umodel = require("@models/userModel");
const app = express();
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c0/\/", salt);
// Store hash in your password DB.
const udb_name = "userdb";
const udb = new PouchDB(udb_name);
const User = require('@models/userModel');

//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + "../"));
app.set("view engine", "hbs");
app.use(require("cookie-parser")());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");

("use strict");
//const users = [{ id: "admin", username: "system", password: "password" }];


module.exports.login = (req, res, next) => {
  console.log('Inside POST /login callback')
  passport.authenticate('local', {
    successRedirect: '/patients',
    failureRedirect: '/login'
  }
  )(req, res, next);
};

module.exports.isLoggedIn = (req, res, next) => {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
      return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});
passport.deserializeUser(function(id, cb) {
  return dbFuncs.get_one(udb, id)
  .then((user)=> {
    cb(null, user);
  }).catch((err) => {
    cb(err);
  });
});


passport.use('local', new LocalStrategy({
      usernameField: "username", 
      passwordField: "password",
      passReqToCallback: true 
    },
    (req, username, password, done) => {
      return dbFuncs.get_one(udb, username)
      .then((user) => {
        user = new umodel.User(user);
        if (bcrypt.compareSync(password, user.password)) {
        //if (username === user.user_name && password === user.password) {
          console.log('password checked by bcrypt');
          return done(null, user);
        }else{
          return done(null, false, {message: 'invalid credentials. \n'});
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  )
);