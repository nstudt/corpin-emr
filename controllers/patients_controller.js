const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const dbFuncs = require("@root/dbFuncs");
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));

// var dbname = "patients";
// var db = new PouchDB(dbname);
const pmodel = require("@models/patientModel");
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + "../"));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials("../views/partials");
const helpers = require("@root/helpers");


//pagination
var paginate = require("handlebars-paginate");
hbs.registerHelper("paginate", paginate);

("use strict");

module.exports.search = (req, res, next) => {
  return dbFuncs.find_one(req.app.db,  req.body.search)
  .then((doc) => {
    count = doc.length
    var perPage = 100
    var page = req.query.p || 1
    if (count < 500){perPage = count}
    let pages = Math.ceil(count / perPage)
    res.render("patients", {
      pagination: {
        page: page,
        pageCount: pages
      },
        obj: doc,
        // current: page,
        // replication: req.app.replication
    });
  });
}

module.exports.render_patients = (req, res, next) => {
  //TODO: change per page to parameter passed from template
  //var perPage = req.params.perPage || 50;
  //or
  //var perPage = req.body.perPage;
  var db = req.app.db;
  var dbinfo = req.app.dbinfo;
  var count = 0;
  var perPage = 100;
  var page = req.query.p || 1;

  return dbFuncs.get_dbinfo(db)
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
        page: page,
        pageCount: pages
      },
        obj: docs,
        // current: page,
        // replication: req.app.replication
    });
  }).catch((err) => {
      console.log('error in patients_controller', err);
  });
});
};


module.exports.render_addPage = (req, res) => {
  res.render("add", {replication: req.app.replication});
};

//TODO: refactor db ops to dbFuncs
module.exports.add_patient = (req, res) => {
  db = req.app.db;
  var newPatient = new pmodel.Patient(req.body);
  patient = helpers.fix_patient(newPatient);
  patient.added = new Date();
  patient.visit_ids = [];
  
  return db.put(patient)
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
  return dbFuncs.get_one(req.app.db, req.params.id)
    .then(patient => {
      patient = helpers.fix_patient(patient);
      res.render("edit", {
        patient: patient,
        pregnant: patient.pregnant,
        sex: patient.sex,
        replication: req.replication
      });
    })
    .catch(function(err) {
      console.log(err);
    });
};

module.exports.post_edit_patient = (req, res) => {
  doc = req.body;
  patient = helpers.fix_patient(doc);
  patient.modified = new Date()
    dbFuncs.update(req.app.db, patient, () => {})
      .then(() => {
        res.redirect("/patients");
        helpers.emit_to_client(req.app.io, 'message', 'patient record updated');

      })
      .catch((err) => {
        console.log('error during patient update', err);
        helpers.emit_to_client(req.app.io, 'message', 'error during patient update');
      });
    }

    //TODO: add deleted flash message
module.exports.delete_patient = (req, res) => {
 
    let _id = req.params.id;
    return dbFuncs.remove(req.app.db, _id).then((result) => {
      console.log(result)
      helpers.emit_to_client(req.app.io, 'message', 'patient record deleted');
      res.redirect("/patients");
    }).catch((err) => {
      console.log('error in delete_patient', err);
      helpers.emit_to_client(req.app.io, 'message', 'error deleting patient record');
    });
  
};
//TODO: add upload success flash message
module.exports.file_upload = (req, res) => {
  if (!req.files) return res.status(400).send("No files were uploaded.");
  let fileName = req.files.fileUpload;
  let fName = fileName.name;
  type = fileName.mimetype;
  let _id = req.body.id;
  let _rev = req.body.rev;
  dbFuncs.put_attachment(req.app.db,_id.toString(), fName, _rev.toString(), fileName.data, type)
    .then(result => {
      console.log(result)
      helpers.emit_to_client(req.app.io, 'message', 'file uploaded to patient record');
      res.redirect("/patients");
    })
    .catch(err => {
      console.log('error during file upload', err);
      helpers.emit_to_client(req.app.io, 'message', 'an error occured during patient file upload.');
    });
};
