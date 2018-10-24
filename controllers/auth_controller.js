const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const dbFuncs = require('@root/dbFuncs');
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
var n = "userdb";
var udb = new PouchDB(n);
const umodel = require('@models/userModel');
const app = express();
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + '../'));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");

("use strict");

var hash = require('pbkdf2-password')()
// var session = require('express-session');



// app.use(express.urlencoded({ extended: false }))
// app.use(session({
//   resave: false, // don't save session if unmodified
//   saveUninitialized: false, // don't create session until something stored
//   secret: 'shhhh, very secret'
// }));

// Session-persisted message middleware

// app.use(function(req, res, next){
//     var err = req.session.error;
//     var msg = req.session.success;
//     delete req.session.error;
//     delete req.session.success;
//     res.locals.message = '';
//     if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
//     if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
//     next();
//   });

module.exports.login = (req, res) => {
    console.log(req.body.user_name);
    console.log(req.body.password);
    res.redirect('/patients');
};
