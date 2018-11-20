const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const dbFuncs = require("@root/dbFuncs");
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
const umodel = require("@models/userModel");
const app = express();
const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + "../"));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");

("use strict");



module.exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("Inside passport.authenticate() callback");
    console.log(
      `req.session.passport: ${JSON.stringify(req.session.passport)}`
    );
    console.log(`req.user: ${JSON.stringify(req.user)}`);
    req.login(user, err => {
      console.log("Inside req.login() callback");
      console.log(
        `req.session.passport: ${JSON.stringify(req.session.passport)}`
      );
      console.log(`req.user: ${JSON.stringify(req.user)}`);
      return res.send("You were authenticated & logged in!\n");
    });
  })(req, res, next);
};
