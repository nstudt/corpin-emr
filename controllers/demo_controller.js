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

//pagination
// var Handlebars = require('handlebars');
var paginate = require('handlebars-paginate');
hbs.registerHelper('paginate', paginate);

module.exports.demo_render = (req, res) => {
  
  console.log("demo called");
  res.render("demo");
};

module.exports.demo_patients = (req, res, next) => {
  
  //TODO: change per page to parameter passed from template
  //var perPage = req.params.perPage || 50;
  //or
  //var perPage = req.body.perPage;
  var perPage = 2;
  var page = req.query.p || 1;

    return db.find({
      selector: {
        type: "patient"
      },
      use_index: "patients",
      skip: ((perPage * page) - perPage),
      limit: perPage
    }).then((doc) => {
        console.log(doc.docs.count)
      count = 10
      let pages = Math.ceil(count / perPage);
      res.render("demo", {
        
        pagination: {
          page: page,
          pageCount: pages
        },
          obj: doc,
          current: page,
          
      })
    }).catch((err) => {
        console.log('error in demo_patients', err);
    });
}
