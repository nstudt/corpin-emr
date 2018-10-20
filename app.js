const express = require("express");
const _ = require('underscore');

const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const dbFuncs = require(__dirname + "/dbFuncs");
const PouchDB = require("PouchDB");
PouchDB.plugin(require("pouchdb-find"));
const fileUpload = require("express-fileupload");

const app = express();
// app.use("/db", require("express-pouchdb")(PouchDB));


//todo - move dbname to .config
var remoteDB = new PouchDB('http://52.74.45.66:5984/patients');
var dbname = "patients";
var db = new PouchDB(dbname);
var pmodel = require(__dirname + "/models/patientModel");

("use strict");

hbs.registerPartials(__dirname + "/views/partials");
//call this to pass data from an onclick to javascript function in the view
hbs.registerHelper("json", function(obj) {
  return new hbs.SafeString(JSON.stringify(obj));
});
//fileUpload is from express-fileUpload
app.use(fileUpload({ preserveExtension: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
var instance2 = hbs.create();
app.engine("html", instance2.__express);
//allows local data to be used in the template
hbs.localsAsTemplateData(app);
// syntax: app.locals.foo = "bar"'
//{{@foo}}

//start routes
app.get("/", (req, res) => {
  const title = "Welcome";
  res.render("index", {
    title: title
  });
});

app.get("/soap/:id", (req, res) => {
  res.render("soap", { id: req.params.id });
  // console.log('soap get', );
});
//refactor to use dbFuncs for all dbs work. Pass patient objects back and forth?
app.post("/soap/:id", (req, res) => {
  let visit = new pmodel.Visits(req.body);
  visit.patient_id = req.params.id;
  visit.date = new Date();
  dbFuncs.addVisitId(db, visit.patient_id, visit._id, visit.date);
  db.put(visit).then(result => {

  }).catch(err => {
      console.log("error in soap/post ", err);
    });
  res.send('<h3 class="w3-card w3-container text-center" >Patient Record Updated</h3>');
});

app.post("/upload", function(req, res) {
  if (!req.files) return res.status(400).send("No files were uploaded.");

  let fileName = req.files.fileUpload;
  let fName = fileName.name;
  type = fileName.mimetype;
  let _id = req.body.id;
  let _rev = req.body.rev;
  //don't really need to save the file to disk
  fileName.mv(__dirname + "/" + fName, function(err) {
    if (err) return res.status(500).send(err);
  });
  //save the file to the patient record
  db.putAttachment(_id.toString(), fName, _rev.toString(), fileName.data, type)
    .then(result => {
      // console.log(result);
      res.redirect("/patients");
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/patients/add", (req, res) => {
  res.render("add", {});
});


app.get("/view/:id", (req, res) => {
  db.get(req.params.id, { attachments: true })
    .then(patient => {
      var patient = new pmodel.Patient(patient);
      return db.query("index/visits", { key: patient._id, include_docs: true })
        .then(visits => {
          res.render("view", {
            patient: patient,
            visits: visits.rows
          });
        }).catch((err) => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err);
    });
});



app.get("/rxnorm", (req, res) => {
  res.render("rxnorm");
});

app.get("/icd10", (req, res) => {
  res.render("icd10");
});

app.get("/patients/edit/:id", (req, res) => {
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
});

app.post("/patients/edit", (req, res) => {
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
});

app.get("/patients", (req, res) => {
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
});
//from Add Patient button on /add.hbs
app.post("/patients", (req, res) => {
  var newPatient = new pmodel.Patient(req.body);
  newPatient.save(db);
  res.redirect("/patients");
});



app.get("/settings", (req, res) => {
  res.render("settings");
});

app.post("/settings/destroy", (req, res) => {
  db.destroy()
    .then(response => {
      console.log("db destroyed", response);
      console.log("db created ");
      res.redirect("/");
    })
    .catch(err => {
      console.log("error in destroy ", err);
    });
});

//this is the only instance in which a new db is created. db is global.
app.post("/settings/sample", (req, res) => {
  console.log("creating samples");
  db = new PouchDB(dbname);
  pmodel.samplePatients(db);
  dbFuncs.makeVisits(db);
  res.redirect("/");
});
//this is the only instance in which a new db is created. db is global.
app.post("/settings/createdb", (req, res) => {
  console.log("creating fresh db");
  db = new PouchDB(dbname);
  res.redirect("/");
});
app.post("/settings/buildQuery", (req, res) => {
  // var newPatient = new pmodel.Patient();
  console.log("building query");
  db = new PouchDB(dbname);
  dbFuncs
    .buildQuery(db)
    .then(() => {
      dbFuncs.dbQuery(db, "index/visits", "a123456");
    })
    .then(() => {
      dbFuncs.dbQuery(db, "index/patients");
    })
    .catch(err => {
      console.log("error in setting/buildQuery", err);
    });
  res.redirect("/patients");
});

app.post("/settings/replicate", (req, res) => {
  db.sync(remoteDB, {
    live: true
  }).on('change',(change) =>{
    console.log('live replication triggered', change)
  }).on('error',(err) =>{
    console.log('error in replication to remoteDB', err);
  })
  res.end;
});
// app.post("/view/encounter", (req, res) ={

// })

app.get("/encounter", (req, res) => {
  const title = "Encounter Form";
  res.render("encounter", {
    title: title
  });
});

app.get("/rx", (req, res) => {
  const title = "JDC Pharmacy";
  res.render("rx", {
    title: title
  });
});


const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
