const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const dbFuncs = require('@root/dbFuncs');
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
var dbname = "patients";
var db = new PouchDB(dbname);
var udb_name = "userdb";
var udb = new PouchDB(udb_name);
const umodel = require('@models/userModel');
const pmodel = require('@models/patientModel');
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + '../'));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");

"use strict";
//todo - move dbname to .config
// var HOST = "http://admin:Sdfg@345@52.74.45.66:5984/patients";
// var remoteDB = new PouchDB('http://52.74.45.66:5984/patients');
var remoteDB = new PouchDB('http://192.168.0.180:2000/patients');

module.exports.render_settings = ((req, res) => {
    res.render("settings"); 
});

module.exports.create_db = ((req, res) => {
    console.log("creating fresh db");
    db = new PouchDB(dbname);
    console.log(`created ${dbname}`)
    udb = new PouchDB(udb_name);
    console.log(`created ${udb_name}`)
    res.redirect("/");
});

module.exports.delete_db = ((req, res) => {
    db.destroy().then((response) => {
      console.log('db.destroy',response)
    }).then(() => {
      udb.destroy().then((response) => {
        console.log('destroy user',response)
      })
    }).catch((err) => {
      console.log('error during destroy', err)
    });
    
});
module.exports.sample_data = ((req, res) => {
    console.log("creating samples")
      udb = new PouchDB(udb_name)
    db = new PouchDB(dbname)
    pmodel.samplePatients(db)
    dbFuncs.makeVisits(db)
    dbFuncs.create_sample_user(udb, suser)
    delete suser;
      res.redirect("/");
});

module.exports.build_index = ((req, res) => {
    // var newPatient = new pmodel.Patient();
  console.log("building query");
  db = new PouchDB(dbname);
  udb = new PouchDB(udb_name);
  dbFuncs.buildQuery(db)
  .then(() => {
    dbFuncs.buildQuery2(udb)
  })    
    .then(() => {
      dbFuncs.dbQuery(db, "index/visits", "a123456");
    }).then(() => {
      dbFuncs.dbQuery(db, "index/patients_only");
    }).then(() => {
      dbFuncs.dbQuery(udb, "index2/users_only" );
    }).then(() => {
      udb.allDocs().then((docs) => {
        console.log('usb data: ',docs.rows);
      })
    }).catch(err => {
      console.log("error in setting/buildQuery", err);
    });
  res.redirect("/patients");
});

module.exports.build_find_indexes = ((req, res) => {
  return new Promise((resolve, reject) => {
    const result = dbFuncs.buildPatientsFindIndexes(db)
    console.log('from build_find_indexes', result)
    (res.redirect("/settings"));
  })
    
  });


module.exports.replicate_patients = ((req, res) => {
    db.sync(remoteDB, {
        live: true
      }).on('change',(change) =>{
        console.log('live replication triggered', change)
      }).on('error',(err) =>{
        console.log('error in replication to remoteDB', err);
      })
      setTimeout(res.redirect('/patients'),3000);
});
module.exports.replicate_users = ((req, res) => {
  udb.sync(remoteDB, {
      live: false
    }).on('complete',(results) =>{
      console.log(results)
    }).on('error',(err) =>{
      console.log('error in replication to remoteDB', err);
    })
    setTimeout(res.redirect('/patients'),3000);
});

// no var so suser can be deleted after used
suser = {
  _id: "la23ks45jf76",
  type: "user",
  user_name: 'test',
  last_name: 'tester',
};