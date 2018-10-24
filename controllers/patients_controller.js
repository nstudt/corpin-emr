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
const pmodel = require('@models/patientModel');
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + '../'));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");

// ("use strict");


  module.exports.render_patients = (req, res) => {
    return db
    .query("index/patients_only", { include_docs: true })
    .then(function(response) {
      res.render("patients", {
        obj: response.rows
      });
    })
    .catch(err => {
      console.log(err);
    });
  };

module.exports.render_addPage = (req,res) => {
    res.render("add");
};

  module.exports.add_patient = (req, res) => {
    var newPatient = new pmodel.Patient(req.body);
    db.put(newPatient).then((result) => {
      console.log(result)
      res.redirect("/patients");
    }).catch((err) => {
      console.log('error in add_patient', err)
    });
};

module.exports.get_edit_patient = (req,res) => {
    db.get(req.params.id)
    .then(patient => {
      //   console.log(patient);
      res.render("edit", {
        patient: patient
      });
    })
    .catch(function(err) {
      console.log(err);
    });
};

module.exports.post_edit_patient = (req, res) => {
    console.log("test", req.body);
    //wrapping in a promise allows dbFuncs.build to complete query
    return new Promise((resolve, reject) => {
      dbFuncs
        .update(db, req.body, () => {})
        .then(() => {
          res.redirect("/patients");
        })
        .catch(() => {});
    });
};

module.exports.delete_patient = (req, res) => {
    db.remove(req._id).then((response) => {
        console.log(response)
    }).catch((err) => {
        console.log(err);
    });
};

module.exports.file_upload = (req, res) => {
    if (!req.files) return res.status(400).send("No files were uploaded.");
    let fileName = req.files.fileUpload;
    let fName = fileName.name;
    type = fileName.mimetype;
    let _id = req.body.id;
    let _rev = req.body.rev;
    //don't really need to save the file to disk
    // fileName.mv(__dirname + "/" + fName, function(err) {
    //   if (err) return res.status(500).send(err);
    // });
    //save the file to the patient record
    db.putAttachment(_id.toString(), fName, _rev.toString(), fileName.data, type)
      .then(result => {
        // console.log(result);
        res.redirect("/patients");
      })
      .catch(err => {
        console.log(err);
      });
};

  
