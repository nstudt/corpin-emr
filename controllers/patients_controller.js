const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const dbFuncs = require("@root/dbFuncs");
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
var dbname = "patients";
var db = new PouchDB(dbname);
const pmodel = require("@models/patientModel");
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + "../"));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");
const helpers = require("@root/helpers");


//pagination
// var Handlebars = require('handlebars');
var paginate = require("handlebars-paginate");
hbs.registerHelper("paginate", paginate);

("use strict");

module.exports.render_patients = (req, res, next) => {
  //TODO: change per page to parameter passed from template
  //var perPage = req.params.perPage || 50;
  //or
  //var perPage = req.body.perPage;
  if (!db) {
    db = dbFuncs.prep_db();
    console.log("created db object");
  }
  var dbinfo = new helpers.DBINFO();
  var count = 0;
  var perPage = 500;
  var page = req.query.p || 1;

return dbFuncs.get_dbinfo()
.then((result) => {
  count = result.doc_count
  if (count < 500){perPage = count};
return db.find({
    selector: {
      $and: [
        {last_name: { '$gt': 1}},
      ]
    },
    use_index: ['patients'],
    sort: [{'last_name': 'asc'}],
    skip: ((perPage * page) - perPage),
    limit: perPage

  }).then((docs) => {
    let pages = Math.ceil(count / perPage);
    res.render("patients", {
      pagination: {
        currentpage: page,
        page: pages
      },
        obj: docs,
        current: page,
        replication: req.replication
    });
  }).catch((err) => {
      console.log('error in patients_controller', err);
  });
});
};


module.exports.render_addPage = (req, res) => {
  res.render("add", {replication: req.replication});
};

//TODO: refactor
module.exports.add_patient = (req, res) => {
  var newPatient = new pmodel.Patient(req.body);
  newPatient.added = new Date();
  return db.put(newPatient)
    .then(result => {
      console.log('patient added' ,result);
      res.redirect("/patients");
    })
    .catch(err => {
      console.log("error in add_patient", err);
    });
};
//TODO: refactor
module.exports.get_edit_patient = (req, res) => {
  db.get(req.params.id)
    .then(patient => {
      //   console.log(patient);
      res.render("edit", {
        patient: patient,
        pregnant: patient.pregnant,
        replication: req.replication
      });
    })
    .catch(function(err) {
      console.log(err);
    });
};

module.exports.post_edit_patient = (req, res) => {
  doc = req.body;
  doc.modified = new Date()
    dbFuncs.update(db, doc, () => {})
      .then(() => {
        res.redirect("/patients");
      })
      .catch(() => {});
    }

module.exports.delete_patient = (req, res) => {
  if (!db) {
    db = dbFuncs.prep_db();
    console.log("db created");
  }
    let _id = req.params.id;
    return dbFuncs.remove(db, _id).then((result) => {
      console.log(result)
      res.redirect("/patients")
    }).catch((err) => {
      console.log('error in delete_patient', err);
    });
    // return db.get(req.params.id).then(doc => {
    //   return db.remove(doc).then(response => {
    //       console.log("user removed ", response);
    //     resolve(res.redirect("/patients"))
    //     }).catch(err => {
    //       console.log("error in delete_patient", err)
    //       reject(err);
    //     });
    // });
};
//TODO: refactor
module.exports.file_upload = (req, res) => {
  if (!req.files) return res.status(400).send("No files were uploaded.");
  let fileName = req.files.fileUpload;
  let fName = fileName.name;
  type = fileName.mimetype;
  let _id = req.body.id;
  let _rev = req.body.rev;
  //don't need to save the file to disk, but keep this code in case we move to replcated files
  // fileName.mv(__dirname + "/" + fName, function(err) {
  //   if (err) return res.status(500).send(err);
  // });
  //save the file to the patient record
  db.putAttachment(_id.toString(), fName, _rev.toString(), fileName.data, type)
    .then(result => {
      res.redirect("/patients");
    })
    .catch(err => {
      console.log(err);
    });
};
