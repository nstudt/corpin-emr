const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
var dbname = "patients";
// var db = new PouchDB(dbname);
const pmodel = require("@models/patientModel");
const dbFuncs = require('@root/dbFuncs');
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname + "../"));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
hbs.registerPartials(path.join(__dirname, "views/partials"));



module.exports.view_patient = (req, res) => {
  db = req.app.db;
  return db.get(req.params.id, { attachments: true })
    .then(patient => {
      var patient = new pmodel.Patient(patient);
      return db
        .query("index/visits", { key: patient._id, include_docs: true })
        .then(visits => {
          req.app.patient = patient;
          res.render("view", {
            patient: patient,
            visits: visits.rows
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  // TODO: read physician_id
module.exports.view_rx = (req, res) => {
  res.render('rxModal', {
    patient: req.app.patient,
    physician_id: req.app.physician_id
  });
  };
  
//TODO: send flash message on update success
  module.exports.write_rx = (req, res ) => {
    let prescription = new pmodel.Prescription(req.body);
    prescription.physician_id = "dr corpin";
    prescription.date = new Date();
    return dbFuncs.create(req.app.db, prescription) //create prescrition
    .then((doc) => { //rx is will be in doc
      return dbFuncs.add_medication(req.app.db, req.body.patient_id, req.body.medication)
    }).then((result) => {
      //send flash message
      console.log(result);
    }).catch((err) => {
      console.log('error writing prescription', err);
    })
  }

//TODO: send flash message on update success
module.exports.post_soap = ((req, res) => {
  let visit = new pmodel.Visits(req.body);
  visit.patient_id = req.params.id;
  visit.date = new Date();
    return dbFuncs.addVisitId(req.app.db, visit.patient_id, visit._id, visit.date)
    .then((result) => {
      console.log(result)
    }).then(() => {
      return db.put(visit).then((result) => {
        (console.log(result))
        res.send('<h3 class="w3-card w3-container text-center" >Patient Record Updated</h3>');
    }).catch(err => {
      console.log("error in soap/post ", err);
      res.send('alert("An error has occured during the update of this visit. Please contact the systems administrator")');
    
    })
      });
  });
  

module.exports.render_soap = (req, res) => {
  res.render("soap", { id: req.params.id });
};

module.exports.render_soapRx = (req, res) => {
    res.send('tbd');
  };

  module.exports.post_soapRx = (req, res) => {
    res.send("tbd");
  };
