const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const dbFuncs = require("@root/dbFuncs");
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
const umodel = require("@models/userModel");
var udb_name = "userdb";
var udb = new PouchDB(udb_name);
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + "../"));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");

("use strict");

module.exports.create_user = (req, res) => {
  // console.log(`create user req.body ${req.body}`);
  var muser = new umodel.User(req.body);
  dbFuncs.create(udb, muser);
//   udb.put(muser)
//   .then((result) => {
//     return udb.get(result.id, {include_docs: true}
//       ).then((doc) => {
//     console.log(doc)
//     res.redirect("/users");
// })
//     }).catch(err => {
//       console.log("error in create_user", err);
//     });
};

module.exports.update_user = (req, res) => {
  return new Promise((resolve, reject) => {
    dbFuncs.update(udb, req.body);
    resolve(console.log("user update complete"));
    res.redirect("/users");
  });
};

module.exports.render_users = (req, res) => {
  udb.query("index2/users_only", { include_docs: true })
    .then(function(response) {
      res.render("users", {
        obj: response.rows
      });
    })
    .catch(err => {
      if (err.status == 404) {
        res.render("users");
      }
      console.log("error in render_users", err);
    });
};

module.exports.read_user = (req, res) => {
  udb
    .get(req.params.id, { attachments: true })
    .then(doc => {
      var user = new pmodel.Patient(user);
      res.render("users", {
        user: user
      });
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports.remove_user = (req, res) => {
    var _id = req.params.id;
    udb.get(_id).then((doc) => {
      return udb.remove(doc._id, doc._rev)
    }).then((response) => {
      console.log(response);
      res.redirect('/users');
    })
    .catch((err) => {
      console.log('error removing user', err)
    });
};

module.exports.change_password = (req, res) => {
  res.send("tbd");
};

module.exports.show_roles = (req, res) => {
  res.send("tbd");
};

module.exports.add_roles = (req, res) => {
  res.send("tbd");
};

module.exports.delete_role = (req, res) => {
  res.send("tbd");
};
