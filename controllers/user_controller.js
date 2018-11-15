const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const dbFuncs = require("@root/dbFuncs");
const PouchDB = require("pouchdb");
const helpers = require("@root/helpers");
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
return dbFuncs.create(req.app.udb, muser)
.then((result) => {
  console.log('successfully created user', result);
  helpers.emit_to_client(req.app.io, 'message', 'user created');
}).catch((err) => {
  console.log('error during create_user', err)
});
};

module.exports.update_user = (req, res) => {
  return dbFuncs.update(req.app.udb, req.body)
  .then(result => {
    console.log("user update complete", result);
    helpers.emit_to_client(req.app.io, 'message', 'user updated');
    res.redirect("/users");;
  }).catch((err) => {
    console.lof('error during user update', err);
  });
  };

module.exports.render_users = (req, res) => {
  return dbFuncs.dbQuery(req.app.udb, "index2/users_only")
    .then(function(response) {
      res.render("users", {
        obj: response.rows
      });
    })
    .catch(err => {
      console.log("error in render_users", err);
      if (err.status == 404) {
        res.render("users");
      }
      
    });
};

module.exports.read_user = (req, res) => {
  req.app.udb
    .get(req.params.id, { attachments: true })
    .then(doc => {
      var user = new pmodel.Patient(doc);
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
    req.app.udb.get(_id).then((doc) => {
      return req.app.udb.remove(doc._id, doc._rev)
    }).then((response) => {
      console.log(response);
      helpers.emit_to_client(req.app.io, 'message', 'user deleted');
      res.redirect('/users');
    })
    .catch((err) => {
      console.log('error removing user', err);
      helpers.emit_to_client(req.app.io, 'message', 'error during user deletion');
    });
};

module.exports.change_password = (req, res) => {
  res.send("tbd");
  helpers.emit_to_client(req.app.io, 'message', 'change password successful');
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
